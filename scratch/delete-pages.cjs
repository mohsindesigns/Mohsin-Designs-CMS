const { MongoClient } = require('mongodb');
const uri = 'mongodb://ammansoor0077_db_user:IVIuSAD1EiIGKuxH@ac-0nknxvb-shard-00-00.chmqmrp.mongodb.net:27017,ac-0nknxvb-shard-00-01.chmqmrp.mongodb.net:27017,ac-0nknxvb-shard-00-02.chmqmrp.mongodb.net:27017/eagle_revolution?ssl=true&replicaSet=atlas-pqmvql-shard-0&authSource=admin&appName=Cluster0';

const slugsToDelete = [
  'services',
  'reviews',
  'faq',
  'about',
  'contact',
  'masnoorowntest',
  'abouttest',
  'sitemaptest',
  'test',
  'testing',
  'home-old',
  'testserviceareapage',
  'testingreal',
];

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('eagle_revolution');

  // List pages before deletion
  const before = await db.collection('pages').find({ slug: { $in: slugsToDelete } }).toArray();
  console.log('Pages to delete:', before.map(p => p.slug));

  const result = await db.collection('pages').deleteMany({ slug: { $in: slugsToDelete } });
  console.log(`✅ Deleted ${result.deletedCount} pages`);

  // Verify remaining
  const remaining = await db.collection('pages').find({}, { projection: { slug: 1, title: 1, status: 1 } }).toArray();
  console.log('Remaining pages:', remaining.map(p => `${p.slug} (${p.status})`));

  await client.close();
}
main().catch(console.error);
