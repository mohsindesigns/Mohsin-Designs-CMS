const mongoose = require("mongoose");
const MONGODB_URI = "mongodb://mdseo_user:mD%26tEam%2FmDs-2026!@127.0.0.1:27017/mdseo2025?authSource=mdseo2025";

async function main() {
  await mongoose.connect(MONGODB_URI);
  const pages = await mongoose.connection.db.collection("pages").find({ isTrashed: { $ne: true } }).project({
    title: 1,
    slug: 1,
    template: 1,
    "content.parentLocationId": 1,
    "content.parentLocationSlug": 1,
    "content.countrySlug": 1,
    "content.stateSlug": 1,
    "content.citySlug": 1
  }).toArray();

  console.log("Total active pages:", pages.length);
  const byTmpl = {};
  pages.forEach(p => { byTmpl[p.template] = (byTmpl[p.template] || 0) + 1; });
  console.log("Pages by template:", byTmpl);

  const countries = pages.filter(p => p.template === "country");
  const states = pages.filter(p => p.template === "state");
  const cities = pages.filter(p => p.template === "city");

  console.log(`Countries: ${countries.length}, States: ${states.length}, Cities: ${cities.length}`);

  const citiesWithoutParent = cities.filter(p => !p.content?.parentLocationId);
  console.log("Cities without parentLocationId:", citiesWithoutParent.length);
  if (citiesWithoutParent.length > 0) {
    console.log("Sample cities without parentLocationId:", citiesWithoutParent.slice(0, 5).map(c => ({ title: c.title, slug: c.slug })));
  }

  const statesWithoutParent = states.filter(p => !p.content?.parentLocationId);
  console.log("States without parentLocationId:", statesWithoutParent.length);
  if (statesWithoutParent.length > 0) {
    console.log("Sample states without parentLocationId:", statesWithoutParent.slice(0, 5).map(s => ({ title: s.title, slug: s.slug })));
  }

  // Let's test parent ID matching
  const pageIdMap = new Map(pages.map(p => [String(p._id), p]));
  let matchedChildren = 0;
  let unmatchedChildren = 0;
  cities.forEach(c => {
    const parentId = c.content?.parentLocationId ? String(c.content.parentLocationId) : null;
    if (parentId && pageIdMap.has(parentId)) {
      matchedChildren++;
    } else {
      unmatchedChildren++;
    }
  });
  console.log(`Cities: ${matchedChildren} matched to parent by ID, ${unmatchedChildren} unmatched`);

  await mongoose.disconnect();
}

main().catch(console.error);
