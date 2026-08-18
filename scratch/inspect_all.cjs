const mongoose = require('mongoose');
const fs = require('fs');

async function inspect() {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const uriMatch = envContent.match(/MONGODB_URI=(.+)/);
  const uri = uriMatch ? uriMatch[1].trim() : process.env.MONGODB_URI;

  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const content = await db.collection('site_contents').findOne({ key: 'complete_data' });
  console.log("All keys in complete_data:", Object.keys(content.data));

  const allPages = await db.collection('pages').find({}).toArray();
  console.log("Pages in DB:", allPages.map(p => ({ title: p.title, slug: p.slug, template: p.template })));
  
  process.exit(0);
}

inspect().catch(err => {
  console.error(err);
  process.exit(1);
});
