const mongoose = require('mongoose');
const fs = require('fs');

async function inspect() {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const uriMatch = envContent.match(/MONGODB_URI=(.+)/);
  const uri = uriMatch ? uriMatch[1].trim() : process.env.MONGODB_URI;

  console.log("Connecting to:", uri.replace(/:([^:@]+)@/, ':****@'));
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const content = await db.collection('sitecontents').findOne({ key: 'complete_data' });
  if (content && content.data) {
    console.log("data.services type:", typeof content.data.services, Array.isArray(content.data.services) ? "ARRAY" : "OBJECT");
    if (typeof content.data.services === 'object' && !Array.isArray(content.data.services)) {
      console.log("data.services keys:", Object.keys(content.data.services));
      if (content.data.services.services) {
        console.log("services.services length:", content.data.services.services.length);
        console.log("Service titles in services.services:", content.data.services.services.map(s => ({ title: s.title, id: s.id, _id: s._id, slug: s.slug })));
      }
      if (content.data.services.list) {
        console.log("services.list length:", content.data.services.list.length);
        console.log("Service titles in services.list:", content.data.services.list.map(s => ({ title: s.title, id: s.id, slug: s.slug })));
      }
    } else if (Array.isArray(content.data.services)) {
      console.log("data.services length:", content.data.services.length);
      console.log("Titles:", content.data.services.map(s => ({ title: s.title, id: s.id, slug: s.slug })));
    }
  } else {
    console.log("No complete_data found");
  }
  process.exit(0);
}

inspect().catch(err => {
  console.error(err);
  process.exit(1);
});
