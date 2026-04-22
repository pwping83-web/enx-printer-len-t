#!/usr/bin/env node
/**
 * CustomerRequest.tsx 파일을 1280번 줄까지만 유지하고 나머지를 삭제하는 스크립트
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/components/CustomerRequest.tsx');

console.log('📝 파일 정리 시작...');
console.log(`   대상 파일: ${filePath}`);

// 파일 읽기
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log(`   현재 줄 수: ${lines.length}`);

// 1280번 줄까지만 유지
const linesToKeep = lines.slice(0, 1280);

// 파일 덮어쓰기
const newContent = linesToKeep.join('\n');
fs.writeFileSync(filePath, newContent, 'utf8');

console.log('✅ 파일이 성공적으로 정리되었습니다!');
console.log(`   유지된 줄 수: ${linesToKeep.length}`);
console.log(`   삭제된 줄 수: ${lines.length - linesToKeep.length}`);
