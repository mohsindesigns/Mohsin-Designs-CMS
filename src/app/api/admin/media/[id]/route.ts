import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Media from '@/models/Media';
import { unlink } from 'fs/promises';
import path from 'path';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    return NextResponse.json(updatedMedia);
  } catch (error: any) {
    console.error('Media update error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
      // We continue anyway to clean up the DB record
    }

    await Media.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Media delete error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
