require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('=== ALL COLLECTIONS IN DATABASE ===');
  for (const c of collections) {
    const count = await mongoose.connection.collection(c.name).countDocuments();
    console.log(`Collection: ${c.name.padEnd(25)} Count: ${count}`);
  }

  // Also check Content collection document
  const Content = mongoose.connection.collection('contents');
  const allContents = await Content.find({}).toArray();
  console.log(`\n=== CONTENTS COLLECTION (${allContents.length} docs) ===`);
  allContents.forEach(c => {
    console.log(`_id: ${c._id}, type: ${c.type}, top keys: ${Object.keys(c.data || {})}`);
  });

  // Check all distinct templates in Page collection
  const Page = mongoose.connection.collection('pages');
  const distinctTemplates = await Page.distinct('template');
  console.log('\n=== DISTINCT TEMPLATES IN PAGES ===', distinctTemplates);

  const totalPages = await Page.countDocuments();
  console.log(`Total Pages in 'pages': ${totalPages}`);

  await mongoose.disconnect();
}

main().catch(console.error);
