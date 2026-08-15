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
    console.log("home.services keys & structure:");
    console.log(JSON.stringify(content?.data?.home?.services, null, 2));
    console.log("services.services structure (first 2 items):");
    const sList = content?.data?.services?.services || [];
    console.log(JSON.stringify(sList.slice(0, 2).map(s => ({
      title: s.title,
      slug: s.slug,
      isFeatured: s.isFeatured,
      featured: s.featured,
      isMain: s.isMain
    })), null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
