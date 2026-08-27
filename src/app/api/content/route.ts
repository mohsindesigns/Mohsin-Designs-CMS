import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import SiteContent from '@/models/Content';
import { hasPermission, getSessionUser } from '@/lib/rbac';
import { recordActivity } from '@/lib/logger';
import { sanitizeEncoding } from '@/lib/utils';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Target the specific key we seeded
    const content = await SiteContent.findOne({ key: 'complete_data' });
    
    if (!content) {
      console.warn('Content not found in MongoDB, key: complete_data');
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }
    
    return NextResponse.json(content.data);
  } catch (error: any) {
    console.error('Content fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getSessionUser(req);
  const canUpdateSettings = await hasPermission(req, 'settings', 'update');
  const canUpdatePages = await hasPermission(req, 'pages', 'update');

  if (!canUpdateSettings && !canUpdatePages) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    await connectToDatabase();
    const body = await req.json();
    const sanitizedBody = sanitizeEncoding(body);

    const oldContent = await SiteContent.findOne({ key: 'complete_data' });

    const result = await SiteContent.updateOne(
      { key: 'complete_data' },
      { 
        $set: { 
          data: sanitizedBody,
          lastUpdated: new Date()
        } 
      },
      { upsert: true }
    );

    // Sync portfolio to Home Page document in MongoDB so it never gets overridden by stale page data
    if (sanitizedBody?.portfolio) {
      try {
        const Page = (await import('@/models/Page')).default;
        await Page.updateMany(
          { $or: [{ slug: 'home' }, { template: 'home' }, { slug: '/' }] },
          { $set: { "content.portfolio": sanitizedBody.portfolio } }
        );
      } catch (syncErr) {
        console.warn('Could not sync portfolio to Home Page doc:', syncErr);
      }
    }

    // Sync galleryPage to Gallery Page document in MongoDB
    if (sanitizedBody?.galleryPage) {
      try {
        const Page = (await import('@/models/Page')).default;
        await Page.updateMany(
          { $or: [{ slug: 'gallery' }, { template: 'gallery' }] },
          { $set: { "content.galleryPage": sanitizedBody.galleryPage } }
        );
      } catch (syncErr) {
        console.warn('Could not sync galleryPage to Gallery Page doc:', syncErr);
      }
    }

    await recordActivity({
      user: (session as any)?.userId || 'admin',
      userName: (session as any)?.username || 'Admin',
      action: 'UPDATE_CONTENT',
      entity: 'Content',
      details: {
        before: { siteTitle: oldContent?.data?.settings?.siteTitle },
        after: { siteTitle: body?.settings?.siteTitle },
        message: 'Updated site settings and global content'
      },
      ip: req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown'
    });

    const { revalidatePath } = await import('next/cache');
    revalidatePath('/', 'layout');
    revalidatePath('/');
    revalidatePath('/services');
    revalidatePath('/blog');
    revalidatePath('/locations');
    revalidatePath('/gallery');
    revalidatePath('/privacy');
    revalidatePath('/terms');
    revalidatePath('/services/[slug]', 'page');
    revalidatePath('/blog/[slug]', 'page');
    revalidatePath('/[...slug]', 'page');

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Content update error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
