const fs = require('fs');
const readline = require('readline');

const logFilePath = 'C:\\Users\\dell\\.gemini\\antigravity\\brain\\061fabab-e586-4492-9632-31dcca0cd27d\\.system_generated\\logs\\transcript.jsonl';

async function inspect() {
  const fileStream = fs.createReadStream(logFilePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);
      if (obj.step_index === 2106 || line.includes('can u please make my SERVICES temaplte')) {
        console.log('Found line! Keys:', Object.keys(obj));
        console.log('Content length:', obj.content ? obj.content.length : 'undefined');
        if (obj.content) {
          console.log('START OF CONTENT (500 chars):');
          console.log(obj.content.substring(0, 500));
          console.log('END OF CONTENT (500 chars):');
          console.log(obj.content.substring(obj.content.length - 500));
        }
      }
    } catch (e) {
      // Ignore
    }
  }
}

inspect();
