const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { MongoClient, ObjectId } = require('mongodb');

require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'mdseo2025';
const blogsJsonPath = path.resolve(__dirname, '../blogsdata.json');
const uploadDir = path.resolve(__dirname, '../public/uploads/blog');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Helper to download an image from a URL and save to local disk
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
        console.warn(`[Image Download Warning] HTTP ${res.statusCode} for ${url}`);
        return resolve(null);
      }

      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve(destPath);
      });

      fileStream.on('error', (err) => {
        console.warn(`[Image File Error] ${err.message}`);
        fs.unlink(destPath, () => {});
        resolve(null);
      });
    });

    req.on('error', (err) => {
      console.warn(`[Image Request Error] ${url}: ${err.message}`);
      resolve(null);
    });

    req.on('timeout', () => {
      req.destroy();
      console.warn(`[Image Timeout] ${url}`);
      resolve(null);
    });
  });
}

// Clean Gutenberg comments while preserving clean HTML tags
function cleanGutenbergHtml(content) {
  if (!content) return "";
  let clean = content
    .replace(/<!--\s*\/?wp:[^\>]*-->/gi, "")
    .replace(/<!--\s*\/wp:[^\>]*-->/gi, "")
    .trim();
  return clean;
}

// Extract plain text snippet for excerpt / meta description
function extractExcerpt(html, maxLength = 160) {
  if (!html) return "";
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

// Extract FAQs from HTML and return cleanContent (with FAQ removed) + parsed FAQs
function extractFaqsAndCleanContent(rawHtml) {
  let content = cleanGutenbergHtml(rawHtml || '');
  const faqs = [];
  
  // Match an <h2> tag that contains FAQ or Frequently Asked Questions strictly within that single H2
  const faqH2Regex = /<h2\b[^>]*>(?:(?!<\/h2>)[\s\S])*?\b(?:FAQs?|Frequently Asked Questions)\b(?:(?!<\/h2>)[\s\S])*?<\/h2>/i;
  const match = content.match(faqH2Regex);
  
  if (!match) {
    return { cleanContent: content, faqs };
  }
  
  const beforeFaq = content.substring(0, match.index).trim();
  const faqAndAfter = content.substring(match.index + match[0].length).trim();
  
  // Find where the FAQ section ends: either at the next <h2 (e.g. CTA section) or at a trailing CTA paragraph or end of string
  const nextH2Match = faqAndAfter.match(/<h2\b[^>]*>/i);
  let faqBody = '';
  let afterFaq = '';
  
  if (nextH2Match) {
    faqBody = faqAndAfter.substring(0, nextH2Match.index).trim();
    afterFaq = faqAndAfter.substring(nextH2Match.index).trim();
  } else {
    // Check if there is a trailing CTA paragraph like <p><strong><em>Ready to...
    const ctaMatch = faqAndAfter.match(/<p[^>]*>\s*<(?:strong|em|b|i)[^>]*>[\s\S]*?(?:Ready to|Contact Mohsin|Get in Touch)[\s\S]*?<\/p>/i);
    if (ctaMatch) {
      faqBody = faqAndAfter.substring(0, ctaMatch.index).trim();
      afterFaq = faqAndAfter.substring(ctaMatch.index).trim();
    } else {
      faqBody = faqAndAfter;
      afterFaq = '';
    }
  }
  
  // Extract FAQs from faqBody:
  // Pattern 1: <h3>Question</h3><p>Answer</p>
  const h3Regex = /<h3\b[^>]*>(?:<a[^>]*><\/a>)?(?:<strong[^>]*>)?(?:[0-9]+\.\s*)?(.*?)(?:<\/strong>)?<\/h3>\s*<p[^>]*>(.*?)<\/p>/gi;
  let m;
  while ((m = h3Regex.exec(faqBody)) !== null) {
    const q = m[1].replace(/<[^>]+>/g, '').trim();
    const a = m[2].replace(/<[^>]+>/g, '').trim();
    if (q && a && q.length > 3 && a.length > 3) {
      faqs.push({ question: q, answer: a });
    }
  }
  
  // Pattern 2: If no h3 found, check <p><strong>[0-9]+\.\s*Question</strong></p><p>Answer</p>
  if (faqs.length === 0) {
    const pRegex = /<p[^>]*>\s*<strong[^>]*>(?:[0-9]+\.\s*)?(.*?)<\/strong>\s*(?:<strong[^>]*><\/strong>)?\s*<\/p>\s*<p[^>]*>(.*?)<\/p>/gi;
    while ((m = pRegex.exec(faqBody)) !== null) {
      const q = m[1].replace(/<[^>]+>/g, '').trim();
      const a = m[2].replace(/<[^>]+>/g, '').trim();
      if (q && a && q.length > 3 && a.length > 3) {
        faqs.push({ question: q, answer: a });
      }
    }
  }
  
  // Recombine content without the FAQ section
  const cleanContent = (beforeFaq + (afterFaq ? '\n\n' + afterFaq : '')).trim();
  return { cleanContent, faqs };
}

async function seed() {
  if (!uri) {
    console.error("MONGODB_URI not found in .env.local");
    process.exit(1);
  }

  console.log("=== Starting WordPress Blog Seed (Content Cleaned & FAQs Component Separated) ===");
  const rawData = fs.readFileSync(blogsJsonPath, 'utf8');
  const blogs = JSON.parse(rawData);
  console.log(`Loaded ${blogs.length} posts from blogsdata.json`);

  const client = new MongoClient(uri);
  await client.connect();
  console.log(`Connected to MongoDB. Target DB: ${dbName}`);
  const db = client.db(dbName);

  const postsCollection = db.collection('posts');
  const categoriesCollection = db.collection('categories');
  const tagsCollection = db.collection('tags');
  const usersCollection = db.collection('users');

  // Find or default author user
  let adminUser = await usersCollection.findOne({ username: 'mdseo2025' });
  if (!adminUser) {
    adminUser = await usersCollection.findOne({});
  }
  const authorId = adminUser ? adminUser._id : new ObjectId();

  let successCount = 0;
  let downloadedImagesCount = 0;
  let totalFaqsCount = 0;

  for (let i = 0; i < blogs.length; i++) {
    const b = blogs[i];
    const postSlug = (b.post_name || b.post_title || `post-${b.ID}`)
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // 1. Process and Download Featured Image
    let localFeaturedImageUrl = "";
    if (b.featured_image && b.featured_image.url) {
      const ext = path.extname(new URL(b.featured_image.url).pathname) || ".jpg";
      const safeFileName = `${postSlug}-featured${ext}`;
      const destFile = path.join(uploadDir, safeFileName);
      
      const downloaded = await downloadImage(b.featured_image.url, destFile);
      if (downloaded) {
        localFeaturedImageUrl = `/uploads/blog/${safeFileName}`;
        downloadedImagesCount++;
      } else {
        localFeaturedImageUrl = b.featured_image.url;
      }
    }

    // 2. Extract FAQs and Remove FAQ section from Content
    const { cleanContent, faqs } = extractFaqsAndCleanContent(b.post_content || "");
    totalFaqsCount += faqs.length;

    // 3. Process Embedded Content Images and Rewrite HTML
    let finalCleanContent = cleanContent;
    const imgRegex = /<img[^>]+src=["'](https?:\/\/[^"']+)["'][^>]*>/gi;
    let imgMatch;
    let imgIndex = 1;

    while ((imgMatch = imgRegex.exec(cleanContent)) !== null) {
      const remoteImgUrl = imgMatch[1];
      try {
        const ext = path.extname(new URL(remoteImgUrl).pathname) || ".jpg";
        const safeImgName = `${postSlug}-content-${imgIndex}${ext}`;
        const destImgPath = path.join(uploadDir, safeImgName);

        const dl = await downloadImage(remoteImgUrl, destImgPath);
        if (dl) {
          const localImgUrl = `/uploads/blog/${safeImgName}`;
          finalCleanContent = finalCleanContent.split(remoteImgUrl).join(localImgUrl);
          downloadedImagesCount++;
        }
      } catch (err) {
        console.warn(`   Skipping inline image ${remoteImgUrl}: ${err.message}`);
      }
      imgIndex++;
    }

    // 4. Process Categories
    const categoryIds = [];
    if (Array.isArray(b.categories)) {
      for (const cat of b.categories) {
        if (!cat.name) continue;
        const catSlug = (cat.slug || cat.name).toLowerCase().replace(/[^a-z0-9-]/g, '-');
        const catDoc = await categoriesCollection.findOneAndUpdate(
          { slug: catSlug },
          { 
            $set: { name: cat.name, slug: catSlug, description: cat.description || "" },
            $inc: { count: 1 }
          },
          { upsert: true, returnDocument: 'after' }
        );
        if (catDoc && catDoc._id) {
          categoryIds.push(catDoc._id);
        } else if (catDoc?.value?._id) {
          categoryIds.push(catDoc.value._id);
        }
      }
    }

    // 5. Process Tags
    const tagIds = [];
    if (Array.isArray(b.tags)) {
      for (const tag of b.tags) {
        if (!tag.name) continue;
        const tagSlug = (tag.slug || tag.name).toLowerCase().replace(/[^a-z0-9-]/g, '-');
        const tagDoc = await tagsCollection.findOneAndUpdate(
          { slug: tagSlug },
          { $set: { name: tag.name, slug: tagSlug } },
          { upsert: true, returnDocument: 'after' }
        );
        if (tagDoc && tagDoc._id) {
          tagIds.push(tagDoc._id);
        } else if (tagDoc?.value?._id) {
          tagIds.push(tagDoc.value._id);
        }
      }
    }

    // 6. Excerpt & Dates
    const excerpt = b.post_excerpt && b.post_excerpt.trim().length > 0 
      ? b.post_excerpt.trim() 
      : extractExcerpt(finalCleanContent, 160);

    const publishedDate = b.post_date ? new Date(b.post_date) : new Date();
    const modifiedDate = b.post_modified ? new Date(b.post_modified) : publishedDate;
    const postStatus = b.post_status === 'publish' ? 'published' : 'draft';

    // 7. Assemble Complete Post Document (Clean content without FAQ duplication)
    const postDoc = {
      title: b.post_title || "Untitled Post",
      slug: postSlug,
      content: finalCleanContent,
      excerpt: excerpt,
      featuredImage: localFeaturedImageUrl,
      author: authorId,
      categories: categoryIds,
      tags: tagIds,
      location: "",
      status: postStatus,
      publishedAt: publishedDate,
      createdAt: publishedDate,
      updatedAt: modifiedDate,
      isTrashed: false,
      trashedAt: null,
      seo: {
        metaTitle: b.post_title,
        metaDescription: excerpt,
        focusKeyword: (b.tags && b.tags[0]?.name) || (b.categories && b.categories[0]?.name) || "",
        canonicalUrl: `https://mohsindesigns.com/blog/${postSlug}`,
        metaRobotsIndex: 'index',
        metaRobotsFollow: 'follow',
        ogTitle: b.post_title,
        ogDescription: excerpt,
        ogImage: localFeaturedImageUrl,
        twitterCard: 'summary_large_image',
        featuredImage: localFeaturedImageUrl,
        featuredImageAlt: (b.featured_image && b.featured_image.alt) || b.post_title
      },
      faq: faqs,
      faqBadge: "FREQUENTLY ASKED QUESTIONS",
      faqTitle: "Frequently Asked Questions",
      faqDescription: `Common inquiries and technical answers regarding ${b.post_title}.`,
      faqSchemaMarkup: faqs.length > 0 ? JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(f => ({
          "@type": "Question",
          "name": f.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": f.answer
          }
        }))
      }, null, 2) : ""
    };

    // 8. Upsert Post in Database
    await postsCollection.updateOne(
      { slug: postSlug },
      { $set: postDoc },
      { upsert: true }
    );

    successCount++;
  }

  console.log(`\n=== SEED COMPLETED SUCCESSFULLY ===`);
  console.log(`Total Blog Posts Updated: ${successCount}`);
  console.log(`Total FAQs Separated to Component: ${totalFaqsCount}`);
  console.log(`All post contents are now free from FAQ duplication!`);

  await client.close();
}

seed().catch(err => {
  console.error("Fatal Seeding Error:", err);
  process.exit(1);
});
