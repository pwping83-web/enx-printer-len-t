#!/usr/bin/env python3
"""
CustomerRequest.tsx 파일을 1280번 줄까지만 유지하고 나머지를 삭제하는 스크립트
"""

file_path = 'src/app/components/CustomerRequest.tsx'

# 파일 읽기
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 1280번 줄까지만 유지
lines_to_keep = lines[:1280]

# 파일 덮어쓰기
with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines_to_keep)

print(f"✅ 파일이 성공적으로 정리되었습니다!")
print(f"   유지된 줄 수: {len(lines_to_keep)}")
print(f"   삭제된 줄 수: {len(lines) - len(lines_to_keep)}")
