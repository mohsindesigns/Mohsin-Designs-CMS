import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Backup from '@/models/Backup';
import SiteContent from '@/models/Content';
import { hasPermission, getSessionUser } from '@/lib/rbac';
import { createCompleteDbBackup, restoreCompleteDb, restorePage } from '@/lib/backup';
import { recordActivity } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// GET — List recent backups
export async function GET(req: NextRequest) {
  if (!(await hasPermission(req, 'settings', 'read'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    await connectToDatabase();
    const type = req.nextUrl.searchParams.get('type');
    const entityId = req.nextUrl.searchParams.get('entityId');

    const query: any = {};
    if (type) query.type = type;
    if (entityId) query.entityId = entityId;

    const backups = await Backup.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .select('-data') // exclude heavy data blob in listing
      .lean();

    return NextResponse.json({ success: true, count: backups.length, backups });
  } catch (error: any) {
    console.error('Backups fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST — Create manual on-demand backup OR restore
export async function POST(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!(await hasPermission(req, 'settings', 'update'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    await connectToDatabase();
    const body = await req.json();

    // RESTORE FLOW
    if (body.action === 'restore') {
      const { backupId, type } = body;
      if (!backupId) {
        return NextResponse.json({ error: 'backupId is required for restore' }, { status: 400 });
      }

      if (type === 'page') {
        const res = await restorePage(backupId);
        await recordActivity({
          user: (session as any)?.userId || 'admin',
          userName: (session as any)?.username || 'Admin',
          action: 'RESTORE_PAGE_BACKUP',
          entity: 'Page',
          details: { backupId, pageSlug: res.page?.slug }
        });
        return NextResponse.json({ success: true, message: 'Page restored successfully', page: res.page });
      } else {
        const res = await restoreCompleteDb(backupId);
        await recordActivity({
          user: (session as any)?.userId || 'admin',
          userName: (session as any)?.username || 'Admin',
          action: 'RESTORE_COMPLETE_DB_BACKUP',
          entity: 'Content',
          details: { backupId, backupLabel: res.backupLabel }
        });
        return NextResponse.json({ success: true, message: 'Complete database restored successfully' });
      }
    }

    // MANUAL BACKUP FLOW
    const currentDoc = await SiteContent.findOne({ key: 'complete_data' });
    if (!currentDoc?.data) {
      return NextResponse.json({ error: 'No complete_data document found to backup' }, { status: 404 });
    }

    const backup = await createCompleteDbBackup({
      user: (session as any)?.username || 'admin',
      label: body.label || 'Manual on-demand complete database backup',
      section: 'manual',
      data: currentDoc.data
    });

    await recordActivity({
      user: (session as any)?.userId || 'admin',
      userName: (session as any)?.username || 'Admin',
      action: 'CREATE_MANUAL_BACKUP',
      entity: 'Backup',
      details: { backupId: backup?._id, label: body.label || 'Manual backup' }
    });

    return NextResponse.json({
      success: true,
      message: 'Atomic complete database backup created successfully',
      backup: {
        id: backup?._id,
        label: backup?.label,
        createdAt: backup?.createdAt
      }
    });

  } catch (error: any) {
    console.error('Backup action error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
