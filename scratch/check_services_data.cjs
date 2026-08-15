const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const SiteContentSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
}, { collection: 'sitecontents' });

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not defined");
    process.exit(1);
  }
  await mongoose.connect(uri);
  const SiteContent = mongoose.models.SiteContent || mongoose.model('SiteContent', SiteContentSchema);
  const content = await SiteContent.findOne({ key: "complete_data" });
  if (content) {
    console.log("SERVICES KEYS:", Object.keys(content.data.services || {}));
    console.log("SERVICES ENTIRE DATA (part):", JSON.stringify(content.data.services, null, 2).substring(0, 1000));
  } else {
    console.log("complete_data not found in DB");
  }
  process.exit(0);
}

run();
