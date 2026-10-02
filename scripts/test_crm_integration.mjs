import { mapToCrmServices, CRM_SERVICES, submitLeadToCrm } from "../src/lib/crmLead.js";

async function runTestSuite() {
  console.log("=================================================");
  console.log("RUNNING BRUTAL AUDIT & AUTOMATED TEST SUITE");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // ─────────────────────────────────────────────────────────
  // TEST SUITE 1: Service Normalization & Option Matching
  // ─────────────────────────────────────────────────────────
  console.log("[1] Testing All 12 CRM Service Option Whitelist & Fuzzy Matchers:");
  
  assert(CRM_SERVICES.length === 12, "CRM_SERVICES contains exactly 12 services");

  for (const s of CRM_SERVICES) {
    const res = mapToCrmServices(s);
    assert(res.length === 1 && res[0] === s, `Direct match for "${s}"`);
  }

  const fuzzyTests = [
    { input: "Custom Web Application Development", expected: "Web Application" },
    { input: "Mobile App for iOS", expected: "App Development" },
    { input: "WordPress Website Design", expected: "Website Design" },
    { input: "Local SEO & GMB Optimization", expected: ["SEO", "GMB Optimization"] },
    { input: "Brand Identity & Logo", expected: ["Branding", "Logo Design"] },
    { input: "UI/UX Figma Design", expected: "UI/UX" },
    { input: "SEO / Content Marketing", expected: ["SEO", "Content Marketing"] },
    { input: "Facebook Ads & Meta Campaign", expected: "Meta Ad Management" },
    { input: "Google Ads PPC", expected: "Google Ad Management" },
    { input: "Social Media Management", expected: "Social Media Management" },
    { input: "None selected", expected: [] },
    { input: "", expected: [] },
    { input: null, expected: [] },
    { input: undefined, expected: [] },
  ];

  for (const t of fuzzyTests) {
    const res = mapToCrmServices(t.input);
    if (Array.isArray(t.expected)) {
      if (t.expected.length === 0) {
        assert(res.length === 0, `Empty mapping for: "${t.input}"`);
      } else {
        const allPresent = t.expected.every((item) => res.includes(item));
        assert(allPresent, `Multi mapping "${t.input}" -> [${res.join(", ")}]`);
      }
    } else {
      assert(res.includes(t.expected), `Fuzzy mapping "${t.input}" -> [${res.join(", ")}]`);
    }
  }

  // ─────────────────────────────────────────────────────────
  // TEST SUITE 2: Live API Endpoint Response & Cloudflare Challenge Check
  // ─────────────────────────────────────────────────────────
  console.log("\n[2] Testing Live API Endpoint With Missing & Invalid Tokens:");

  // Test 2A: Missing token -> Expected 400 with "Please complete the verification challenge."
  const resNoToken = await submitLeadToCrm({
    name: "Audit Test User",
    email: "audit@test.com",
    phone: "+1 555 012 3456",
    service: "Web Application",
  });

  assert(resNoToken.status === 400, "Missing token returns HTTP 400 from endpoint");
  assert(
    resNoToken.message?.includes("verification challenge") || resNoToken.error?.includes("verification challenge"),
    `Endpoint responds with challenge requirement: "${resNoToken.message}"`
  );

  // Test 2B: Invalid token -> Expected 400 with "Verification failed — please try again."
  const resBadToken = await submitLeadToCrm({
    name: "Audit Test User",
    email: "audit@test.com",
    phone: "+1 555 012 3456",
    service: "Web Application",
    captchaToken: "invalid_dummy_token_12345",
  });

  assert(resBadToken.status === 400, "Invalid token returns HTTP 400 from endpoint");
  assert(
    resBadToken.message?.includes("Verification failed") || resBadToken.error?.includes("Verification failed"),
    `Endpoint actively verifies token with Cloudflare: "${resBadToken.message}"`
  );

  // ─────────────────────────────────────────────────────────
  // TEST SUITE 3: Form Shape for Newsletter Subscribers
  // ─────────────────────────────────────────────────────────
  console.log("\n[3] Testing Form Payload Shape for Newsletter / Subscriber leads:");

  const newsletterRes = await submitLeadToCrm({
    name: "Newsletter Subscriber",
    email: "newsletter.subscriber@example.com",
    phone: "+1 000 000 0000",
    service: "Content Marketing",
    captchaToken: "test_token_newsletter",
  });

  assert(newsletterRes.status === 400, "Newsletter payload evaluated by endpoint (HTTP 400 due to test token)");
  assert(
    newsletterRes.message?.includes("Verification failed"),
    `Newsletter subscriber payload successfully passed schema check and reached Cloudflare verification: "${newsletterRes.message}"`
  );

  console.log("\n=================================================");
  console.log(`AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((e) => {
  console.error("FATAL ERROR IN TEST SUITE:", e);
  process.exit(1);
});
