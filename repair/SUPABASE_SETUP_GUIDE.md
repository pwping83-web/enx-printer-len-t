# 🗄️ Supabase 데이터베이스 설정 가이드

## ✅ 완료된 작업 요약

1. ✅ CustomerRequest.tsx - Supabase 직접 저장 추가
2. ✅ AdminDashboard.tsx - Supabase 직접 조회 + Realtime 구독
3. ✅ 방음부스 관련 모든 코드 제거
4. ✅ 프린터 수리 전용 시스템으로 전환

---

## 🔧 Supabase 테이블 생성

Supabase 대시보드의 SQL Editor에서 아래 SQL을 실행하세요.

### 1️⃣ 프린터 수리 요청 테이블 생성

```sql
-- 프린터 수리 요청 테이블
CREATE TABLE IF NOT EXISTS printer_repair_requests (
  id TEXT PRIMARY KEY,
  "customerName" TEXT NOT NULL,
  "recipientPhone" TEXT NOT NULL,
  "visitAddress" TEXT NOT NULL,
  "printerType" TEXT,
  symptoms TEXT[],
  "moveDate" TEXT,
  "moveTime" TEXT,
  "estimateAmount" INTEGER DEFAULT 0,
  details TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_printer_repair_createdAt ON printer_repair_requests("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_printer_repair_customerName ON printer_repair_requests("customerName");
CREATE INDEX IF NOT EXISTS idx_printer_repair_moveDate ON printer_repair_requests("moveDate");

-- RLS (Row Level Security) 비활성화 (관리자만 접근)
ALTER TABLE printer_repair_requests ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 INSERT 가능 (고객 접수용)
CREATE POLICY "Anyone can insert repair requests"
ON printer_repair_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 모든 사용자가 SELECT 가능 (관리자 조회용)
CREATE POLICY "Anyone can view repair requests"
ON printer_repair_requests
FOR SELECT
TO anon, authenticated
USING (true);

-- 모든 사용자가 DELETE 가능 (관리자 삭제용)
CREATE POLICY "Anyone can delete repair requests"
ON printer_repair_requests
FOR DELETE
TO anon, authenticated
USING (true);
```

### 2️⃣ 예약 불가능 날짜 테이블 생성

```sql
-- 예약 불가능 날짜 테이블 (이미 있다면 생략)
CREATE TABLE IF NOT EXISTS blocked_dates (
  id SERIAL PRIMARY KEY,
  date TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_blocked_dates_date ON blocked_dates(date);

-- RLS 비활성화
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 SELECT 가능
CREATE POLICY "Anyone can view blocked dates"
ON blocked_dates
FOR SELECT
TO anon, authenticated
USING (true);

-- 모든 사용자가 INSERT 가능
CREATE POLICY "Anyone can insert blocked dates"
ON blocked_dates
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 모든 사용자가 DELETE 가능
CREATE POLICY "Anyone can delete blocked dates"
ON blocked_dates
FOR DELETE
TO anon, authenticated
USING (true);
```

---

## 🎯 Realtime 기능 활성화

Supabase 대시보드에서:

1. **Database** → **Replication** 메뉴로 이동
2. `printer_repair_requests` 테이블 찾기
3. **Realtime** 토글 ON으로 설정
4. 저장

또는 SQL로 실행:

```sql
-- Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE printer_repair_requests;
```

---

## 🔍 테스트 방법

### 1️⃣ 테이블 확인

```sql
-- 테이블 존재 확인
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- printer_repair_requests 테이블 구조 확인
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'printer_repair_requests';
```

### 2️⃣ 샘플 데이터 삽입

```sql
-- 테스트 데이터 삽입
INSERT INTO printer_repair_requests (
  id,
  "customerName",
  "recipientPhone",
  "visitAddress",
  "printerType",
  symptoms,
  "moveDate",
  "moveTime",
  "estimateAmount",
  details
) VALUES (
  'test123',
  '테스트고객',
  '010-1234-5678',
  '서울특별시 강남구 테헤란로 123',
  '엡손1390',
  ARRAY['잉크막힘', '작동불량'],
  '2026-02-15',
  '10:00-12:00',
  400000,
  '테스트 상세 내용'
);
```

### 3️⃣ 데이터 조회

```sql
-- 모든 수리 요청 조회
SELECT * FROM printer_repair_requests ORDER BY "createdAt" DESC;

-- 특정 날짜의 요청만 조회
SELECT * FROM printer_repair_requests WHERE "moveDate" = '2026-02-15';
```

### 4️⃣ Realtime 테스트

1. 관리자 대시보드 열기 (`/admin`)
2. 브라우저 콘솔 확인 (F12)
3. 새 탭에서 견적 요청 제출
4. 관리자 대시보드에서 자동으로 새로고침되는지 확인

콘솔 로그:
```
📡 Supabase Realtime 구독 시작...
📡 Realtime 구독 상태: SUBSCRIBED
🔔 Realtime 이벤트 감지: {event: "INSERT", ...}
📡 Supabase에서 수리 요청 조회 중...
✅ Supabase에서 수리 요청 불러옴: 1 개
```

---

## 🚨 문제 해결

### ❌ 에러: "relation does not exist"

**원인:** 테이블이 생성되지 않음

**해결:**
1. Supabase SQL Editor에서 테이블 생성 SQL 실행
2. 테이블 이름이 `printer_repair_requests` (정확히 일치)인지 확인

### ❌ 에러: "permission denied"

**원인:** RLS 정책 설정 오류

**해결:**
```sql
-- RLS 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'printer_repair_requests';

-- RLS 정책 재생성 (위의 SQL 다시 실행)
```

### ❌ Realtime 작동 안 함

**원인:** Realtime이 활성화되지 않음

**해결:**
1. Database → Replication 메뉴에서 활성화
2. 또는 SQL 실행:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE printer_repair_requests;
```

### ❌ 데이터가 관리자 페이지에 안 나타남

**원인:** 필드명 불일치

**해결:**
```sql
-- 컬럼명 확인
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'printer_repair_requests';

-- 필드명이 다르면 수정
-- 예: customerName → "customerName" (쌍따옴표 주의!)
```

---

## 📊 데이터 흐름도

```
[고객 폼 제출]
      ↓
[필수 입력값 검증]
      ↓
[이메일 전송 (EmailJS)]
      ↓
[Supabase 저장]
   ├─ printer_repair_requests 테이블에 INSERT
   └─ Realtime 이벤트 발생
      ↓
[관리자 대시보드]
   ├─ Realtime 구독 감지
   ├─ 자동으로 데이터 다시 불러오기
   └─ UI 업데이트 (새 요청 표시)
```

---

## 🎉 완료 체크리스트

- [ ] Supabase에서 `printer_repair_requests` 테이블 생성
- [ ] Supabase에서 `blocked_dates` 테이블 생성 (이미 있으면 생략)
- [ ] RLS 정책 설정 완료
- [ ] Realtime 활성화 완료
- [ ] 샘플 데이터로 테스트 완료
- [ ] 고객 폼에서 견적 요청 제출 테스트
- [ ] 관리자 대시보드에서 실시간 업데이트 확인
- [ ] 이메일 수신 확인 (tseizou@naver.com)

---

**마지막 업데이트:** 2026년 2월 9일
**버전:** 2.0.0 (프린터 수리 + Realtime)
