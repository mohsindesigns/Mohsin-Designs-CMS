const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const uri = process.env.MONGODB_URI;
const dbName = 'eagle_revolution';

async function check() {
    if (!uri) {
        console.error("MONGODB_URI not found in env");
        return;
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db(dbName);
        const contentsCollection = db.collection('site_contents');
        const contentDoc = await contentsCollection.findOne({ key: 'complete_data' });
        
        if (contentDoc && contentDoc.data) {
            console.log("=== Configured Emails in Database ===");
            console.log("Contact Page Email:", contentDoc.data.contactPage?.email || "Not configured");
            console.log("Quote Section Email:", contentDoc.data.quote?.email || "Not configured");
            console.log("Footer Contact Email:", contentDoc.data.footer?.contact?.email || "Not configured");
        } else {
            console.log("No complete_data document found in database.");
        }
    } catch (err) {
        console.error("Error connecting to database:", err);
    } finally {
        await client.close();
    }
}

check();
