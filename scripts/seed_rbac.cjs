const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
const dbName = 'eagle_revolution';

if (!MONGODB_URI) {
    console.error("MONGODB_URI not found");
    process.exit(1);
}

// Define inline schemas because we are in a CJS script and models are in TS
const RoleSchema = new mongoose.Schema({
    name: String,
    permissions: mongoose.Schema.Types.Mixed,
    isCustom: { type: Boolean, default: false }
});

const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    role: mongoose.Schema.Types.ObjectId,
    status: { type: String, default: 'active' }
});

const Role = mongoose.models.Role || mongoose.model('Role', RoleSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI, { dbName });
        console.log("Connected to MongoDB for RBAC seeding.");

        // 1. Create Default Roles
        const rolesData = [
            {
                name: 'Admin',
                isCustom: false,
                permissions: {
                    pages: { create: true, read: true, update: true, delete: true, publish: true },
                    media: { create: true, read: true, update: true, delete: true },
                    seo: { read: true, update: true },
                    blog: { create: true, read: true, update: true, delete: true, publish: true },
                    submissions: { read: true, delete: true },
                    settings: { read: true, update: true },
                    users: { read: true, create: true, update: true, delete: true },
                    logs: { read: true }
                }
            },
            {
                name: 'Editor',
                isCustom: false,
                permissions: {
                    pages: { create: true, read: true, update: true, delete: false, publish: true },
                    media: { create: true, read: true, update: true, delete: true },
                    seo: { read: true, update: true },
                    blog: { create: true, read: true, update: true, delete: false, publish: true },
                    submissions: { read: true, delete: false },
                    settings: { read: false, update: false },
                    users: { read: false, create: false, update: false, delete: false },
                    logs: { read: false }
                }
            },
            {
                name: 'SEO Manager',
                isCustom: false,
                permissions: {
                    pages: { create: false, read: true, update: false, delete: false, publish: false },
                    media: { create: false, read: true, update: false, delete: false },
                    seo: { read: true, update: true },
                    blog: { create: false, read: true, update: true, delete: false, publish: false },
                    submissions: { read: false, delete: false },
                    settings: { read: false, update: false },
                    users: { read: false, create: false, update: false, delete: false },
                    logs: { read: false }
                }
            },
            {
                name: 'Writer',
                isCustom: false,
                permissions: {
                    pages: { create: true, read: true, update: true, delete: false, publish: false },
                    media: { create: true, read: true, update: false, delete: false },
                    seo: { read: true, update: false },
                    blog: { create: true, read: true, update: true, delete: false, publish: false },
                    submissions: { read: false, delete: false },
                    settings: { read: false, update: false },
                    users: { read: false, create: false, update: false, delete: false },
                    logs: { read: false }
                }
            }
        ];

        for (const r of rolesData) {
            await Role.updateOne({ name: r.name }, { $set: r }, { upsert: true });
        }
        console.log("Default roles seeded.");

        // 2. Create Initial Admin User
        const adminRole = await Role.findOne({ name: 'Admin' });
        
        const adminUsername = 'admin';
        const adminPassword = 'Password123!'; // User should change this
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        await User.updateOne(
            { username: adminUsername },
            { 
                $set: {
                    username: adminUsername,
                    email: 'admin@eaglerevolution.com',
                    password: hashedPassword,
                    role: adminRole._id,
                    status: 'active'
                }
            },
            { upsert: true }
        );
        console.log(`Initial Admin User created: ${adminUsername} / ${adminPassword}`);

    } catch (err) {
        console.error("Seeding error:", err);
    } finally {
        await mongoose.connection.close();
    }
}

seed();
