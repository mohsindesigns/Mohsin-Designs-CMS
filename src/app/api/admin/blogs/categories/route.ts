import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Category from '@/models/Category';
import Post from '@/models/Post';
import { hasPermission, getPermissions, getSessionUser } from '@/lib/rbac';
import { recordActivity } from '@/lib/logger';
import { dbErrorResponse, slugify } from '@/lib/blog-admin';

// The ONE categories route (src/app/api/admin/blog/categories re-exports it).

export async function GET(req: NextRequest) {
  if (!(await hasPermission(req, 'blog', 'read'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  try {
    await connectToDatabase();
    const [categories, usage] = await Promise.all([
      Category.find().sort({ name: 1 }).lean(),
      // Real usage. The stored `count` field is never maintained (it holds stale imported numbers, e.g. double the real total).
      Post.aggregate([
        { $match: { isTrashed: { $ne: true } } },
        { $unwind: '$categories' },
        { $group: { _id: '$categories', count: { $sum: 1 } } },
      ]),
    ]);
    const counts = new Map<string, number>(usage.map((u: any) => [String(u._id), u.count]));
    return NextResponse.json(categories.map((c: any) => ({ ...c, count: counts.get(String(c._id)) || 0 })));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let permissions: Record<string, any> | null;
  try {
    permissions = await getPermissions(req);
  } catch {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
  if (!(await hasPermission(req, 'blog', 'update', permissions)) && !(await hasPermission(req, 'blog', 'create', permissions))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  try {
    const body = await req.json();
    const name = String(body?.name ?? '').trim();
    if (!name) return NextResponse.json({ error: 'Category name is required.' }, { status: 400 });
    const slug = slugify(body?.slug || name);
    if (!slug) return NextResponse.json({ error: 'Slug is required (use letters or numbers).' }, { status: 400 });

    await connectToDatabase();
    const category = await Category.create({ name, slug, description: String(body?.description ?? '').trim() });
    const session: any = await getSessionUser(req);
    await recordActivity({
      user: session?.userId,
      userName: session?.username,
      action: 'CREATE_CATEGORY',
      entity: 'Category',
      entityId: String(category._id),
      details: { name: category.name },
      ip: req.headers.get('x-forwarded-for') || 'unknown',
    });
    return NextResponse.json(category);
  } catch (error: any) {
    return dbErrorResponse(error, 'category');
  }
}
