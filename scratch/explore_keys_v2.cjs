const mongoose = require('mongoose');

const SiteContentSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
}, { collection: 'site_contents' });

async function checkKeys() {
  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri);
  const SiteContent = mongoose.models.SiteContent || mongoose.model('SiteContent', SiteContentSchema);
  const content = await SiteContent.findOne({ key: "complete_data" });
  if (content) {
    console.log("TOP LEVEL KEYS:", Object.keys(content.data));
    if (content.data.portfolio) {
        console.log("PORTFOLIO KEYS:", Object.keys(content.data.portfolio));
        console.log("PORTFOLIO PROJECTS COUNT:", content.data.portfolio.projects?.length);
    }
  } else {
      const all = await SiteContent.find({});
      console.log("AVAILABLE KEYS IN site_contents:", all.map(a => a.key));
  }
  process.exit(0);
}

checkKeys();
