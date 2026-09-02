import fs from 'fs';
import path from 'path';
import readline from 'readline';

const brainDir = 'C:\\Users\\dell\\.gemini\\antigravity-ide\\brain';
const currentConv = '6e7d8d2f-fe6b-4972-9c83-901f3f493cd3';

async function searchPast() {
  const dirs = fs.readdirSync(brainDir);
  for (const d of dirs) {
    if (d === currentConv) continue;
    const transcriptPath = path.join(brainDir, d, '.system_generated', 'logs', 'transcript.jsonl');
    if (!fs.existsSync(transcriptPath)) continue;

    const fileStream = fs.createReadStream(transcriptPath);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
    for await (const line of rl) {
      if (line.includes('missing from Texas') || line.includes('remove industries from backend') || line.includes('fetch reviews from gmb') || line.includes('this blog section is repeated')) {
        try {
          const parsed = JSON.parse(line);
          console.log(`\n=== MATCH in ${d} ===`);
          console.log(`Content: ${parsed.content ? parsed.content.substring(0, 500) : line.substring(0, 500)}`);
        } catch (e) {}
      }
    }
  }
}

searchPast();
