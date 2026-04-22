# 🖨️ ENX Printer - Macaron Printer Rental System

> **마카롱 프린터 렌탈 견적서 자동화 시스템**  
> A comprehensive web application for macaron printer rental quotations with e-signatures, phone verification, and automated notifications.

---

## 🚀 빠른 실행 및 배포

### 1) 로컬 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드 확인
npm run build
```

- 개발 서버: `http://localhost:5173/`
- 빌드 결과물: `dist/`

### 2) Vercel 배포

Vercel에서 **New Project**로 이 저장소를 연결한 뒤 아래 설정을 사용하세요.

- **Project Name:** `enx-printer-len-t` (권장: 소문자 + 하이픈)
- **Framework Preset:** `Vite`
- **Root Directory:** `./`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 3) Environment Variables

기능에 따라 Vercel 환경변수에 아래 값을 등록하세요.

```env
# Telegram 알림 (선택)
VITE_TELEGRAM_BOT_TOKEN=your_telegram_bot_token
VITE_TELEGRAM_CHAT_ID=your_telegram_chat_id
```

### 4) 배포 후 점검 체크리스트

- 고객 화면에서 견적 작성/서명 플로우 정상 동작
- Admin 화면 접근 및 설정 저장 확인
- 이메일 알림(EmailJS) 테스트 전송 확인
- localStorage 데이터 저장/조회 정상 확인

### 5) 자동화 운영 (저장/푸시/배포)

```bash
# 변경사항 자동 저장(commit) + 자동 push
npm run auto:ship
```

- 로컬 자동 저장: `npm run auto:save`
- 자동 배포 트리거: `main` 브랜치 push
- GitHub Actions 시크릿 필요값:
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`

---

## 📋 Overview

**ENX Printer** is a fully automated quotation system for macaron printer rentals. Customers can select printer models, rental periods, and receive instant quotations with electronic signature capabilities.

### Key Technologies
- ⚛️ **React 18** + TypeScript
- 🎨 **Tailwind CSS v4**
- 🔄 **React Router v7** (Data Mode)
- 💾 **LocalStorage** (Client-side persistence)
- 📧 **EmailJS** (Notifications)
- ✍️ **Canvas API** (E-Signatures)

---

## 🎯 Features

### 🖨️ Printer Models
- **Epson 3156 A4** (Small) - Entry-level
- **Epson 1390 A3** (Medium) - Recommended ⭐
- **Epson 3880/P800 A2** (Large) - Professional

### 📅 Rental Periods
- **1 Month:** 3-month price + 35% surcharge
- **3 Months:** Standard pricing
- **6 Months:** Discounted pricing
- **12 Months:** Lowest pricing

### 🔐 Security
- **Phone Verification:** Required before viewing prices
- **Admin Password:** `kkus2011!!` (protected access)
- **Email Verification:** 4-digit code system

### 📧 Notifications
- **EmailJS Integration:** Automated email alerts
- **Telegram Bot:** Optional webhook notifications
- **Admin Dashboard:** Real-time quotation management

### ✍️ E-Signature
- **Canvas-Based:** Touch/mouse signature support
- **Mobile-Friendly:** Responsive design
- **PDF Generation:** Signed documents

---

## 🏗️ Project Structure

```
/src
  /app
    App.tsx                     # Main app entry point
    routes.tsx                  # React Router configuration
    /pages
      Home.tsx                  # Landing page
      Custom.tsx                # Quotation form page
      Admin.tsx                 # Admin dashboard
      Success.tsx               # Success confirmation
      Root.tsx                  # Layout wrapper
      NotFound.tsx              # 404 page
    /components
      QuotationForm.tsx         # Customer input form
      QuotationPreview.tsx      # Live quotation preview
      SignedQuotation.tsx       # Final signed quotation
      SignatureDialog.tsx       # E-signature canvas
      PhoneVerification.tsx     # Phone verification
      TermsEditor.tsx           # Contract terms WYSIWYG editor
      PricingSettings.tsx       # Admin pricing management
      EmailSettings.tsx         # EmailJS configuration
      ContractTerms.tsx         # Terms display component
      PDFQuotation.tsx          # PDF generation
    /utils
      pricingConfig.ts          # Pricing configuration utility
      emailNotification.ts      # EmailJS integration
      supabaseClient.ts         # localStorage quotation store
      emailConfig.ts            # Email configuration
      telegramNotification.ts   # Telegram bot integration
      smsVerification.ts        # SMS verification (future)
  /styles
    theme.css                   # Tailwind v4 theme
    fonts.css                   # Font imports
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Optional: Telegram Bot (for notifications)
VITE_TELEGRAM_BOT_TOKEN=your_telegram_bot_token
VITE_TELEGRAM_CHAT_ID=your_telegram_chat_id
```

### EmailJS Setup

The system uses **EmailJS** for email notifications. Configuration is managed in the Admin Dashboard:

1. Go to **Admin** → **이메일 설정** tab
2. Enter your EmailJS credentials:
   - **Service ID:** `service_7j4qknh` (default)
   - **Template ID:** `template_cswgob8` (default)
   - **Public Key:** `ZO6lfTIKXQoZzu-TU` (default)
   - **Admin Email:** `tseizou@naver.com` (default)
3. Click **저장** to apply changes
4. Use **테스트 이메일 전송** to verify configuration

---

## 📊 Pricing Configuration

### Default Pricing (KRW, VAT excluded)

| Model | 1 Month | 3 Months | 6 Months | 12 Months | Installation Fee |
|-------|---------|----------|----------|-----------|------------------|
| **Epson 3156 A4** | 201,000 | 149,000 | 139,000 | 129,000 | 150,000 |
| **Epson 1390 A3** | 296,000 | 219,000 | 209,000 | 199,000 | 170,000 |
| **Epson 3880/P800 A2** | 377,000 | 279,000 | 269,000 | 259,000 | 170,000 |

**Software Rental:** 15,000 KRW/month (currently FREE event)

### Pricing Logic
- **1-Month Rental:** 3-month price × 1.35 (35% surcharge)
- **2-5 Months:** 3-month price
- **6-11 Months:** 6-month discounted price
- **12+ Months:** 12-month lowest price

---

## 🔐 Admin Access

### Password Protection
- **Password:** `kkus2011!!`
- **Access:** Click the hidden Settings icon (⚙️) in the header
- **Location:** Home page → Top-right corner (low opacity)

### Admin Dashboard Tabs

#### 1️⃣ 가격 관리 (Pricing Management)
- Edit pricing for all models
- Adjust rental period prices
- Configure installation fees
- Set surcharges

#### 2️⃣ 약관 관리 (Contract Terms)
- WYSIWYG editor for contract terms
- Show/Hide toggle for customer visibility
- Live preview mode
- Save/Reset functionality

#### 3️⃣ 이메일 설정 (Email Settings)
- Configure EmailJS credentials
- Set admin email address
- Test email delivery
- Enable/Disable notifications

#### 4️⃣ 전송 내역 (Quotation History)
- View all submitted quotations
- Filter by date, model, status
- Download/Print quotations
- Signature verification

---

## 📱 Responsive Design

The system is **mobile-first** and fully responsive:

- **Mobile:** < 640px (optimized for touch)
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

---

## 🧪 Testing

### Phone Verification Test
1. Enter a valid email address in the quotation form
2. Click **전화번호 인증**
3. Check your email for the 4-digit code
4. Enter the code to unlock pricing information

### Email Notification Test
1. Go to **Admin** → **이메일 설정**
2. Click **테스트 이메일 전송**
3. Check the admin email inbox
4. Verify template variables are correct

### Signature Test
1. Fill out the quotation form
2. Click **견적서 생성**
3. Review the quotation preview
4. Click **서명하기**
5. Draw a signature on the canvas
6. Click **서명 완료**
7. Check for email notification

---

## 📄 Data Storage

### Storage Policy

- 이 프로젝트는 **Supabase를 사용하지 않습니다.**
- 견적 데이터는 브라우저 `localStorage`에 저장됩니다.
- 브라우저 캐시/스토리지 삭제 시 데이터가 사라질 수 있습니다.

### LocalStorage Keys

| Key | Type | Description |
|-----|------|-------------|
| `printer_rental_pricing_config` | Object | Pricing configuration |
| `contract_terms` | String | HTML contract terms |
| `terms_visibility` | Boolean | Show/hide terms |
| `email_config` | Object | EmailJS configuration |
| `quotations` | Array | Quotation records for admin list/history |

---

## 🔄 Workflow

### Customer Journey
1. **Home Page** → Click "견적 발행하기"
2. **Custom Page:**
   - Enter company information
   - Select printer model (view images/dimensions)
   - Choose rental period (1/3/6/12 months)
   - Select usage types (macaron, rice cake, cake, etc.)
   - Enter phone number
   - **Verify phone** → View pricing
3. **Preview Quotation:**
   - Review all details
   - Check pricing breakdown
   - View contract terms (if visible)
4. **Sign:**
   - Open signature dialog
   - Draw signature
   - Agree to terms
   - Submit
5. **Success Page:**
   - Confirmation message
   - Email sent to admin
   - Return to home

---

## 🛠️ Development

### Code Comments
All major code files include **English comments** to help AI assistants understand the project structure and make accurate modifications.

### Documentation
- **PROJECT_DOCUMENTATION.md** - Comprehensive project guide
- **README.md** (this file) - Quick reference

---

## 📞 Support

**Company:** ENX Printer  
**Admin Email:** tseizou@naver.com  
**Business Registration:** 302-47-00920

---

## 📝 License

Proprietary - © 2026 ENX Printer. All rights reserved.

---

## 🚀 Future Enhancements

- [ ] Multi-language support (English, Japanese)
- [ ] SMS verification (instead of email)
- [ ] Kakao Map integration
- [ ] Payment gateway
- [ ] Customer portal (login/dashboard)
- [ ] Printer inventory management
- [ ] Analytics dashboard
- [ ] Export to Excel

---

**Last Updated:** 2026-02-20  
**Version:** 1.0.0

---

Made with ❤️ by ENX Printer Team
