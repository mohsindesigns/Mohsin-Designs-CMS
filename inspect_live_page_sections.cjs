const fs = require('fs');

function clean(t) {
  if (!t) return '';
  return t.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#8217;/g, "'").replace(/&#8220;/g, '"').replace(/&#8221;/g, '"').replace(/&#8211;/g, '-').replace(/\s+/g, ' ').trim();
}

async function inspectLive() {
  console.log('Fetching live UI/UX design page...');
  const res = await fetch('https://mohsindesigns.com/services/ui-ux-design/', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36' }
  });
  const html = await res.text();
  fs.writeFileSync('live_ui-ux.html', html, 'utf8');

  // Find all H2s and their following content
  const h2Regex = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  let m;
  const sections = [];
  while ((m = h2Regex.exec(html)) !== null) {
    sections.push({ title: clean(m[1]), index: m.index });
  }

  console.log('--- ALL H2 SECTIONS IN mohsindesigns.com/services/ui-ux-design/ ---');
  sections.forEach((s, i) => {
    const nextIdx = sections[i + 1] ? sections[i + 1].index : s.index + 3000;
    const chunk = html.substring(s.index, Math.min(html.length, nextIdx));
    const h3s = [...chunk.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi)].map(x => clean(x[1]));
    const paras = [...chunk.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map(x => clean(x[1])).filter(p => p.length > 20);
    console.log(`\n[${i + 1}] H2: "${s.title}"`);
    if (h3s.length > 0) console.log(`    H3s (${h3s.length}):`, h3s);
    if (paras.length > 0) console.log(`    Paras (${paras.length}):`, paras.slice(0, 3));
  });
}

inspectLive().catch(console.error);
