import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Tag from '@/models/Tag';
import Post from '@/models/Post';
import { hasPermission } from '@/lib/rbac';
import { dbErrorResponse, revalidateBlog, slugify } from '@/lib/blog-admin';

// Edit / delete one tag. src/app/api/admin/blog/tags/[id] re-exports this file.

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasPermission(req, 'blog', 'update'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  try {
    const { id } = await params;
    const body = await req.json();
    const update: Record<string, string> = {};
    if (body?.name !== undefined) {
      update.name = String(body.name).trim();
      if (!update.name) return NextResponse.json({ error: 'Tag name is required.' }, { status: 400 });
    }
    if (body?.slug !== undefined) {
      update.slug = slugify(body.slug);
      if (!update.slug) return NextResponse.json({ error: 'Slug is required (use letters or numbers).' }, { status: 400 });
    }

    await connectToDatabase();
    const tag = await Tag.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!tag) return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    await revalidateBlog([]);
    return NextResponse.json(tag);
  } catch (error: any) {
    return dbErrorResponse(error, 'tag');
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasPermission(req, 'blog', 'delete'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  try {
    const { id } = await params;
    await connectToDatabase();
    const tag = await Tag.findByIdAndDelete(id);
    if (!tag) return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    const cleaned = await Post.updateMany({ tags: id }, { $pull: { tags: id } });
    await revalidateBlog([]);
    return NextResponse.json({ success: true, postsUpdated: cleaned.modifiedCount ?? 0 });
  } catch (error: any) {
    return dbErrorResponse(error, 'tag');
  }
}
