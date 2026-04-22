# 방음부스 → 프린터 AS 시스템 마이그레이션 가이드

## 📋 개요
방음부스 이전 견적 시스템을 프린터 AS 견적 시스템으로 변경합니다.

---

## 1️⃣ Supabase 데이터베이스 마이그레이션

### 옵션 A: 기존 테이블 수정 (데이터 보존)
```bash
# /migration_booth_to_printer.sql 파일 사용
# Supabase Dashboard > SQL Editor에서 실행
```

**변경 사항:**
- `booth_size` → `printer_type` (UV평판, 솔벤, 일반평판)
- `departure_address` → `visit_address` (방문 주소 하나만)
- `arrival_address` → 삭제
- `options` → `symptoms` (고장 증상)
- `image_url` → TEXT[] 배열로 변경 (여러 장 업로드)

### 옵션 B: 새 테이블 생성 (처음부터)
```bash
# /create_printer_estimates_table.sql 파일 사용
# Supabase Dashboard > SQL Editor에서 실행
```

---

## 2️⃣ 프론트엔드 코드 수정 항목

### CustomerRequest.tsx
```typescript
// 1. formData 상태 수정
const [formData, setFormData] = useState({
  // 기존
  boothSize: "",        // ❌ 삭제
  boothType: "",        // ❌ 삭제 또는 변경
  departureAddress: "", // ❌ 삭제
  arrivalAddress: "",   // ❌ 삭제
  options: [],          // ❌ 삭제
  
  // 새로운
  printerType: "",      // ✅ "UV평판", "솔벤", "일반평판"
  visitAddress: "",     // ✅ AS 방문 주소
  symptoms: [],         // ✅ ["잉크막힘", "보드불량", "인식불가"]
  imageUrls: [],        // ✅ 여러 이미지 URL 배열
});

// 2. Supabase INSERT 쿼리 수정
const { data, error } = await supabase
  .from('estimates')
  .insert({
    printer_type: formData.printerType,
    visit_address: formData.visitAddress,
    symptoms: formData.symptoms.join(', '),
    image_url: formData.imageUrls, // 배열로 저장
  });
```

### AdminDashboard.tsx
```typescript
// 1. 견적 표시 필드 수정
<div>프린터 종류: {estimate.printer_type}</div>
<div>방문 주소: {estimate.visit_address}</div>
<div>고장 증상: {estimate.symptoms}</div>

// 2. 이미지 여러 장 표시
{estimate.image_url && estimate.image_url.length > 0 && (
  <div className="flex gap-2">
    {estimate.image_url.map((url, index) => (
      <img key={index} src={url} alt={`사진 ${index + 1}`} />
    ))}
  </div>
)}
```

---

## 3️⃣ UI 수정 항목

### 입력 폼 변경
1. **부스 크기** → **프린터 종류** 선택
   - 라디오 버튼: UV평판 / 솔벤 / 일반평판

2. **출발지/도착지** → **방문 주소** 하나만
   - 주소 검색 필드 1개로 통합

3. **옵션** → **고장 증상** 체크박스
   - 잉크막힘, 보드불량, 인식불가, 헤드고장, 기타

4. **이미지 업로드** → 여러 장 가능
   - multiple 속성 추가
   - 미리보기 여러 개 표시

---

## 4️⃣ 실행 순서

1. ✅ **SQL 파일 실행** (Supabase)
   - `migration_booth_to_printer.sql` 또는
   - `create_printer_estimates_table.sql`

2. ⏳ **프론트엔드 코드 수정**
   - CustomerRequest.tsx
   - AdminDashboard.tsx
   - EstimateModal.tsx

3. ⏳ **테스트**
   - 견적 요청 제출
   - 관리자 대시보드 확인
   - 이미지 여러 장 업로드 테스트

---

## 5️⃣ 주의사항

⚠️ **데이터베이스 백업**
```sql
-- 실행 전 기존 데이터 백업
CREATE TABLE estimates_backup AS SELECT * FROM estimates;
```

⚠️ **기존 데이터 마이그레이션**
- `booth_size` → `printer_type`: 수동 매핑 필요
- `departure_address` → `visit_address`: 출발지 또는 도착지 선택
- `image_url` TEXT → TEXT[]: 단일 URL을 배열로 변환

⚠️ **RLS 정책 확인**
```sql
-- Supabase Dashboard > Authentication > Policies에서 확인
-- INSERT, SELECT, UPDATE 권한 설정 확인
```

---

## 📞 다음 단계

지금 프론트엔드 코드를 수정해드릴까요?
1. CustomerRequest.tsx (견적 요청 폼)
2. AdminDashboard.tsx (관리자 대시보드)
3. EstimateModal.tsx (견적 상세 모달)

어떤 파일부터 수정하시겠습니까?
