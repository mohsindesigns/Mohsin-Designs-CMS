const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not found");
    return;
  }
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('eagle_revolution');
    const collection = db.collection('site_contents');
    const content = await collection.findOne({ key: 'complete_data' });
    
    if (!content || !content.data) {
      console.error("No content found in database");
      return;
    }
    
    const services = content.data.services;
    if (!services) {
      console.error("No services section found in content data");
      return;
    }

    console.log("Original description:", services.description);
    console.log("Original highlightText:", services.highlightText);

    // Perform migration
    let modified = false;
    if (Array.isArray(services.description)) {
      if (services.description.length > 1) {
        // Clear out the HTML span from description and move it to highlightText
        services.highlightText = "Veteran Owned • Licensed • Bonded & Insured";
        services.description = [services.description[0]];
        modified = true;
      }
    }

    // Always ensure highlightText is set if not already present
    if (!services.highlightText) {
      services.highlightText = "Veteran Owned • Licensed • Bonded & Insured";
      modified = true;
    }

    if (modified) {
      const result = await collection.updateOne(
        { key: 'complete_data' },
        { 
          $set: { 
            "data.services": services,
            lastUpdated: new Date()
          } 
        }
      );
      console.log(`Migration successful! Modified: ${result.modifiedCount}`);
      console.log("Updated description:", services.description);
      console.log("Updated highlightText:", services.highlightText);
    } else {
      console.log("No migration needed, database is already updated.");
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
