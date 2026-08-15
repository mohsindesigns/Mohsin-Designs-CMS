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
    const s = content?.data?.services || {};
    // print core properties of services section
    console.log("Core services keys:", Object.keys(s));
    console.log("services.badge:", s.badge);
    console.log("services.headline:", s.headline);
    console.log("services.description:", s.description);
    console.log("services.highlightText:", s.highlightText);
    console.log("services.cta:", s.cta);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
