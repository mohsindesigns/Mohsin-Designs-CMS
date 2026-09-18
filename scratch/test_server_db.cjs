const mongoose = require('mongoose');

async function test(uri) {
  try {
    console.log('Testing URI:', uri.replace(/:[^:@]+@/, ':***@'));
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
    console.log('CONNECTED SUCCESSFULLY!');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections count:', collections.length);
    for (const c of collections) {
      const count = await mongoose.connection.collection(c.name).countDocuments();
      console.log(`  - ${c.name}: ${count}`);
    }
    await mongoose.disconnect();
    return true;
  } catch (err) {
    console.log('Failed:', err.message);
    try { await mongoose.disconnect(); } catch {}
    return false;
  }
}

(async () => {
  const host = '2.25.158.110';
  const uris = [
    `mongodb://mdseo_user:mD%26tEam%2FmDs-2026!@${host}:27017/mdseo2025?authSource=admin`,
    `mongodb://mdseo_user:mD%26tEam%2FmDs-2026!@${host}:27017/mdseo2025`,
    `mongodb://mdseo_user:mD%26tEam%2FmDs-2026!@${host}:27017/mdseo2025?authSource=mdseo2025`
  ];
  for (const u of uris) {
    if (await test(u)) break;
  }
})();
