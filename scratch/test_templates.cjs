const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

async function testTemplates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB });
    
    // 1. Upsert a country page
    const countrySlug = 'test-country';
    await mongoose.connection.db.collection('pages').updateOne(
      { slug: countrySlug },
      {
        $set: {
          slug: countrySlug,
          title: 'United States Test Hub',
          template: 'country',
          status: 'published',
          content: {
            hero: {
              badgeText: 'United States Digital Hub',
              titleLine1: 'Scale Your Brand Across',
              titleConnector: 'the',
              titleLine2: 'United States',
              description: 'Custom web development and organic SEO engineered for US business growth.'
            }
          },
          seo: {
            metaTitle: 'United States Digital Hub | Mohsin Designs',
            metaDescription: 'Custom web architecture for US businesses'
          },
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    console.log('Sample country page created/updated.');

    // 2. Upsert a state page
    const stateSlug = 'test-country/texas';
    await mongoose.connection.db.collection('pages').updateOne(
      { slug: stateSlug },
      {
        $set: {
          slug: stateSlug,
          title: 'Texas Web Solutions',
          template: 'state',
          status: 'published',
          content: {
            hero: {
              badgeText: 'Texas Regional Hub',
              titleLine1: 'Digital Architecture in',
              titleConnector: 'the Lone Star',
              titleLine2: 'State of Texas',
              description: 'Local web development and high-converting design systems in Texas.'
            }
          },
          seo: {
            metaTitle: 'Texas Web Solutions | Mohsin Designs',
            metaDescription: 'High-converting web architecture for Texas businesses'
          },
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    console.log('Sample state page created/updated.');

    // 3. Test HTTP fetching of both pages via localhost:3000
    const countryRes = await fetch('http://localhost:3000/test-country');
    console.log('GET /test-country Status:', countryRes.status);
    const countryText = await countryRes.text();
    console.log('Country page contains "United States Digital Hub":', countryText.includes('United States Digital Hub'));

    const stateRes = await fetch('http://localhost:3000/test-country/texas');
    console.log('GET /test-country/texas Status:', stateRes.status);
    const stateText = await stateRes.text();
    console.log('State page contains "Texas Regional Hub":', stateText.includes('Texas Regional Hub'));
    console.log('State page does NOT contain "United States Digital Hub":', !stateText.includes('United States Digital Hub'));

    // Clean up test pages
    await mongoose.connection.db.collection('pages').deleteMany({ slug: { $in: [countrySlug, stateSlug] } });
    console.log('Cleaned up test pages from DB.');

  } catch (err) {
    console.error('Error testing templates:', err);
  } finally {
    await mongoose.disconnect();
  }
}

testTemplates();
