import fs from 'fs';
import path from 'path';

const editorsDir = './src/components/admin/editors';
const templatesDir = './src/components/templates';

const mappings = [
  {
    name: 'Home',
    editor: 'HomeEditor.tsx',
    template: 'HomeTemplate.tsx',
    extraTemplates: ['CountryTemplate.tsx', 'StateTemplate.tsx']
  },
  {
    name: 'ServiceDetail',
    editor: 'ServiceDetailEditor.tsx',
    template: 'ServiceDetailTemplate.tsx'
  },
  {
    name: 'NewAbout',
    editor: 'NewAboutEditor.tsx',
    template: 'NewAboutTemplate.tsx'
  },
  {
    name: 'About (Classic)',
    editor: 'AboutEditor.tsx',
    template: 'AboutTemplate.tsx'
  },
  {
    name: 'Services',
    editor: 'ServicesEditor.tsx',
    template: 'ServicesTemplate.tsx'
  },
  {
    name: 'Contact',
    editor: 'ContactEditor.tsx',
    template: 'ContactTemplate.tsx'
  },
  {
    name: 'Careers',
    editor: 'CareersEditor.tsx',
    template: 'CareersTemplate.tsx'
  },
  {
    name: 'FAQ',
    editor: 'FAQEditor.tsx',
    template: 'FAQTemplate.tsx'
  },
  {
    name: 'Reviews',
    editor: 'ReviewsEditor.tsx',
    template: 'ReviewsTemplate.tsx'
  },
  {
    name: 'Gallery',
    editor: 'GalleryEditor.tsx',
    template: 'GalleryTemplate.tsx'
  },
  {
    name: 'Team',
    editor: 'TeamEditor.tsx',
    template: 'TeamTemplate.tsx'
  },
  {
    name: 'Industry',
    editor: 'IndustryEditor.tsx',
    template: 'IndustryTemplate.tsx'
  },
  {
    name: 'Location',
    editor: 'LocationEditor.tsx',
    template: 'LocationTemplate.tsx'
  },
  {
    name: 'ServiceArea',
    editor: 'ServiceAreaEditor.tsx',
    template: 'ServiceAreaTemplate.tsx'
  },
  {
    name: 'Blog',
    editor: 'BlogEditor.tsx',
    template: 'BlogTemplate.tsx'
  }
];

console.log('='.repeat(80));
console.log('🔬 DEEP SECTION VISIBILITY & CMS BULK AUDIT');
console.log('='.repeat(80));

let totalEditorToggles = 0;
let totalTemplateGuards = 0;
let auditResults = [];

for (const m of mappings) {
  const editorPath = path.join(editorsDir, m.editor);
  const templatePath = path.join(templatesDir, m.template);

  const editorContent = fs.existsSync(editorPath) ? fs.readFileSync(editorPath, 'utf8') : '';
  const templateContent = fs.existsSync(templatePath) ? fs.readFileSync(templatePath, 'utf8') : '';

  // Extract SectionToggle instances in editor
  const toggleMatches = [...editorContent.matchAll(/<SectionToggle[\s\S]*?label="([^"]+)"[\s\S]*?\/>/g)];
  const toggleLabels = toggleMatches.map(tm => tm[1]);
  
  // Extract enabled check expressions in template
  const enabledMatches = [...templateContent.matchAll(/([a-zA-Z0-9_$.?()]+(?:\.enabled|\["enabled"\]))\s*!==\s*false/g)];
  const enabledKeys = [...new Set(enabledMatches.map(em => em[1]))];

  const sectionTags = [...templateContent.matchAll(/<section|<article|<main|PageInlineFaqs/g)];

  totalEditorToggles += toggleLabels.length;
  totalTemplateGuards += enabledKeys.length;

  auditResults.push({
    name: m.name,
    editorFile: m.editor,
    templateFile: m.template,
    editorTogglesCount: toggleLabels.length,
    editorToggleLabels: toggleLabels,
    templateGuardsCount: enabledKeys.length,
    templateGuards: enabledKeys,
    sectionTagsCount: sectionTags.length
  });

  if (m.extraTemplates) {
    for (const extra of m.extraTemplates) {
      const extraPath = path.join(templatesDir, extra);
      const extraContent = fs.existsSync(extraPath) ? fs.readFileSync(extraPath, 'utf8') : '';
      const extraGuards = [...extraContent.matchAll(/([a-zA-Z0-9_$.?()]+(?:\.enabled|\["enabled"\]))\s*!==\s*false/g)];
      auditResults.push({
        name: `${m.name} -> ${extra.replace('.tsx', '')}`,
        editorFile: m.editor,
        templateFile: extra,
        editorTogglesCount: toggleLabels.length,
        editorToggleLabels: toggleLabels,
        templateGuardsCount: extraGuards.length,
        templateGuards: [...new Set(extraGuards.map(em => em[1]))]
      });
    }
  }
}

console.log(`\n📋 AUDIT BREAKDOWN BY PAGE TEMPLATE & EDITOR:\n`);

for (const res of auditResults) {
  console.log(`┌─ [${res.name.toUpperCase()}]`);
  console.log(`│  Editor: ${res.editorFile} (${res.editorTogglesCount} SectionToggles detected)`);
  if (res.editorToggleLabels.length > 0) {
    console.log(`│    Labels: ${res.editorToggleLabels.join(' | ')}`);
  } else {
    console.log(`│    ⚠️ WARNING: 0 SectionToggles detected in Editor!`);
  }
  console.log(`│  Template: ${res.templateFile} (${res.templateGuardsCount} Visibility Guards detected)`);
  if (res.templateGuards && res.templateGuards.length > 0) {
    console.log(`│    Guards: ${res.templateGuards.slice(0, 5).join(', ')}${res.templateGuards.length > 5 ? ' ... (+' + (res.templateGuards.length - 5) + ' more)' : ''}`);
  } else {
    console.log(`│    ⚠️ WARNING: 0 Visibility Guards detected in Template!`);
  }
  console.log(`└─────────────────────────────────────────────────────────────`);
}

console.log(`\n${'='.repeat(80)}`);
console.log(`📊 TOTAL SUMMARY`);
console.log(`Total Editor Section Toggles Found: ${totalEditorToggles}`);
console.log(`Total Template Visibility Guards Found: ${totalTemplateGuards}`);
console.log(`Total Template Pairs Audited: ${auditResults.length}`);
console.log('='.repeat(80));
