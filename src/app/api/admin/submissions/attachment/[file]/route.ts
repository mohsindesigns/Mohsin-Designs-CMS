import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { hasPermission } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

// Must match the directory /api/send writes to; kept outside public/ so resumes are never served unauthenticated.
const SUBMISSION_UPLOAD_DIR = path.join(process.cwd(), 'private-uploads', 'submissions');

const CONTENT_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.txt': 'text/plain; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ file: string }> }) {
  if (!(await hasPermission(req, 'submissions', 'read'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { file } = await params;
  const name = decodeURIComponent(file || '');
  if (!/^[A-Za-z0-9_-]+\.[A-Za-z0-9]+$/.test(name)) {
    return NextResponse.json({ error: 'Invalid file name' }, { status: 400 });
  }
  const ext = path.extname(name).toLowerCase();
  const contentType = CONTENT_TYPES[ext];
  if (!contentType) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
  }

  try {
    const buffer = await readFile(path.join(SUBMISSION_UPLOAD_DIR, name));
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${name}"`,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'private, no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
