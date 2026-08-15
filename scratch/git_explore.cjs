const { execSync } = require('child_process');
try {
  console.log("Branches:");
  console.log(execSync('git branch -a', { encoding: 'utf8' }));
  console.log("Stash list:");
  console.log(execSync('git stash list', { encoding: 'utf8' }));
  console.log("Recent commits (last 5):");
  console.log(execSync('git log -n 5 --oneline', { encoding: 'utf8' }));
} catch (err) {
  console.error("Git command failed:", err.message);
}
