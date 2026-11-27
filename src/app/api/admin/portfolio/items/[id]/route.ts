import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Portfolio from '@/models/Portfolio';
import { hasPermission, getSessionUser } from '@/lib/rbac';
import { recordActivity } from '@/lib/logger';
import { BASE_URL } from '@/lib/constants';
import {
  applyPortfolioPublishRules,
  dbErrorResponse,
  pickPortfolioFields,
  revalidatePortfolio,
  slugify,
} from '@/lib/portfolio-admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasPermission(req, 'blog', 'read'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id } = await params;
    await connectToDatabase();
    const item = await Portfolio.findById(id).lean();
    if (!item) return NextResponse.json({ error: 'Portfolio item not found' }, { status: 404 });
    return NextResponse.json(item);
  } catch (error: any) {
    return dbErrorResponse(error, 'portfolio item');
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser(req);
  if (!(await hasPermission(req, 'blog', 'update'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    await connectToDatabase();

    const oldItem = await Portfolio.findById(id);
    if (!oldItem) return NextResponse.json({ error: 'Portfolio item not found' }, { status: 404 });

    let updateData = pickPortfolioFields(body);
    if (typeof body.slug === 'string' && body.slug.trim() === oldItem.slug) updateData.slug = oldItem.slug;
    if ('title' in updateData && !updateData.title) {
      return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
    }
    if ('slug' in updateData && !updateData.slug) {
      updateData.slug = slugify(updateData.title ?? oldItem.title);
      if (!updateData.slug) return NextResponse.json({ error: 'Slug is required (use letters or numbers).' }, { status: 400 });
    }
    if (updateData.slug && updateData.slug !== oldItem.slug) {
      const seo = updateData.seo ?? oldItem.toObject().seo ?? {};
      const cur = String(seo.canonicalUrl || '').trim().replace(/\/+$/, '');
      // An auto-filled canonical for the old slug would point at a dead URL; clearing it falls back to the current slug.
      if (!cur || cur === `${BASE_URL}/portfolio/${oldItem.slug}`) {
        updateData.seo = { ...seo, canonicalUrl: '' };
      }
    }
    updateData = applyPortfolioPublishRules(updateData, { status: oldItem.status, publishedAt: oldItem.publishedAt });

    if (body.isTrashed !== undefined) {
      updateData.isTrashed = !!body.isTrashed;
      updateData.trashedAt = body.isTrashed ? new Date() : null;
    }

    if (updateData.featured === true) {
      await Portfolio.updateMany({ _id: { $ne: id }, featured: true }, { $set: { featured: false } });
    }

    const item = await Portfolio.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    await recordActivity({
      user: (session as any).userId,
      userName: (session as any).username,
      action: 'UPDATE_PORTFOLIO_ITEM',
      entity: 'Portfolio',
      entityId: id,
      details: { before: oldItem.title, after: item?.title },
      ip: req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown',
    });

    await revalidatePortfolio([item?.slug, oldItem.slug]);

    return NextResponse.json(item);
  } catch (error: any) {
    return dbErrorResponse(error, 'portfolio item');
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser(req);
  if (!(await hasPermission(req, 'blog', 'delete'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id } = await params;
    await connectToDatabase();
    const item = await Portfolio.findByIdAndDelete(id);
    if (!item) return NextResponse.json({ error: 'Portfolio item not found' }, { status: 404 });

    await recordActivity({
      user: (session as any).userId,
      userName: (session as any).username,
      action: 'DELETE_PORTFOLIO_ITEM',
      entity: 'Portfolio',
      entityId: id,
      details: { title: item?.title },
      ip: req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown',
    });

    await revalidatePortfolio([item.slug]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return dbErrorResponse(error, 'portfolio item');
  }
}
