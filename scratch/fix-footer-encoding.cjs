const { MongoClient } = require('mongodb');
const uri = 'mongodb://ammansoor0077_db_user:IVIuSAD1EiIGKuxH@ac-0nknxvb-shard-00-00.chmqmrp.mongodb.net:27017,ac-0nknxvb-shard-00-01.chmqmrp.mongodb.net:27017,ac-0nknxvb-shard-00-02.chmqmrp.mongodb.net:27017/eagle_revolution?ssl=true&replicaSet=atlas-pqmvql-shard-0&authSource=admin&appName=Cluster0';

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('eagle_revolution');
  const doc = await db.collection('site_contents').findOne({ key: 'complete_data' });
  const data = doc.data;

  // Fix UTF-8 encoding issues
  data.footer.bottom.copyright = '\u00A9 2026 Eagle Revolution';
  data.footer.bottom.tagline = 'VETERAN OWNED \u2022 INTEGRITY \u2022 CRAFTSMANSHIP';

  await db.collection('site_contents').updateOne(
    { key: 'complete_data' },
    { $set: { data: data } }
  );

  // Verify
  const updated = await db.collection('site_contents').findOne({ key: 'complete_data' });
  console.log('✅ copyright:', updated.data.footer.bottom.copyright);
  console.log('✅ tagline:', updated.data.footer.bottom.tagline);
  await client.close();
}
main().catch(console.error);
