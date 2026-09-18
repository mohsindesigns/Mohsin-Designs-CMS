require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Page = mongoose.connection.collection('pages');

  const allCities = await Page.find({ template: 'city' }).toArray();
  console.log(`=== ALL ${allCities.length} CITIES IN DB ===`);
  allCities.forEach((c, idx) => {
    console.log(`${idx + 1}. [${c._id}] "${c.title}" | slug: "${c.slug}" | isTrashed: ${!!c.isTrashed} | canonical: "${c.seo?.canonicalUrl || ''}"`);
  });

  const allStates = await Page.find({ template: 'state' }).toArray();
  console.log(`\n=== ALL ${allStates.length} STATES IN DB ===`);
  allStates.forEach((s, idx) => {
    console.log(`${idx + 1}. [${s._id}] "${s.title}" | slug: "${s.slug}" | isTrashed: ${!!s.isTrashed} | canonical: "${s.seo?.canonicalUrl || ''}"`);
  });

  const allCountries = await Page.find({ template: 'country' }).toArray();
  console.log(`\n=== ALL ${allCountries.length} COUNTRIES IN DB ===`);
  allCountries.forEach((c, idx) => {
    console.log(`${idx + 1}. [${c._id}] "${c.title}" | slug: "${c.slug}" | isTrashed: ${!!c.isTrashed} | canonical: "${c.seo?.canonicalUrl || ''}"`);
  });

  await mongoose.disconnect();
}

main().catch(console.error);
