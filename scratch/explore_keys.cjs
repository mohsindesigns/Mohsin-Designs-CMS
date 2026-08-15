const mongoose = require('mongoose');

const SiteContentSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
}, { collection: 'sitecontents' });

async function checkKeys() {
  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri);
  const SiteContent = mongoose.models.SiteContent || mongoose.model('SiteContent', SiteContentSchema);
  const content = await SiteContent.findOne({ key: "complete_data" });
  if (content) {
    console.log("TOP LEVEL KEYS:", Object.keys(content.data));
    if (content.data.home) console.log("HOME KEYS:", Object.keys(content.data.home));
    if (content.data.projects) console.log("PROJECTS KEY TYPE:", typeof content.data.projects, Array.isArray(content.data.projects) ? "Array" : "Object");
    // Print a bit of the projects if they exist
    if (content.data.projects) console.log("PROJECTS SAMPLE:", JSON.stringify(content.data.projects).slice(0, 200));
  } else {
      // Try listing all sitecontents
      const all = await SiteContent.find({});
      console.log("AVAILABLE KEYS IN sitecontents:", all.map(a => a.key));
  }
  process.exit(0);
}

checkKeys();
