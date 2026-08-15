import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import SiteContent from '@/models/Content';
import { randomUUID } from 'crypto';

const KEY = 'site_scripts_v2';

async function getScripts() {
  await connectToDatabase();
  const doc = await SiteContent.findOne({ key: KEY });
  return doc?.data || [];
}

async function saveScripts(scripts: any[]) {
  await connectToDatabase();
  await SiteContent.updateOne(
    { key: KEY },
    { $set: { data: scripts, lastUpdated: new Date() } },
    { upsert: true }
  );
}

// GET — return all scripts
export async function GET() {
  try {
    const scripts = await getScripts();
    return NextResponse.json(scripts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST — create a new script entry
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const scripts = await getScripts();
    const newScript = {
      id: randomUUID(),
      name: body.name || 'Untitled Script',
      location: body.location || 'head', // 'head' | 'body_start' | 'body_end'
      code: body.code || '',
      active: body.active !== false,
      createdAt: new Date().toISOString(),
    };
    scripts.push(newScript);
    await saveScripts(scripts);
    return NextResponse.json(newScript, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT — update an existing script by id
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    const scripts = await getScripts();
    const idx = scripts.findIndex((s: any) => s.id === id);
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    scripts[idx] = { ...scripts[idx], ...updates, id };
    await saveScripts(scripts);
    return NextResponse.json(scripts[idx]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE — remove a script by id (passed as ?id=xxx)
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const scripts = await getScripts();
    const filtered = scripts.filter((s: any) => s.id !== id);
    await saveScripts(filtered);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
