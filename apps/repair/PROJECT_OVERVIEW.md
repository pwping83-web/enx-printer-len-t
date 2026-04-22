# ENX Printer Repair Service - Project Overview

## 🖨️ Project Description

A comprehensive printer repair request system that allows customers to submit repair requests with photos/videos and automatically calculates travel costs based on distance. Admin dashboard provides real-time request management.

## 📋 Key Features

### Customer Features
- **Printer Information Input**: Printer model, symptoms (multiple selection)
- **Photo/Video Upload**: Direct client-side upload to Supabase Storage
  - Image compression (HEIC to JPEG conversion, size optimization to 300KB)
  - Video compression for mobile devices (360p, WebM format)
  - Progress tracking during upload
- **Address Search**: Kakao Postcode API integration
- **Real-time Travel Cost Calculation**:
  - Metro area (Seoul/Gyeonggi/Incheon): Fixed 400,000 KRW base
  - Busan: Fixed 800,000 KRW base
  - Other regions: Distance-based calculation (Haversine formula + 1.3x road curvature)
  - Office location: Incheon Jung-gu Unbuk-dong
- **Visit Date Selection**: Calendar with blocked dates management
- **Email Notification**: Automatic email to admin via EmailJS

### Admin Features
- **Request Dashboard**: View all repair requests in real-time
- **Status Management**: Update request status (pending/completed)
- **Blocked Dates Management**: Prevent double bookings
- **Search & Filter**: By customer name, phone, printer model, status
- **Request Details View**: Images, videos, customer info, pricing breakdown
- **Full-width Layout**: Desktop-optimized admin interface

## 🏗️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **React Router** (Data mode) for navigation
- **Tailwind CSS v4** for styling
- **Lucide React** for icons
- **Sonner** for toast notifications

### Backend & Services
- **Supabase** (https://omqsbenvwyemjbmqgrqw.supabase.co)
  - PostgreSQL database
  - Storage bucket: `printer-images` (public access)
  - Real-time subscriptions
- **EmailJS** for email notifications (to: tseizou@naver.com)
- **Kakao Maps API** for geocoding and distance calculation
  - JavaScript Key: f6216527bfa56e0da08783dbdcec7f70
  - Server-side geocoding endpoint to protect API key

### File Processing
- **browser-image-compression**: Image optimization
- **heic2any**: HEIC to JPEG conversion
- **react-daum-postcode**: Korean address search

## 📁 Project Structure

```
/
├── index.html                          # HTML entry point with meta tags, fonts, PWA manifest
├── public/
│   ├── favicon.svg                     # App favicon (printer icon)
│   ├── icon-192.png.svg                # PWA icon (192x192)
│   ├── icon-512.png.svg                # PWA icon (512x512)
│   └── manifest.json                   # PWA manifest
├── src/
│   ├── app/
│   │   ├── App.tsx                     # Main app component (responsive layout wrapper)
│   │   ├── routes.tsx                  # React Router configuration
│   │   ├── components/
│   │   │   ├── Home.tsx                # Landing page
│   │   │   ├── CustomerRequest.tsx     # Customer repair request form (MAIN FORM)
│   │   │   ├── AdminDashboard.tsx      # Admin dashboard (request management)
│   │   │   ├── SuccessPage.tsx         # Success confirmation page
│   │   │   ├── EstimateModal.tsx       # Estimate preview modal
│   │   │   ├── ImageUploadHandlers.tsx # Image/video upload logic
│   │   │   ├── Logo.tsx                # ENX logo component
│   │   │   └── ui/                     # shadcn/ui components
│   │   ├── utils/
│   │   │   └── distance.ts             # Distance calculation utilities (Haversine formula)
│   │   └── hooks/
│   │       └── useKakaoLoader.ts       # Kakao Maps API loader
│   ├── styles/
│   │   ├── index.css                   # Global styles
│   │   ├── tailwind.css                # Tailwind CSS imports
│   │   ├── theme.css                   # CSS variables and theme tokens
│   │   └── fonts.css                   # Font imports (Pretendard)
│   └── utils/
│       └── supabase/
│           ├── client.ts               # Supabase client initialization
│           └── info.tsx                # Supabase project credentials
├── supabase/
│   └── functions/
│       └── server/
│           └── index.tsx               # Server-side geocoding endpoint
└── package.json                        # NPM dependencies
```

## 🗄️ Database Schema

### Table: `printer_repair_requests`
Stores all customer repair requests

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key (auto-increment) |
| created_at | timestamp | Request creation time |
| printer_model | text | Printer model name |
| symptoms | text[] | Array of symptoms |
| description | text | Detailed issue description |
| customer_name | text | Customer name |
| customer_phone | text | Customer phone number |
| customer_address | text | Full address (includes detail) |
| visit_date | text | Preferred visit date (YYYY-MM-DD) |
| visit_time | text | Preferred visit time slot |
| total_price | bigint | Total estimated price (KRW) |
| image_urls | text[] | Array of Supabase Storage URLs |
| status | text | Request status (pending/completed) |

### Table: `blocked_dates`
Manages unavailable dates to prevent double bookings

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key (auto-increment) |
| date | text | Blocked date (YYYY-MM-DD) |
| created_at | timestamp | Record creation time |

## 🔐 Environment Variables & Keys

### Supabase
- **Project URL**: https://omqsbenvwyemjbmqgrqw.supabase.co
- **Public Anon Key**: (stored in `/utils/supabase/info.tsx`)
- **Storage Bucket**: `printer-images` (public access enabled)

### EmailJS
- **Service ID**: service_dtiuz62
- **Template ID**: template_j7ux474
- **Public Key**: U5X12dcF7LuZ84ptU
- **Recipient**: tseizou@naver.com

### Kakao Maps API
- **JavaScript Key**: f6216527bfa56e0da08783dbdcec7f70
- **Server Endpoint**: `/functions/v1/make-server-006adbb0/geocode`

## 🎨 UI/UX Design

### Responsive Layout
- **Desktop (>420px)**: 
  - User pages: Mobile-first centered column (max-width 420px) with gray sidebars
  - Admin pages: Full-width layout
- **Mobile (≤420px)**: Full-width, optimized for touch

### Design System
- **Primary Color**: Blue (#3B82F6)
- **Font**: Pretendard (Korean), fallback to system fonts
- **Iconography**: Lucide React
- **Gradients**: Blue to Indigo, Green to Emerald (for success states)

## 💰 Pricing Logic

### Travel Cost Calculation
```javascript
// Metro area (Seoul/Gyeonggi/Incheon)
basePrice = 400,000 KRW (fixed)
additionalCost = 0
totalPrice = 400,000 KRW

// Busan (special case)
basePrice = 800,000 KRW (fixed)
additionalCost = 0
totalPrice = 800,000 KRW

// Other regions (distance-based)
basePrice = 400,000 KRW
distance = calculateHaversineDistance(office, customer) * 1.3 // Road curvature
distanceRatio = distance / 400 (Busan distance)
additionalCost = distanceRatio * 400,000
totalPrice = basePrice + additionalCost (rounded to nearest 10,000 KRW)

// Minimum additional cost for distant regions
if (additionalCost < 50,000 && distance > 50km) {
  additionalCost = 50,000
}
```

### Regional Adjustments
- **Automatic correction for known regions**:
  - Busan/Ulsan: Min 380km → Corrected to 400km
  - Daegu: Min 250km → Corrected to 290km
  - Gwangju: Min 250km → Corrected to 320km
  - Gangwon: Min 200km → Corrected to 230km
  - Daejeon: Min 150km → Corrected to 160km

## 📱 PWA Support

- **Manifest**: `/public/manifest.json`
- **Icons**: 
  - favicon.svg (scalable)
  - icon-192.png.svg (PWA small)
  - icon-512.png.svg (PWA large)
- **Theme Color**: #3B82F6 (Blue)

## 🚀 Deployment

### Prerequisites
- Node.js 18+
- Supabase project setup
- EmailJS account configured
- Kakao Maps API key

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

## 📊 Data Flow

### Customer Request Submission
1. Customer fills form (printer model, symptoms, address, date)
2. Photos/videos uploaded directly to Supabase Storage
3. Address geocoded via server endpoint (Kakao Maps API)
4. Distance calculated using Haversine formula
5. Travel cost computed based on distance
6. Form data saved to Supabase database
7. Email notification sent to admin (EmailJS)
8. Customer redirected to success page

### Admin Request Management
1. Admin opens dashboard
2. Requests fetched from Supabase database
3. Admin filters/searches requests
4. Admin views request details (modal)
5. Admin updates status (pending → completed)
6. Changes saved to database
7. Admin manages blocked dates (calendar)

## 🔧 Key Components Explained

### `/src/app/components/CustomerRequest.tsx`
- **Main customer-facing form**
- Handles all form state and validation
- Integrates address search, file upload, date selection
- Calculates travel cost in real-time
- Submits to Supabase and sends email

### `/src/app/components/ImageUploadHandlers.tsx`
- **Client-side file processing**
- `handleImageSelect()`: Compress and upload images (HEIC → JPEG, 300KB max)
- `handleVideoSelect()`: Compress and upload videos (360p, WebM)
- Direct upload to Supabase Storage bucket
- Progress tracking and error handling

### `/src/app/utils/distance.ts`
- **Distance calculation utilities**
- `calculateRealDistance()`: Get distance between two addresses
- `getCoordinates()`: Geocode address via server endpoint
- `calculateHaversineDistance()`: Haversine formula for straight-line distance
- `getRegion()`: Detect region type (metro/busan)
- `getBasePrice()`: Calculate base travel cost

### `/src/app/components/AdminDashboard.tsx`
- **Admin interface for request management**
- Real-time request list from Supabase
- Status update functionality
- Blocked dates calendar management
- Full-width layout on desktop

## 🐛 Known Issues & Solutions

### Issue: Favicon not updating
**Solution**: Added cache-busting query parameter (`?v=2`)

### Issue: HEIC images not supported on some browsers
**Solution**: Auto-convert HEIC to JPEG using `heic2any` library

### Issue: Large video files cause slow upload
**Solution**: 
- Compress videos to 360p using MediaRecorder API
- Limit file size to 100MB
- Show progress bar during upload

### Issue: Distance calculation errors
**Solution**:
- Implemented fallback to regional estimation
- Added retry logic for geocoding API
- Manual distance corrections for known regions

## 📝 Code Comments

All major components and utilities have comprehensive English comments explaining:
- Purpose and functionality
- Key features
- Data flow
- Important parameters and return values
- Usage examples

This makes the codebase easily understandable for other AI assistants or developers.

## 📞 Support Contact

**Admin Email**: tseizou@naver.com  
**Business Registration**: 302-47-00920

---

Last Updated: 2026-02-20
