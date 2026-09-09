import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Page from '@/models/Page';
import { hasPermission, getSessionUser } from '@/lib/rbac';
import { recordActivity } from '@/lib/logger';
import { normalizePageSlug } from '@/lib/utils';

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
    const { slug, title, template, status, seo, content, isTrashed } = body;

    await connectToDatabase();
    const oldPage = await Page.findById(id);
    if (!oldPage) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

    // Snapshot the old data before update
    const beforeState: any = { 
      title: oldPage.title, 
      status: oldPage.status, 
      slug: oldPage.slug,
      template: oldPage.template,
      seo: oldPage.seo,
      content: oldPage.content,
      isTrashed: oldPage.isTrashed
    };

    // ATOMIC PAGE SNAPSHOT (Async / Non-blocking):
    import('@/lib/backup').then(({ createPageBackup }) => {
      createPageBackup({
        pageId: id,
        user: (session as any)?.username || 'admin',
        label: `Pre-update backup for page: ${oldPage.title}`,
        pageDoc: oldPage
      }).catch((pBkErr) => console.warn('[Backup Engine] Page backup failed:', pBkErr));
    }).catch((pBkErr) => console.warn('[Backup Engine] Backup import failed:', pBkErr));

    const updateData = { ...body };
    if (body.isTrashed !== undefined) {
      updateData.isTrashed = body.isTrashed;
      updateData.trashedAt = body.isTrashed ? new Date() : null;
    }

    if (body.slug !== undefined) {
      const normalizedSlug = normalizePageSlug(body.slug);
      if (!normalizedSlug) {
        return NextResponse.json({ error: 'A valid slug is required.' }, { status: 400 });
      }
      if (normalizedSlug !== oldPage.slug) {
        const collision = await Page.findOne({ slug: normalizedSlug, _id: { $ne: id } }).select('_id title').lean();
        if (collision) {
          return NextResponse.json({ error: `The slug "${normalizedSlug}" is already used by "${(collision as any).title}". Please choose a different slug.` }, { status: 409 });
        }
      }
      updateData.slug = normalizedSlug;
    }

    const updatedPage = await Page.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    await recordActivity({
      user: (session as any).userId,
      userName: (session as any).username,
      action: 'UPDATE_PAGE',
      entity: 'Page',
      entityId: id,
      details: { before: oldPage?.title || 'Unknown', after: updatedPage?.title || 'Unknown' },
      ip: req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown'
    });

    if (updatedPage && updatedPage.slug) {
      try {
        const { revalidatePath } = await import('next/cache');
        const pagePath = updatedPage.slug.startsWith('/') ? updatedPage.slug : `/${updatedPage.slug}`;
        revalidatePath(pagePath);
        revalidatePath('/');
      } catch (err) {
        console.error('Failed to revalidate path:', err);
      }
    }

    // Sync Home page changes directly into SiteContent (complete_data) so frontend and projects CMS update in real-time
    if (updatedPage && (updatedPage.template === 'home' || updatedPage.slug === 'home' || updatedPage.slug === '/') && content) {
      try {
        const SiteContent = (await import('@/models/Content')).default;
        const currentDoc = await SiteContent.findOne({ key: 'complete_data' });
        if (currentDoc) {
          const cleanContent = { ...content };
          // Strict protection: home page sync must NEVER touch services
          delete cleanContent.services;
          delete cleanContent.globalServices;
          const mergedData = { ...currentDoc.data, ...cleanContent };
          mergedData.services = currentDoc.data?.services;
          mergedData.globalServices = currentDoc.data?.globalServices || currentDoc.data?.services?.services;
          if (content.portfolio) {
            mergedData.portfolio = { ...(currentDoc.data?.portfolio || {}), ...content.portfolio };
          }
          await SiteContent.updateOne(
            { key: 'complete_data' },
            { $set: { data: mergedData, lastUpdated: new Date() } }
          );
        }
      } catch (syncErr) {
        console.error('Failed to sync Home page to complete_data:', syncErr);
      }
    }

    return NextResponse.json(updatedPage);
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
    const deletedPage = await Page.findByIdAndDelete(id);
    if (!deletedPage) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

    await recordActivity({
      user: (session as any).userId,
      userName: (session as any).username,
      action: 'DELETE_PAGE',
      entity: 'Page',
      entityId: id,
      details: { message: `Deleted page: ${deletedPage?.title || 'Unknown'}` },
      ip: req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown'
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Page delete error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
