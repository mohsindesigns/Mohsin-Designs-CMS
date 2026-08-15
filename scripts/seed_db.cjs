const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
// Updated path for scripts folder
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const uri = process.env.MONGODB_URI;
const dbName = 'eagle_revolution';
// data path relative to root
const dataPath = path.resolve(__dirname, '../src/src/data/completeData.json');

async function seed() {
    if (!uri) {
        console.error("MONGODB_URI not found in .env.local");
        return;
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log(`Connected to MongoDB. Target DB: ${dbName}`);

        const db = client.db(dbName);
        const collection = db.collection('site_contents');

        const rawData = fs.readFileSync(dataPath, 'utf8');
        const jsonData = JSON.parse(rawData);

        const result = await collection.updateOne(
            { key: 'complete_data' },
            { 
                $set: { 
                    data: jsonData,
                    lastUpdated: new Date()
                } 
            },
            { upsert: true }
        );

        console.log(`Successfully seeded database "${dbName}". Matched: ${result.matchedCount}, Upserted: ${result.upsertedCount}`);

    } catch (err) {
        console.error("Error seeding database:", err);
    } finally {
        await client.close();
    }
}

seed();
