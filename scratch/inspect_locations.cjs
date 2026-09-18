require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function inspectLocations() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Page = mongoose.connection.collection('pages');

  // Count by template
  const templates = ['country', 'state', 'city', 'location', 'locations', 'service-area'];
  console.log('=== COUNT BY TEMPLATE ===');
  for (const t of templates) {
    const count = await Page.countDocuments({ template: t });
    const published = await Page.countDocuments({ template: t, status: 'published', isTrashed: { $ne: true } });
    console.log(`Template: ${t.padEnd(15)} Total: ${count} | Published: ${published}`);
  }

  // Inspect all pages with these templates
  const locationPages = await Page.find({
    template: { $in: templates }
  }).toArray();

  console.log(`\nTotal location-related documents: ${locationPages.length}`);

  // Sample keys in content for each template
  console.log('\n=== CONTENT STRUCTURE SAMPLES ===');
  for (const t of templates) {
    const sample = locationPages.find(p => p.template === t);
    if (sample) {
      console.log(`\nTemplate: ${t} (Slug: /${sample.slug})`);
      console.log('Top-level doc keys:', Object.keys(sample));
      console.log('Content keys:', Object.keys(sample.content || {}));
      console.log('Content state/country/city fields:', {
        country: sample.content?.country,
        state: sample.content?.state,
        city: sample.content?.city,
        stateName: sample.content?.stateName,
        cityName: sample.content?.cityName,
        locationName: sample.content?.locationName,
        parent: sample.content?.parent,
        hero: sample.content?.hero,
      });
    }
  }

  // Inspect all city documents specifically
  const cityPages = locationPages.filter(p => p.template === 'city');
  console.log(`\n=== CITY PAGES ANALYSIS (Count: ${cityPages.length}) ===`);
  const citiesSummary = cityPages.map(c => ({
    id: c._id.toString(),
    title: c.title,
    slug: c.slug,
    status: c.status,
    isTrashed: !!c.isTrashed,
    contentCountry: c.content?.country || c.content?.hero?.country,
    contentState: c.content?.state || c.content?.stateName || c.content?.hero?.state || c.content?.hero?.stateName,
    contentCity: c.content?.city || c.content?.cityName || c.content?.hero?.city || c.content?.hero?.cityName || c.content?.locationName,
  }));
  console.log(`Found ${citiesSummary.length} cities. First 15:`);
  console.table(citiesSummary.slice(0, 15));

  // Inspect all state documents specifically
  const statePages = locationPages.filter(p => p.template === 'state');
  console.log(`\n=== STATE PAGES ANALYSIS (Count: ${statePages.length}) ===`);
  const statesSummary = statePages.map(s => ({
    id: s._id.toString(),
    title: s.title,
    slug: s.slug,
    status: s.status,
    isTrashed: !!s.isTrashed,
    contentCountry: s.content?.country || s.content?.hero?.country,
    contentState: s.content?.state || s.content?.stateName || s.content?.hero?.state || s.content?.hero?.stateName,
  }));
  console.table(statesSummary);

  // Inspect all country documents specifically
  const countryPages = locationPages.filter(p => p.template === 'country');
  console.log(`\n=== COUNTRY PAGES ANALYSIS (Count: ${countryPages.length}) ===`);
  const countriesSummary = countryPages.map(c => ({
    id: c._id.toString(),
    title: c.title,
    slug: c.slug,
    status: c.status,
    isTrashed: !!c.isTrashed,
    contentCountry: c.content?.country || c.content?.hero?.country,
  }));
  console.table(countriesSummary);

  await mongoose.disconnect();
}

inspectLocations().catch(console.error);
