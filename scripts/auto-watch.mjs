import { watch } from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const projectRoot = process.cwd();
const ignoredSegments = new Set(['.git', 'node_modules', 'dist']);

let pending = false;
let running = false;
let debounceTimer = null;

const shouldIgnore = (targetPath = '') => {
  const normalized = targetPath.replace(/\\/g, '/');
  return normalized
    .split('/')
    .some((segment) => ignoredSegments.has(segment));
};

const runShip = () => {
  if (running) {
    pending = true;
    return;
  }

  running = true;
  pending = false;

  const timestamp = new Date().toLocaleString('ko-KR', { hour12: false });
  console.log(`[auto-watch] change detected -> auto:ship (${timestamp})`);

  try {
    execSync('npm run auto:ship', { stdio: 'inherit' });
  } catch (error) {
    console.error('[auto-watch] auto:ship failed. watching continues.');
  } finally {
    running = false;
    if (pending) {
      runShip();
    }
  }
};

const scheduleShip = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(runShip, 3000);
};

console.log('[auto-watch] started. Press Ctrl+C to stop.');
console.log('[auto-watch] watching:', projectRoot);

const watcher = watch(
  projectRoot,
  { recursive: true },
  (eventType, filename) => {
    if (!filename || shouldIgnore(filename)) {
      return;
    }

    const fullPath = path.resolve(projectRoot, filename);
    console.log(`[auto-watch] ${eventType}: ${fullPath}`);
    scheduleShip();
  }
);

const closeWatcher = () => {
  clearTimeout(debounceTimer);
  watcher.close();
  console.log('\n[auto-watch] stopped.');
  process.exit(0);
};

process.on('SIGINT', closeWatcher);
process.on('SIGTERM', closeWatcher);
