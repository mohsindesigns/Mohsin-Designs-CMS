const fs = require('fs');
const readline = require('readline');

const logFilePath = 'C:\\Users\\dell\\.gemini\\antigravity\\brain\\061fabab-e586-4492-9632-31dcca0cd27d\\.system_generated\\logs\\transcript.jsonl';

async function findInputs() {
  const fileStream = fs.createReadStream(logFilePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let index = 0;
  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);
      if (obj.type === 'USER_INPUT') {
        console.log(`Step ${obj.step_index || index}: Length: ${obj.content ? obj.content.length : 0}, Preview: ${obj.content ? obj.content.substring(0, 100).replace(/\n/g, ' ') : ''}`);
      }
    } catch (e) {
      // Ignore
    }
    index++;
  }
}

findInputs();
