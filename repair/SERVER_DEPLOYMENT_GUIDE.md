# 🚨 서버 배포 필수 안내

## 현재 상황
- ❌ **예약 불가 날짜 조회 에러 발생** (TypeError: Failed to fetch)
- ⚠️ Supabase Edge Function 서버가 배포되지 않음

## 해결 방법

### 1️⃣ Supabase CLI 설치 (이미 설치했다면 생략)
```bash
npm install -g supabase
```

### 2️⃣ Supabase 로그인
```bash
supabase login
```

### 3️⃣ 프로젝트 연결
```bash
supabase link --project-ref omqsbenvwyemjbmqgrqw
```

### 4️⃣ Edge Function 배포
```bash
supabase functions deploy server
```

### 5️⃣ 환경 변수 설정
```bash
supabase secrets set SUPABASE_URL=https://omqsbenvwyemjbmqgrqw.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
supabase secrets set SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tcXNiZW52d3llbWpibXFncnF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MTIyMDAsImV4cCI6MjA4NjE4ODIwMH0.0BcO4B74LDz2DXO6e4H5FOKyw0GAIzJ_wmnKUl8TbJA
supabase secrets set KAKAO_REST_API_KEY=YOUR_KAKAO_KEY
```

### 6️⃣ 배포 확인
브라우저에서 접속하여 확인:
```
https://omqsbenvwyemjbmqgrqw.supabase.co/functions/v1/make-server-006adbb0/health
```

정상 응답 예시:
```json
{
  "status": "ok",
  "timestamp": "2026-02-11T...",
  "version": "2.0.0"
}
```

## ✅ 배포 완료 후
- 예약 불가 날짜 조회 정상 작동
- "Failed to fetch" 에러 해결
- 관리자/고객 페이지 모두 정상 작동

---

## 📝 참고사항
- 서버 파일 위치: `/supabase/functions/server/index.tsx`
- 배포 명령어는 프로젝트 루트에서 실행
- Edge Function 이름: `server`
- 경로 prefix: `/make-server-006adbb0`
