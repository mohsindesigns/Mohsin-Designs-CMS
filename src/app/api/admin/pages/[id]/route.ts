import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Page from '@/models/Page';
import { hasPermission, getSessionUser } from '@/lib/rbac';
import { recordActivity } from '@/lib/logger';
import { normalizePageSlug } from '@/lib/utils';
import {
  PAGE_STATUSES,
  HOMEPAGE_GUARD_MESSAGE,
  applyChildRenames,
  canonicalAfterSlugChange,
  checkDedicatedSlugTemplate,
  getHomepageId,
  isLiveHomepage,
  planChildRenames,
  revalidatePageCaches,
  syncSlugRedirects,
  validatePageSlug,
  validationMessage,
} from '../pageRules';

/**
 * Keys that describe ONE page's own body and must never be copied into the site-wide
 * `complete_data` document when the homepage is saved. They are read from the page's own content
 * (pageData.content) by every template, and `{...globalData, ...pageContent}` (TemplateWrapper) and the
 * `...globalData` spreads in /gallery/ and /locations/ made any copy stored globally leak into OTHER
 * pages (e.g. the homepage's Video Testimonials or FAQ headings showing on a page that has none).
 */
const HOME_PAGE_ONLY_KEYS = [
  'videoTestimonials',
  'faqs', 'faqBadge', 'faqTitle', 'faqTitleIntro', 'faqTitleHighlight', 'faqDescription',
  'faqSchemaMarkup', 'faqSchemaAutoSync', 'strategyAudit', 'sectionTag',
  'schemaMarkup', 'customSchema',
];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await hasPermission(req, 'pages', 'read'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  try {
    const { id } = await params;
    await connectToDatabase();
    const page = await Page.findById(id).lean();
    if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    return NextResponse.json(page);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser(req);
  if (!(await hasPermission(req, 'pages', 'update'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { slug, title, template, status, seo, content, isTrashed, baseUpdatedAt, force } = body;

    await connectToDatabase();
    const oldPage = await Page.findById(id);
    if (!oldPage) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

    // ---- 1. Validate the request (400/403/409 before anything is written or backed up) ----------
    if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
      return NextResponse.json({ error: 'A page title is required.' }, { status: 400 });
    }
    if (status !== undefined && !PAGE_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
    }
    if (content !== undefined && (content === null || typeof content !== 'object' || Array.isArray(content))) {
      return NextResponse.json({ error: 'Invalid page content.' }, { status: 400 });
    }
    if (template !== undefined) {
      const allowed: string[] = (Page.schema.path('template') as any)?.enumValues || [];
      if (typeof template !== 'string' || (allowed.length > 0 && !allowed.includes(template))) {
        return NextResponse.json({ error: `Unknown template "${template}".` }, { status: 400 });
      }
    }

    // Publishing / unpublishing needs the separate `pages.publish` permission (Roles admin).
    const willChangeStatus = status !== undefined && status !== oldPage.status;
    if (willChangeStatus && (status === 'published' || oldPage.status === 'published')) {
      if (!(await hasPermission(req, 'pages', 'publish'))) {
        return NextResponse.json({ error: 'You do not have permission to publish or unpublish pages.' }, { status: 403 });
      }
    }

    // The homepage cannot be taken offline by accident.
    const takingOffline =
      (isTrashed === true && !oldPage.isTrashed) || (willChangeStatus && status === 'draft');
    if (takingOffline && isLiveHomepage(oldPage, await getHomepageId())) {
      return NextResponse.json({ error: HOMEPAGE_GUARD_MESSAGE, code: 'HOMEPAGE' }, { status: 409 });
    }

    // Stale-tab protection: the editor sends the `updatedAt` it loaded. If the page was saved
    // since then (another tab/user, or a list action such as Publish/Trash), a blind save would
    // silently overwrite those changes with this tab's older copy.
    if (baseUpdatedAt && !force && oldPage.updatedAt) {
      const base = new Date(baseUpdatedAt).getTime();
      if (!Number.isNaN(base) && base !== new Date(oldPage.updatedAt).getTime()) {
        return NextResponse.json(
          {
            error: 'This page was changed since you opened it (in another tab, or by another admin). Saving now would overwrite those changes.',
            code: 'STALE',
            updatedAt: oldPage.updatedAt,
          },
          { status: 409 }
        );
      }
    }

    // ---- 2. Build the update from a whitelist (never `{...body}`) ------------------------------
    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (template !== undefined) updateData.template = template;
    if (status !== undefined) updateData.status = status;
    if (seo !== undefined && seo !== null && typeof seo === 'object') updateData.seo = { ...seo };
    if (content !== undefined) {
      // Navbar/footer are global (Admin > Settings); a page must never carry its own copy.
      const cleanContent = { ...content };
      delete cleanContent.navbar;
      delete cleanContent.footer;
      updateData.content = cleanContent;
    }
    if (isTrashed !== undefined) {
      updateData.isTrashed = !!isTrashed;
      updateData.trashedAt = isTrashed ? new Date() : null;
    }

    // ---- 3. Slug ------------------------------------------------------------------------------
    const effectiveTemplate: string = updateData.template || oldPage.template;
    let slugChanged = false;
    let childPlan: Awaited<ReturnType<typeof planChildRenames>>['plan'] = [];
    if (slug !== undefined) {
      const normalizedSlug = normalizePageSlug(slug);
      if (!normalizedSlug) {
        return NextResponse.json({ error: 'A valid slug is required.' }, { status: 400 });
      }
      if (normalizedSlug !== oldPage.slug) {
        slugChanged = true;
        const problem = validatePageSlug(normalizedSlug, effectiveTemplate);
        if (problem) return NextResponse.json({ error: problem }, { status: 400 });

        const collision = await Page.findOne({ slug: normalizedSlug, _id: { $ne: id } }).select('_id title').lean();
        if (collision) {
          return NextResponse.json({ error: `The slug "${normalizedSlug}" is already used by "${(collision as any).title}". Please choose a different slug.` }, { status: 409 });
        }

        const planned = await planChildRenames(oldPage, oldPage.slug, normalizedSlug);
        if (planned.error) return NextResponse.json({ error: planned.error }, { status: 409 });
        childPlan = planned.plan;

        // Keep the canonical in step with the slug - but only when it is empty or the auto URL of
        // the old slug (a hand-written canonical is kept).
        const currentCanonical = updateData.seo?.canonicalUrl ?? oldPage.seo?.canonicalUrl;
        const nextCanonical = canonicalAfterSlugChange(currentCanonical, oldPage.slug, normalizedSlug);
        if (nextCanonical) {
          if (!updateData.seo) updateData.seo = { ...(oldPage.seo?.toObject ? oldPage.seo.toObject() : oldPage.seo || {}) };
          updateData.seo.canonicalUrl = nextCanonical;
        }
      }
      updateData.slug = normalizedSlug;
    }
    if (!slugChanged && template !== undefined && template !== oldPage.template) {
      // Template change on an existing slug: still enforce the dedicated-slug pairing
      // (e.g. the page at /gallery/ must keep the gallery template).
      const problem = checkDedicatedSlugTemplate(oldPage.slug, template);
      if (problem) return NextResponse.json({ error: problem }, { status: 400 });
    }

    // ---- 4. Snapshot the old data (only now that the request is known to be acceptable) --------
    const beforeState: any = {
      title: oldPage.title,
      status: oldPage.status,
      slug: oldPage.slug,
      template: oldPage.template,
      isTrashed: oldPage.isTrashed,
    };
    import('@/lib/backup').then(({ createPageBackup }) => {
      createPageBackup({
        pageId: id,
        user: (session as any)?.username || 'admin',
        label: `Pre-update backup for page: ${oldPage.title}`,
        pageDoc: oldPage
      }).catch((pBkErr) => console.warn('[Backup Engine] Page backup failed:', pBkErr));
    }).catch((pBkErr) => console.warn('[Backup Engine] Backup import failed:', pBkErr));

    // ---- 5. Write -----------------------------------------------------------------------------
    let updatedPage;
    try {
      updatedPage = await Page.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } catch (err: any) {
      const message = validationMessage(err);
      if (message) return NextResponse.json({ error: message }, { status: 400 });
      if (err?.code === 11000) {
        return NextResponse.json({ error: 'That slug is already used by another page.' }, { status: 409 });
      }
      throw err;
    }

    let cascadedChildren = 0;
    if (slugChanged && updatedPage) {
      await syncSlugRedirects(oldPage.slug, updatedPage.slug);
      cascadedChildren = await applyChildRenames(childPlan);
    }

    // Audit trail: record WHAT changed (the old log only stored the title twice).
    const changes: Record<string, { from: any; to: any }> = {};
    for (const key of ['title', 'slug', 'template', 'status', 'isTrashed']) {
      if (updatedPage && (beforeState as any)[key] !== (updatedPage as any)[key]) {
        changes[key] = { from: (beforeState as any)[key], to: (updatedPage as any)[key] };
      }
    }
    await recordActivity({
      user: (session as any).userId,
      userName: (session as any).username,
      action: 'UPDATE_PAGE',
      entity: 'Page',
      entityId: id,
      details: {
        before: oldPage?.title || 'Unknown',
        after: updatedPage?.title || 'Unknown',
        changes,
        contentSaved: content !== undefined,
        ...(cascadedChildren ? { cascadedChildren } : {}),
      },
      ip: req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown'
    });

    // ---- 6. Homepage -> site-wide content sync ------------------------------------------------
    // Only THE homepage (the page chosen in Settings, or the primary "home"/"homepage" page) feeds
    // complete_data. Any other page with the Home template (a "-copy-" duplicate, an alternate
    // landing page) used to overwrite the live site-wide content whenever it was saved.
    let globalChanged = false;
    if (updatedPage && content !== undefined && updatedPage.template === 'home' && updatedPage.status === 'published' && !updatedPage.isTrashed) {
      const homepageId = await getHomepageId();
      const isTheHomepage =
        (!!homepageId && String(updatedPage._id) === homepageId) ||
        updatedPage.slug === 'home' || updatedPage.slug === 'homepage' || updatedPage.slug === '/';
      if (isTheHomepage) {
        try {
          const SiteContent = (await import('@/models/Content')).default;
          const currentDoc = await SiteContent.findOne({ key: 'complete_data' });
          if (currentDoc) {
            // Strict protection: home page sync must NEVER touch services, navbar, footer, settings, loader, or hours
            const cleanContent: any = { ...updateData.content };
            delete cleanContent.services;
            delete cleanContent.globalServices;
            delete cleanContent.navbar;
            delete cleanContent.footer;
            delete cleanContent.settings;
            delete cleanContent.loader;
            delete cleanContent.hours;
            // Page-only keys (see HOME_PAGE_ONLY_KEYS) are not global content.
            for (const k of HOME_PAGE_ONLY_KEYS) delete cleanContent[k];
            const mergedData = { ...currentDoc.data, ...cleanContent };
            // ...and purge copies that earlier saves already leaked into the global document.
            for (const k of HOME_PAGE_ONLY_KEYS) delete mergedData[k];
            mergedData.services = currentDoc.data?.services;
            mergedData.globalServices = currentDoc.data?.globalServices || currentDoc.data?.services?.services;
            mergedData.navbar = currentDoc.data?.navbar;
            mergedData.footer = currentDoc.data?.footer;
            mergedData.settings = currentDoc.data?.settings;
            mergedData.loader = currentDoc.data?.loader;
            mergedData.hours = currentDoc.data?.hours;
            if (updateData.content.portfolio) {
              // The Home page's `portfolio.projects` is only its FEATURED selection; the global list is the
              // master catalogue (Admin > Projects, Gallery "existing" mode, the Home ContentSelector).
              // Overwriting it would silently delete every project Home did not pick.
              const masterProjects = currentDoc.data?.portfolio?.projects;
              mergedData.portfolio = {
                ...(currentDoc.data?.portfolio || {}),
                ...updateData.content.portfolio,
                ...(Array.isArray(masterProjects) ? { projects: masterProjects } : {}),
              };
            }
            await SiteContent.updateOne(
              { key: 'complete_data' },
              { $set: { data: mergedData, lastUpdated: new Date() } }
            );
            globalChanged = true;
          }
        } catch (syncErr) {
          console.error('Failed to sync Home page to complete_data:', syncErr);
        }
      }
    }

    // ---- 7. Caches ----------------------------------------------------------------------------
    if (updatedPage) {
      revalidatePageCaches({
        slugs: [updatedPage.slug, slugChanged ? oldPage.slug : undefined],
        template: updatedPage.template,
        moved: slugChanged,
        global: globalChanged,
      });
    }

    return NextResponse.json({ ...(updatedPage?.toObject?.() || updatedPage), cascadedChildren });
  } catch (error: any) {
    console.error('Page update error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser(req);
  if (!(await hasPermission(req, 'pages', 'delete'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id } = await params;
    await connectToDatabase();

    const existing = await Page.findById(id).select('_id slug template title').lean();
    if (!existing) return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    if (isLiveHomepage(existing as any, await getHomepageId())) {
      return NextResponse.json({ error: HOMEPAGE_GUARD_MESSAGE, code: 'HOMEPAGE' }, { status: 409 });
    }

    const deletedPage = await Page.findByIdAndDelete(id);
    if (!deletedPage) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

    await recordActivity({
      user: (session as any).userId,
      userName: (session as any).username,
      action: 'DELETE_PAGE',
      entity: 'Page',
      entityId: id,
      details: { message: `Deleted page: ${deletedPage?.title || 'Unknown'}`, slug: deletedPage.slug },
      ip: req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown'
    });

    revalidatePageCaches({ slugs: [deletedPage.slug], template: deletedPage.template });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Page delete error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
