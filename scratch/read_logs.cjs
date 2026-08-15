const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\dell\\.gemini\\antigravity-ide\\brain\\f9c46555-5a13-44c2-986f-08f2cbbb4c5a\\.system_generated\\logs\\transcript.jsonl';
const outPath = 'c:\\Users\\dell\\Desktop\\Eagle-Revolution\\scratch\\matches.txt';

const lines = fs.readFileSync(logPath, 'utf8').split('\n');
let outContent = `Total lines: ${lines.length}\n`;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    const text = JSON.stringify(obj);
    if (text.toLowerCase().includes('newcomponent') || text.toLowerCase().includes('new_component')) {
      outContent += `\n=========================================\n`;
      outContent += `LINE ${i + 1} | STEP ${obj.step_index} | TYPE: ${obj.type} | SOURCE: ${obj.source}\n`;
      outContent += `=========================================\n`;
      if (obj.content) {
        outContent += `CONTENT:\n${obj.content}\n`;
      }
      if (obj.tool_calls) {
        outContent += `TOOL CALLS:\n${JSON.stringify(obj.tool_calls, null, 2)}\n`;
      }
    }
  } catch (err) {
    // Ignore invalid JSON lines
  }
}

fs.writeFileSync(outPath, outContent, 'utf8');
console.log('Matches written to scratch/matches.txt');
