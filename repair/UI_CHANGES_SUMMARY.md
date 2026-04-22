# UI 변경 완료 사항 ✅

## 1. 메인 타이틀 변경 ✅
- **이전**: "견적 요청하기"
- **변경**: "평판프린터 출장 수리 견적"

## 2. 섹션 제목 변경 ✅
- **이전**: "방음부스 기본 정보"
- **변경**: "프린터 기본 정보"

## 3. 프린터 기종 선택 ✅
- **이전**: "부스 크기" (텍스트 입력), "부스 타입" (싱글/더블 등)
- **변경**: "프린터 기종" (드롭다운 선택)
  - UV평판 프린터
  - 솔벤 프린터
  - 일반평판 프린터
  - 기타

## 4. 고장 증상 체크박스 추가 ✅
날짜/시간 선택 다음에 추가됨:
- 잉크 막힘
- 보드 불량
- 인식 불가
- 헤드 고장
- 출력 안됨
- 기타

## 5. 주소 입력 변경 ✅
- **이전**: "출발지 정보", "도착지 정보" (2개)
- **변경**: "수리 받으실 주소" (1개)
  - 방문 주소
  - 상세 주소
  - 건물 유형
  - 엘리베이터/계단 정보

## 6. 방문 희망 날짜 ✅
- **이전**: "이전 희망 날짜"
- **변경**: "방문 희망 날짜"

## 7. formData 구조 변경 ✅
```typescript
// 삭제된 필드
- boothSize
- boothType
- boothTypeCustom
- fromAddress, toAddress
- fromCustomerName, toCustomerName
- fromCustomerPhone, toCustomerPhone
- 특수 작업 관련 필드 (needDrilling, needPiano 등)

// 추가된 필드
+ printerType (프린터 기종)
+ symptoms (고장 증상 배열)
+ visitAddress (방문 주소)
+ visitAddressDetail (상세 주소)
+ visitBuildingType (건물 유형)
+ visitElevator, visitStairs, visitStairsFloor
```

---

## ⏳ 아직 수정 필요한 부분

### 1. 도착지 정보 섹션 삭제
- 1146-1272줄: 전체 도착지 섹션 HTML 삭제 필요

### 2. 이동거리 섹션 수정
- 조건문 수정: `formData.fromAddress && formData.toAddress` → `formData.visitAddress`
- 지도 컴포넌트 props 수정

### 3. 특수 작업 섹션
- 프린터 수리에 맞게 수정 또는 삭제
- 현재 방음부스 관련 옵션 (타공, 피아노, 에어컨 등) 제거 필요

### 4. 사진 업로드 섹션
- exterior/interior/other → printerImages로 통합
- 여러 장 업로드 가능하도록 수정

### 5. Supabase 저장 로직 수정
- booth_size → printer_type
- options → symptoms
- from_address, to_address → visit_address
- image_url → 배열로 변경

### 6. 이메일/SMS 발송 로직 수정
- 새로운 필드명으로 변경
- 메시지 내용 수정 (부스 이전 → 프린터 수리)

---

## 📝 다음 단계

다음 명령어를 실행해주세요:

```
"도착지 정보 섹션 전체 삭제하고, 이동거리 섹션을 visitAddress로 수정해줘. 그리고 특수 작업 섹션은 프린터 수리용으로 간단하게 변경하거나 삭제해줘."
```
