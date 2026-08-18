const mongoose = require('mongoose');
const fs = require('fs');

async function listAll() {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const uriMatch = envContent.match(/MONGODB_URI=(.+)/);
  const uri = uriMatch ? uriMatch[1].trim() : process.env.MONGODB_URI;

  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log("Collections:", collections.map(c => c.name));

  for (const c of collections) {
    const count = await db.collection(c.name).countDocuments();
    console.log(`Collection: ${c.name}, count: ${count}`);
    const sample = await db.collection(c.name).find({}).limit(3).toArray();
    console.log(`Sample from ${c.name}:`, sample.map(s => s.key || s.slug || s.title || s._id));
  }
  process.exit(0);
}

listAll().catch(err => {
  console.error(err);
  process.exit(1);
});
