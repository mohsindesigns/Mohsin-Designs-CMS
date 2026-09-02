import mongoose from 'mongoose';
import fs from 'fs';

let uri = 'mongodb://127.0.0.1:27017/mohsindesigns';
if (fs.existsSync('.env.local')) {
  const env = fs.readFileSync('.env.local', 'utf8');
  const match = env.match(/MONGODB_URI=(.+)/);
  if (match) uri = match[1].trim().replace(/^["']|["']$/g, '');
}

function hasContent(obj) {
  if (!obj) return false;
  if (typeof obj === 'object' && obj.enabled === false) return false;
  if (typeof obj === 'string') return obj.trim().length > 0;
  if (typeof obj === 'number') return true;
  if (typeof obj === 'boolean') return obj;
  if (Array.isArray(obj)) return obj.length > 0 && obj.some(hasContent);
  if (typeof obj === 'object') {
    return Object.entries(obj).some(([k, v]) => k !== 'enabled' && hasContent(v));
  }
  return false;
}

async function check() {
  await mongoose.connect(uri);
  const p = await mongoose.connection.db.collection('pages').findOne({ slug: 'texas' });
  console.log('Texas Page:');
  console.log('contact:', JSON.stringify(p.content?.contact, null, 2));
  console.log('hasContent(contact):', hasContent(p.content?.contact));
  console.log('quote:', JSON.stringify(p.content?.quote, null, 2));
  console.log('hasContent(quote):', hasContent(p.content?.quote));
  console.log('about:', JSON.stringify(p.content?.about, null, 2));
  console.log('hasContent(about):', hasContent(p.content?.about));
  process.exit(0);
}

check().catch(console.error);
