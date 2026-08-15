const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const doc = await db.collection('site_contents').findOne({ key: 'complete_data' });
  if (doc && doc.data && doc.data.services) {
    console.log("SERVICES KEYS:", Object.keys(doc.data.services));
    console.log("SERVICES FIELD DATA:", JSON.stringify({
      ...doc.data.services,
      services: doc.data.services.services ? `${doc.data.services.services.length} services` : 'none'
    }, null, 2));
  } else {
    console.log("Services data not found in complete_data");
  }
  process.exit(0);
}

run();
