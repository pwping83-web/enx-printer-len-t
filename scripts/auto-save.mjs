import { execSync } from 'node:child_process';

const run = (command) => execSync(command, { stdio: 'inherit' });
const read = (command) =>
  execSync(command, { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' }).trim();

try {
  const status = read('git status --porcelain');
  if (!status) {
    console.log('No changes to commit.');
    process.exit(0);
  }

  run('git add -A');

  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  run(`git commit -m "chore: auto save ${timestamp}"`);
  console.log('Auto save commit created.');
} catch (error) {
  console.error('Auto save failed.');
  process.exit(1);
}
