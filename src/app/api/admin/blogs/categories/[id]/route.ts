import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Category from '@/models/Category';
import Post from '@/models/Post';
import { hasPermission } from '@/lib/rbac';
import { dbErrorResponse, revalidateBlog, slugify } from '@/lib/blog-admin';

// Edit / delete one category (the admin list had Edit + Delete links that did nothing).
// src/app/api/admin/blog/categories/[id] re-exports this file.

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
      if (!update.name) return NextResponse.json({ error: 'Category name is required.' }, { status: 400 });
    }
    if (body?.slug !== undefined) {
      update.slug = slugify(body.slug);
      if (!update.slug) return NextResponse.json({ error: 'Slug is required (use letters or numbers).' }, { status: 400 });
    }
    if (body?.description !== undefined) update.description = String(body.description).trim();

    await connectToDatabase();
    const category = await Category.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!category) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    await revalidateBlog([]);
    return NextResponse.json(category);
  } catch (error: any) {
    return dbErrorResponse(error, 'category');
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasPermission(req, 'blog', 'delete'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  try {
    const { id } = await params;
    await connectToDatabase();
    const category = await Category.findByIdAndDelete(id);
    if (!category) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    // Integrity: no post may keep pointing at a category that no longer exists.
    const cleaned = await Post.updateMany({ categories: id }, { $pull: { categories: id } });
    await revalidateBlog([]);
    return NextResponse.json({ success: true, postsUpdated: cleaned.modifiedCount ?? 0 });
  } catch (error: any) {
    return dbErrorResponse(error, 'category');
  }
}
