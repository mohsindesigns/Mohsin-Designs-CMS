import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();

console.log('========================================================================');
console.log('🔬 DEEP FIELD-BY-FIELD TEMPLATE VS EDITOR AUDIT');
console.log('========================================================================\n');

const templateEditorPairs = [
  { template: 'src/components/templates/HomeTemplate.tsx', editor: 'src/components/admin/editors/HomeEditor.tsx', name: 'Home' },
  { template: 'src/components/templates/ServiceDetailTemplate.tsx', editor: 'src/components/admin/editors/ServiceDetailEditor.tsx', name: 'ServiceDetail' },
  { template: 'src/components/templates/NewAboutTemplate.tsx', editor: 'src/components/admin/editors/NewAboutEditor.tsx', name: 'NewAbout' },
  { template: 'src/components/templates/AboutTemplate.tsx', editor: 'src/components/admin/editors/AboutEditor.tsx', name: 'About (Legacy)' },
  { template: 'src/components/templates/IndustryTemplate.tsx', editor: 'src/components/admin/editors/IndustryEditor.tsx', name: 'Industry' },
  { template: 'src/components/templates/LocationTemplate.tsx', editor: 'src/components/admin/editors/LocationEditor.tsx', name: 'Location' },
  { template: 'src/components/templates/ServiceAreaTemplate.tsx', editor: 'src/components/admin/editors/ServiceAreaEditor.tsx', name: 'ServiceArea' },
  { template: 'src/components/templates/CountryTemplate.tsx', editor: 'src/components/admin/editors/CountryEditor.tsx', name: 'Country' },
  { template: 'src/components/templates/StateTemplate.tsx', editor: 'src/components/admin/editors/StateEditor.tsx', name: 'State' },
  { template: 'src/components/templates/ContactTemplate.tsx', editor: 'src/components/admin/editors/ContactEditor.tsx', name: 'Contact' },
  { template: 'src/components/templates/CareersTemplate.tsx', editor: 'src/components/admin/editors/CareersEditor.tsx', name: 'Careers' },
  { template: 'src/components/templates/FAQTemplate.tsx', editor: 'src/components/admin/editors/FAQEditor.tsx', name: 'FAQ' },
  { template: 'src/components/templates/ReviewsTemplate.tsx', editor: 'src/components/admin/editors/ReviewsEditor.tsx', name: 'Reviews' },
  { template: 'src/components/templates/GalleryTemplate.tsx', editor: 'src/components/admin/editors/GalleryEditor.tsx', name: 'Gallery' },
  { template: 'src/components/templates/TeamTemplate.tsx', editor: 'src/components/admin/editors/TeamEditor.tsx', name: 'Team' },
  { template: 'src/components/templates/ServicesTemplate.tsx', editor: 'src/components/admin/editors/ServicesEditor.tsx', name: 'Services' },
];

for (const pair of templateEditorPairs) {
  console.log(`\n------------------------------------------------------------`);
  console.log(`Auditing Pair: [${pair.name}]`);
  console.log(`Template: ${pair.template}`);
  console.log(`Editor:   ${pair.editor}`);

  const tExists = fs.existsSync(path.join(ROOT, pair.template));
  const eExists = fs.existsSync(path.join(ROOT, pair.editor));

  if (!tExists) {
    console.log(`❌ Template file missing: ${pair.template}`);
    continue;
  }
  if (!eExists) {
    console.log(`❌ Editor file missing: ${pair.editor}`);
    continue;
  }

  const tContent = fs.readFileSync(path.join(ROOT, pair.template), 'utf8');
  const eContent = fs.readFileSync(path.join(ROOT, pair.editor), 'utf8');

  console.log(`Template size: ${tContent.length} bytes | Editor size: ${eContent.length} bytes`);
}
