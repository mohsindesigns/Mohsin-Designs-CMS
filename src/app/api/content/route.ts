import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import SiteContent from '@/models/Content';
import { getPermissions, checkPermission, getSessionUser, getActiveSessionUser } from '@/lib/rbac';
import { recordActivity } from '@/lib/logger';
import { sanitizeEncoding } from '@/lib/utils';
import contentDefaults from '@/data/content.json';
import { sanitizePublicContent } from '@/lib/content';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    // Target the specific key we seeded
    const content = await SiteContent.findOne({ key: 'complete_data' }).lean();
    
    if (!content || !content.data) {
      console.warn('Content not found in MongoDB, returning fallback defaults from content.json');
      return NextResponse.json(contentDefaults, { headers: { 'X-Content-Fallback': '1' } });
    }

    let session = null;
    try {
      session = await getActiveSessionUser(req);
    } catch (err) {
      // A signed-in admin must never get the stripped public payload: an editor that saves it would
      // persist the missing fields. Only fail when a session cookie is actually present.
      if (await getSessionUser(req)) {
        console.error('Content fetch: could not verify admin session', err);
        return NextResponse.json({ error: 'Could not verify session. Please retry.' }, { status: 503 });
      }
    }
    return NextResponse.json(session ? content.data : sanitizePublicContent(content.data));
  } catch (error: any) {
    console.error('Content fetch error (falling back to contentDefaults):', error);
    return NextResponse.json(contentDefaults, { status: 503, headers: { 'X-Content-Fallback': '1' } });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getSessionUser(req);
  let permissions: Record<string, any> | null;
  try {
    permissions = await getPermissions(req);
  } catch {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
  const canUpdateSettings = checkPermission(permissions, 'settings', 'update');
  const canUpdatePages = checkPermission(permissions, 'pages', 'update');

  if (!canUpdateSettings && !canUpdatePages) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    await connectToDatabase();
    const body = await req.json();
    const sanitizedBody = sanitizeEncoding(body);

    // Site-wide keys need settings.update however they arrive: via their own section, or bundled
    // into a full-merge (no section / 'complete_data') payload.
    const GLOBAL_KEYS = ['settings', 'navbar', 'footer', 'loader', 'hours', 'contact'];
    const sec = sanitizedBody?.section;
    const isFullMerge = !sec || sec === 'complete_data';
    const touchesGlobal = GLOBAL_KEYS.includes(sec) || (isFullMerge && GLOBAL_KEYS.some((k) => sanitizedBody?.[k] !== undefined));
    const needsPages = !GLOBAL_KEYS.includes(sec);
    if ((touchesGlobal && !canUpdateSettings) || (needsPages && !canUpdatePages)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

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
            // Under `data`: the schema is strict, so top-level fields here were silently dropped.
            $set: {
              'data.lastBackup': new Date(),
              'data.count': incomingList.length,
              'data.services': incomingList,
              lastUpdated: new Date()
            },
            $push: {
              'data.history': {
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

    } else if (sanitizedBody.section === 'settings') {
      // The Settings editor bundles several sibling field groups (settings, navbar, footer,
      // loader, hours) under one 'settings' section id, unlike other granular editors that
      // send a single key matching their section name - merge each provided key individually
      // so navbar/footer/loader/hours edits (e.g. the navbar logo) aren't silently dropped.
      finalData = { ...existingData };
      for (const key of ['settings', 'navbar', 'footer', 'loader', 'hours', 'contact']) {
        if (sanitizedBody[key] !== undefined) {
          finalData[key] = sanitizedBody[key];
        }
      }

      // Ensure services are NEVER touched by any other section update
      finalData.services = existingData.services;
      finalData.globalServices = existingServicesList;

    } else if (sanitizedBody.section && sanitizedBody.section !== 'complete_data') {
      // Granular section update for other editors (e.g. 'portfolio', 'faq', 'testimonials')
      const incoming = sanitizedBody[sanitizedBody.section] ?? sanitizedBody;
      const prevSection = existingData[sanitizedBody.section];
      finalData = {
        ...existingData,
        [sanitizedBody.section]: sanitizedBody.section === 'portfolio' && prevSection && typeof prevSection === 'object' && !Array.isArray(prevSection)
          ? { ...prevSection, ...incoming }
          : incoming
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

      // IMMUTABLE GLOBAL LAYOUT SHIELD:
      // Navbar, footer, settings, loader, and hours are strictly managed in Admin > Settings.
      // Other full-payload updates MUST NEVER overwrite them.
      if (sanitizedBody.section !== 'settings') {
        finalData.navbar = existingData.navbar;
        finalData.footer = existingData.footer;
        finalData.settings = existingData.settings;
        if (existingData.loader) finalData.loader = existingData.loader;
        if (existingData.hours) finalData.hours = existingData.hours;
        finalData.contact = existingData.contact;
      }
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

    // Granular sections $set only their own paths so concurrent saves of other sections aren't reverted.
    let changedKeys: string[] | null = null;
    if (sanitizedBody.section === 'services') {
      changedKeys = ['services', 'globalServices'];
    } else if (sanitizedBody.section === 'settings') {
      changedKeys = ['settings', 'navbar', 'footer', 'loader', 'hours', 'contact'].filter((k) => sanitizedBody[k] !== undefined);
    } else if (sanitizedBody.section && sanitizedBody.section !== 'complete_data' && /^[A-Za-z0-9_-]+$/.test(sanitizedBody.section)) {
      changedKeys = [sanitizedBody.section];
    }
    const setOps: Record<string, any> = { lastUpdated: new Date() };
    if (changedKeys && oldContent?.data) {
      for (const k of changedKeys) setOps[`data.${k}`] = finalData[k];
    } else {
      setOps.data = finalData;
    }

    const result = await SiteContent.updateOne(
      { key: 'complete_data' },
      { $set: setOps },
      { upsert: true }
    );

    // Sync portfolio to Home Page document in MongoDB so it never gets overridden by stale page data
    // Never copy `projects`: on the Home doc that list is the hand-picked Featured selection.
    const portfolioSet: Record<string, any> = {};
    if (sanitizedBody?.portfolio && typeof sanitizedBody.portfolio === 'object') {
      for (const [k, v] of Object.entries(sanitizedBody.portfolio)) {
        if (k !== 'projects') portfolioSet[`content.portfolio.${k}`] = v;
      }
    }
    if (Object.keys(portfolioSet).length > 0) {
      import('@/models/Page').then(({ default: PageModel }) => {
        PageModel.updateMany(
          { $or: [{ slug: 'home' }, { template: 'home' }, { slug: '/' }] },
          { $set: portfolioSet }
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
