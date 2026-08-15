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
    const collection = db.collection('site_contents');
    const content = await collection.findOne({ key: 'complete_data' });
    
    if (!content || !content.data) {
      console.error("No content found in database");
      return;
    }
    
    console.log("=== SERVICES FIELD ===");
    console.dir(content.data.services, { depth: null });
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
