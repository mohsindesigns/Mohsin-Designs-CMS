const { MongoClient } = require('mongodb');

async function run() {
  const uri = "mongodb+srv://mansoor:mansoor@cluster0.p8v6n.mongodb.net/eagle-revolution?retryWrites=true&w=majority";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('eagle-revolution');
    
    // Check site_contents
    const content = await db.collection('site_contents').findOne({ key: 'complete_data' });
    console.log("Keys in complete_data:", Object.keys(content.data));
    
    if (content.data.portfolio) {
        console.log("PORTFOLIO PROJECTS COUNT:", content.data.portfolio.projects?.length);
        if (content.data.portfolio.projects?.length > 0) {
            console.log("FIRST PORTFOLIO PROJECT:", content.data.portfolio.projects[0].title);
        }
    }
    
    if (content.data.galleryPage) {
        console.log("GALLERY PAGE PROJECTS COUNT:", content.data.galleryPage.projects?.length);
        if (content.data.galleryPage.projects?.length > 0) {
            console.log("FIRST GALLERY PROJECT:", content.data.galleryPage.projects[0].title);
        }
    }

    // Also check for 'projects' collection or key
    console.log("Does 'projects' key exist in data?", !!content.data.projects);

  } finally {
    await client.close();
  }
}

run().catch(console.dir);
