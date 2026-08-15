import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Media from '@/models/Media';
import SiteContent from '@/models/Content';
import { unlink, writeFile } from 'fs/promises';
import path from 'path';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 1. Find existing media record
    const oldMedia = await Media.findById(id);
    if (!oldMedia) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    const oldUrl = oldMedia.url;
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // 2. Generate new file info
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name.replace(/\s+/g, '-')}`;
    const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
    const newUrl = `/uploads/${filename}`;

    // 3. Save new physical file
    await writeFile(filePath, buffer);

    // 4. Update all occurrences in SiteContent (Global Search & Replace)
    const contentRecord = await SiteContent.findOne({ key: 'complete_data' });
    if (contentRecord) {
      // Recursive function to replace URLs in deep JSON
      const replaceUrl = (obj: any): any => {
        if (typeof obj !== 'object' || obj === null) return obj;
        
        for (let key in obj) {
          if (typeof obj[key] === 'string' && obj[key] === oldUrl) {
            obj[key] = newUrl;
          } else if (typeof obj[key] === 'object') {
            obj[key] = replaceUrl(obj[key]);
          }
        }
        return obj;
      };

      const updatedData = replaceUrl(JSON.parse(JSON.stringify(contentRecord.data)));
      await SiteContent.updateOne(
        { key: 'complete_data' },
        { $set: { data: updatedData, lastUpdated: new Date() } }
      );
    }

    // 5. Update the Media record
    const updatedMedia = await Media.findByIdAndUpdate(
      id,
      {
        url: newUrl,
        name: filename,
        size: file.size,
        type: file.type,
        updatedAt: Date.now()
      },
      { new: true }
    );

    // 6. Delete the old physical file
    try {
      const oldFilename = oldUrl.split('/').pop();
      if (oldFilename) {
        const oldFilePath = path.join(process.cwd(), 'public', 'uploads', oldFilename);
        await unlink(oldFilePath);
      }
    } catch (err) {
      console.warn('Old file deletion failed:', err);
    }

    return NextResponse.json(updatedMedia);
  } catch (error: any) {
    console.error('Media replacement error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
