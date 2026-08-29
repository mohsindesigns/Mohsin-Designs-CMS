const http = require('http');
const fs = require('fs');

http.get('http://localhost:3000/services/testbulkqa', (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    const matches = data.match(/testbulkqa/gi) || [];
    const distinctMatches = [...new Set(data.match(/testbulkqa[^\s<\"\']*/gi) || [])];

    const checks = [
      { section: "Hero Title & Highlight", passed: data.includes("testbulkqa") },
      { section: "Hero Description Multi-line", passed: data.includes("testbulkqa line 2") },
      { section: "Hero Benefits Checklist", passed: data.includes("testbulkqa benefit 1") },
      { section: "Hero Form Heading", passed: data.includes("testbulkqa form heading") },
      { section: "Hero Form Subheading", passed: data.includes("testbulkqa form subheading") },
      { section: "Hero Form Submit Button", passed: data.includes("testbulkqa submit") },
      { section: "Client Trust Heading & Logos", passed: data.includes("testbulkqa trust heading") && data.includes("testbulkqa logo 1") },
      { section: "Deliverables Eyebrow & Description", passed: data.includes("testbulkqa deliverables eyebrow") && data.includes("testbulkqa deliverables description overview") },
      { section: "Deliverables Pillars & Features", passed: data.includes("testbulkqa pillar 1") && data.includes("testbulkqa feature 1") },
      { section: "Strategy Approach Steps", passed: data.includes("testbulkqa strategy eyebrow") && data.includes("testbulkqa step 1") },
      { section: "Outcomes Metrics & Guaranteed Outcome", passed: data.includes("testbulkqa outcomes eyebrow") && data.includes("testbulkqa outcome 1") },
      { section: "Process Roadmap & Phase Tag", passed: data.includes("testbulkqa phase 1") && data.includes("testbulkqa deliverable 1") },
      { section: "Results & Case Studies", passed: data.includes("testbulkqa case study 1") && data.includes("testbulkqa challenge 1") },
      { section: "Industries We Specialize In", passed: data.includes("testbulkqa industries eyebrow") && data.includes("testbulkqa industry 1") },
      { section: "Tech Stack & Tool Tag", passed: data.includes("testbulkqa tech eyebrow") && data.includes("testbulkqa tool 1") },
      { section: "Why Choose Us Differentiators", passed: data.includes("testbulkqa why eyebrow") && data.includes("testbulkqa diff 1") },
      { section: "Pricing Plans & Features", passed: data.includes("testbulkqa pricing eyebrow") && data.includes("testbulkqa plan 1") && data.includes("testbulkqa plan feature 1") },
      { section: "Global Coverage / Service Area", passed: data.includes("testbulkqa global reach tag") || data.includes("testbulkqa global reach intro") },
      { section: "FAQs Questions & Answers", passed: data.includes("testbulkqa question 1?") || data.includes("testbulkqa answer 1") },
      { section: "Final CTA Banner", passed: data.includes("testbulkqa cta eyebrow") && data.includes("testbulkqa primary cta") }
    ];

    let output = `STATUS CODE: ${res.statusCode}\n`;
    output += `HTML TOTAL LENGTH: ${data.length}\n`;
    output += `TOTAL OCCURRENCES OF "testbulkqa": ${matches.length}\n\n`;
    output += `--- SECTION-BY-SECTION RENDER REPORT ---\n`;
    checks.forEach(c => {
      output += `[${c.passed ? "✓ PASS" : "✗ FAIL"}] ${c.section}\n`;
    });

    output += `\n--- DISTINCT TOKENS MATCHED ---\n`;
    output += distinctMatches.join('\n');

    fs.writeFileSync('testbulkqa_results.txt', output);
    console.log("Wrote report to testbulkqa_results.txt");
  });
}).on('error', err => {
  fs.writeFileSync('testbulkqa_results.txt', 'ERROR: ' + err.message);
});
