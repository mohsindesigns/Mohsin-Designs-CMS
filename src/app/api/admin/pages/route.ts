import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Page from '@/models/Page';
import { hasPermission, getSessionUser } from '@/lib/rbac';
import { recordActivity } from '@/lib/logger';

export async function GET(req: NextRequest) {
  if (!(await hasPermission(req, 'pages', 'read'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  try {
    await connectToDatabase();
    const pages = await Page.find({}).sort({ createdAt: -1 });
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
    const { title, slug, template } = body;

    const newPage = await Page.create({
      title,
      slug,
      template,
      status: 'published'
    });

    await recordActivity({
      user: (session as any).userId,
      userName: (session as any).username,
      action: 'CREATE_PAGE',
      entity: 'Page',
      entityId: newPage._id.toString(),
      details: { after: { title, slug, template }, message: `Created new page: ${title}` },
      ip: req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown'
    });

    return NextResponse.json(newPage);
  } catch (error: any) {
    console.error('Page create error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!(await hasPermission(req, 'pages', 'update'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    await connectToDatabase();
    const { action, ids, status } = await req.json();
    
    if (action === 'duplicate' && ids && Array.isArray(ids)) {
      const sourcePages = await Page.find({ _id: { $in: ids } });
      const newPages = [];
      
      for (const source of sourcePages) {
        const timestamp = Date.now();
        const duplicate = await Page.create({
          title: `${source.title} (Copy)`,
          slug: `${source.slug}-copy-${timestamp}`,
          template: source.template,
          content: source.content,
          seo: source.seo,
          status: 'draft'
        });
        newPages.push(duplicate);

        await recordActivity({
          user: (session as any).userId,
          userName: (session as any).username,
          action: 'DUPLICATE_PAGE',
          entity: 'Page',
          entityId: duplicate._id.toString(),
          details: { message: `Duplicated page: ${source.title} -> ${duplicate.title}` },
          ip: req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown'
        });
      }
      return NextResponse.json(newPages);
    }

    if (action === 'status' && ids && Array.isArray(ids)) {
      await Page.updateMany(
        { _id: { $in: ids } },
        { $set: { status: status || 'draft' } }
      );

      await recordActivity({
        user: (session as any).userId,
        userName: (session as any).username,
        action: 'BULK_STATUS_UPDATE',
        entity: 'Page',
        details: { ids, status: status || 'draft', message: `Bulk updated ${ids.length} pages to ${status || 'draft'}` },
        ip: req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown'
      });

      return NextResponse.json({ success: true });
    } else if (action === 'trash' && ids && Array.isArray(ids)) {
      await Page.updateMany(
        { _id: { $in: ids } },
        { $set: { isTrashed: true, trashedAt: new Date() } }
      );

      await recordActivity({
        user: (session as any).userId,
        userName: (session as any).username,
        action: 'BULK_TRASH_PAGES',
        entity: 'Page',
        details: { message: `Bulk moved ${ids.length} pages to trash` },
        ip: req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown'
      });

      return NextResponse.json({ success: true });
    } else if (action === 'restore' && ids && Array.isArray(ids)) {
      await Page.updateMany(
        { _id: { $in: ids } },
        { $set: { isTrashed: false, trashedAt: null } }
      );

      await recordActivity({
        user: (session as any).userId,
        userName: (session as any).username,
        action: 'BULK_RESTORE_PAGES',
        entity: 'Page',
        details: { message: `Bulk restored ${ids.length} pages from trash` },
        ip: req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown'
      });

      return NextResponse.json({ success: true });
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
    const { ids } = await req.json();
    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json({ error: 'Invalid IDs' }, { status: 400 });
    }
    await Page.deleteMany({ _id: { $in: ids } });

    await recordActivity({
      user: (session as any).userId,
      userName: (session as any).username,
      action: 'BULK_DELETE_PAGES',
      entity: 'Page',
      details: { ids, message: `Bulk deleted ${ids.length} pages` },
      ip: req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown'
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Bulk delete error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
