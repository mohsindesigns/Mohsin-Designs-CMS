import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import Page from '@/models/Page';
import { hasPermission, getSessionUser } from '@/lib/rbac';
import { recordActivity } from '@/lib/logger';
import { normalizePageSlug } from '@/lib/utils';
import {
  PAGE_STATUSES,
  HOMEPAGE_GUARD_MESSAGE,
  canonicalFor,
  getHomepageId,
  isLiveHomepage,
  revalidatePageCaches,
  validatePageSlug,
  validationMessage,
} from './pageRules';

export async function GET(req: NextRequest) {
  if (!(await hasPermission(req, 'pages', 'read'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  try {
    await connectToDatabase();
    // Deliberately a slim projection: the full `content` of every page is several MB. Consumers
    // (page manager, location pickers, settings homepage picker, FAQ page picker) only need these.
    const pages = await Page.find({})
      .select('_id title slug template status isTrashed createdAt updatedAt content.parentLocationId content.parentLocationSlug content.countrySlug content.stateSlug content.citySlug content.country content.state content.city')
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json(pages);
  } catch (error: any) {
    console.error('Pages fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!(await hasPermission(req, 'pages', 'create'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  try {
    await connectToDatabase();
    const body = await req.json();
    const { template } = body;
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    if (!title) {
      return NextResponse.json({ error: 'A page title is required.' }, { status: 400 });
    }
    const allowedTemplates: string[] = (Page.schema.path('template') as any)?.enumValues || [];
    if (typeof template !== 'string' || (allowedTemplates.length > 0 && !allowedTemplates.includes(template))) {
      return NextResponse.json({ error: 'Please choose a valid template.' }, { status: 400 });
    }

    const slug = normalizePageSlug(body.slug || "");
    if (!slug) {
      return NextResponse.json({ error: 'A valid slug is required.' }, { status: 400 });
    }
    const slugProblem = validatePageSlug(slug, template);
    if (slugProblem) {
      return NextResponse.json({ error: slugProblem }, { status: 400 });
    }

    const existing: any = await Page.findOne({ slug }).select('_id title isTrashed').lean();
    if (existing) {
      const where = existing.isTrashed ? ' (it is in the Trash - restore or permanently delete it first)' : '';
      return NextResponse.json({ error: `The slug "${slug}" is already used by "${existing.title}"${where}. Please choose a different slug.` }, { status: 409 });
    }

    const pageStatus = body.status === 'draft' ? 'draft' : 'published';
    if (pageStatus === 'published' && !(await hasPermission(req, 'pages', 'publish'))) {
      return NextResponse.json({ error: 'You do not have permission to publish pages. Save it as a Draft instead.' }, { status: 403 });
    }

    const seoIn: any = (body.seo && typeof body.seo === 'object') ? { ...body.seo } : {};
    const canonicalUrl: string = seoIn.canonicalUrl || canonicalFor(slug);
    seoIn.canonicalUrl = canonicalUrl.endsWith('/') ? canonicalUrl : `${canonicalUrl}/`;

    const cleanContent = (body.content && typeof body.content === 'object' && !Array.isArray(body.content)) ? { ...body.content } : {};
    delete cleanContent.navbar;
    delete cleanContent.footer;

    let newPage;
    try {
      newPage = await Page.create({
        title,
        slug,
        template,
        status: pageStatus,
        content: cleanContent,
        seo: seoIn
      });
    } catch (err: any) {
      const message = validationMessage(err);
      if (message) return NextResponse.json({ error: message }, { status: 400 });
      if (err?.code === 11000) {
        return NextResponse.json({ error: `The slug "${slug}" is already used by another page.` }, { status: 409 });
      }
      throw err;
    }

    await recordActivity({
      user: (session as any).userId,
      userName: (session as any).username,
      action: 'CREATE_PAGE',
      entity: 'Page',
      entityId: newPage._id.toString(),
      details: { after: { title, slug, template }, message: `Created new page: ${title}` },
      ip: req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown'
    });

    // A visitor (or crawler) may already have hit this URL and had the 404 cached.
    revalidatePageCaches({ slugs: [slug], template, moved: true });

    return NextResponse.json(newPage);
  } catch (error: any) {
    console.error('Page create error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/** Accepts only real ObjectId strings (an invalid id would make Mongoose throw a CastError -> 500). */
function cleanIds(ids: unknown): string[] {
  if (!Array.isArray(ids)) return [];
  return ids.map(String).filter((i) => mongoose.isValidObjectId(i));
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!(await hasPermission(req, 'pages', 'update'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    await connectToDatabase();
    const { action, ids: rawIds, status } = await req.json();
    const ids = cleanIds(rawIds);
    const ip = req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown';

    if (!ids.length) {
      return NextResponse.json({ error: 'No pages selected.' }, { status: 400 });
    }

    if (action === 'duplicate') {
      // Duplicating creates pages, so it needs the create permission (it used to only need update).
      if (!(await hasPermission(req, 'pages', 'create'))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
      const sourcePages = await Page.find({ _id: { $in: ids } });
      const newPages = [];

      for (const source of sourcePages) {
        const src: any = source.toObject();
        const segs = (normalizePageSlug(src.slug) || 'page').split('/');
        const baseSlug = segs.join('/');

        // "<slug>-copy", "<slug>-copy-2", ... (readable and sequential instead of a timestamp).
        let candidateSlug = `${baseSlug}-copy`;
        for (let n = 2; await Page.exists({ slug: candidateSlug }); n++) {
          candidateSlug = `${baseSlug}-copy-${n}`;
        }

        // Deep copy: the duplicate must never share nested objects/arrays with the original.
        const content = JSON.parse(JSON.stringify(src.content || {}));
        const seo = JSON.parse(JSON.stringify(src.seo || {}));
        seo.canonicalUrl = canonicalFor(candidateSlug);

        // A copied location page must not keep claiming the original's place in the hierarchy.
        const ownSegment = candidateSlug.split('/').pop() as string;
        if (src.template === 'city' && content.citySlug) content.citySlug = ownSegment;
        if (src.template === 'state' && content.stateSlug) content.stateSlug = ownSegment;

        const duplicate = await Page.create({
          title: `${src.title} (Copy)`,
          slug: candidateSlug,
          template: src.template,
          content,
          seo,
          status: 'draft' // never publish a copy automatically
        });
        newPages.push(duplicate);

        await recordActivity({
          user: (session as any).userId,
          userName: (session as any).username,
          action: 'DUPLICATE_PAGE',
          entity: 'Page',
          entityId: duplicate._id.toString(),
          details: { message: `Duplicated page: ${src.title} -> ${duplicate.title}`, slug: candidateSlug },
          ip
        });
      }
      return NextResponse.json(newPages);
    }

    if (action === 'status' || action === 'trash' || action === 'restore') {
      if (action === 'status') {
        if (!PAGE_STATUSES.includes(status)) {
          return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
        }
        // Publishing / unpublishing needs the separate `pages.publish` permission.
        if (!(await hasPermission(req, 'pages', 'publish'))) {
          return NextResponse.json({ error: 'You do not have permission to publish or unpublish pages.' }, { status: 403 });
        }
      }

      const affectedPages: any[] = await Page.find({ _id: { $in: ids } }).select('_id slug title template').lean();

      // Taking pages offline: the homepage is protected.
      let targets = affectedPages;
      const skipped: Array<{ id: string; title: string; reason: string }> = [];
      if (action === 'trash' || (action === 'status' && status === 'draft')) {
        const homepageId = await getHomepageId();
        targets = affectedPages.filter((p) => {
          if (isLiveHomepage(p, homepageId)) {
            skipped.push({ id: String(p._id), title: p.title, reason: HOMEPAGE_GUARD_MESSAGE });
            return false;
          }
          return true;
        });
      }
      const targetIds = targets.map((p) => p._id);

      if (targetIds.length > 0) {
        if (action === 'status') {
          await Page.updateMany({ _id: { $in: targetIds } }, { $set: { status } }, { runValidators: true });
        } else if (action === 'trash') {
          await Page.updateMany({ _id: { $in: targetIds } }, { $set: { isTrashed: true, trashedAt: new Date() } });
        } else {
          await Page.updateMany({ _id: { $in: targetIds } }, { $set: { isTrashed: false, trashedAt: null } });
        }

        await recordActivity({
          user: (session as any).userId,
          userName: (session as any).username,
          action: action === 'status' ? 'BULK_STATUS_UPDATE' : action === 'trash' ? 'BULK_TRASH_PAGES' : 'BULK_RESTORE_PAGES',
          entity: 'Page',
          details: {
            ids: targetIds.map(String),
            slugs: targets.map((p) => p.slug),
            ...(action === 'status' ? { status } : {}),
            message:
              action === 'status'
                ? `Bulk updated ${targetIds.length} pages to ${status}`
                : action === 'trash'
                  ? `Bulk moved ${targetIds.length} pages to trash`
                  : `Bulk restored ${targetIds.length} pages from trash`
          },
          ip
        });

        for (const p of targets) revalidatePageCaches({ slugs: [p.slug], template: p.template });
      }

      if (targetIds.length === 0 && skipped.length > 0) {
        return NextResponse.json({ error: skipped[0].reason, code: 'HOMEPAGE', skipped }, { status: 409 });
      }
      return NextResponse.json({ success: true, updated: targetIds.length, skipped });
    }

    return NextResponse.json({ error: 'Invalid Action' }, { status: 400 });
  } catch (error: any) {
    console.error('Bulk action error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!(await hasPermission(req, 'pages', 'delete'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    await connectToDatabase();
    const { ids: rawIds } = await req.json();
    const ids = cleanIds(rawIds);
    if (!ids.length) {
      return NextResponse.json({ error: 'Invalid IDs' }, { status: 400 });
    }

    const pages: any[] = await Page.find({ _id: { $in: ids } }).select('_id slug title template').lean();
    const homepageId = await getHomepageId();
    const skipped = pages.filter((p) => isLiveHomepage(p, homepageId));
    const targets = pages.filter((p) => !skipped.includes(p));

    if (targets.length === 0 && skipped.length > 0) {
      return NextResponse.json({ error: HOMEPAGE_GUARD_MESSAGE, code: 'HOMEPAGE' }, { status: 409 });
    }

    await Page.deleteMany({ _id: { $in: targets.map((p) => p._id) } });

    await recordActivity({
      user: (session as any).userId,
      userName: (session as any).username,
      action: 'BULK_DELETE_PAGES',
      entity: 'Page',
      details: { ids: targets.map((p) => String(p._id)), slugs: targets.map((p) => p.slug), message: `Bulk deleted ${targets.length} pages` },
      ip: req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown'
    });

    for (const p of targets) revalidatePageCaches({ slugs: [p.slug], template: p.template });

    return NextResponse.json({ success: true, deleted: targets.length, skipped: skipped.map((p) => ({ id: String(p._id), title: p.title })) });
  } catch (error: any) {
    console.error('Bulk delete error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
