const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function findAnyContactPage() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Page = mongoose.connection.db.collection('pages');
    
    // Search for anything containing "contact"
    const contactPages = await Page.find({ slug: /contact/i }).toArray();
    
    console.log(`Found ${contactPages.length} page(s) with "contact" in the slug:`);
    contactPages.forEach(p => {
      console.log(`- Title: ${p.title}, Slug: "${p.slug}", Status: ${p.status}, isTrashed: ${p.isTrashed}`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

findAnyContactPage();
