import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const projectRoot = process.cwd();
const repairRoot = path.resolve(projectRoot, 'apps', 'repair');
const repairDist = path.resolve(repairRoot, 'dist');
const publicRepair = path.resolve(projectRoot, 'public', 'repair');

const run = (command, args, cwd = projectRoot) => {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit', shell: true });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

if (!existsSync(repairRoot)) {
  console.error('[build-repair] apps/repair 폴더를 찾을 수 없습니다.');
  process.exit(1);
}

console.log('[build-repair] installing repair dependencies...');
run('npm', ['ci'], repairRoot);

console.log('[build-repair] building repair app with /repair base...');
run('npm', ['run', 'build', '--', '--base=/repair/'], repairRoot);

if (!existsSync(repairDist)) {
  console.error('[build-repair] dist 생성 실패');
  process.exit(1);
}

console.log('[build-repair] syncing dist -> public/repair...');
rmSync(publicRepair, { recursive: true, force: true });
mkdirSync(publicRepair, { recursive: true });
cpSync(repairDist, publicRepair, { recursive: true });

console.log('[build-repair] done');
