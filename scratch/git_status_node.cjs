const { execSync } = require('child_process');
try {
  const status = execSync('git status -u', { encoding: 'utf8' });
  console.log("Git Status Output:");
  console.log(status);
} catch (err) {
  console.error("Git status failed:", err.message);
}
