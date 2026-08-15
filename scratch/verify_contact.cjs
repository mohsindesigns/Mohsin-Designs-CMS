const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function verifyContactPage() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Page = mongoose.connection.db.collection('pages');
    
    // Check for "contact" and "/contact" just in case
    const contactPages = await Page.find({ slug: { $in: ['contact', '/contact'] } }).toArray();
    
    if (contactPages.length > 0) {
      console.log(`Found ${contactPages.length} contact page(s):`);
      contactPages.forEach(p => {
        console.log(`- Title: ${p.title}, Slug: "${p.slug}", Status: ${p.status}, isTrashed: ${p.isTrashed}`);
      });
    } else {
      console.log('No page with slug "contact" or "/contact" found.');
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

verifyContactPage();
