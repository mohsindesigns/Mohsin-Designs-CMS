const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://mdseo2025_db_user:UElPBA47l5oQf2oX@ac-rtmxchd-shard-00-00.havgrhc.mongodb.net:27017,ac-rtmxchd-shard-00-01.havgrhc.mongodb.net:27017,ac-rtmxchd-shard-00-02.havgrhc.mongodb.net:27017/mdseo2025?ssl=true&replicaSet=atlas-qtu58a-shard-0&authSource=admin";

async function check() {
  await mongoose.connect(MONGODB_URI);
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log("COLLECTIONS:", collections.map(c => c.name));
  
  for (const c of collections) {
    const count = await mongoose.connection.db.collection(c.name).countDocuments();
    console.log(`Collection ${c.name}: ${count} docs`);
    if (c.name.toLowerCase().includes('content')) {
      const docs = await mongoose.connection.db.collection(c.name).find({}).project({ key: 1, _id: 1 }).toArray();
      console.log(`Docs in ${c.name}:`, docs);
    }
  }

  await mongoose.disconnect();
}

check().catch(console.error);
