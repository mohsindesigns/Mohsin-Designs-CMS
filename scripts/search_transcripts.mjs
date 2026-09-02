import fs from 'fs';
import path from 'path';
import readline from 'readline';

const brainDir = 'C:\\Users\\dell\\.gemini\\antigravity-ide\\brain';
const searchPhrases = [
  'this link is not clickable',
  'this section image is not replace',
  'Remove these numbers and button',
  'fetch reviews from gmb',
  'remove this badge from faqs',
  'remove industries from backend',
  'this blog section is repeated',
  'CTA section is missing',
  'available in dashboard but not showing at frontend',
  'image and description is missing from the card of services',
  'missing from Texas page',
  'remove these numbers from these cards',
  'give enable and disable option'
];

async function searchInFiles() {
  const dirs = fs.readdirSync(brainDir);
  for (const d of dirs) {
    const transcriptPath = path.join(brainDir, d, '.system_generated', 'logs', 'transcript.jsonl');
    if (!fs.existsSync(transcriptPath)) continue;

    const fileStream = fs.createReadStream(transcriptPath);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
    for await (const line of rl) {
      for (const phrase of searchPhrases) {
        if (line.toLowerCase().includes(phrase.toLowerCase())) {
          try {
            const parsed = JSON.parse(line);
            console.log(`\n=== MATCH in ${d} for "${phrase}" ===`);
            console.log(`Type: ${parsed.type}`);
            console.log(`Content: ${parsed.content ? parsed.content.substring(0, 400) : ''}`);
          } catch (e) {
            console.log(`\n=== RAW MATCH in ${d} for "${phrase}" ===`);
            console.log(line.substring(0, 300));
          }
        }
      }
    }
  }
}

searchInFiles();
