const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not found");
    return;
  }
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('eagle_revolution');
    const content = await db.collection('site_contents').findOne({ key: 'complete_data' });
    const services = content?.data?.services?.services || [];
    console.log("Found services count:", services.length);
    services.forEach((s, idx) => {
      console.log(`${idx + 1}. [${s.status || 'published'}] ${s.title} (slug: ${s.slug}, id: ${s._id || s.id})`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
