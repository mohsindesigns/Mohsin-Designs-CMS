import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Portfolio from '@/models/Portfolio';
import { getSessionUser, hasPermission } from '@/lib/rbac';
import { recordActivity } from '@/lib/logger';
import { revalidatePortfolio } from '@/lib/portfolio-admin';
import { toIdList } from '@/lib/blog-admin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = (await getSessionUser(req)) as any;
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const action = body?.action;
    const value = body?.value;
    const ids = toIdList(body?.ids);
    if (!ids.length || typeof action !== 'string') {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }
    if (!['delete', 'status', 'trash', 'restore'].includes(action)) {
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    const needed = action === 'delete' ? 'delete' : 'update';
    if (!(await hasPermission(req, 'blog', needed))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    if (action === 'status' && !['draft', 'published'].includes(value)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await connectToDatabase();

    const affected = await Portfolio.find({ _id: { $in: ids } }, 'slug').lean();
    const slugs = affected.map((p: any) => p.slug);
    const ip = req.headers.get('x-forwarded-for') || 'unknown';

    if (action === 'delete') {
      await Portfolio.deleteMany({ _id: { $in: ids } });
      await recordActivity({
        user: user.userId,
        userName: user.username,
        action: 'BULK_DELETE_PORTFOLIO_ITEMS',
        entity: 'Portfolio',
        details: { ids, message: `Bulk deleted ${ids.length} portfolio items` },
        ip,
      });
    } else if (action === 'status') {
      if (value === 'published') {
        await Portfolio.updateMany(
          { _id: { $in: ids }, status: { $ne: 'published' } },
          [{ $set: { status: 'published', publishedAt: '$$NOW' } }],
          { updatePipeline: true }
        );
      } else {
        await Portfolio.updateMany({ _id: { $in: ids } }, { $set: { status: value, updatedAt: new Date() } }, { runValidators: true });
      }
      await recordActivity({
        user: user.userId,
        userName: user.username,
        action: 'BULK_STATUS_CHANGE_PORTFOLIO',
        entity: 'Portfolio',
        details: { ids, status: value, message: `Bulk changed ${ids.length} portfolio items to ${value}` },
        ip,
      });
    } else if (action === 'trash') {
      await Portfolio.updateMany({ _id: { $in: ids } }, { $set: { isTrashed: true, trashedAt: new Date() } });
      await recordActivity({
        user: user.userId,
        userName: user.username,
        action: 'BULK_TRASH_PORTFOLIO_ITEMS',
        entity: 'Portfolio',
        details: { ids, message: `Bulk moved ${ids.length} portfolio items to trash` },
        ip,
      });
    } else if (action === 'restore') {
      await Portfolio.updateMany({ _id: { $in: ids } }, { $set: { isTrashed: false, trashedAt: null } });
      await recordActivity({
        user: user.userId,
        userName: user.username,
        action: 'BULK_RESTORE_PORTFOLIO_ITEMS',
        entity: 'Portfolio',
        details: { ids, message: `Bulk restored ${ids.length} portfolio items from trash` },
        ip,
      });
    }

    await revalidatePortfolio(slugs);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Portfolio bulk action error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
