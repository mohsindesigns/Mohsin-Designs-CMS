import mongoose from 'mongoose';
import fs from 'fs';

// Read .env or .env.local
let uri = 'mongodb://127.0.0.1:27017/mohsindesigns';
if (fs.existsSync('.env.local')) {
  const env = fs.readFileSync('.env.local', 'utf8');
  const match = env.match(/MONGODB_URI=(.+)/);
  if (match) uri = match[1].trim().replace(/^["']|["']$/g, '');
} else if (fs.existsSync('.env')) {
  const env = fs.readFileSync('.env', 'utf8');
  const match = env.match(/MONGODB_URI=(.+)/);
  if (match) uri = match[1].trim().replace(/^["']|["']$/g, '');
}

async function checkTexas() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const pages = await db.collection('pages').find({ $or: [{ slug: /texas/i }, { slug: /usa/i }] }).toArray();
  console.log(`Found ${pages.length} pages matching texas/usa:`);
  for (const p of pages) {
    console.log(`Slug: ${p.slug}, Title: ${p.title}, Template: ${p.template}`);
    console.log('Content keys:', Object.keys(p.content || {}));
    console.log('Has contact:', !!p.content?.contact);
    console.log('Has quote:', !!p.content?.quote);
    console.log('Has about:', !!p.content?.about);
    console.log('Has aboutOwner:', !!p.content?.aboutOwner);
  }
  process.exit(0);
}

checkTexas().catch(console.error);
