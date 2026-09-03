import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const targetDir = path.resolve('public/uploads/wp-media');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function downloadImage(url, destPath) {
  return new Promise((resolve) => {
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      return resolve(null);
    }

    if (fs.existsSync(destPath)) {
      const stats = fs.statSync(destPath);
      if (stats.size > 0) {
        return resolve(destPath);
      }
    }

    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 15000
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location, destPath).then(resolve);
      }

      if (res.statusCode !== 200) {
        console.warn(`⚠️ HTTP ${res.statusCode} for ${url}`);
        return resolve(null);
      }

      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve(destPath);
      });

      fileStream.on('error', (err) => {
        console.warn(`File error: ${err.message}`);
        fs.unlink(destPath, () => {});
        resolve(null);
      });
    });

    req.on('error', (err) => {
      console.warn(`Download error for ${url}:`, err.message);
      resolve(null);
    });

    req.on('timeout', () => {
      req.destroy();
      console.warn(`Timeout for ${url}`);
      resolve(null);
    });
  });
}

async function run() {
  console.log('🔍 Fetching media from Wyoming state page (and WP REST API)...');
  const res = await fetch('https://mohsindesigns.com/usa/wyoming/');
  const html = await res.text();

  // Find all image URLs
  const imgMatches = [...html.matchAll(/https?:\/\/[^\s"'<>]+\.(?:png|jpe?g|webp|svg|gif)/gi)].map(m => m[0]);
  const uniqueImages = [...new Set(imgMatches)].filter(url => url.includes('wp-content/uploads'));

  console.log(`📸 Found ${uniqueImages.length} images to download and host in public/uploads/wp-media/`);

  const urlMap = {};
  let successCount = 0;

  for (const imgUrl of uniqueImages) {
    const filename = path.basename(new URL(imgUrl).pathname);
    const destPath = path.join(targetDir, filename);
    const localUrl = `/uploads/wp-media/${filename}`;

    const saved = await downloadImage(imgUrl, destPath);
    if (saved) {
      urlMap[imgUrl] = localUrl;
      successCount++;
    }
  }

  console.log(`✅ Successfully downloaded ${successCount} images to public/uploads/wp-media/`);

  // Now update Wyoming in MongoDB so any references to remote WP image URLs point to local /uploads/wp-media/
  if (process.env.MONGODB_URI) {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db(process.env.MONGODB_DB || 'mdseo2025');
    const pagesCol = db.collection('pages');

    const wyPages = await pagesCol.find({ slug: { $in: ['usa/wyoming', 'wyoming'] } }).toArray();

    for (const p of wyPages) {
      let docStr = JSON.stringify(p);
      let updated = false;

      for (const [remoteUrl, localUrl] of Object.entries(urlMap)) {
        if (docStr.includes(remoteUrl)) {
          docStr = docStr.replaceAll(remoteUrl, localUrl);
          updated = true;
        }
      }

      // Also ensure ogImage and twitterImage are set to local hero image
      const heroImageLocal = urlMap['https://mohsindesigns.com/wp-content/uploads/2026/05/hero-image-1.webp'] || '/uploads/wp-media/hero-image-1.webp';
      const updatedDoc = JSON.parse(docStr);
      if (updatedDoc.seo) {
        if (updatedDoc.seo.ogImage?.includes('wp-content')) updatedDoc.seo.ogImage = heroImageLocal;
        if (updatedDoc.seo.twitterImage?.includes('wp-content')) updatedDoc.seo.twitterImage = heroImageLocal;
      }
      if (updatedDoc.content?.hero) {
        updatedDoc.content.hero.image = heroImageLocal;
        updatedDoc.content.hero.bgImage = heroImageLocal;
      }

      delete updatedDoc._id;
      await pagesCol.updateOne({ _id: p._id }, { $set: updatedDoc });
      console.log(`🔄 Updated database document for /${p.slug} with local media paths!`);
    }

    await client.close();
  }

  console.log('🎉 Media download & local hosting complete!');
}

run();
