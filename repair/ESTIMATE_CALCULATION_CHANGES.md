# 견적 계산 로직 변경 요구사항

## 변경 전 (방음부스 이전)
- 싱글 기본: 50만원
- 더블 기본: 90만원
- 거리별: 서울경기인천 50만원, 부산 100만원
- 추가 비용: 계단, 타공, 피아노, 에어컨 등

## 변경 후 (프린터 AS)

### 1. 기본 출장비
```javascript
const baseFee = 500000; // 서울/경기/인천 50만원 고정
```

### 2. 지방 할증
```javascript
if (formData.distanceRange === "busan") {
  baseFee = 1000000; // 부산 100만원 고정
} else if (actualDistance > 50) {
  // 그 외 지역: 거리 비례 (1만원 단위)
  const excessKm = actualDistance - 50;
  const busanExcessKm = 400 - 50; // 350km
  const busanAdditionalCost = 500000; // 부산 추가 비용 (100만 - 50만)
  const costPerKm = busanAdditionalCost / busanExcessKm; // 약 1,428원/km
  distanceAdditionalCost = Math.ceil((excessKm * costPerKm) / 10000) * 10000; // 만원 단위 올림
}
```

### 3. 총 출장비
```javascript
const totalFee = baseFee + distanceAdditionalCost;
```

### 4. 계산 예시
- 서울/경기/인천 (50km 이내): 50만원
- 서울에서 100km 지점: 50만 + (50km × 1,428원 = 71,400 → 80,000원) = 58만원
- 부산: 100만원

## UI 표시 변경

### 현재 (변경 전)
- 레이블: "AI 예상 견적"
- 표시 내용: 
  - 기본 이전 비용
  - 추가 작업 비용
  - 총 예상 비용

### 변경 요구사항
- 레이블: **"예상 출장 점검비"**
- 표시 내용:
  - 기본 출장비
  - 거리 추가비 (50km 초과 시)
  - 총 출장비
- **하단 문구 추가**: "부품 교체 비용은 현장 점검 후 별도 안내"

## 수정 필요 파일

### CustomerRequest.tsx
1. calculateAIEstimate 함수 완전히 재작성
2. UI 섹션의 "AI 예상 견적" → "예상 출장 점검비"
3. 하단 안내 문구 추가

### 삭제할 로직
- 부스 타입별 추가 비용
- 계단 층수 추가 비용
- 보관 비용
- 특수 작업 비용 (타공, 피아노, 에어컨 등)
- 공사식 부스 추가 비용
- 셀프 이전 실패 할인

## 코드 구현

```typescript
// 프린터 AS 출장비 계산
const calculateAIEstimate = useMemo(() => {
  // 기본 출장비: 서울/경기/인천 50만원 고정
  let baseFee = 500000;
  
  // 거리 추가 비용 계산
  let distanceAdditionalCost = 0;
  const actualDistance = formData.actualDistance || 0;
  
  if (formData.distanceRange === "busan") {
    // 부산: 100만원 고정
    baseFee = 1000000;
  } else if (actualDistance > 50) {
    // 그 외 지역: 50km 초과 시 거리 비례
    const excessKm = actualDistance - 50;
    const busanExcessKm = 400 - 50; // 350km
    const busanAdditionalCost = 500000; // 부산의 추가 비용
    const costPerKm = busanAdditionalCost / busanExcessKm; // 약 1,428원/km
    distanceAdditionalCost = Math.ceil((excessKm * costPerKm) / 10000) * 10000; // 만원 단위 올림
  }
  
  // 총 출장비 = 기본비 + 거리 추가비
  const totalFee = baseFee + distanceAdditionalCost;
  
  return {
    basePrice: baseFee, // 기본 출장비
    additionalCost: distanceAdditionalCost, // 거리 추가 비용
    totalPrice: totalFee, // 전체 출장비
    isValid: formData.visitAddress !== ""
  };
}, [formData.distanceRange, formData.actualDistance, formData.visitAddress]);
```

---

## 다음 단계

견적 계산 로직이 너무 복잡하게 얽혀 있어서 파일을 직접 수정하는 것보다
전체 함수를 재작성하는 것이 더 효율적일 것 같습니다.

다음 명령어로 진행해주세요:
```
"calculateAIEstimate 함수 전체를 위 코드로 교체하고, UI에서 '예상 출장 점검비'로 표시하고 하단에 안내 문구 추가해줘"
```
