import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Tag from '@/models/Tag';
import Post from '@/models/Post';
import { hasPermission, getPermissions, getSessionUser } from '@/lib/rbac';
import { recordActivity } from '@/lib/logger';
import { dbErrorResponse, slugify } from '@/lib/blog-admin';

// The ONE tags route (src/app/api/admin/blog/tags re-exports it).

export async function GET(req: NextRequest) {
  if (!(await hasPermission(req, 'blog', 'read'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  try {
    await connectToDatabase();
    const [tags, usage] = await Promise.all([
      Tag.find().sort({ name: 1 }).lean(),
      Post.aggregate([
        { $match: { isTrashed: { $ne: true } } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
      ]),
    ]);
    const counts = new Map<string, number>(usage.map((u: any) => [String(u._id), u.count]));
    return NextResponse.json(tags.map((t: any) => ({ ...t, count: counts.get(String(t._id)) || 0 })));
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
    if (!name) return NextResponse.json({ error: 'Tag name is required.' }, { status: 400 });
    const slug = slugify(body?.slug || name);
    if (!slug) return NextResponse.json({ error: 'Slug is required (use letters or numbers).' }, { status: 400 });

    await connectToDatabase();
    const tag = await Tag.create({ name, slug });
    const session: any = await getSessionUser(req);
    await recordActivity({
      user: session?.userId,
      userName: session?.username,
      action: 'CREATE_TAG',
      entity: 'Tag',
      entityId: String(tag._id),
      details: { name: tag.name },
      ip: req.headers.get('x-forwarded-for') || 'unknown',
    });
    return NextResponse.json(tag);
  } catch (error: any) {
    return dbErrorResponse(error, 'tag');
  }
}
