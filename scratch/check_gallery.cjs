const mongoose = require('mongoose');

const SiteContentSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
}, { collection: 'site_contents' });

async function checkGallery() {
  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri);
  const SiteContent = mongoose.models.SiteContent || mongoose.model('SiteContent', SiteContentSchema);
  const content = await SiteContent.findOne({ key: "complete_data" });
  if (content) {
    if (content.data.galleryPage) {
        console.log("GALLERY PAGE KEYS:", Object.keys(content.data.galleryPage));
        if (content.data.galleryPage.projects) {
            console.log("GALLERY PROJECTS COUNT:", content.data.galleryPage.projects.length);
            console.log("FIRST PROJECT:", JSON.stringify(content.data.galleryPage.projects[0], null, 2));
        }
    }
  }
  process.exit(0);
}

checkGallery();
