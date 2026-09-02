import { execSync } from 'child_process';

function showCommit(hash) {
  return execSync(`git show ${hash} -- . ":(exclude)tsconfig.tsbuildinfo"`, { maxBuffer: 10 * 1024 * 1024 }).toString();
}

console.log("=== COMMIT d729236 ===");
console.log(showCommit('d729236'));

console.log("=== COMMIT c7aed09 ===");
console.log(showCommit('c7aed09'));
