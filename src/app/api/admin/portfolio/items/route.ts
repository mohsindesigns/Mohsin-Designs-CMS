import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Portfolio from '@/models/Portfolio';
import { hasPermission, getSessionUser } from '@/lib/rbac';
import { recordActivity } from '@/lib/logger';
import {
  applyPortfolioPublishRules,
  dbErrorResponse,
  pickPortfolioFields,
  revalidatePortfolio,
  slugify,
} from '@/lib/portfolio-admin';

export const dynamic = 'force-dynamic';

// Reuses the 'blog' RBAC module for Portfolio (no dedicated module was added to Role.ts /
// admin/layout.tsx - anyone who can manage blog posts can manage case studies).

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
    const getAll = searchParams.get('all') === 'true';

    let query: any = {};
    if (getAll) {
      // client-side filtering + counts
    } else if (status === 'trash') {
      query.isTrashed = true;
    } else {
      query.isTrashed = { $ne: true };
      if (status) query.status = status;
    }

    if (search) {
      const rx = escapeRegex(search.slice(0, 100));
      query.$or = [
        { title: { $regex: rx, $options: 'i' } },
        { client: { $regex: rx, $options: 'i' } },
        { summary: { $regex: rx, $options: 'i' } },
      ];
    }

    const items = await Portfolio.find(query)
      .select('title slug client industry status thumbnail featured services publishedAt createdAt updatedAt isTrashed')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(items);
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

    let fields = pickPortfolioFields(body);
    if (!fields.title) return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
    if (!fields.slug) fields.slug = slugify(fields.title);
    if (!fields.slug) return NextResponse.json({ error: 'Slug is required (use letters or numbers).' }, { status: 400 });
    fields = applyPortfolioPublishRules(fields, null);

    // Only one item should be featured at a time: unset any other item's flag first.
    if (fields.featured === true) {
      await Portfolio.updateMany({ featured: true }, { $set: { featured: false } });
    }

    const item = await Portfolio.create(fields);

    await recordActivity({
      user: (session as any).userId,
      userName: (session as any).username,
      action: 'CREATE_PORTFOLIO_ITEM',
      entity: 'Portfolio',
      entityId: item._id.toString(),
      details: { title: item.title },
      ip: req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown',
    });

    await revalidatePortfolio([item.slug]);

    return NextResponse.json(item);
  } catch (error: any) {
    return dbErrorResponse(error, 'portfolio item');
  }
}
