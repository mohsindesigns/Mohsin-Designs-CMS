const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'mdseo2025';
const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

async function runQACrawler() {
    console.log(`\n======================================================`);
    console.log(`🚀 STARTING CMS QA CRAWLER AUDIT ON ${BASE_URL}`);
    console.log(`======================================================\n`);

    let pages = [];
    let posts = [];

    try {
        if (uri) {
            const client = new MongoClient(uri);
            await client.connect();
            const db = client.db(dbName);
            pages = await db.collection('pages').find({ status: 'published' }).toArray();
            posts = await db.collection('posts').find({ status: 'published' }).toArray();
            await client.close();
        }
    } catch (e) {
        console.warn(`⚠️ Could not query MongoDB directly for route list: ${e.message}`);
    }

    const testRoutes = [
        // Core Public Root Pages
        { path: '/', label: 'Homepage' },
        { path: '/privacy', label: 'Privacy Policy' },
        { path: '/terms', label: 'Terms of Service' },
        { path: '/blog', label: 'Blog Listing' },

        // Admin Routes
        { path: '/admin/login', label: 'Admin Login' },
        { path: '/admin', label: 'Admin Dashboard' },
        { path: '/admin/pages', label: 'Admin Pages Manager' },
        { path: '/admin/blog', label: 'Admin Blog Manager' },
        { path: '/admin/media', label: 'Admin Media Library' },
        { path: '/admin/faq', label: 'Admin FAQ Manager' },
        { path: '/admin/reviews', label: 'Admin Reviews Manager' },
        { path: '/admin/services', label: 'Admin Services Manager' },
        { path: '/admin/submissions', label: 'Admin Form Submissions' },
        { path: '/admin/settings', label: 'Admin Settings' },
        { path: '/admin/activity-logs', label: 'Admin Activity Logs' },
    ];

    // Add Dynamic CMS Pages from MongoDB
    for (const p of pages) {
        if (p.slug && p.slug !== 'home') {
            testRoutes.push({
                path: `/${p.slug.startsWith('/') ? p.slug.slice(1) : p.slug}`,
                label: `CMS Page [${p.template}] : ${p.title}`,
                template: p.template
            });
        }
    }

    // Add Sample Blog Posts
    for (const post of posts.slice(0, 3)) {
        if (post.slug) {
            testRoutes.push({
                path: `/blog/${post.slug}`,
                label: `Blog Detail: ${post.title}`,
                template: 'blog-post'
            });
        }
    }

    const results = {
        passed: [],
        failed: [],
        warnings: []
    };

    console.log(`📋 Discovered ${testRoutes.length} routes to crawl and audit.\n`);

    for (const route of testRoutes) {
        const fullUrl = `${BASE_URL}${route.path}`;
        process.stdout.write(`🔍 Testing: ${route.path.padEnd(45)} `);

        try {
            const start = Date.now();
            const res = await fetch(fullUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (CMS-Auto-QA-Crawler)'
                },
                redirect: 'manual'
            });
            const duration = Date.now() - start;

            if (res.status >= 200 && res.status < 400) {
                const html = await res.text();

                // Check for SSR React Crashes / Uncaught Exceptions in HTML
                const errorPatterns = [
                    /Application error:/i,
                    /Unhandled Runtime Error/i,
                    /Minified React error/i,
                    /TypeError:/i,
                    /ReferenceError:/i,
                    /Cannot read properties of undefined/i,
                    /Cannot read property/i,
                    /Hydration failed/i
                ];

                let crashDetected = false;
                let crashMatch = '';
                for (const pattern of errorPatterns) {
                    if (pattern.test(html)) {
                        crashDetected = true;
                        crashMatch = pattern.toString();
                        break;
                    }
                }

                if (crashDetected) {
                    console.log(`❌ [SSR CRASH: ${crashMatch}] (${duration}ms)`);
                    results.failed.push({
                        ...route,
                        status: res.status,
                        error: `SSR Crash Detected (${crashMatch})`,
                        duration
                    });
                } else {
                    console.log(`✅ [${res.status} OK] (${duration}ms)`);
                    results.passed.push({
                        ...route,
                        status: res.status,
                        duration
                    });
                }
            } else {
                console.log(`❌ [HTTP ${res.status}] (${duration}ms)`);
                results.failed.push({
                    ...route,
                    status: res.status,
                    error: `Unexpected HTTP status ${res.status}`,
                    duration
                });
            }
        } catch (err) {
            console.log(`❌ [NETWORK/CONN ERROR] ${err.message}`);
            results.failed.push({
                ...route,
                status: 0,
                error: err.message
            });
        }
    }

    console.log(`\n======================================================`);
    console.log(`📊 QA CRAWL SUMMARY RESULTS`);
    console.log(`======================================================`);
    console.log(`✅ Total Passed Routes : ${results.passed.length}`);
    console.log(`❌ Total Failed Routes : ${results.failed.length}`);
    console.log(`📋 Total Audited Routes: ${testRoutes.length}`);
    console.log(`======================================================\n`);

    if (results.failed.length > 0) {
        console.log(`🚨 FAILED ROUTE BREAKDOWN:`);
        results.failed.forEach((f, idx) => {
            console.log(`  ${idx + 1}. ${f.path} (${f.label}) -> Status: ${f.status} | Error: ${f.error}`);
        });
        console.log(`\n`);
        process.exit(1);
    } else {
        console.log(`🎉 ALL ROUTES AND TEMPLATES PASSED WITH 0 ERRORS!\n`);
        process.exit(0);
    }
}

runQACrawler();
