# 🔧 blocked_dates 테이블 생성 가이드

## ❌ 현재 에러
```
❌ blocked_dates 조회 실패: Could not find the table 'public.blocked_dates' in the schema cache
```

## ✅ 해결 방법

### 1️⃣ Supabase Dashboard 접속
```
https://supabase.com/dashboard/project/omqsbenvwyemjbmqgrqw
```

### 2️⃣ SQL Editor로 이동
1. 왼쪽 메뉴에서 **"SQL Editor"** 클릭
2. 또는 직접 접속: https://supabase.com/dashboard/project/omqsbenvwyemjbmqgrqw/sql/new

### 3️⃣ 다음 SQL 실행

```sql
-- ============================================
-- blocked_dates 테이블 생성
-- ============================================

-- 1️⃣ 테이블 생성
CREATE TABLE IF NOT EXISTS blocked_dates (
  id BIGSERIAL PRIMARY KEY,
  date TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2️⃣ RLS (Row Level Security) 활성화
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;

-- 3️⃣ Public 읽기 권한 (고객 화면에서 조회용)
CREATE POLICY IF NOT EXISTS "Public Read Access"
ON blocked_dates FOR SELECT
TO public
USING (true);

-- 4️⃣ Public 쓰기 권한 (관리자 페이지에서 저장용)
CREATE POLICY IF NOT EXISTS "Public Write Access"
ON blocked_dates FOR INSERT
TO public
WITH CHECK (true);

-- 5️⃣ Public 삭제 권한 (관리자 페이지에서 삭제용)
CREATE POLICY IF NOT EXISTS "Public Delete Access"
ON blocked_dates FOR DELETE
TO public
USING (true);

-- ============================================
-- 확인용 쿼리
-- ============================================

-- 테이블 생성 확인
SELECT * FROM blocked_dates;

-- Policy 확인
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'blocked_dates';
```

### 4️⃣ 실행 방법
1. 위 SQL을 복사
2. Supabase SQL Editor에 붙여넣기
3. **"Run"** 버튼 클릭 (또는 Ctrl + Enter)
4. ✅ Success 메시지 확인

---

## 📋 테이블 구조

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| `id` | BIGSERIAL | Primary Key (자동 증가) |
| `date` | TEXT | 예약 불가능 날짜 (형식: `YYYY-MM-DD`) |
| `created_at` | TIMESTAMPTZ | 생성 일시 (자동 설정) |

### 예시 데이터:
```
id | date       | created_at
---|------------|----------------------------
1  | 2024-02-15 | 2024-02-09 10:30:00+00
2  | 2024-02-20 | 2024-02-09 10:31:15+00
3  | 2024-02-25 | 2024-02-09 10:32:30+00
```

---

## 🔐 RLS Policy 설명

### 1. **Public Read Access** (읽기 권한)
- **목적**: 고객 화면에서 예약 불가능 날짜 조회
- **범위**: 모든 사용자 (인증 불필요)
- **SQL**: `SELECT * FROM blocked_dates`

### 2. **Public Write Access** (쓰기 권한)
- **목적**: 관리자 페이지에서 예약 불가능 날짜 추가
- **범위**: 모든 사용자 (인증 불필요)
- **SQL**: `INSERT INTO blocked_dates (date) VALUES ('2024-02-15')`

### 3. **Public Delete Access** (삭제 권한)
- **목적**: 관리자 페이지에서 예약 불가능 날짜 삭제
- **범위**: 모든 사용자 (인증 불필요)
- **SQL**: `DELETE FROM blocked_dates WHERE date = '2024-02-15'`

---

## 🧪 테스트 방법

### 1️⃣ Supabase SQL Editor에서 테스트
```sql
-- 데이터 추가
INSERT INTO blocked_dates (date) 
VALUES ('2024-02-15'), ('2024-02-20'), ('2024-02-25');

-- 데이터 조회
SELECT * FROM blocked_dates ORDER BY date;

-- 데이터 삭제
DELETE FROM blocked_dates WHERE date = '2024-02-15';
```

### 2️⃣ 관리자 페이지에서 테스트
1. `/admin` 접속 (비밀번호: 2482)
2. 달력에서 내일 날짜 클릭 (빨간색으로 변경됨)
3. "💾 예약 불가 날짜 저장" 버튼 클릭
4. Supabase Table Editor에서 데이터 확인:
   ```
   https://supabase.com/dashboard/project/omqsbenvwyemjbmqgrqw/editor/blocked_dates
   ```

### 3️⃣ 고객 페이지에서 테스트
1. `/request` 접속
2. 달력 확인
3. 관리자가 추가한 날짜가 🔴 빨간색 배경 + 취소선으로 표시됨
4. 클릭 시 "⚠️ 선택하신 날짜는 예약이 마감되었습니다" 알림

---

## 🔍 문제 해결

### Q1: "relation blocked_dates does not exist" 에러
**A:** 테이블이 생성되지 않았습니다. 위의 SQL을 다시 실행하세요.

### Q2: "new row violates row-level security policy" 에러
**A:** RLS Policy가 없습니다. 위의 Policy 생성 SQL을 실행하세요.

### Q3: 고객 화면에서 날짜가 안 보임
**A:** 
1. Supabase Table Editor에서 데이터 확인
2. 브라우저 콘솔(F12) 열어서 에러 확인
3. 30초 대기 (자동 새로고침)

### Q4: 관리자 페이지에서 저장이 안 됨
**A:**
1. 브라우저 콘솔(F12) 열어서 에러 메시지 확인
2. Supabase Dashboard → Logs → Error Logs 확인
3. RLS Policy가 제대로 설정되었는지 확인

---

## 📊 시스템 흐름

### **관리자가 예약 불가 날짜 설정**
```
1. /admin 접속
   ↓
2. 달력에서 날짜 클릭 (메모리에 저장)
   ↓
3. "💾 저장" 버튼 클릭
   ↓
4. Supabase blocked_dates 테이블에 저장
   - DELETE FROM blocked_dates (기존 데이터 삭제)
   - INSERT INTO blocked_dates (새 데이터 추가)
   ↓
5. 성공 알림 표시
```

### **고객이 예약 가능 날짜 확인**
```
1. /request 접속
   ↓
2. Supabase blocked_dates 조회
   ↓
3. 달력에 예약 불가 날짜 표시
   - 🔴 빨간색 배경
   - 취소선
   - 클릭 불가능
   ↓
4. 고객이 예약 가능한 날짜만 선택
```

---

## ✅ 완료 체크리스트

- [ ] Supabase SQL Editor에서 테이블 생성 SQL 실행
- [ ] RLS Policy 생성 SQL 실행
- [ ] Supabase Table Editor에서 `blocked_dates` 테이블 확인
- [ ] 관리자 페이지에서 날짜 추가 테스트
- [ ] Supabase에서 데이터 저장 확인
- [ ] 고객 페이지에서 빨간색 날짜 표시 확인
- [ ] 브라우저 콘솔에서 에러 없음 확인

---

## 🎯 최종 확인

모든 작업이 완료되면:

```sql
-- 데이터 확인
SELECT * FROM blocked_dates ORDER BY date DESC;

-- Policy 확인
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'blocked_dates';
```

결과가 정상적으로 나오면 **설정 완료**입니다! ✅

---

## 📞 추가 도움

문제가 계속되면:
1. Supabase Dashboard → Logs 확인
2. 브라우저 콘솔(F12) → Network 탭 확인
3. 관리자에게 문의

