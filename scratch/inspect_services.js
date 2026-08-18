const mongoose = require('mongoose');

async function inspect() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/mohsin-designs";
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const content = await db.collection('sitecontents').findOne({ key: 'complete_data' });
  if (content && content.data) {
    console.log("data.services type:", typeof content.data.services, Array.isArray(content.data.services) ? "ARRAY" : "OBJECT");
    if (typeof content.data.services === 'object' && !Array.isArray(content.data.services)) {
      console.log("data.services keys:", Object.keys(content.data.services));
      console.log("services.services length:", content.data.services.services ? content.data.services.services.length : 'none');
      console.log("services.list length:", content.data.services.list ? content.data.services.list.length : 'none');
    } else if (Array.isArray(content.data.services)) {
      console.log("data.services length:", content.data.services.length);
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
