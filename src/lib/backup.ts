import connectToDatabase from '@/lib/mongodb';
import Backup from '@/models/Backup';
import SiteContent from '@/models/Content';
import Page from '@/models/Page';

const MAX_COMPLETE_BACKUPS = 50;
const MAX_PAGE_BACKUPS = 100;

/**
 * Creates an atomic snapshot of the entire complete_data document before or after any mutation
 */
export async function createCompleteDbBackup({
  user = 'admin',
  label = 'Automated Complete DB Snapshot',
  section = 'all',
  data
}: {
  user?: string;
  label?: string;
  section?: string;
  data: any;
}) {
  try {
    await connectToDatabase();
    if (!data) return null;

    const servicesCount = Array.isArray(data?.services?.services)
      ? data.services.services.length
      : (Array.isArray(data?.services) ? data.services.length : (data?.globalServices?.length || 0));

    const backup = await Backup.create({
      type: 'complete_db',
      label,
      section,
      user,
      data,
      metadata: {
        servicesCount,
        description: `Snapshot triggered by section: ${section}`
      }
    });

    // Prune old complete_db backups keeping only latest MAX_COMPLETE_BACKUPS
    const oldBackups = await Backup.find({ type: 'complete_db' })
      .sort({ createdAt: -1 })
      .skip(MAX_COMPLETE_BACKUPS)
      .select('_id')
      .lean();

    if (oldBackups.length > 0) {
      const idsToDelete = oldBackups.map(b => b._id);
      await Backup.deleteMany({ _id: { $in: idsToDelete } });
    }

    return backup;
  } catch (error) {
    console.error('[Backup Engine] Failed to create complete DB backup:', error);
    return null;
  }
}

/**
 * Creates an atomic snapshot of an individual page before it is updated
 */
export async function createPageBackup({
  pageId,
  user = 'admin',
  label = 'Pre-Update Page Snapshot',
  pageDoc
}: {
  pageId: string;
  user?: string;
  label?: string;
  pageDoc: any;
}) {
  try {
    await connectToDatabase();
    if (!pageDoc) return null;

    const backup = await Backup.create({
      type: 'page',
      entityId: String(pageId),
      label: label || `Page snapshot: ${pageDoc.title || pageDoc.slug}`,
      section: pageDoc.slug,
      user,
      data: {
        title: pageDoc.title,
        slug: pageDoc.slug,
        template: pageDoc.template,
        status: pageDoc.status,
        seo: pageDoc.seo,
        content: pageDoc.content,
        isTrashed: pageDoc.isTrashed
      },
      metadata: {
        slug: pageDoc.slug,
        template: pageDoc.template
      }
    });

    // Prune old page backups for this entity keeping latest 20 per page
    const oldPageBackups = await Backup.find({ type: 'page', entityId: String(pageId) })
      .sort({ createdAt: -1 })
      .skip(20)
      .select('_id')
      .lean();

    if (oldPageBackups.length > 0) {
      const idsToDelete = oldPageBackups.map(b => b._id);
      await Backup.deleteMany({ _id: { $in: idsToDelete } });
    }

    return backup;
  } catch (error) {
    console.error('[Backup Engine] Failed to create page backup:', error);
    return null;
  }
}

/**
 * Restores complete_data from a specific backup ID
 */
export async function restoreCompleteDb(backupId: string) {
  await connectToDatabase();
  const backup = await Backup.findById(backupId);
  if (!backup || backup.type !== 'complete_db' || !backup.data) {
    throw new Error('Valid complete database backup not found.');
  }

  // Pre-backup the current state before rolling back
  const currentDoc = await SiteContent.findOne({ key: 'complete_data' });
  if (currentDoc?.data) {
    await Backup.create({
      type: 'complete_db',
      label: 'Auto-snapshot before rollback',
      section: 'pre-restore',
      user: 'system',
      data: currentDoc.data
    });
  }

  await SiteContent.updateOne(
    { key: 'complete_data' },
    { $set: { data: backup.data, lastUpdated: new Date() } },
    { upsert: true }
  );

  return { success: true, restoredAt: new Date(), backupLabel: backup.label };
}

/**
 * Restores a specific page from a page backup ID
 */
export async function restorePage(backupId: string) {
  await connectToDatabase();
  const backup = await Backup.findById(backupId);
  if (!backup || backup.type !== 'page' || !backup.data || !backup.entityId) {
    throw new Error('Valid page backup not found.');
  }

  const updated = await Page.findByIdAndUpdate(
    backup.entityId,
    {
      title: backup.data.title,
      slug: backup.data.slug,
      template: backup.data.template,
      status: backup.data.status,
      seo: backup.data.seo,
      content: backup.data.content,
      isTrashed: backup.data.isTrashed
    },
    { new: true }
  );

  return { success: true, page: updated };
}
