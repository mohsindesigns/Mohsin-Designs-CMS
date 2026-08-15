const mongoose = require('mongoose');

async function listCollections() {
  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri);
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log("COLLECTIONS:", collections.map(c => c.name));
  process.exit(0);
}

listCollections();
