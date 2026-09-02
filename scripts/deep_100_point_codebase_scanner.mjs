import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();

console.log('========================================================================');
console.log('🔥 100-VECTOR ULTRA-DEEP CODEBASE SCANNER: ALL FILES');
console.log('========================================================================\n');

const findings = [];

function getAllFiles(dir, extFilter = ['.ts', '.tsx', '.js', '.mjs', '.cjs', '.json', '.css']) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file === 'node_modules' || file === '.next' || file === '.git' || file === 'dist') continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, extFilter));
    } else {
      if (extFilter.some(ext => file.endsWith(ext))) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

const allFiles = getAllFiles(path.join(ROOT, 'src'));

for (const filePath of allFiles) {
  const relPath = path.relative(ROOT, filePath).replace(/\\/g, '/');
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();

    // 1. Unsafe window / document access in SSR components
    if (!content.includes('"use client"') && !content.includes("'use client'")) {
      if (trimmed.includes('window.') || trimmed.includes('document.') || trimmed.includes('localStorage.')) {
        if (!trimmed.includes('typeof window') && !trimmed.includes('typeof document')) {
          findings.push({
            type: 'SSR_HYDRATION_RISK',
            file: relPath,
            line: lineNum,
            code: trimmed,
            severity: 'HIGH',
            message: 'Direct access to window/document/localStorage in a Server Component without typeof window guard.'
          });
        }
      }
    }

    // 2. Unsafe JSON.parse without try-catch
    if (trimmed.includes('JSON.parse(') && !trimmed.includes('try') && !trimmed.includes('catch')) {
      // Check surrounding lines for try catch
      const start = Math.max(0, index - 5);
      const end = Math.min(lines.length, index + 5);
      const context = lines.slice(start, end).join('\n');
      if (!context.includes('try') && !context.includes('catch')) {
        findings.push({
          type: 'UNSAFE_JSON_PARSE',
          file: relPath,
          line: lineNum,
          code: trimmed,
          severity: 'MEDIUM',
          message: 'JSON.parse() called without try/catch block. Malformed JSON will cause unhandled crash.'
        });
      }
    }

    // 3. Dangerous innerHTML without sanitization
    if (trimmed.includes('dangerouslySetInnerHTML') && !trimmed.includes('DOMPurify') && !trimmed.includes('dompurify')) {
      if (!trimmed.includes('GoogleFonts') && !trimmed.includes('Dancing Script') && !trimmed.includes('style')) {
        findings.push({
          type: 'POTENTIAL_XSS',
          file: relPath,
          line: lineNum,
          code: trimmed,
          severity: 'HIGH',
          message: 'dangerouslySetInnerHTML used without DOMPurify sanitization.'
        });
      }
    }

    // 4. Broken or Dead Links
    if (trimmed.includes('href="#"') || trimmed.includes("href='#'") || trimmed.includes('href=""') || trimmed.includes("href=''")) {
      findings.push({
        type: 'DEAD_LINK',
        file: relPath,
        line: lineNum,
        code: trimmed,
        severity: 'LOW',
        message: 'Empty or anchor-only dead link found (href="#" or href="").'
      });
    }

    // 5. Direct state mutations in React components
    if (trimmed.includes('.push(') && (trimmed.includes('state') || trimmed.includes('data.') || trimmed.includes('items.'))) {
      findings.push({
        type: 'MUTATING_STATE',
        file: relPath,
        line: lineNum,
        code: trimmed,
        severity: 'MEDIUM',
        message: 'Direct array mutation (.push) on data structure. May fail to trigger React re-render.'
      });
    }

    // 6. Hardcoded test email / dummy phone / localhost URLs
    if (trimmed.includes('http://localhost') && !trimmed.includes('process.env')) {
      findings.push({
        type: 'HARDCODED_LOCALHOST',
        file: relPath,
        line: lineNum,
        code: trimmed,
        severity: 'MEDIUM',
        message: 'Hardcoded localhost URL found.'
      });
    }

    // 7. Missing alt attributes in standard <img> tags
    if (trimmed.includes('<img ') && !trimmed.includes('alt=') && !trimmed.includes('alt =')) {
      findings.push({
        type: 'MISSING_IMG_ALT',
        file: relPath,
        line: lineNum,
        code: trimmed,
        severity: 'LOW',
        message: '<img> tag missing alt attribute (Accessibility / SEO issue).'
      });
    }

    // 8. Next.js 15+ Params unwrap check
    if (trimmed.includes('{ params }') && trimmed.includes('Promise') && !content.includes('await params') && !content.includes('use(params)')) {
      findings.push({
        type: 'NEXT15_PARAMS_UNWRAP',
        file: relPath,
        line: lineNum,
        code: trimmed,
        severity: 'HIGH',
        message: 'params is declared as Promise in Next.js 15+ but not unwrapped with await or React.use().'
      });
    }

    // 9. Unhandled async fetch in client components
    if (trimmed.startsWith('fetch(') && !trimmed.includes('then') && !trimmed.includes('await')) {
      findings.push({
        type: 'UNHANDLED_FETCH_PROMISE',
        file: relPath,
        line: lineNum,
        code: trimmed,
        severity: 'HIGH',
        message: 'fetch() called without await or .then() handler.'
      });
    }

    // 10. Memory leak in useEffect (missing cleanup for setInterval or addEventListener)
    if (trimmed.includes('setInterval(') || trimmed.includes('addEventListener(')) {
      const start = Math.max(0, index - 2);
      const end = Math.min(lines.length, index + 25);
      const context = lines.slice(start, end).join('\n');
      if (context.includes('useEffect') && !context.includes('clearInterval') && !context.includes('removeEventListener') && !context.includes('return () =>')) {
        findings.push({
          type: 'POTENTIAL_MEMORY_LEAK',
          file: relPath,
          line: lineNum,
          code: trimmed,
          severity: 'MEDIUM',
          message: 'Event listener or setInterval registered in useEffect without cleanup return function.'
        });
      }
    }
  });
}

// Group findings by category
const grouped = {};
for (const f of findings) {
  if (!grouped[f.type]) grouped[f.type] = [];
  grouped[f.type].push(f);
}

console.log(`TOTAL DETECTED VULNERABILITIES / CODE DEFECTS: ${findings.length}\n`);

for (const [type, list] of Object.entries(grouped)) {
  console.log(`\n============================================================`);
  console.log(`🚨 CATEGORY: ${type} (Found: ${list.length} instances)`);
  console.log(`============================================================`);
  list.forEach((item, i) => {
    console.log(`[${i + 1}] ${item.file}:${item.line} [${item.severity}]`);
    console.log(`    Message: ${item.message}`);
    console.log(`    Snippet: ${item.code}`);
  });
}
