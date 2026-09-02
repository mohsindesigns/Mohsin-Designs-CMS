import { readFileSync, writeFileSync } from 'fs';

const path = 'src/components/admin/editors/HomeEditor.tsx';
let content = readFileSync(path, 'utf8');

// Check if already done
const alreadyDone = content.includes('{!aboutClean && (\n                     <div className="space-y-6">\n                        <h3 className={UI.sectionHeader}>3. Action Buttons</h3>');
if (alreadyDone) {
  console.log('ALREADY DONE');
  process.exit(0);
}

// Exact match from debug output
const target = `</div>\n                     <div className="space-y-6">\n                        <h3 className={UI.sectionHeader}>3. Action Buttons</h3>`;
const replacement = `</div>\n                     {!aboutClean && (\n                     <div className="space-y-6">\n                        <h3 className={UI.sectionHeader}>3. Action Buttons</h3>`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  writeFileSync(path, content, 'utf8');
  console.log('DONE: Buttons guard added');
} else {
  console.log('Still not matched. Raw idx check:');
  const idx = content.indexOf('3. Action Buttons');
  console.log(JSON.stringify(content.substring(idx - 120, idx + 50)));
}
