const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const uri = process.env.MONGODB_URI;

async function main() {
    if (!uri) {
        console.error("MONGODB_URI not found");
        return;
    }
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db('mdseo2025');
        const collections = await db.listCollections().toArray();
        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments({});
            console.log(`Collection: ${col.name}, Count: ${count}`);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}
main();
