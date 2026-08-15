const fs = require('fs');
const readline = require('readline');
const path = require('path');

const logFilePath = 'C:\\Users\\dell\\.gemini\\antigravity\\brain\\061fabab-e586-4492-9632-31dcca0cd27d\\.system_generated\\logs\\transcript.jsonl';
const outputFilePath = path.join(__dirname, 'full_user_request.txt');

async function extract() {
  const fileStream = fs.createReadStream(logFilePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let foundContent = null;

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);
      // Look for the user input step
      if (obj.type === 'USER_INPUT' && obj.content && obj.content.includes('SERVICES temaplte like the belwo givne')) {
        foundContent = obj.content;
      }
    } catch (e) {
      // Ignore parse errors
    }
  }

  if (foundContent) {
    fs.writeFileSync(outputFilePath, foundContent);
    console.log('Successfully extracted full user request. Size:', foundContent.length, 'characters.');
  } else {
    console.log('Could not find the target USER_INPUT in transcript.jsonl');
  }
}

extract();
