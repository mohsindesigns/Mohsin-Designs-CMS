const mongoose = require('mongoose');
const fs = require('fs');

async function inspect() {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const uriMatch = envContent.match(/MONGODB_URI=(.+)/);
  const uri = uriMatch ? uriMatch[1].trim() : process.env.MONGODB_URI;

  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const content = await db.collection('site_contents').findOne({ key: 'complete_data' });
  if (content && content.data) {
    console.log("data.services keys:", Object.keys(content.data.services));
    console.log("Full data.services structure:", JSON.stringify(content.data.services, null, 2).slice(0, 1000));
  }
  process.exit(0);
}

inspect().catch(err => {
  console.error(err);
  process.exit(1);
});
