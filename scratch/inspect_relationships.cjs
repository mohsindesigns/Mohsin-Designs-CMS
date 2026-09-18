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

  // Get a sample of cities, states, countries and check what location fields exist in content or hero
  const cities = await Page.find({ template: 'city' }).project({
    slug: 1,
    title: 1,
    status: 1,
    isTrashed: 1,
    'content.country': 1,
    'content.state': 1,
    'content.city': 1,
    'content.stateSlug': 1,
    'content.countrySlug': 1,
    'content.hero.location': 1,
    'content.hero.state': 1,
    'content.hero.city': 1,
    'content.hero.titleIntro': 1,
    'content.hero.titleHighlight': 1,
    'content.hero.headline': 1,
    'content.hero.headlineHighlight': 1,
    'content.hero.badge': 1,
    'content.locationName': 1,
    'content.locationType': 1,
    'seo.canonicalUrl': 1
  }).toArray();

  console.log(`\n=== TOTAL CITIES: ${cities.length} ===`);
  console.log('Sample 10 cities:');
  console.log(JSON.stringify(cities.slice(0, 10), null, 2));

  // Check how many cities have state / country info
  let withState = 0;
  let withCountry = 0;
  let withHeroLoc = 0;
  cities.forEach(c => {
    if (c.content?.state || c.content?.hero?.state) withState++;
    if (c.content?.country || c.content?.hero?.country) withCountry++;
    if (c.content?.hero?.location || c.content?.locationName) withHeroLoc++;
  });
  console.log(`Cities count: ${cities.length}`);
  console.log(`With state: ${withState}`);
  console.log(`With country: ${withCountry}`);
  console.log(`With hero location/locationName: ${withHeroLoc}`);

  // Let's also check Country and State docs
  const states = await Page.find({ template: 'state' }).project({
    slug: 1,
    title: 1,
    status: 1,
    isTrashed: 1,
    'content.country': 1,
    'content.countrySlug': 1,
    'content.hero.location': 1,
    'content.hero.country': 1,
    'content.cities': 1,
    'content.locations': 1
  }).toArray();
  console.log(`\n=== TOTAL STATES: ${states.length} ===`);
  console.log(JSON.stringify(states, null, 2));

  const countries = await Page.find({ template: 'country' }).project({
    slug: 1,
    title: 1,
    status: 1,
    isTrashed: 1,
    'content.states': 1,
    'content.locations': 1
  }).toArray();
  console.log(`\n=== TOTAL COUNTRIES: ${countries.length} ===`);
  console.log(JSON.stringify(countries, null, 2));

  await mongoose.disconnect();
}

main().catch(console.error);
