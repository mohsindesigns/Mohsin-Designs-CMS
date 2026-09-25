import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Post from '@/models/Post';
import '@/models/User';
import { hasPermission, getSessionUser } from '@/lib/rbac';
import { recordActivity } from '@/lib/logger';
import { applyPublishRules, dbErrorResponse, pickPostFields, revalidateBlog, slugify } from '@/lib/blog-admin';

// The ONE admin posts collection route (src/app/api/admin/blog/* re-exports it).

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function GET(req: NextRequest) {
  if (!(await hasPermission(req, 'blog', 'read'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let query: any = {};
    const getAll = searchParams.get('all') === 'true';

    if (getAll) {
      // Return all posts for client-side filtering and counts
    } else if (status === 'trash') {
      query.isTrashed = true;
    } else {
      query.isTrashed = { $ne: true };
      if (status) query.status = status;
    }

    if (search) {
      // Escaped: the raw string used to be compiled as a regex (invalid input -> 500, catastrophic patterns -> hang)
      const rx = escapeRegex(search.slice(0, 100));
      query.$or = [
        { title: { $regex: rx, $options: 'i' } },
        { content: { $regex: rx, $options: 'i' } }
      ];
    }

    const posts = await Post.find(query)
      // `author` and `isTrashed` were missing here, so the list always showed "admin" and could not tell trashed posts apart
      .select('title slug status featuredImage categories tags author publishedAt createdAt updatedAt isTrashed')
      .populate('categories', 'name')
      .populate('tags', 'name')
      .populate({ path: 'author', model: 'User', select: 'username' })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(posts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!(await hasPermission(req, 'blog', 'create'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();
    await connectToDatabase();

    let fields = pickPostFields(body);
    if (!fields.title) return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
    if (!fields.slug) fields.slug = slugify(fields.title);
    if (!fields.slug) return NextResponse.json({ error: 'Slug is required (use letters or numbers).' }, { status: 400 });
    const contentHtml = String(fields.content || '');
    if (!contentHtml.replace(/<[^>]*>/g, '').trim() && !/<img\b/i.test(contentHtml)) {
      return NextResponse.json({ error: 'Write some content before saving.' }, { status: 400 });
    }
    fields = applyPublishRules(fields, null);

    const post = await Post.create({
      ...fields,
      author: (session as any).userId
    });

    await recordActivity({
      user: (session as any).userId,
      userName: (session as any).username,
      action: 'CREATE_POST',
      entity: 'Post',
      entityId: post._id.toString(),
      details: { title: post.title },
      ip: req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown'
    });

    // The public listing / sitemap / home blog section otherwise lag up to 60s behind a new post.
    await revalidateBlog([post.slug]);

    return NextResponse.json(post);
  } catch (error: any) {
    return dbErrorResponse(error, 'post');
  }
}
