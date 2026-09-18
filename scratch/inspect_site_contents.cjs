require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const SiteContent = mongoose.connection.collection('site_contents');
  const docs = await SiteContent.find({}).toArray();
  for (const d of docs) {
    console.log(`_id: ${d._id}, type: ${d.type}, keys:`, Object.keys(d.data || {}));
    if (d.data?.locations || d.data?.location || d.data?.serviceArea) {
      console.log('Location keys found in data:', Object.keys(d.data.locations || d.data.location || {}));
    }
  }

  // Also let's check countryLocations.ts or location helpers in codebase
  await mongoose.disconnect();
}

main().catch(console.error);
