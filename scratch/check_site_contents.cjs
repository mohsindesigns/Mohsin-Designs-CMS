const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const docs = await db.collection('site_contents').find({}).project({ key: 1 }).toArray();
  console.log("site_contents keys:", docs);
  
  for (const doc of docs) {
    const fullDoc = await db.collection('site_contents').findOne({ key: doc.key });
    console.log(`Key: ${doc.key}, Keys of data:`, Object.keys(fullDoc.data || {}));
    if (doc.key === 'complete_data' || doc.key === 'services') {
      console.log(`Sample of data for key ${doc.key}:`, JSON.stringify(fullDoc.data, null, 2).substring(0, 1000));
    }
  }
  process.exit(0);
}

run();
