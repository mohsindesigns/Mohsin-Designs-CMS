const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function listAllPages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Page = mongoose.connection.db.collection('pages');
    const pages = await Page.find({}).toArray();
    
    console.log(`Total Pages in Collection: ${pages.length}`);
    pages.forEach(p => {
      console.log(`- Slug: "${p.slug}", Status: ${p.status}, isTrashed: ${p.isTrashed}, Title: ${p.title}`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

listAllPages();
