const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

async function seedAdminUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB });
    const adminRole = await mongoose.connection.db.collection('roles').findOne({ name: 'Admin' });
    if (!adminRole) {
      console.error('Admin role not found');
      return;
    }
    
    // Hash for eagleadmin (from .env.local)
    const eagleUsername = process.env.ADMIN_USERNAME || 'eagleadmin';
    const eaglePass = process.env.ADMIN_PASSWORD || 'Eagle@Revolution2025';
    const hashedEaglePass = await bcrypt.hash(eaglePass, 10);
    
    await mongoose.connection.db.collection('users').updateOne(
      { username: eagleUsername },
      {
        $set: {
          username: eagleUsername,
          email: `${eagleUsername}@mohsindesigns.com`,
          password: hashedEaglePass,
          role: adminRole._id,
          status: 'active',
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    console.log(`Seeded ${eagleUsername} user successfully.`);
    
    // Also ensure admin user has known Password123!
    const hashedAdminPass = await bcrypt.hash('Password123!', 10);
    await mongoose.connection.db.collection('users').updateOne(
      { username: 'admin' },
      {
        $set: {
          username: 'admin',
          email: 'admin@mohsindesigns.com',
          password: hashedAdminPass,
          role: adminRole._id,
          status: 'active',
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    console.log('Verified admin user successfully.');

  } catch (err) {
    console.error('Error seeding admin users:', err);
  } finally {
    await mongoose.disconnect();
  }
}

seedAdminUsers();
