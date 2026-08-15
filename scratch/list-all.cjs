const { MongoClient } = require('mongodb');
const uri = 'mongodb://ammansoor0077_db_user:IVIuSAD1EiIGKuxH@ac-0nknxvb-shard-00-00.chmqmrp.mongodb.net:27017,ac-0nknxvb-shard-00-01.chmqmrp.mongodb.net:27017,ac-0nknxvb-shard-00-02.chmqmrp.mongodb.net:27017/eagle_revolution?ssl=true&replicaSet=atlas-pqmvql-shard-0&authSource=admin&appName=Cluster0';

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('eagle_revolution');

  const pages = await db.collection('pages').find({}, {
    projection: { _id: 1, slug: 1, title: 1, status: 1, template: 1 }
  }).toArray();

  const doc = await db.collection('site_contents').findOne({ key: 'complete_data' });
  const services = doc.data.services.services || [];

  console.log('PAGES:', JSON.stringify(pages, null, 2));
  console.log('SERVICES:', JSON.stringify(services.map(s => ({ title: s.title, slug: s.slug, status: s.status })), null, 2));
  await client.close();
}
main().catch(console.error);
