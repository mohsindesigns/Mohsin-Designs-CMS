const fs = require('fs');
const logPath = 'C:\\Users\\dell\\.gemini\\antigravity-ide\\brain\\f9c46555-5a13-44c2-986f-08f2cbbb4c5a\\.system_generated\\logs\\transcript.jsonl';

const lines = fs.readFileSync(logPath, 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.step_index === 159) {
      console.log('Step 159 Content:', obj.content);
    }
    if (obj.step_index === 210) {
      console.log('Step 210 Content:', obj.content);
    }
  } catch (err) {}
}
