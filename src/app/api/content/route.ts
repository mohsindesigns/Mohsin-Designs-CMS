import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import SiteContent from '@/models/Content';
import { hasPermission, getSessionUser } from '@/lib/rbac';
import { recordActivity } from '@/lib/logger';
import { sanitizeEncoding } from '@/lib/utils';
export const revalidate = 60; // Cache for 1 minute

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
  if (!(await hasPermission(req, 'settings', 'update'))) {
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

    await recordActivity({
      user: (session as any).userId,
      userName: (session as any).username,
      action: 'UPDATE_SETTINGS',
      entity: 'Settings',
      details: {
        before: { siteTitle: oldContent?.data?.settings?.siteTitle },
        after: { siteTitle: body?.settings?.siteTitle },
        message: 'Updated site settings and global content'
      },
      ip: req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown'
    });

    const { revalidatePath } = await import('next/cache');
    revalidatePath('/');
    revalidatePath('/services');
    revalidatePath('/blog');
    revalidatePath('/services/[slug]', 'page');
    revalidatePath('/blog/[slug]', 'page');

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Content update error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
