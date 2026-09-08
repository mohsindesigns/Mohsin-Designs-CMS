const fs = require('fs');
const html = fs.readFileSync('live_ui-ux.html', 'utf8');

const idx = html.indexOf('Why Growing Brands Pick');
const chunk = html.substring(idx, idx + 4000);

const titles = [...chunk.matchAll(/class=["'][^"']*elementor-icon-box-title[^"']*["'][^>]*>([\s\S]*?)<\/(?:h\d|span|div)>/gi)]
  .map(m => m[1].replace(/<[^>]+>/g, '').trim());

const descs = [...chunk.matchAll(/class=["'][^"']*elementor-icon-box-description[^"']*["'][^>]*>([\s\S]*?)<\/p>/gi)]
  .map(m => m[1].replace(/<[^>]+>/g, '').trim());

console.log('TITLES:', titles);
console.log('DESCS:', descs);
