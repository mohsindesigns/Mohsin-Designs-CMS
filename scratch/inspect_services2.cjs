const mongoose = require('mongoose');
const fs = require('fs');

async function inspect() {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const uriMatch = envContent.match(/MONGODB_URI=(.+)/);
  const uri = uriMatch ? uriMatch[1].trim() : process.env.MONGODB_URI;

  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const content = await db.collection('site_contents').findOne({ key: 'complete_data' });
  if (content && content.data) {
    console.log("Services in site_contents:", {
      isServicesArray: Array.isArray(content.data.services),
      servicesKeys: typeof content.data.services === 'object' ? Object.keys(content.data.services) : null,
      servicesCount: content.data.services?.services?.length,
      listCount: content.data.services?.list?.length,
      servicesSample: (content.data.services?.services || content.data.services || []).slice(0, 5).map(s => ({ title: s.title, id: s.id, slug: s.slug })),
      listSample: (content.data.services?.list || []).map(s => ({ title: s.title, id: s.id, slug: s.slug }))
    });

    const homePage = await db.collection('pages').findOne({ slug: 'home' });
    console.log("Home page content.services in pages collection:", homePage?.content?.services);
  }
  process.exit(0);
}

inspect().catch(err => {
  console.error(err);
  process.exit(1);
});
