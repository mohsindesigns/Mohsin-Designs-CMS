const mongoose = require('mongoose');

const SiteContentSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
}, { collection: 'sitecontents' }); // Check collection name

const PageSchema = new mongoose.Schema({
  title: String,
  template: String,
  content: mongoose.Schema.Types.Mixed
}, { collection: 'pages' });

async function checkData() {
  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri);

  // Try different collection name if needed
  const SiteContent = mongoose.models.SiteContent || mongoose.model('SiteContent', SiteContentSchema);
  const Page = mongoose.models.Page || mongoose.model('Page', PageSchema);

  const content = await SiteContent.findOne({ key: "complete_data" });
  if (content) {
    console.log("GLOBAL PORTFOLIO HEADLINE:", content.data?.portfolio?.section?.headline);
    console.log("GLOBAL PORTFOLIO PROJECTS COUNT:", content.data?.portfolio?.projects?.length);
  } else {
    console.log("GLOBAL DATA NOT FOUND");
  }

  const pages = await Page.find({ template: 'home' });
  console.log(`FOUND ${pages.length} HOME PAGES`);
  pages.forEach(p => {
    console.log(`PAGE [${p.title}] HEADLINE:`, p.content?.portfolio?.section?.headline);
    console.log(`PAGE [${p.title}] PROJECTS COUNT:`, p.content?.portfolio?.projects?.length);
  });

  process.exit(0);
}

checkData();
