import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import SiteContent from '@/models/Content';
import { hasPermission, getSessionUser } from '@/lib/rbac';
import { recordActivity } from '@/lib/logger';
import { sanitizeEncoding } from '@/lib/utils';
import contentDefaults from '@/data/content.json';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Target the specific key we seeded
    const content = await SiteContent.findOne({ key: 'complete_data' }).lean();
    
    if (!content || !content.data) {
      console.warn('Content not found in MongoDB, returning fallback defaults from content.json');
      return NextResponse.json(contentDefaults);
    }
    
    return NextResponse.json(content.data);
  } catch (error: any) {
    console.error('Content fetch error (falling back to contentDefaults):', error);
    return NextResponse.json(contentDefaults);
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
    const existingData = oldContent?.data || {};
    const existingServicesList = Array.isArray(existingData.services?.services)
      ? existingData.services.services
      : (Array.isArray(existingData.services) ? existingData.services : (existingData.globalServices || []));

    let finalData: any;

    if (sanitizedBody.section === 'services') {
      // Granular update EXCLUSIVELY from the Dedicated Services Manager (/admin/services)
      const incomingList = Array.isArray(sanitizedBody.services?.services) 
        ? sanitizedBody.services.services 
        : (Array.isArray(sanitizedBody.services) ? sanitizedBody.services : (sanitizedBody.globalServices || []));
      
      // CRITICAL ACCIDENTAL-WIPEOUT SHIELD:
      // If incoming array is empty but DB has existing services, reject unless explicitly confirmed
      if (incomingList.length === 0 && existingServicesList.length > 0 && !sanitizedBody.confirmWipeAllServices) {
        console.warn('[Safety Shield] Blocked attempt to wipe all services with empty array!');
        return NextResponse.json({ 
          error: 'Safety shield blocked empty services list. Existing services preserved.',
          preservedCount: existingServicesList.length
        }, { status: 400 });
      }

      const prevServicesObj = (typeof existingData.services === 'object' && !Array.isArray(existingData.services)) 
        ? existingData.services 
        : {};
      
      finalData = {
        ...existingData,
        services: {
          ...prevServicesObj,
          services: incomingList
        },
        globalServices: incomingList
      };

      // AUTOMATIC VERSIONED SNAPSHOT:
      // Save an atomic backup in site_contents with key 'services_backup'
      try {
        await SiteContent.updateOne(
          { key: 'services_backup' },
          {
            $set: {
              lastBackup: new Date(),
              count: incomingList.length,
              services: incomingList
            },
            $push: {
              history: {
                $each: [{ timestamp: new Date(), count: incomingList.length, user: (session as any)?.username || 'admin' }],
                $slice: -20 // keep last 20 snapshots
              }
            }
          },
          { upsert: true }
        );
      } catch (backupErr) {
        console.warn('Could not write services backup:', backupErr);
      }

    } else if (sanitizedBody.section && sanitizedBody.section !== 'complete_data') {
      // Granular section update for other editors (e.g. 'settings', 'portfolio', 'faq', 'testimonials')
      finalData = {
        ...existingData,
        [sanitizedBody.section]: sanitizedBody[sanitizedBody.section] ?? sanitizedBody
      };

      // Ensure services are NEVER touched by any other section update
      finalData.services = existingData.services;
      finalData.globalServices = existingServicesList;

    } else {
      // Full payload update (from editors like Home, Settings, About, Pages/Services that send full JSON state)
      // We merge incoming updates on top of existingData BUT with strict immutable preservation for services:
      finalData = {
        ...existingData,
        ...sanitizedBody
      };

      // IMMUTABLE SERVICE SHIELD:
      // An editor that does not have section === 'services' MUST NEVER modify existing services.
      // If the incoming payload has services metadata (e.g. hero, intro for /services archive page),
      // we preserve the metadata while strictly locking the services array to the database truth.
      const prevServicesObj = (typeof existingData.services === 'object' && !Array.isArray(existingData.services))
        ? existingData.services
        : {};

      const incomingServicesObj = (typeof sanitizedBody.services === 'object' && !Array.isArray(sanitizedBody.services))
        ? sanitizedBody.services
        : {};

      finalData.services = {
        ...prevServicesObj,
        ...incomingServicesObj,
        // Always lock the services array to the live database
        services: existingServicesList
      };
      finalData.globalServices = existingServicesList;
    }

    // COMPLETE ATOMIC DATABASE SNAPSHOT (Async / Non-blocking):
    import('@/lib/backup').then(({ createCompleteDbBackup }) => {
      createCompleteDbBackup({
        user: (session as any)?.username || 'admin',
        label: `Snapshot before update (${sanitizedBody.section || 'complete_data'})`,
        section: sanitizedBody.section || 'complete_data',
        data: existingData
      }).catch((bkErr) => console.warn('[Backup Engine] Complete DB snapshot failed:', bkErr));
    }).catch((bkErr) => console.warn('[Backup Engine] Backup import failed:', bkErr));

    const result = await SiteContent.updateOne(
      { key: 'complete_data' },
      { 
        $set: { 
          data: finalData,
          lastUpdated: new Date()
        } 
      },
      { upsert: true }
    );

    // Sync portfolio to Home Page document in MongoDB so it never gets overridden by stale page data
    if (sanitizedBody?.portfolio) {
      import('@/models/Page').then(({ default: PageModel }) => {
        PageModel.updateMany(
          { $or: [{ slug: 'home' }, { template: 'home' }, { slug: '/' }] },
          { $set: { "content.portfolio": sanitizedBody.portfolio } }
        ).catch((syncErr) => console.warn('Could not sync portfolio to Home Page doc:', syncErr));
      }).catch(() => {});
    }

    // Sync galleryPage to Gallery Page document in MongoDB
    if (sanitizedBody?.galleryPage) {
      import('@/models/Page').then(({ default: PageModel }) => {
        PageModel.updateMany(
          { $or: [{ slug: 'gallery' }, { template: 'gallery' }] },
          { $set: { "content.galleryPage": sanitizedBody.galleryPage } }
        ).catch((syncErr) => console.warn('Could not sync galleryPage to Gallery Page doc:', syncErr));
      }).catch(() => {});
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

    try {
      const { revalidatePath } = await import('next/cache');
      revalidatePath('/', 'layout');
      revalidatePath('/');
    } catch (revalErr) {
      console.warn('Revalidation warning:', revalErr);
    }

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Content update error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
