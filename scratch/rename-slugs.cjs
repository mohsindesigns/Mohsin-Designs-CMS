const { MongoClient } = require('mongodb');
const uri = 'mongodb://ammansoor0077_db_user:IVIuSAD1EiIGKuxH@ac-0nknxvb-shard-00-00.chmqmrp.mongodb.net:27017,ac-0nknxvb-shard-00-01.chmqmrp.mongodb.net:27017,ac-0nknxvb-shard-00-02.chmqmrp.mongodb.net:27017/eagle_revolution?ssl=true&replicaSet=atlas-pqmvql-shard-0&authSource=admin&appName=Cluster0';

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('eagle_revolution');

  // Rename reviewss -> reviews
  const res1 = await db.collection('pages').updateOne(
    { slug: 'reviewss' },
    { $set: { slug: 'reviews' } }
  );
  console.log('Updated reviews:', res1.modifiedCount);

  // Rename servicess -> services
  const res2 = await db.collection('pages').updateOne(
    { slug: 'servicess' },
    { $set: { slug: 'services' } }
  );
  console.log('Updated services:', res2.modifiedCount);

  // Check the remaining pages
  const pages = await db.collection('pages').find({}, { projection: { slug: 1, title: 1 } }).toArray();
  console.log('Current pages in DB:', pages.map(p => `${p.title} => /${p.slug}`));

  await client.close();
}
main().catch(console.error);
