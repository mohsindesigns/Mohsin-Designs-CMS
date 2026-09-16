import fs from 'fs';
import path from 'path';

const data = JSON.parse(fs.readFileSync('./scripts/textarea_audit_results.json', 'utf8'));
const report = [];

data.forEach(tmpl => {
  if (!tmpl.items || tmpl.items.length === 0) return;
  const tmplFile = tmpl.template !== 'N/A' ? path.join('./src/components/templates', tmpl.template) : null;
  const tmplContent = (tmplFile && fs.existsSync(tmplFile)) ? fs.readFileSync(tmplFile, 'utf8') : '';

  tmpl.items.forEach(item => {
    let propName = '';
    const m = item.valueBinding.match(/(?:\.|\?\.|\['|\[")([a-zA-Z0-9_]+)(?:'\]|"\])?(?:\s*\|\||$)/);
    if (m) {
      propName = m[1];
    }

    let renderStatus = 'Unknown';
    let renderSnippet = '';

    if (tmplContent && propName) {
      const richRegex = new RegExp('<RichTextRenderer[^>]*content=\\{[^}]*' + propName + '[^}]*\\}', 'i');
      const pRegex = new RegExp('<p[^>]*>[^<]*\\{[^}]*' + propName + '[^}]*\\}[^<]*<\\/p>', 'i');
      const divRegex = new RegExp('<div[^>]*>[^<]*\\{[^}]*' + propName + '[^}]*\\}[^<]*<\\/div>', 'i');

      if (richRegex.test(tmplContent)) {
        renderStatus = 'Already RichTextRenderer';
        renderSnippet = (tmplContent.match(richRegex) || [''])[0];
      } else if (pRegex.test(tmplContent)) {
        renderStatus = 'Plain <p> tag (Needs RichTextRenderer)';
        renderSnippet = (tmplContent.match(pRegex) || [''])[0];
      } else if (divRegex.test(tmplContent)) {
        renderStatus = 'Plain <div> tag (Needs RichTextRenderer)';
        renderSnippet = (tmplContent.match(divRegex) || [''])[0];
      } else if (tmplContent.includes(propName)) {
        renderStatus = 'Referenced in template object/helper';
      } else {
        renderStatus = 'Not found directly in template';
      }
    }

    report.push({
      templateName: tmpl.name,
      editor: tmpl.editor,
      template: tmpl.template,
      line: item.line,
      section: item.section,
      label: item.label,
      valueBinding: item.valueBinding,
      category: item.category,
      propName,
      renderStatus,
      renderSnippet
    });
  });
});

fs.writeFileSync('./scripts/detailed_frontend_render_audit.json', JSON.stringify(report, null, 2));

console.log('Processed ' + report.length + ' fields with frontend render status.');
const candidates = report.filter(r => r.category === 'candidate');
console.log('Total Rich Text Candidates: ' + candidates.length);

const grouped = {};
report.forEach(r => {
  if (!grouped[r.templateName]) grouped[r.templateName] = [];
  grouped[r.templateName].push(r);
});

for (const [tName, items] of Object.entries(grouped)) {
  console.log(`\n============================================================`);
  console.log(`📌 ${tName} (${items[0].editor} ➔ ${items[0].template})`);
  console.log(`============================================================`);
  items.forEach(i => {
    const badge = i.category === 'candidate' ? '🌟 [RICH CANDIDATE]' : i.category === 'seo' ? '🛑 [SEO PLAIN]' : '🛑 [CODE/SCHEMA]';
    console.log(`- Line ${i.line} | Section: "${i.section}" | Label: "${i.label}"`);
    console.log(`  Binding: ${i.valueBinding}`);
    console.log(`  Frontend Status: ${i.renderStatus}`);
    if (i.renderSnippet) console.log(`  Frontend Snippet: ${i.renderSnippet}`);
  });
}
