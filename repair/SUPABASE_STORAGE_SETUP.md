# 📸 Supabase Storage 설정 가이드

## ✅ 필수 설정: 'printer-images' 버킷 권한 설정

현재 Storage 버킷이 비어있고 업로드가 안 되는 이유는 **RLS Policy** 때문입니다.
아래 단계를 따라 설정하면 즉시 해결됩니다!

---

## 🔧 방법 1: SQL로 Policy 생성 (권장)

### 1️⃣ Supabase SQL Editor 접속
```
https://supabase.com/dashboard/project/omqsbenvwyemjbmqgrqw/sql
```

### 2️⃣ 다음 SQL 실행

```sql
-- ✅ 1. 모든 사용자가 업로드 가능하도록 설정
CREATE POLICY "Allow public uploads"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'printer-images');

-- ✅ 2. 모든 사용자가 조회 가능하도록 설정
CREATE POLICY "Allow public access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'printer-images');

-- ✅ 3. 모든 사용자가 삭제 가능하도록 설정 (선택사항)
CREATE POLICY "Allow public deletes"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'printer-images');
```

### 3️⃣ 실행 후 확인
- ✅ "Success. No rows returned" 메시지가 나오면 성공!
- ✅ 이제 사진 업로드가 정상적으로 작동합니다!

---

## 🔧 방법 2: UI에서 버킷을 Public으로 설정 (더 간단)

### 1️⃣ Storage 페이지 접속
```
https://supabase.com/dashboard/project/omqsbenvwyemjbmqgrqw/storage/buckets
```

### 2️⃣ 'printer-images' 버킷 설정
1. **'printer-images' 버킷 클릭**
2. **우측 상단 '⚙️ Settings' 클릭**
3. **'Public bucket' 토글을 ON으로 변경**
4. **'Save' 클릭**

### 3️⃣ 완료!
- ✅ 버킷이 Public으로 설정되면 누구나 업로드/조회 가능!
- ✅ 이제 고객이 사진을 업로드하면 자동으로 Storage에 저장됩니다!

---

## 🎯 테스트 방법

### 1. 고객 페이지에서 테스트
1. **고객 견적 요청 페이지 접속**: `/customer-request`
2. **프린터 정보 입력**
3. **사진 2-3장 첨부**
4. **주소 입력 및 제출**

### 2. 콘솔 확인 (F12 > Console)
```
📸 이미지 업로드 시작... 2개
📤 업로드 중 (1/2): abc123_1234567890.jpg
✅ Supabase에 파일 업로드 완료 (1): abc123_1234567890.jpg
✅ 이미지 업로드 성공 (1): https://omqsbenvwyemjbmqgrqw.supabase.co/storage/v1/object/public/printer-images/...
📊 현재까지 업로드된 이미지 URLs: ["https://..."]
```

### 3. Storage 확인
```
https://supabase.com/dashboard/project/omqsbenvwyemjbmqgrqw/storage/buckets/printer-images
```
- ✅ 업로드된 이미지 파일들이 보여야 함!

### 4. 관리자 페이지 확인
1. **관리자 페이지 접속**: `/admin`
2. **비밀번호 입력**: `2482`
3. **방금 제출한 견적 클릭**
4. **상세 모달에서 이미지 썸네일 확인**
   - ✅ 이미지가 보이고, 클릭하면 원본 이미지가 새 탭에서 열림!

---

## ⚠️ 문제 해결

### Q1. 여전히 "❌ Storage 업로드 권한이 없습니다!" 에러가 나옵니다.
**A1.** Policy가 제대로 생성되지 않았을 수 있습니다.

```sql
-- 기존 Policy 삭제 후 다시 생성
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access" ON storage.objects;

-- 다시 생성
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'printer-images');

CREATE POLICY "Allow public access"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'printer-images');
```

### Q2. 이미지가 업로드되었는데 관리자 페이지에서 안 보입니다.
**A2.** DB에 URL이 제대로 저장되지 않았을 수 있습니다.

**확인 방법:**
```sql
-- DB에서 최근 데이터 확인
SELECT id, customer_name, image_urls, created_at 
FROM printer_repair_requests 
ORDER BY created_at DESC 
LIMIT 5;
```

- `image_urls` 컬럼이 `[]` (빈 배열)이면 → 업로드는 성공했으나 DB 저장 실패
- `image_urls` 컬럼에 URL이 있으면 → 정상

### Q3. Public URL이 404 에러를 반환합니다.
**A3.** 버킷이 Private으로 설정되어 있을 수 있습니다.

**해결:**
- Storage 설정에서 'printer-images' 버킷을 **Public**으로 변경
- 또는 위의 SQL로 SELECT Policy 추가

---

## 🎊 설정 완료 체크리스트

- [ ] Supabase SQL로 Policy 생성 완료
- [ ] 또는 버킷을 Public으로 설정 완료
- [ ] 고객 페이지에서 사진 업로드 테스트 성공
- [ ] Storage 버킷에 이미지 파일 확인됨
- [ ] 관리자 페이지에서 이미지 썸네일 표시 확인
- [ ] 이미지 클릭 시 원본 이미지 열림 확인

모든 항목에 체크가 되면 **완벽하게 작동**합니다! 🚀✨

---

## 📞 추가 지원

문제가 계속되면:
1. 브라우저 콘솔(F12) 로그 확인
2. Supabase 대시보드에서 Storage Policies 확인
3. 필요 시 Supabase 공식 문서 참고: https://supabase.com/docs/guides/storage
