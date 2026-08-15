const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log("COLLECTIONS:", collections.map(c => c.name));
  
  for (const coll of collections) {
    const count = await db.collection(coll.name).countDocuments();
    console.log(`Collection: ${coll.name}, Count: ${count}`);
    if (coll.name === 'sitecontents') {
      const keys = await db.collection(coll.name).find({}).project({ key: 1 }).toArray();
      console.log(`sitecontents keys:`, keys);
    }
  }
  process.exit(0);
}

run();
