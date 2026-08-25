const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'mdseo2025';

async function seedPages() {
    if (!uri) {
        console.error("MONGODB_URI not found in .env.local");
        return;
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('pages');

        const pages = [
            {
                slug: 'home',
                title: 'Home Page',
                template: 'home',
                status: 'published',
                metadata: {
                    title: 'Mohsin Designs | Home',
                    description: 'Welcome to Mohsin Designs - Your Home Improvement Experts.'
                },
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                slug: 'about',
                title: 'About Us',
                template: 'about',
                status: 'published',
                metadata: {
                    title: 'About Mohsin Designs',
                    description: 'Learn about our history, mission, and commitment to excellence.'
                },
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                slug: 'services',
                title: 'Our Services',
                template: 'services',
                status: 'published',
                metadata: {
                    title: 'Our Services | Mohsin Designs',
                    description: 'Explore our wide range of home improvement services.'
                },
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                slug: 'about/team',
                title: 'Meet The Team',
                template: 'team',
                status: 'published',
                metadata: {
                    title: 'Our Team | Mohsin Designs',
                    description: 'Meet the professionals behind Mohsin Designs.'
                },
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                slug: 'about/careers',
                title: 'Join Our Team',
                template: 'careers',
                status: 'published',
                metadata: {
                    title: 'Careers | Mohsin Designs',
                    description: 'Explore career opportunities with Mohsin Designs.'
                },
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                slug: 'reviews',
                title: 'Customer Reviews',
                template: 'reviews',
                status: 'published',
                metadata: {
                    title: 'Reviews | Mohsin Designs',
                    description: 'Read what our customers have to say about us.'
                },
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                slug: 'faq',
                title: 'Frequently Asked Questions',
                template: 'faq',
                status: 'published',
                metadata: {
                    title: 'FAQ | Mohsin Designs',
                    description: 'Find answers to common questions about our services.'
                },
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                slug: 'gallery',
                title: 'Project Gallery',
                template: 'gallery',
                status: 'published',
                metadata: {
                    title: 'Portfolio | Mohsin Designs',
                    description: 'View our completed projects and quality workmanship.'
                },
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                slug: 'contact-us',
                title: 'Contact Us',
                template: 'contact',
                status: 'published',
                metadata: {
                    title: 'Contact | Mohsin Designs',
                    description: 'Get in touch with us for a free estimate.'
                },
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        for (const page of pages) {
            await collection.updateOne(
                { slug: page.slug },
                { $set: page },
                { upsert: true }
            );
        }

        console.log(`Successfully seeded ${pages.length} pages into "${dbName}.pages"`);

    } catch (err) {
        console.error("Error seeding pages:", err);
    } finally {
        await client.close();
    }
}

seedPages();
