const fs = require('fs');
const path = require('path');

function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      if (!name.includes('node_modules') && !name.includes('.git') && !name.includes('.next')) {
        getFiles(name, fileList);
      }
    } else {
      if (name.endsWith('.tsx') || name.endsWith('.ts') || name.endsWith('.json')) {
        fileList.push({
          path: name,
          size: fs.statSync(name).size
        });
      }
    }
  }
  return fileList;
}

const allFiles = getFiles('c:/Users/dell/Desktop/Eagle-Revolution/src');
console.log(`Found ${allFiles.length} files:`);
allFiles.forEach(f => {
  console.log(`- ${f.path.replace('c:/Users/dell/Desktop/Eagle-Revolution/src\\', '')} (${f.size} bytes)`);
});
