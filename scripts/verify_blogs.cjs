const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'mdseo2025';

async function check() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  
  const postsCount = await db.collection('posts').countDocuments();
  const categoriesCount = await db.collection('categories').countDocuments();
  const tagsCount = await db.collection('tags').countDocuments();
  
  console.log(`\n--- Verification Summary ---`);
  console.log(`Total Posts in DB: ${postsCount}`);
  console.log(`Total Categories in DB: ${categoriesCount}`);
  console.log(`Total Tags in DB: ${tagsCount}`);
  
  const sample = await db.collection('posts').findOne({}, { projection: { title: 1, slug: 1, featuredImage: 1, 'seo.metaTitle': 1, status: 1 } });
  console.log(`Sample Post:`, sample);
  
  await client.close();
}

check().catch(console.error);
