# 🖨️ Macaron Printer Rental Quotation System

## 📋 Project Overview

A comprehensive web application for managing macaron printer rental quotations with electronic signatures, phone verification, and automated email notifications.

**Company:** ENX Printer (엔엑스 프린터)  
**Business:** Edible flatbed printer rental service  
**Primary Product:** Macaron printing printers

---

## 🏗️ Architecture

### Tech Stack
- **Framework:** React 18+ with TypeScript
- **Routing:** React Router v7 (Data Mode)
- **Styling:** Tailwind CSS v4
- **UI Components:** Lucide React icons
- **Backend:** Supabase (Database, Storage, Auth)
- **Email:** EmailJS integration
- **Notifications:** Telegram Bot API
- **Date Handling:** date-fns with Korean locale
- **Signature:** HTML Canvas API
- **Build Tool:** Vite

### Project Structure
```
/src
  /app
    App.tsx                 # Main app component (RouterProvider)
    routes.tsx              # Route configuration
    /pages
      Home.tsx              # Landing page with password-protected admin access
      Custom.tsx            # Quotation form page
      Admin.tsx             # Admin dashboard
      Success.tsx           # Success confirmation page
      Root.tsx              # Layout wrapper
      NotFound.tsx          # 404 page
    /components
      QuotationForm.tsx     # Main customer input form
      QuotationPreview.tsx  # Live quotation preview
      SignedQuotation.tsx   # Final signed quotation
      PDFQuotation.tsx      # PDF generation component
      SignatureDialog.tsx   # E-signature canvas modal
      PhoneVerification.tsx # Phone verification system
      ContractTerms.tsx     # Contract terms display
      TermsEditor.tsx       # WYSIWYG terms editor
      PricingSettings.tsx   # Admin pricing management
      EmailSettings.tsx     # EmailJS configuration
    /utils
      pricingConfig.ts      # Pricing configuration utility
      supabase.ts           # Supabase client setup
  /styles
    theme.css               # Tailwind v4 theme
    fonts.css               # Font imports
```

---

## 🎯 Key Features

### 1. **Customer Quotation System**
- **3 Printer Models:**
  - Epson 3156 A4 (Small) - 150,000 KRW installation
  - Epson 1390 A3 (Medium) - 170,000 KRW installation
  - Epson 3880/P800 A2 (Large) - 170,000 KRW installation

- **Rental Periods:**
  - 1 month: 3-month price + 35% surcharge
  - 3 months: Standard pricing
  - 6 months: Discounted pricing
  - 12 months: Lowest pricing

- **Usage Types:** Macaron, Rice Cake, Cake, Other (multiple selection)

- **Pricing Information Security:**
  - Phone verification required before viewing prices
  - 4-digit verification code sent via email
  - Prevents unauthorized price checking

### 2. **Admin Dashboard**
- **Password Protection:** `kkus2011!!`
- **Pricing Management:**
  - Edit all model prices per rental period
  - Adjust installation fees and surcharges
  - Real-time price updates across system
- **Contract Terms Editor:**
  - WYSIWYG contentEditable interface
  - HTML support for formatting
  - Show/Hide toggle for customer visibility
  - Live preview mode
- **Email Settings:**
  - EmailJS configuration management
  - Service ID, Template ID, Public Key, Admin Email
  - Test email functionality

### 3. **Electronic Signature System**
- HTML5 Canvas-based signature pad
- Mobile-responsive touch support
- Clear/Redo functionality
- Signature saved as base64 image
- Integrated with quotation PDF

### 4. **Notification System**

#### EmailJS Integration
- **Service ID:** service_7j4qknh
- **Template ID:** template_cswgob8
- **Public Key:** ZO6lfTIKXQoZzu-TU
- **Admin Email:** tseizou@naver.com
- **Triggers:**
  - Quotation created
  - Quotation signed
- **Template Variables:**
  - Company name, contact info
  - Printer model, rental period
  - Total price, usage types
  - Signature image (base64)

#### Telegram Bot (Optional)
- Webhook notifications for admin
- Quotation summary alerts
- Signature confirmation

### 5. **Supabase Integration**
- **Database:**
  - Quotations table (stores all form data)
  - Signatures table (stores signature images)
- **Storage:**
  - Signature images bucket
  - PDF documents bucket
- **Real-time Updates:**
  - Live quotation list refresh
  - Admin dashboard sync

---

## 🔐 Security Features

### Phone Verification
- Required before viewing pricing information
- 4-digit random code generation
- Email delivery via EmailJS
- Session-based verification state
- Prevents price scraping

### Admin Access
- Password-protected admin button (hidden in header)
- Settings icon with low opacity
- No direct URL access protection
- Password: `kkus2011!!`

---

## 💾 Data Storage

### LocalStorage Keys
| Key | Type | Description |
|-----|------|-------------|
| `printer_rental_pricing_config` | Object | Pricing configuration for all models |
| `contract_terms` | String | HTML content of contract terms |
| `terms_visibility` | Boolean | Show/hide terms to customers |
| `email_config` | Object | EmailJS service configuration |

### Supabase Schema

#### `quotations` Table
```sql
CREATE TABLE quotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  printer_model TEXT NOT NULL,
  printer_size TEXT NOT NULL,
  rental_period INTEGER NOT NULL,
  quantity INTEGER DEFAULT 1,
  start_date DATE NOT NULL,
  include_software BOOLEAN DEFAULT false,
  usage TEXT[], -- Array of usage types
  usage_other TEXT,
  total_price DECIMAL(10,2),
  signature_url TEXT, -- URL to signature image
  signed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📱 Responsive Design

- **Mobile-First:** Optimized for mobile quotation creation
- **Breakpoints:**
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px
- **Touch-Friendly:** Large tap targets, swipe gestures
- **Adaptive Layout:** Grid columns adjust per device

---

## 🚀 Deployment

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Build Commands
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

---

## 🔄 Workflow

### Customer Journey
1. **Home Page** → Click "견적 발행하기"
2. **Custom Page:**
   - Fill company information
   - Select printer model (view images)
   - Choose rental period (1/3/6/12 months)
   - Select usage types (multiple)
   - Enter phone number
   - **Verify phone** → View pricing
3. **Preview Quotation:**
   - Review all details
   - Check pricing breakdown
   - View contract terms (if visible)
4. **Sign:**
   - Open signature dialog
   - Draw signature on canvas
   - Agree to terms
   - Submit
5. **Success Page:**
   - Confirmation message
   - Email notification sent
   - Return to home

### Admin Workflow
1. **Home Page** → Click hidden Settings icon (top-right)
2. **Enter Password:** `kkus2011!!`
3. **Admin Dashboard:**
   - **가격 관리 Tab:**
     - Edit pricing for all models
     - Adjust surcharges
     - Save → Triggers global update
   - **약관 관리 Tab:**
     - Edit contract terms (WYSIWYG)
     - Toggle customer visibility
     - Preview changes
     - Save/Reset
   - **이메일 설정 Tab:**
     - Configure EmailJS credentials
     - Test email delivery
     - Update admin email
   - **전송 내역 Tab:**
     - View all submitted quotations
     - Filter by date, model, status
     - Download/Print quotations

---

## 🎨 Styling Guidelines

### Color Palette
- **Primary Blue:** `#2563eb` (blue-600)
- **Success Green:** `#16a34a` (green-600)
- **Warning Orange:** `#ea580c` (orange-600)
- **Error Red:** `#dc2626` (red-600)
- **Gray Scale:** slate-50 to slate-900

### Typography
- **Font Family:** System fonts (sans-serif)
- **Headings:** Bold weights (600-700)
- **Body:** Regular weight (400)
- **Korean Text:** Optimized line-height (1.6)

---

## 🧪 Testing Checklist

- [ ] Phone verification sends email correctly
- [ ] Pricing calculations match contract terms
- [ ] Signature canvas works on mobile/desktop
- [ ] PDF generation includes all data
- [ ] EmailJS sends notifications
- [ ] Supabase saves quotations
- [ ] Admin password protection works
- [ ] Terms visibility toggle functions
- [ ] Responsive layout on all devices
- [ ] LocalStorage persistence

---

## 📞 Contact & Support

**Company:** ENX Printer  
**Admin Email:** tseizou@naver.com  
**Business Registration:** 302-47-00920

---

## 📝 License

Proprietary - © 2026 ENX Printer. All rights reserved.

---

## 🔧 Troubleshooting

### Common Issues

**1. EmailJS not sending emails**
- Check Service ID, Template ID, Public Key in Admin > 이메일 설정
- Verify template variables match in EmailJS dashboard
- Check browser console for errors

**2. Supabase connection failed**
- Verify environment variables in `.env`
- Check Supabase project status
- Ensure tables/buckets exist

**3. Pricing not updating**
- Clear browser cache
- Check localStorage for corrupt data
- Reset pricing to defaults in Admin

**4. Signature not saving**
- Ensure canvas is not empty
- Check browser Canvas API support
- Verify base64 encoding

---

## 🚧 Future Enhancements

- [ ] Multi-language support (English, Japanese)
- [ ] SMS verification (instead of email)
- [ ] Kakao Map integration for store locations
- [ ] Payment gateway integration
- [ ] Contract renewal system
- [ ] Customer portal (login/dashboard)
- [ ] Printer inventory management
- [ ] Maintenance request system
- [ ] Analytics dashboard
- [ ] Export to Excel/PDF

---

**Last Updated:** 2026-02-20  
**Version:** 1.0.0  
**Documentation for AI:** This file helps AI assistants understand the project structure and make accurate modifications.
