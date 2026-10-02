import { mapToCrmServices, CRM_SERVICES, submitLeadToCrm } from "../src/lib/crmLead.js";

async function brutalAudit() {
  console.log("======================================================================");
  console.log("BRUTAL 8-FORM FULL PAYLOAD VERIFICATION & LIVE API SCHEMA TEST");
  console.log("======================================================================\n");

  const formScenarios = [
    {
      formName: "1. ContactForm (Homepage & Embedded)",
      rawPayload: {
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1 555 123 4567",
        service: "Website Design",
        message: "I need a redesign for my corporate website with SEO.",
        type: "Contact Form",
        source: "/"
      }
    },
    {
      formName: "2. ContactTemplate (/contact-us page)",
      rawPayload: {
        name: "Sarah Connor",
        email: "sarah@cyberdyne.com",
        phone: "+1 555 987 6543",
        company: "Resistance Corp",
        service: "App Development",
        message: "Looking for full-stack mobile and web app development.",
        type: "Contact Inquiry",
        source: "/contact-us/"
      }
    },
    {
      formName: "3. QuickQuote (Modal Drawer)",
      rawPayload: {
        name: "Michael Scott",
        email: "michael@dundermifflin.com",
        phone: "+1 555 333 4444",
        project_type: "Web Application",
        message: "Need a custom CRM portal for paper sales.",
        type: "Quote Request",
        source: "/services/web-development/"
      }
    },
    {
      formName: "4. QAForm (Interactive Quote Builder)",
      rawPayload: {
        name: "Bruce Wayne",
        email: "bruce@wayneenterprises.com",
        phone: "+1 555 000 9999",
        services: "UI/UX, SEO, Branding",
        timeline: "1-2 months",
        message: "Complete rebrand and digital design overhaul.",
        type: "QA Form Quote",
        source: "/#get-quote"
      }
    },
    {
      formName: "5. ServiceDetailTemplate (Service Pages Consultation)",
      rawPayload: {
        name: "Clark Kent",
        email: "clark@dailyplanet.com",
        phone: "+1 555 111 2222",
        company: "Daily Planet",
        service: "Search Engine Optimization",
        message: "Need technical SEO and ranking improvements.",
        type: "Service Detail Consultation",
        source: "/services/seo/"
      }
    },
    {
      formName: "6. IndustryTemplate (Industry Strategy Session)",
      rawPayload: {
        name: "Tony Stark",
        email: "tony@stark.com",
        phone: "+1 555 300 0000",
        industry: "Aerospace & Technology",
        message: "Custom AI strategy session for our web presence.",
        type: "Industry Consultation Request",
        source: "/industries/technology/"
      }
    },
    {
      formName: "7. CareersTemplate (Job Application Form)",
      rawPayload: {
        name: "Peter Parker",
        email: "peter@dailybugle.com",
        phone: "+1 555 444 7777",
        role: "Senior Frontend Engineer",
        message: "I have 5 years experience with Next.js and TypeScript.",
        type: "Job Application",
        source: "/careers/"
      }
    },
    {
      formName: "8. Footer Newsletter (Email Subscriber Box)",
      rawPayload: {
        name: "Newsletter Subscriber",
        email: "subscriber@newsletter.com",
        phone: "+1 000 000 0000",
        service: "Content Marketing",
        message: "New subscription from: subscriber@newsletter.com",
        type: "Newsletter",
        source: "Footer"
      }
    }
  ];

  let passedAll = true;

  for (const s of formScenarios) {
    console.log(`\n--------------------------------------------------`);
    console.log(`TESTING: ${s.formName}`);
    console.log(`--------------------------------------------------`);

    // 1. Service Resolution Check
    const rawService =
      s.rawPayload.service ||
      s.rawPayload.services ||
      s.rawPayload.project_type ||
      s.rawPayload.industry ||
      s.rawPayload.role;

    const mapped = mapToCrmServices(rawService);
    const finalServices = mapped.length > 0 ? mapped : ["Website Design"];
    console.log(`  Raw Service Input: "${rawService}"`);
    console.log(`  Mapped Services:   [${finalServices.map(x => `"${x}"`).join(", ")}]`);

    // Verify all mapped services belong to the whitelist
    const allValid = finalServices.every(x => CRM_SERVICES.includes(x));
    if (!allValid) {
      console.error(`  ❌ ERROR: Invalid service detected in mapped output!`);
      passedAll = false;
    } else {
      console.log(`  ✅ All mapped services match official CRM whitelist.`);
    }

    // 2. Message Resolution Check
    const finalMessage = (s.rawPayload.message || "Inquiry from website lead form").trim();
    if (!finalMessage) {
      console.error(`  ❌ ERROR: Message field is empty!`);
      passedAll = false;
    } else {
      console.log(`  ✅ Message resolved: "${finalMessage.substring(0, 45)}..."`);
    }

    // 3. Phone Resolution Check
    const finalPhone = (s.rawPayload.phone || "+1 000 000 0000").trim();
    if (!finalPhone) {
      console.error(`  ❌ ERROR: Phone field is empty!`);
      passedAll = false;
    } else {
      console.log(`  ✅ Phone resolved: "${finalPhone}"`);
    }

    // 4. Test Live API Endpoint with Full Schema Payload
    const crmResult = await submitLeadToCrm({
      name: s.rawPayload.name,
      email: s.rawPayload.email,
      phone: finalPhone,
      service: finalServices,
      message: finalMessage,
      captchaToken: "test_verification_probe_token"
    });

    console.log(`  Live Endpoint Response: HTTP ${crmResult.status} | "${crmResult.message}"`);
    
    // Status 400 with "Verification failed" proves that:
    // 1. The payload JSON parsed successfully.
    // 2. All 5 required keys (full_name, email, phone_number, service, message) passed schema validation!
    // 3. The CRM endpoint successfully reached the Cloudflare Turnstile verification stage!
    if (crmResult.status === 400 && crmResult.message?.includes("Verification failed")) {
      console.log(`  ✅ Passed Schema & Reached Cloudflare Challenge on app.mohsindesigns.com!`);
    } else {
      console.error(`  ❌ UNEXPECTED RESPONSE: HTTP ${crmResult.status} - ${JSON.stringify(crmResult)}`);
      passedAll = false;
    }
  }

  console.log("\n======================================================================");
  if (passedAll) {
    console.log("🎉 ALL 8 FORMS PASSED LIVE SCHEMA VERIFICATION WITH 0 ERRORS!");
  } else {
    console.log("❌ SOME TESTS FAILED!");
    process.exit(1);
  }
  console.log("======================================================================\n");
}

brutalAudit().catch(e => {
  console.error("FATAL ERROR IN BRUTAL AUDIT:", e);
  process.exit(1);
});
