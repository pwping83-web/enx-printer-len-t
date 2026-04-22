
# 프린터 출장 수리 견적 (Web Ready)

이 폴더는 독립적으로 웹 배포 가능한 Vite + React 프로젝트입니다.

## 로컬 실행

```bash
npm install
npm run dev
```

## 프로덕션 빌드

```bash
npm run build
```

## Vercel 배포 설정

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

`vercel.json`에 SPA rewrite를 추가해 직접 URL 접속/새로고침 시 404가 나지 않도록 설정되어 있습니다.

## Supabase 환경변수

`.env.example`를 참고해 `.env`를 생성하세요.

```bash
cp .env.example .env
```

필수 항목:
- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY` (또는 `VITE_SUPABASE_ANON_KEY`)

EmailJS 항목:
- `VITE_EMAILJS_SERVICE_ID`
- `VITE_EMAILJS_TEMPLATE_ID`
- `VITE_EMAILJS_PUBLIC_KEY`

주의:
- `sb_secret_*` / `service_role` 키는 서버 전용입니다.
- 클라이언트 코드/깃 커밋에는 절대 포함하지 마세요.
- EmailJS `Private Key`도 서버 전용이며 클라이언트 코드/커밋 금지입니다.
  