const { MongoClient } = require('mongodb');

async function checkData() {
  const client = new MongoClient("mongodb://localhost:27017/eagle-revolution"); // Assuming local or I'll check env
  try {
    await client.connect();
    const db = client.db('eagle-revolution');
    const content = await db.collection('sitecontents').findOne({ key: 'complete_data' });
    console.log("Global Portfolio:", JSON.stringify(content?.data?.portfolio, null, 2));
    console.log("Global Home Portfolio:", JSON.stringify(content?.data?.home?.portfolio, null, 2));
    
    const pages = await db.collection('pages').find({ template: 'home' }).toArray();
    pages.forEach(p => {
      console.log(`Page [${p.title}] Portfolio:`, JSON.stringify(p.content?.portfolio, null, 2));
    });
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

checkData();
