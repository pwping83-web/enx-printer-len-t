# 📋 Supabase 테이블 생성 SQL

## 🎯 실행 방법
1. Supabase 대시보드 접속: https://supabase.com/dashboard/project/omqsbenvwyemjbmqgrqw/sql
2. SQL Editor에서 아래 SQL을 복사하여 붙여넣기
3. "Run" 버튼 클릭하여 실행

---

## 🗓️ blocked_dates 테이블 생성

```sql
-- ========================================
-- 📅 예약 불가능 날짜 관리 테이블
-- ========================================

-- 1️⃣ 테이블 생성
CREATE TABLE IF NOT EXISTS public.blocked_dates (
  id BIGSERIAL PRIMARY KEY,
  date TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2️⃣ 인덱스 생성 (날짜 검색 속도 향상)
CREATE INDEX IF NOT EXISTS idx_blocked_dates_date ON public.blocked_dates(date);

-- 3️⃣ RLS (Row Level Security) 활성화
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;

-- 4️⃣ 공개 읽기 정책 (모든 사용자가 조회 가능)
CREATE POLICY "Public can read blocked_dates"
ON public.blocked_dates
FOR SELECT
TO public
USING (true);

-- 5️⃣ 공개 삽입 정책 (관리자가 추가 가능)
CREATE POLICY "Public can insert blocked_dates"
ON public.blocked_dates
FOR INSERT
TO public
WITH CHECK (true);

-- 6️⃣ 공개 삭제 정책 (관리자가 삭제 가능)
CREATE POLICY "Public can delete blocked_dates"
ON public.blocked_dates
FOR DELETE
TO public
USING (true);

-- 7️⃣ 공개 수정 정책 (관리자가 수정 가능)
CREATE POLICY "Public can update blocked_dates"
ON public.blocked_dates
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- ✅ 완료!
```

---

## 📊 printer_repair_requests 테이블 (이미 생성되어 있을 경우 스킵)

```sql
-- ========================================
-- 🖨️ 프린터 수리 요청 테이블
-- ========================================

-- 1️⃣ 테이블 생성
CREATE TABLE IF NOT EXISTS public.printer_repair_requests (
  id BIGSERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  printer_model TEXT,
  symptoms TEXT[] DEFAULT '{}',
  visit_date TEXT,
  visit_time TEXT,
  total_price BIGINT DEFAULT 0,
  description TEXT,
  image_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2️⃣ 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_printer_repair_requests_created_at 
ON public.printer_repair_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_printer_repair_requests_visit_date 
ON public.printer_repair_requests(visit_date);

-- 3️⃣ RLS 활성화
ALTER TABLE public.printer_repair_requests ENABLE ROW LEVEL SECURITY;

-- 4️⃣ 공개 읽기 정책
CREATE POLICY "Public can read printer_repair_requests"
ON public.printer_repair_requests
FOR SELECT
TO public
USING (true);

-- 5️⃣ 공개 삽입 정책
CREATE POLICY "Public can insert printer_repair_requests"
ON public.printer_repair_requests
FOR INSERT
TO public
WITH CHECK (true);

-- 6️⃣ 공개 삭제 정책
CREATE POLICY "Public can delete printer_repair_requests"
ON public.printer_repair_requests
FOR DELETE
TO public
USING (true);

-- 7️⃣ 공개 수정 정책
CREATE POLICY "Public can update printer_repair_requests"
ON public.printer_repair_requests
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- ✅ 완료!
```

---

## 🎬 Storage 버킷 설정 (printer-images)

### 방법 1: Supabase Dashboard에서 설정
1. Storage → Buckets 메뉴 접속
2. "printer-images" 버킷 클릭
3. Settings → "Public bucket" 토글 ON

### 방법 2: SQL로 설정
```sql
-- Storage Policy 설정
INSERT INTO storage.buckets (id, name, public)
VALUES ('printer-images', 'printer-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 공개 업로드 정책
CREATE POLICY "Public Upload"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'printer-images');

-- 공개 읽기 정책
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'printer-images');

-- 공개 삭제 정책
CREATE POLICY "Public Delete"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'printer-images');
```

---

## ✅ 테이블 생성 확인

테이블이 정상적으로 생성되었는지 확인:

```sql
-- 테이블 목록 조회
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('blocked_dates', 'printer_repair_requests');

-- blocked_dates 데이터 확인
SELECT * FROM public.blocked_dates ORDER BY date;

-- printer_repair_requests 데이터 확인
SELECT * FROM public.printer_repair_requests ORDER BY created_at DESC;
```

---

## 🧪 테스트

### blocked_dates 테이블 테스트
```sql
-- 테스트 날짜 추가
INSERT INTO public.blocked_dates (date) VALUES ('2026-02-15');
INSERT INTO public.blocked_dates (date) VALUES ('2026-02-20');

-- 조회
SELECT * FROM public.blocked_dates;

-- 삭제
DELETE FROM public.blocked_dates WHERE date = '2026-02-15';
```

---

## 🔥 문제 해결

### "permission denied" 에러 발생 시
```sql
-- RLS를 일시적으로 비활성화 (개발 단계에서만 사용)
ALTER TABLE public.blocked_dates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.printer_repair_requests DISABLE ROW LEVEL SECURITY;
```

⚠️ **주의**: 운영 환경에서는 RLS를 반드시 활성화하고 적절한 정책을 설정하세요!

---

## 📞 문의
- Supabase 프로젝트: https://supabase.com/dashboard/project/omqsbenvwyemjbmqgrqw
- SQL Editor: https://supabase.com/dashboard/project/omqsbenvwyemjbmqgrqw/sql
- Storage: https://supabase.com/dashboard/project/omqsbenvwyemjbmqgrqw/storage/buckets
