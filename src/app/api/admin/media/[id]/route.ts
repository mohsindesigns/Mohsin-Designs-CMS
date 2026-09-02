import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Media from '@/models/Media';
import { unlink } from 'fs/promises';
import path from 'path';
import { hasPermission, getSessionUser } from '@/lib/rbac';
import { recordActivity } from '@/lib/logger';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser(req);
  if (!(await hasPermission(req, 'media', 'update'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id } = await params;
    await connectToDatabase();
    const body = await req.json();
    const { alt, title, description } = body;

    const updatedMedia = await Media.findByIdAndUpdate(
      id,
      { alt, title, description, updatedAt: Date.now() },
      { new: true }
    );

    if (!updatedMedia) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    await recordActivity({
      user: (session as any)?.userId,
      userName: (session as any)?.username,
      action: 'UPDATE_MEDIA',
      entity: 'Media',
      entityId: id,
      details: { title: updatedMedia.title, name: updatedMedia.name },
      ip: req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown'
    });

    return NextResponse.json(updatedMedia);
  } catch (error: any) {
    console.error('Media update error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser(req);
  if (!(await hasPermission(req, 'media', 'delete'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id } = await params;
    await connectToDatabase();
    
    // Find media record to get the URL
    const media = await Media.findById(id);
    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Attempt to delete physical file
    try {
      const filename = media.url.split('/').pop();
      if (filename) {
        const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
        await unlink(filePath);
      }
    } catch (err) {
      console.warn('Physical file deletion failed or file already gone:', err);
    }

    await Media.findByIdAndDelete(id);

    await recordActivity({
      user: (session as any)?.userId,
      userName: (session as any)?.username,
      action: 'DELETE_MEDIA',
      entity: 'Media',
      entityId: id,
      details: { name: media.name, url: media.url },
      ip: req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown'
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Media delete error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
