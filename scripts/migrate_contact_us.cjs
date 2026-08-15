const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const uri = process.env.MONGODB_URI;
const dbName = 'eagle_revolution';

function cleanEmailsAndLinks(obj) {
  if (!obj) return obj;
  if (typeof obj === 'string') {
    let val = obj;
    // 1. Replace '/contact' links with '/contact-us'
    if (val === '/contact') {
      val = '/contact-us';
    }
    // 2. Clean up banderson email addresses and mailto links
    if (val.toLowerCase().includes('banderson@')) {
      if (val.includes('<a')) {
        // Sanitize within HTML tag (href and inner text)
        val = val.replace(/href="mailto:[^"]*"/gi, 'href="mailto:banderson@eaglerevolution.com"');
        val = val.replace(/mailto:[a-zA-Z0-9.\s@_#-]+/gi, 'mailto:banderson@eaglerevolution.com');
        val = val.replace(/>[a-zA-Z0-9.\s@_#-]+@eaglerevolution\.com</gi, '>banderson@eaglerevolution.com<');
        val = val.replace(/>banderson@[^<]*</gi, '>banderson@eaglerevolution.com<');
      } else {
        // Plain string fallback
        val = 'banderson@eaglerevolution.com';
      }
    }
    return val;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => cleanEmailsAndLinks(item));
  }
  if (typeof obj === 'object') {
    const res = {};
    for (const key in obj) {
      res[key] = cleanEmailsAndLinks(obj[key]);
    }
    return res;
  }
  return obj;
}

async function migrate() {
    if (!uri) {
        console.error("MONGODB_URI not found in env");
        return;
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db(dbName);
        
        // 1. Delete legacy 'contact' page from pages collection
        const pagesCollection = db.collection('pages');
        const deleteResult = await pagesCollection.deleteOne({ slug: 'contact' });
        console.log(`Deleted legacy 'contact' page: ${deleteResult.deletedCount} document(s).`);

        // 2. Update all '/contact' references in site_contents collection
        const contentsCollection = db.collection('site_contents');
        const contentDoc = await contentsCollection.findOne({ key: 'complete_data' });
        if (contentDoc && contentDoc.data) {
            const updatedData = cleanEmailsAndLinks(contentDoc.data);
            const updateResult = await contentsCollection.updateOne(
                { key: 'complete_data' },
                { 
                    $set: { 
                        data: updatedData,
                        lastUpdated: new Date()
                    } 
                }
            );
            console.log(`Updated '/contact' references in site_contents: matched ${updateResult.matchedCount}, modified ${updateResult.modifiedCount}.`);
        }

        console.log("Database migration for /contact-us completed successfully.");
    } catch (err) {
        console.error("Error during migration:", err);
    } finally {
        await client.close();
    }
}

migrate();
