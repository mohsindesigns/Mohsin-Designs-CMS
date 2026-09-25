import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Post from '@/models/Post';
import { hasPermission, getSessionUser } from '@/lib/rbac';
import { recordActivity } from '@/lib/logger';
import { applyPublishRules, dbErrorResponse, pickPostFields, revalidateBlog, slugify } from '@/lib/blog-admin';

// The ONE admin single-post route (src/app/api/admin/blog/posts/[id] re-exports it).

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await hasPermission(req, 'blog', 'read'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id } = await params;
    await connectToDatabase();
    const post = await Post.findById(id).populate('categories tags').lean();
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    return NextResponse.json(post);
  } catch (error: any) {
    return dbErrorResponse(error, 'post');
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser(req);
  if (!(await hasPermission(req, 'blog', 'update'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    await connectToDatabase();

    const oldPost = await Post.findById(id);
    if (!oldPost) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    // Whitelisted fields only (was `...body`, which let the client overwrite author / timestamps / anything).
    let updateData = pickPostFields(body);
    // An unchanged slug is never rewritten (a legacy slug must not silently change its public URL on save).
    if (typeof body.slug === 'string' && body.slug.trim() === oldPost.slug) updateData.slug = oldPost.slug;
    if ('title' in updateData && !updateData.title) {
      return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
    }
    if ('slug' in updateData && !updateData.slug) {
      updateData.slug = slugify(updateData.title ?? oldPost.title);
      if (!updateData.slug) return NextResponse.json({ error: 'Slug is required (use letters or numbers).' }, { status: 400 });
    }
    if ('content' in updateData) {
      const html = String(updateData.content || '');
      if (!html.replace(/<[^>]*>/g, '').trim() && !/<img\b/i.test(html)) {
        return NextResponse.json({ error: 'Content cannot be empty.' }, { status: 400 });
      }
    }
    updateData = applyPublishRules(updateData, { status: oldPost.status, publishedAt: oldPost.publishedAt });

    if (body.isTrashed !== undefined) {
      updateData.isTrashed = !!body.isTrashed;
      updateData.trashedAt = body.isTrashed ? new Date() : null;
    }

    const post = await Post.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    await recordActivity({
      user: (session as any).userId,
      userName: (session as any).username,
      action: 'UPDATE_POST',
      entity: 'Post',
      entityId: id,
      details: { before: oldPost.title, after: post.title },
      ip: req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown'
    });

    // Also refresh the OLD url when the slug changed.
    await revalidateBlog([post?.slug, oldPost.slug]);

    return NextResponse.json(post);
  } catch (error: any) {
    return dbErrorResponse(error, 'post');
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser(req);
  if (!(await hasPermission(req, 'blog', 'delete'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id } = await params;
    await connectToDatabase();
    const post = await Post.findByIdAndDelete(id);
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    await recordActivity({
      user: (session as any).userId,
      userName: (session as any).username,
      action: 'DELETE_POST',
      entity: 'Post',
      entityId: id,
      details: { title: post?.title },
      ip: req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown'
    });

    // The public pages used to keep serving a permanently deleted post for up to a minute.
    await revalidateBlog([post.slug]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return dbErrorResponse(error, 'post');
  }
}
