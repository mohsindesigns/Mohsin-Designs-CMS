import fs from 'fs';
import path from 'path';

const editorsDir = './src/components/admin/editors';
const templatesDir = './src/components/templates';
const adminDir = './src/components/admin';

const mappings = [
  { name: 'Home Template', editor: 'HomeEditor.tsx', template: 'HomeTemplate.tsx' },
  { name: 'New About Template', editor: 'NewAboutEditor.tsx', template: 'NewAboutTemplate.tsx' },
  { name: 'Classic About Template', editor: 'AboutEditor.tsx', template: 'AboutTemplate.tsx' },
  { name: 'Services Template', editor: 'ServicesEditor.tsx', template: 'ServicesTemplate.tsx' },
  { name: 'Service Detail Template', editor: 'ServiceDetailEditor.tsx', template: 'ServiceDetailTemplate.tsx' },
  { name: 'Industry Template', editor: 'IndustryEditor.tsx', template: 'IndustryTemplate.tsx' },
  { name: 'Location Template', editor: 'LocationEditor.tsx', template: 'LocationTemplate.tsx' },
  { name: 'Service Area Template', editor: 'ServiceAreaEditor.tsx', template: 'ServiceAreaTemplate.tsx' },
  { name: 'Blog Template / Posts', editor: 'BlogEditor.tsx', template: 'BlogTemplate.tsx' },
  { name: 'Careers Template', editor: 'CareersEditor.tsx', template: 'CareersTemplate.tsx' },
  { name: 'Contact Template', editor: 'ContactEditor.tsx', template: 'ContactTemplate.tsx' },
  { name: 'FAQ Template', editor: 'FAQEditor.tsx', template: 'FAQTemplate.tsx' },
  { name: 'Gallery Template', editor: 'GalleryEditor.tsx', template: 'GalleryTemplate.tsx' },
  { name: 'Reviews Template', editor: 'ReviewsEditor.tsx', template: 'ReviewsTemplate.tsx' },
  { name: 'Team Template', editor: 'TeamEditor.tsx', template: 'TeamTemplate.tsx' },
];

function analyzeEditor(filePath, templatePath) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const textareas = [];

  const templateContent = (templatePath && fs.existsSync(templatePath)) ? fs.readFileSync(templatePath, 'utf8') : '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('<textarea')) {
      // Look backward from line i up to 10 lines to find the immediately preceding label
      let label = 'Unknown Field';
      for (let j = i; j >= Math.max(0, i - 10); j--) {
        const lblMatch = lines[j].match(/<label[^>]*>(.*?)<\/label>/i);
        if (lblMatch) {
          label = lblMatch[1].replace(/<[^>]*>/g, '').trim();
          break;
        }
      }

      // Look backward up to 30 lines to find the enclosing section header (h2, h3, h4)
      let section = 'General';
      for (let j = i; j >= Math.max(0, i - 30); j--) {
        const secMatch = lines[j].match(/<(?:h2|h3|h4)[^>]*>(.*?)<\/(?:h2|h3|h4)>/i);
        if (secMatch) {
          section = secMatch[1].replace(/<[^>]*>/g, '').trim();
          break;
        }
      }

      // Look forward up to 10 lines to find value and onChange bindings
      let fullTag = lines.slice(i, Math.min(lines.length, i + 8)).join(' ');
      let valueBinding = '';
      const valMatch = fullTag.match(/value=\{([^}]+)\}/);
      if (valMatch) {
        valueBinding = valMatch[1].trim();
      }

      let onChangeBinding = '';
      const onChMatch = fullTag.match(/onChange=\{([^}]+)\}/);
      if (onChMatch) {
        onChangeBinding = onChMatch[1].trim();
      }

      // Check how the property is rendered in the frontend template
      let frontendRender = 'Not Found / Dynamic';
      if (valueBinding && templateContent) {
        // extract the property name at the end of valueBinding
        const propMatch = valueBinding.match(/(?:\.|\?\.|\['|\[")([a-zA-Z0-9_]+)(?:'\]|"\])?(?:\s*\|\||$)/);
        if (propMatch) {
          const propName = propMatch[1];
          const renderRegex = new RegExp(`(<[^>]+>\\s*\\{[^}]*${propName}[^}]*\\}\\s*<\\/[^>]+>|<RichTextRenderer[^>]*content=\\{[^}]*${propName}[^}]*\\}[^>]*\\/>)`, 'i');
          const renderMatch = templateContent.match(renderRegex);
          if (renderMatch) {
            frontendRender = renderMatch[0].trim();
          } else if (templateContent.includes(propName)) {
            frontendRender = `Referenced in template (${propName})`;
          }
        }
      }

      // Categorization
      let category = 'candidate';
      let reason = 'Multi-line user-facing text suitable for rich formatting (RichTextEditor).';

      const lowerLabelAndBinding = (label + ' ' + valueBinding).toLowerCase();
      if (lowerLabelAndBinding.includes('schema') || lowerLabelAndBinding.includes('json') || lowerLabelAndBinding.includes('markup') || valueBinding.includes('schemaMarkup')) {
        category = 'code';
        reason = 'Schema markup / JSON-LD — MUST remain code/plain text to prevent syntax corruption.';
      } else if (lowerLabelAndBinding.includes('metadescription') || lowerLabelAndBinding.includes('ogdescription') || lowerLabelAndBinding.includes('twitterdescription') || filePath.includes('SeoEditor')) {
        category = 'seo';
        reason = 'SEO Meta/OG Description — Search engines and social crawlers require plain text without HTML tags.';
      } else if (/\b(custom_script|trackingscript|custom_css|head_scripts|body_scripts|redirect|turnstile)\b/i.test(lowerLabelAndBinding)) {
        category = 'code';
        reason = 'Code, scripts, or tokens — plain text only.';
      } else if (lowerLabelAndBinding.includes('zipcode') || lowerLabelAndBinding.includes('zip codes') || lowerLabelAndBinding.includes('tech') || lowerLabelAndBinding.includes('tags')) {
        category = 'comma_separated';
        reason = 'Comma-separated array input (e.g. tags, zip codes, tech stack).';
      }

      textareas.push({
        line: i + 1,
        label,
        section,
        valueBinding,
        frontendRender,
        category,
        reason
      });
    }
  }
  return textareas;
}

const allResults = [];

for (const m of mappings) {
  const editorFile = path.join(editorsDir, m.editor);
  const templateFile = path.join(templatesDir, m.template);
  const items = analyzeEditor(editorFile, templateFile);
  allResults.push({
    name: m.name,
    editor: m.editor,
    template: m.template,
    items
  });
}

const otherAdminFiles = [
  'SeoEditor.tsx',
  'BlogPostEditor.tsx',
  'SchemaEditor.tsx'
];

for (const f of otherAdminFiles) {
  const p = path.join(adminDir, f);
  if (fs.existsSync(p)) {
    const items = analyzeEditor(p);
    allResults.push({
      name: `Admin Module: ${f}`,
      editor: f,
      template: 'N/A',
      items
    });
  }
}

fs.writeFileSync('./scripts/textarea_audit_results.json', JSON.stringify(allResults, null, 2));

console.log('AUDIT COMPLETE. Processed ' + allResults.length + ' modules.');
let candidateCount = 0;
let totalTextareas = 0;
allResults.forEach(r => {
  totalTextareas += r.items.length;
  candidateCount += r.items.filter(i => i.category === 'candidate').length;
  if (r.items.length > 0) {
    console.log(`\n📁 ${r.name} (${r.editor}) -> ${r.items.length} textareas (${r.items.filter(i => i.category === 'candidate').length} Rich Text Candidates):`);
    r.items.forEach(item => {
      const icon = item.category === 'candidate' ? '🌟 [RICH TEXT CANDIDATE]' : item.category === 'seo' ? '🛑 [SEO PLAIN TEXT ONLY]' : item.category === 'code' ? '🛑 [CODE/SCHEMA ONLY]' : 'ℹ️ [NOTE]';
      console.log(`   Line ${item.line}: ${icon} "${item.label}" in [${item.section}] -> ${item.valueBinding || 'no binding'}`);
    });
  }
});

console.log('\n' + '='.repeat(80));
console.log(`TOTAL TEXTAREAS FOUND: ${totalTextareas}`);
console.log(`HIGH-VALUE RICH TEXT CANDIDATES: ${candidateCount}`);
console.log('='.repeat(80));
