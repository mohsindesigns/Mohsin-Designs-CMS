import { buildAdminLeadEmail, buildCustomerConfirmationEmail } from '../src/lib/leadMail.ts';

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
}

console.log('🧪 Starting Email Template Test Suite...\n');

// ── Test 1: Admin Lead Email Interpolation & Sanitization ──
console.log('1. Testing Admin Lead Alert Email (admin-new-lead.html)...');
const adminInput = {
  fullName: 'Mansoor & Mohsin <Developer>',
  email: 'test@example.com',
  phone: '+1 (555) 234-5678',
  service: 'Web Application, Website Design',
  message: 'Hello team,\n\nWe need a high-converting CMS & Web App with real-time analytics.\n\nThanks!',
  formSource: 'Mohsin Designs (/contact-us/)',
  submittedAt: new Date('2026-10-02T20:30:00Z'),
  leadId: 'MD-8F92A',
  pageUrl: 'https://mohsindesigns.com/contact-us/',
  crmLeadUrl: 'https://mohsindesigns.com/admin/submissions',
  logoWhiteUrl: 'https://mohsindesigns.com/images/logo-white.png',
};

const adminResult = buildAdminLeadEmail(adminInput);

// Check for unreplaced mustache templates
const adminUnreplaced = adminResult.html.match(/\{\{[a-zA-Z0-9_]+\}\}/g);
assert(!adminUnreplaced, `Found unreplaced mustache tags in admin email: ${adminUnreplaced}`);

// Check subject line (plain text for email headers, stripped of HTML tags)
assert(
  adminResult.subject === 'New lead: Mansoor & Mohsin · Web Application, Website Design',
  `Admin subject mismatch: "${adminResult.subject}"`
);

// Check XSS safety (HTML tags stripped by cleanText, special chars escaped by escapeHtml)
assert(!adminResult.html.includes('<Developer>'), 'Raw unescaped script/tags leaked into admin HTML');
assert(adminResult.html.includes('Mansoor &amp; Mohsin'), 'Ampersand not escaped in admin HTML');

// Check line breaks converted in message
assert(adminResult.html.includes('Hello team,<br><br>We need a high-converting CMS'), 'Message newlines were not converted to <br>');

// Check phone link
assert(adminResult.html.includes('href="tel:+15552345678"'), 'Tel link formatting incorrect');

// Check action buttons
assert(adminResult.html.includes('href="mailto:test@example.com?subject=Re:%20Your%20Web%20Application%2C%20Website%20Design%20inquiry"'), 'Mailto reply button link mismatch');
assert(adminResult.html.includes('href="https://mohsindesigns.com/admin/submissions"'), 'CRM lead URL mismatch');

// Check Lead ID and Page URL
assert(adminResult.html.includes('MD-8F92A'), 'Lead ID missing in admin HTML');
assert(adminResult.html.includes('https://mohsindesigns.com/contact-us/'), 'Page URL missing in admin HTML');

console.log('   ✅ Admin Lead Alert template passed all checks!');

// ── Test 2: Customer Confirmation Email (customer-confirmation.html) ──
console.log('\n2. Testing Customer Confirmation Receipt (customer-confirmation.html)...');
const customerInput = {
  fullName: 'Sarah Connor',
  email: 'sarah@skynet-defense.com',
  phone: '+1 (307) 890-1234',
  service: 'App Development, UI/UX',
  message: 'Looking for a complete mobile app rebuild in React Native.\nTimeline is 2 months.',
  leadId: 'MD-99120',
  bookingUrl: 'https://mohsindesigns.com/contact-us/#book',
  companyPhone: '+1 (307) 555-0100',
  companyEmail: 'info@mohsindesigns.com',
  companyAddress: 'Mohsin Designs LLC · Sheridan, WY, USA',
  logoUrl: 'https://mohsindesigns.com/images/logo-navy.png',
};

const customerResult = buildCustomerConfirmationEmail(customerInput);

// Check for unreplaced mustache templates
const custUnreplaced = customerResult.html.match(/\{\{[a-zA-Z0-9_]+\}\}/g);
assert(!custUnreplaced, `Found unreplaced mustache tags in customer email: ${custUnreplaced}`);

// Check subject
assert(customerResult.subject === 'We received your request, Sarah', `Customer subject mismatch: "${customerResult.subject}"`);

// Check first name greeting
assert(customerResult.html.includes('Thanks, Sarah — we&#39;ve got your request') || customerResult.html.includes("Thanks, Sarah — we've got your request"), 'First name greeting mismatch');
assert(customerResult.html.includes('Hi Sarah,<br><br>'), 'Hi firstName greeting mismatch');

// Check service summary
assert(customerResult.html.includes('App Development, UI/UX'), 'Service summary missing in customer email');

// Check 3-step sequence
assert(customerResult.html.includes('We review your request'), 'Step 1 missing');
assert(customerResult.html.includes('A specialist contacts you'), 'Step 2 missing');
assert(customerResult.html.includes('You get a clear plan'), 'Step 3 missing');

// Check Booking CTA
assert(customerResult.html.includes('href="https://mohsindesigns.com/contact-us/#book"'), 'Booking URL mismatch');
assert(customerResult.html.includes('href="tel:+13075550100"'), 'Company phone link mismatch');

// Check Footer
assert(customerResult.html.includes('Mohsin Designs LLC · Sheridan, WY, USA'), 'Company address missing in footer');
assert(customerResult.html.includes('href="mailto:info@mohsindesigns.com"'), 'Company email link missing in footer');

console.log('   ✅ Customer Confirmation template passed all checks!');

// ── Test 3: Edge Cases (Missing optional fields, no phone, empty message) ──
console.log('\n3. Testing Edge Cases (Empty optional fields, fallback values)...');
const edgeAdmin = buildAdminLeadEmail({
  fullName: '',
  email: 'anon@example.com',
});
assert(!edgeAdmin.html.match(/\{\{[a-zA-Z0-9_]+\}\}/g), 'Edge admin contains unreplaced tags');
assert(edgeAdmin.html.includes('Website Lead'), 'Edge admin missing fallback full name');
assert(edgeAdmin.html.includes('Website Design'), 'Edge admin missing fallback service');
assert(edgeAdmin.html.includes('Not provided'), 'Edge admin missing phone fallback');
assert(edgeAdmin.html.includes('No message provided'), 'Edge admin missing message fallback');

const edgeCustomer = buildCustomerConfirmationEmail({
  email: 'client@example.com',
});
assert(!edgeCustomer.html.match(/\{\{[a-zA-Z0-9_]+\}\}/g), 'Edge customer contains unreplaced tags');
assert(edgeCustomer.html.includes('there'), 'Edge customer missing fallback first name');
assert(edgeCustomer.html.includes('Not provided'), 'Edge customer missing phone fallback');

console.log('   ✅ Edge cases passed all checks!');

console.log('\n🎉 ALL EMAIL TEMPLATE TESTS PASSED WITH 100% INTEGRITY!\n');
