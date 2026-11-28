import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Media from '@/models/Media';
import sizeOf from 'image-size';
import { deleteFile } from '@/lib/storage';
import { loadMediaHaystack, isMediaInUse } from '@/lib/mediaUsage';
import { hasPermission, getSessionUser } from '@/lib/rbac';
import { recordActivity } from '@/lib/logger';

// Matches the limit the Media Library UI advertises (MediaSelector).
const MAX_UPLOAD_SIZE = 64 * 1024 * 1024;
// SVG/HTML are deliberately excluded: served from our own origin they are stored XSS.
const ALLOWED_MIME_RE = /^(image\/(jpeg|png|webp|gif|avif|x-icon|vnd\.microsoft\.icon)|video\/(mp4|webm|quicktime))$/i;
// image-size result types accepted for image/* uploads ('heif' covers AVIFs with an mif1 major brand).
const SNIFFED_IMAGE_TYPES = new Set(['jpg', 'png', 'webp', 'gif', 'avif', 'heif', 'ico', 'cur']);

export async function GET(req: NextRequest) {
  if (!(await hasPermission(req, 'media', 'read'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  try {
    await connectToDatabase();
    const media = await Media.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(media);
  } catch (error: any) {
    console.error('Media fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!(await hasPermission(req, 'media', 'create'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  try {
    await connectToDatabase();
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 64MB limit.' }, { status: 400 });
    }

    if (!ALLOWED_MIME_RE.test(file.type || '')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, GIF, AVIF, ICO images and MP4, WebM, MOV videos are allowed.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // The declared MIME type is client-controlled (an SVG renamed .png passes it), so image
    // uploads must also match on the sniffed content type.
    const isImage = (file.type || '').toLowerCase().startsWith('image/');
    const invalidType = () => NextResponse.json(
      { error: 'Invalid file type. Only JPEG, PNG, WebP, GIF, AVIF, ICO images and MP4, WebM, MOV videos are allowed.' },
      { status: 400 }
    );
    let width = 0;
    let height = 0;
    try {
      const dimensions = sizeOf(buffer);
      if (isImage && !SNIFFED_IMAGE_TYPES.has(dimensions.type || '')) return invalidType();
      width = dimensions.width || 0;
      height = dimensions.height || 0;
    } catch (err) {
      // image-size cannot parse animated AVIF ('avis' brand), so only that type may pass unsniffed.
      if (isImage && file.type.toLowerCase() !== 'image/avif') return invalidType();
      console.warn('Could not calculate image dimensions:', err);
    }

    // Use universal storage utility
    const { uploadFile } = await import('@/lib/storage');
    const { url, publicId } = await uploadFile(file, buffer);

    const newMedia = await Media.create({
      url,
      publicId,
      name: file.name,
      type: file.type,
      size: file.size,
      width,
      height,
      alt: formData.get('alt') || '',
      title: formData.get('title') || '',
      description: formData.get('description') || '',
    });

    await recordActivity({
      user: (session as any).userId,
      userName: (session as any).username,
      action: 'UPLOAD_MEDIA',
      entity: 'Media',
      entityId: newMedia._id.toString(),
      details: { after: { url, name: file.name }, message: `Uploaded media: ${file.name}` },
      ip: req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown'
    });

    return NextResponse.json(newMedia);
  } catch (error: any) {
    console.error('Media upload error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to upload media' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!(await hasPermission(req, 'media', 'delete'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  try {
    await connectToDatabase();
    const { ids } = await req.json();
    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json({ error: 'Invalid IDs' }, { status: 400 });
    }

    // Find all records to get URLs
    const mediaItems = await Media.find({ _id: { $in: ids } });

    // Remove the stored file only when nothing on the site still uses it; otherwise just the library entry goes.
    const haystack = await loadMediaHaystack();
    const keptInUse: string[] = [];
    for (const item of mediaItems) {
      try {
        if (await isMediaInUse(item, haystack, ids)) {
          keptInUse.push(item.name || item.url);
          continue;
        }
        await deleteFile(item);
      } catch (err) {
        console.warn(`Failed to delete physical file for ${item._id}:`, err);
      }
    }

    await Media.deleteMany({ _id: { $in: ids } });

    await recordActivity({
      user: (session as any).userId,
      userName: (session as any).username,
      action: 'BULK_DELETE_MEDIA',
      entity: 'Media',
      details: { ids, message: `Bulk deleted ${ids.length} media items` },
      ip: req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown'
    });

    return NextResponse.json({ success: true, keptInUse });
  } catch (error: any) {
    console.error('Media delete error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!(await hasPermission(req, 'media', 'update'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    await connectToDatabase();
    const { id, alt, title, description } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Media ID required' }, { status: 400 });
    }

    const updatedMedia = await Media.findByIdAndUpdate(
      id,
      { $set: { alt, title, description } },
      { new: true }
    );

    if (!updatedMedia) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    await recordActivity({
      user: (session as any).userId,
      userName: (session as any).username,
      action: 'UPDATE_MEDIA',
      entity: 'Media',
      entityId: id,
      details: { 
        after: { alt, title, description }, 
        message: `Updated media metadata: ${updatedMedia.name}` 
      },
      ip: req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown'
    });

    return NextResponse.json(updatedMedia);
  } catch (error: any) {
    console.error('Media update error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
