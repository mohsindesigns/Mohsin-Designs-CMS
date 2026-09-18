/**
 * VERIFICATION SCRIPT FOR LIVE LOCATION HIERARCHY
 */
const https = require("https");
const http = require("http");

const BASE = "https://new.mohsindesigns.com";

function fetchUrl(urlPath, follow = false) {
  return new Promise((resolve) => {
    const fullUrl = urlPath.startsWith("http") ? urlPath : `${BASE}${urlPath}`;
    const req = https.get(fullUrl, { headers: { "User-Agent": "LocationVerifier/1.0" } }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (follow && (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) && res.headers.location) {
          return fetchUrl(res.headers.location, true).then(resolve);
        }
        resolve({
          statusCode: res.statusCode,
          location: res.headers.location,
          body: data
        });
      });
    });
    req.on("error", (err) => {
      resolve({ statusCode: 500, error: err.message });
    });
  });
}

async function run() {
  console.log("================================================================");
  console.log(" TESTING LIVE LOCATION HIERARCHY & REDIRECTS ON NEW.MOHSINDESIGNS.COM");
  console.log("================================================================\n");

  const testCases = [
    // 1. City Canonical 200 checks
    { name: "Fort Worth (Canonical City)", path: "/usa/texas/fort-worth/", expectedStatus: 200 },
    { name: "Houston (Canonical City)", path: "/usa/texas/houston/", expectedStatus: 200 },
    { name: "Dallas (Canonical City)", path: "/usa/texas/dallas/", expectedStatus: 200 },
    { name: "Melbourne (Australia City)", path: "/australia/victoria/melbourne/", expectedStatus: 200 },
    { name: "Sydney (Australia City)", path: "/australia/nsw/sydney/", expectedStatus: 200 },
    { name: "Auckland (New Zealand City)", path: "/new-zealand/north-island/auckland/", expectedStatus: 200 },

    // 2. State Canonical 200 checks
    { name: "Texas (Canonical State)", path: "/usa/texas/", expectedStatus: 200 },
    { name: "Florida (Canonical State)", path: "/usa/florida/", expectedStatus: 200 },
    { name: "Victoria (Canonical State)", path: "/australia/victoria/", expectedStatus: 200 },

    // 3. Country Canonical 200 checks
    { name: "USA (Canonical Country)", path: "/usa/", expectedStatus: 200 },
    { name: "Australia (Canonical Country)", path: "/australia/", expectedStatus: 200 },
    { name: "New Zealand (Canonical Country)", path: "/new-zealand/", expectedStatus: 200 },

    // 4. 301 Direct Redirect checks from old URLs
    { name: "Old Flat /fort-worth/ 301 Direct", path: "/fort-worth/", expectedStatus: 301, expectRedirectTo: "/usa/texas/fort-worth/" },
    { name: "Old Flat /houston/ 301 Direct", path: "/houston/", expectedStatus: 301, expectRedirectTo: "/usa/texas/houston/" },
    { name: "Old Flat /texas/ 301 Direct", path: "/texas/", expectedStatus: 301, expectRedirectTo: "/usa/texas/" },
    { name: "Old Flat /melbourne/ 301 Direct", path: "/melbourne/", expectedStatus: 301, expectRedirectTo: "/australia/victoria/melbourne/" },

    // 5. Followed Redirects checks (from non-trailing slash /fort-worth)
    { name: "Old /fort-worth end-to-end resolution", path: "/fort-worth", follow: true, expectedStatus: 200 },
    { name: "Old /houston end-to-end resolution", path: "/houston", follow: true, expectedStatus: 200 },
    { name: "Old /texas end-to-end resolution", path: "/texas", follow: true, expectedStatus: 200 },
    { name: "Old /melbourne end-to-end resolution", path: "/melbourne", follow: true, expectedStatus: 200 },

    // 6. Hierarchy Invalidation Checks (MUST return 404!)
    { name: "Invalid Hierarchy: Fort Worth under Oklahoma", path: "/usa/oklahoma/fort-worth/", expectedStatus: 404 },
    { name: "Invalid Hierarchy: Melbourne under USA", path: "/usa/texas/melbourne/", expectedStatus: 404 },
    { name: "Invalid Hierarchy: Non-existent City", path: "/usa/texas/non-existent-city-xyz/", expectedStatus: 404 }
  ];

  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    const res = await fetchUrl(tc.path, tc.follow);
    const expectedArr = Array.isArray(tc.expectedStatus) ? tc.expectedStatus : [tc.expectedStatus];
    const isStatusOk = expectedArr.includes(res.statusCode);

    let isRedirectOk = true;
    if (tc.expectRedirectTo) {
      isRedirectOk = res.location && (res.location === tc.expectRedirectTo || res.location.endsWith(tc.expectRedirectTo));
    }

    if (isStatusOk && isRedirectOk) {
      console.log(`[PASS] ${tc.name}`);
      console.log(`       Path: ${tc.path} => Status: ${res.statusCode}${res.location ? " -> " + res.location : ""}`);
      passed++;
    } else {
      console.error(`[FAIL] ${tc.name}`);
      console.error(`       Path: ${tc.path} => Status: ${res.statusCode} (Expected: ${expectedArr.join(" or ")})${tc.expectRedirectTo ? " | Target: " + res.location + " (Expected: " + tc.expectRedirectTo + ")" : ""}`);
      failed++;
    }
  }

  console.log("\n================================================================");
  console.log(` RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log("================================================================");
}

run();
