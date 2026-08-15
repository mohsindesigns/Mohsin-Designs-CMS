const fs = require('fs');
const logPath = 'C:\\Users\\dell\\.gemini\\antigravity-ide\\brain\\f9c46555-5a13-44c2-986f-08f2cbbb4c5a\\.system_generated\\logs\\transcript.jsonl';

const lines = fs.readFileSync(logPath, 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.tool_calls) {
      for (const tc of obj.tool_calls) {
        if (tc.name === 'view_file') {
          console.log(`Step ${obj.step_index}: view_file on ${tc.args.AbsolutePath} (Lines ${tc.args.StartLine} - ${tc.args.EndLine})`);
        }
      }
    }
    if (obj.type === 'VIEW_FILE') {
      console.log(`Step ${obj.step_index}: VIEW_FILE response, content length: ${obj.content ? obj.content.length : 0}`);
      if (obj.content && obj.content.includes('Total Lines:')) {
        const line1 = obj.content.split('\n')[1] || '';
        console.log(`   -> ${line1}`);
      }
    }
  } catch (err) {}
}
