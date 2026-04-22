#!/bin/bash
# CustomerRequest.tsx 파일 정리 스크립트

echo "🔧 CustomerRequest.tsx 파일 정리 시작..."

FILE="src/app/components/CustomerRequest.tsx"

# 현재 라인 수 확인
CURRENT_LINES=$(wc -l < "$FILE")
echo "   현재 라인 수: $CURRENT_LINES"

# 1280번 줄까지만 유지
head -n 1280 "$FILE" > "${FILE}.tmp"
mv "${FILE}.tmp" "$FILE"

# 결과 확인
NEW_LINES=$(wc -l < "$FILE")
echo "   수정 후 라인 수: $NEW_LINES"
echo "   삭제된 라인 수: $((CURRENT_LINES - NEW_LINES))"

echo "✅ 파일 정리 완료!"
