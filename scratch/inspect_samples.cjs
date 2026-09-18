require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Page = mongoose.connection.collection('pages');

  // Count by template
  const counts = await Page.aggregate([
    { $group: { _id: { template: "$template", status: "$status", isTrashed: "$isTrashed" }, count: { $sum: 1 } } }
  ]).toArray();
  console.log('=== COUNTS BY TEMPLATE/STATUS/TRASHED ===');
  console.log(JSON.stringify(counts, null, 2));

  // Get 1 full city document
  const sampleCity = await Page.findOne({ template: 'city', isTrashed: { $ne: true } });
  console.log('\n=== SAMPLE CITY DOCUMENT ===');
  console.log(JSON.stringify(sampleCity, null, 2));

  // Get 1 full state document
  const sampleState = await Page.findOne({ template: 'state', isTrashed: { $ne: true } });
  console.log('\n=== SAMPLE STATE DOCUMENT ===');
  console.log(JSON.stringify(sampleState, null, 2));

  // Get 1 full country document
  const sampleCountry = await Page.findOne({ template: 'country', isTrashed: { $ne: true } });
  console.log('\n=== SAMPLE COUNTRY DOCUMENT ===');
  console.log(JSON.stringify(sampleCountry, null, 2));

  await mongoose.disconnect();
}

main().catch(console.error);
