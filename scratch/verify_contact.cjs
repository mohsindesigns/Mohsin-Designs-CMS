const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

async function verifyContactLead() {
  try {
    // 1. Submit lead via fetch to local server API
    const payload = {
      name: "Alex Mercer",
      email: "alex.mercer@prototype.com",
      phone: "+1 512 555 0199",
      message: "Looking for enterprise Next.js CMS architecture and high conversion design system.",
      type: "Contact Form",
      source: "/contact"
    };

    const res = await fetch('http://localhost:3000/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log('POST /api/send Response Status:', res.status);
    const json = await res.json();
    console.log('Response Body:', json);

    // 2. Query MongoDB to confirm lead saved in submissions collection
    await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB });
    const savedLead = await mongoose.connection.db.collection('submissions').findOne({ email: "alex.mercer@prototype.com" });
    console.log('Found Saved Lead in DB:', savedLead ? {
      id: savedLead._id,
      name: savedLead.name,
      email: savedLead.email,
      phone: savedLead.phone,
      type: savedLead.type,
      message: savedLead.message
    } : 'NOT FOUND');

    // 3. Clean up test lead
    if (savedLead) {
      await mongoose.connection.db.collection('submissions').deleteOne({ _id: savedLead._id });
      console.log('Cleaned up test lead.');
    }

  } catch (err) {
    console.error('Error during verification:', err);
  } finally {
    await mongoose.disconnect();
  }
}

verifyContactLead();
