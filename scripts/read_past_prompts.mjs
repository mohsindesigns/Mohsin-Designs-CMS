import fs from 'fs';
import readline from 'readline';

async function readPrompts(convId) {
  const filePath = `C:\\Users\\dell\\.gemini\\antigravity-ide\\brain\\${convId}\\.system_generated\\logs\\transcript.jsonl`;
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  console.log(`\n=== CONVERSATION ${convId} ===`);
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  for await (const line of rl) {
    try {
      const entry = JSON.parse(line);
      if (entry.type === 'USER_INPUT') {
        console.log(`USER: ${entry.content?.substring(0, 300)}`);
      }
    } catch (e) {}
  }
}

async function main() {
  await readPrompts('b11ccf05-befc-4891-97fd-720bd0c79e1b');
  await readPrompts('75fbc0ec-a9b3-4715-a777-bdab9af1c5df');
  await readPrompts('2ef202c4-e2c3-4bc7-8a54-4ecf24dc7397');
}

main();
