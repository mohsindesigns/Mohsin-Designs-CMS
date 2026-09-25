import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Post from '@/models/Post';
import { getSessionUser, hasPermission } from '@/lib/rbac';
import { recordActivity } from '@/lib/logger';
import { revalidateBlog, toIdList } from '@/lib/blog-admin';

// The ONE bulk route (src/app/api/admin/blog/posts/bulk re-exports it).

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req) as any;
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

    // Any signed-in user could previously bulk-delete posts: enforce the same RBAC as the single-post routes.
    const needed = action === 'delete' ? 'delete' : 'update';
    if (!(await hasPermission(req, 'blog', needed))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    // "scheduled" needs a date, which only the post editor can set.
    if (action === 'status' && !['draft', 'published'].includes(value)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await connectToDatabase();

    // Collect slugs BEFORE a permanent delete so their public pages can be refreshed afterwards.
    const affectedPosts = await Post.find({ _id: { $in: ids } }, 'slug').lean();
    const slugs = affectedPosts.map((p: any) => p.slug);
    const ip = req.headers.get('x-forwarded-for') || 'unknown';

    if (action === 'delete') {
      await Post.deleteMany({ _id: { $in: ids } });
      await recordActivity({
        user: user.userId,
        userName: user.username,
        action: 'BULK_DELETE_POSTS',
        entity: 'Post',
        details: { ids, message: `Bulk deleted ${ids.length} posts` },
        ip
      });
    } else if (action === 'status') {
      if (value === 'published') {
        // Posts that were not live yet get "now" as their publish date (aggregation-pipeline update).
        await Post.updateMany(
          { _id: { $in: ids }, status: { $ne: 'published' } },
          [{ $set: { status: 'published', publishedAt: '$$NOW' } }]
        );
      } else {
        await Post.updateMany(
          { _id: { $in: ids } },
          { $set: { status: value, updatedAt: new Date() } },
          { runValidators: true }
        );
      }
      await recordActivity({
        user: user.userId,
        userName: user.username,
        action: 'BULK_STATUS_CHANGE',
        entity: 'Post',
        details: { ids, status: value, message: `Bulk changed ${ids.length} posts to ${value}` },
        ip
      });
    } else if (action === 'trash') {
      await Post.updateMany(
        { _id: { $in: ids } },
        { $set: { isTrashed: true, trashedAt: new Date() } }
      );
      await recordActivity({
        user: user.userId,
        userName: user.username,
        action: 'BULK_TRASH_POSTS',
        entity: 'Post',
        details: { ids, message: `Bulk moved ${ids.length} posts to trash` },
        ip
      });
    } else if (action === 'restore') {
      await Post.updateMany(
        { _id: { $in: ids } },
        { $set: { isTrashed: false, trashedAt: null } }
      );
      await recordActivity({
        user: user.userId,
        userName: user.username,
        action: 'BULK_RESTORE_POSTS',
        entity: 'Post',
        details: { ids, message: `Bulk restored ${ids.length} posts from trash` },
        ip
      });
    }

    await revalidateBlog(slugs);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Bulk action error:", err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
