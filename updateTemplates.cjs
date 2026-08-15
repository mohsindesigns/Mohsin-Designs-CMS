const fs = require('fs');
const path = require('path');
const dir = path.join(process.cwd(), 'src/components/templates');
const files = fs.readdirSync(dir).filter(f => f.endsWith('Template.tsx') && f !== 'ServiceDetailTemplate.tsx' && f !== 'FAQTemplate.tsx');

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('PageInlineFaqs')) {
    // Add import after the last import statement
    const importMatch = content.match(/import .* from .*;/g);
    if (importMatch) {
      const lastImport = importMatch[importMatch.length - 1];
      content = content.replace(lastImport, lastImport + '\nimport PageInlineFaqs from "@/components/PageInlineFaqs";');
    } else {
      content = 'import PageInlineFaqs from "@/components/PageInlineFaqs";\n' + content;
    }
    
    // Add component before the last closing div or main
    content = content.replace(/<\/(div|main)>\s*$/g, '  <PageInlineFaqs faqs={pageData?.content?.faqs || pageData?.faqs || []} />\n</$1>\n');
    
    fs.writeFileSync(filePath, content);
    console.log('Updated ' + file);
  }
}
