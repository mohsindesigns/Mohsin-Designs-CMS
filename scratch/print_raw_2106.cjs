const fs = require('fs');
const readline = require('readline');

const logFilePath = 'C:\\Users\\dell\\.gemini\\antigravity\\brain\\061fabab-e586-4492-9632-31dcca0cd27d\\.system_generated\\logs\\transcript.jsonl';

async function run() {
  const fileStream = fs.createReadStream(logFilePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);
      if (obj.step_index === 2106) {
        fs.writeFileSync('scratch/raw_step_2106.txt', obj.content);
        console.log('Saved raw content of step 2106 to scratch/raw_step_2106.txt. Length:', obj.content.length);
        break;
      }
    } catch (e) {
      // Ignore
    }
  }
}

run();
