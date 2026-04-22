# 🔧 이미지 표시 문제 해결 가이드

## ❌ 증상
관리자 대시보드에서 이미지가 표시되지 않습니다.

## ✅ 해결 방법

### 1단계: Supabase Storage 버킷 생성 확인

1. **Supabase 대시보드 접속**
   ```
   https://supabase.com/dashboard/project/omqsbenvwyemjbmqgrqw/storage/buckets
   ```

2. **`printer-images` 버킷이 있는지 확인**
   - 없으면 **"New bucket"** 클릭
   - Bucket 이름: `printer-images`
   - **Public bucket 체크박스를 반드시 켜야 합니다!** ✅
   - "Create bucket" 클릭

### 2단계: Public 접근 권한 설정

1. **`printer-images` 버킷 클릭**

2. **"Policies" 탭 클릭**

3. **다음 정책이 있는지 확인:**

#### Policy 1: 누구나 읽기 가능
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'printer-images');
```

#### Policy 2: 누구나 업로드 가능
```sql
CREATE POLICY "Public Upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'printer-images');
```

4. **또는 간단하게:**
   - "New policy" 클릭
   - "For full customization" 선택
   - Policy name: `Public Access`
   - Allowed operation: `SELECT`, `INSERT`
   - Target roles: `public`
   - USING expression: `bucket_id = 'printer-images'`
   - WITH CHECK: `bucket_id = 'printer-images'`
   - "Save policy" 클릭

### 3단계: 기존 파일 확인

1. **Supabase Storage에서 `printer-images` 버킷 열기**

2. **업로드된 파일이 있는지 확인**
   - 파일이 있으면: Public URL을 복사해서 브라우저에서 직접 열어보세요
   - 파일이 없으면: 고객이 사진을 첨부하지 않았거나 업로드에 실패한 것입니다

### 4단계: 테스트 업로드

1. **고객 페이지에서 새로운 견적 요청 제출**
   - 반드시 사진을 첨부하세요
   - 브라우저 개발자 도구(F12) → Console 탭을 열어두세요
   - 제출 버튼 클릭

2. **콘솔에서 다음 메시지 확인:**
   ```
   📸 이미지 업로드 시작... 1개
   📤 업로드 중 (1/1): abc123_1234567890_xyz.jpg
   ✅ 이미지 업로드 성공 (1): https://omqsbenvwyemjbmqgrqw.supabase.co/storage/v1/object/public/printer-images/abc123_1234567890_xyz.jpg
   ✅ 모든 이미지 업로드 완료: 1개
   ```

3. **에러가 발생한 경우:**
   ```
   ❌ 이미지 업로드 실패 (1): {error message}
   ```
   → 에러 메시지를 확인하고 1~2단계를 다시 점검하세요

### 5단계: 관리자 대시보드에서 확인

1. **관리자 페이지 새로고침 (F5)**

2. **브라우저 개발자 도구(F12) → Console 탭 확인**
   ```
   📸 이미지 URL 추출: {
     고객명: "홍길동",
     이미지_개수: 1,
     이미지_URLs: ["https://omqsbenvwyemjbmqgrqw.supabase.co/storage/v1/object/public/printer-images/..."]
   }
   ```

3. **이미지 URL을 복사해서 브라우저에 붙여넣기**
   - 이미지가 표시되면: ✅ 정상!
   - "Access Denied" 또는 404 에러: ❌ Public 접근 권한 문제 → 2단계 다시 확인

---

## 🎯 빠른 체크리스트

- [ ] `printer-images` 버킷이 생성되어 있음
- [ ] 버킷이 **Public**으로 설정되어 있음
- [ ] Storage Policies에서 `SELECT`와 `INSERT` 권한이 `public` 역할에 허용됨
- [ ] 고객 페이지에서 사진을 첨부하여 테스트 제출
- [ ] 콘솔에서 "✅ 이미지 업로드 성공" 메시지 확인
- [ ] 관리자 페이지에서 이미지 썸네일 표시 확인

---

## 🔥 자주 발생하는 문제

### 문제 1: "Access Denied" 에러
**원인:** Public 접근 권한이 설정되지 않음
**해결:** 2단계의 Policy 설정을 다시 확인하세요

### 문제 2: 이미지 URL이 `[]` (빈 배열)
**원인:** 
- 고객이 사진을 첨부하지 않았거나
- 업로드 중 에러가 발생했음

**해결:** 
- 고객 페이지에서 사진을 첨부하여 다시 제출
- 브라우저 콘솔에서 에러 메시지 확인

### 문제 3: 이미지가 매우 느리게 로드됨
**원인:** Supabase Storage의 CDN이 아직 캐시되지 않음
**해결:** 정상 동작입니다. 1~2분 후 다시 시도하세요

---

## 📞 추가 지원

문제가 계속되면:
1. 브라우저 개발자 도구(F12) → Console 탭의 모든 로그를 복사
2. Supabase Storage의 `printer-images` 버킷 스크린샷
3. 관리자 페이지의 스크린샷

위 3가지를 준비해서 문의하세요!
