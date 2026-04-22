# 🖨️ ENX 프린터 수리 서비스 시스템 완전 전환 가이드

## ✅ 완료된 작업

### 1. EstimateModal.tsx - 프린터 수리 전용 견적서로 전면 개편
**변경 전 (방음부스):**
- ❌ 방음부스 기본 정보
- ❌ 모델명, 부스 타입, 부스 크기
- ❌ 출발지/도착지 정보
- ❌ 건물 유형, 엘리베이터/계단

**변경 후 (프린터 수리):**
- ✅ 프린터 기본 정보
- ✅ 프린터 기종, 고장 증상
- ✅ 고객 정보 (이름, 연락처, 주소)
- ✅ 견적 정보 (기본 출장비, 거리 추가비, 총 견적)
- ✅ 추가 요청사항, 첨부 사진/영상

---

### 2. AdminDashboard.tsx - 프린터 수리 관리 시스템
**데이터 구조:**
```typescript
interface Request {
  id: string;
  customerName: string;           // 고객명
  recipientPhone: string;         // 연락처
  visitAddress: string;           // 방문 주소
  printerType: string;            // ✅ 프린터 기종
  symptoms: string[];             // ✅ 고장 증상 (배열)
  moveDate: string;               // 방문 날짜
  moveTime: string;               // 방문 시간
  estimateAmount: number;         // 견적 금액
  details: string;                // 상세 정보
  createdAt: string;              // 생성일
}
```

**UI 표시:**
- ✅ 프린터 기종 아이콘 (Printer)
- ✅ 고장 증상 아이콘 (Wrench)
- ✅ 방문 주소 아이콘 (MapPin)
- ✅ 견적 금액 강조 표시

---

### 3. CustomerRequest.tsx - 프린터 수리 접수 폼

**FormData 구조:**
```typescript
{
  // 프린터 정보
  printerType: string;                    // ✅ 프린터 기종
  symptoms: string[];                     // ✅ 고장 증상 (다중 선택)
  symptomDetails: Record<string, string>; // ✅ 증상별 상세 내용
  
  // 방문 정보
  moveDate: string;                       // 방문 날짜
  moveTime: string;                       // 방문 시간
  visitAddress: string;                   // 방문 주소
  visitAddressDetail: string;             // 상세 주소
  
  // 고객 정보
  customerName: string;                   // 고객명
  customerPhone: string;                  // 연락처
  
  // 거리 정보
  distanceRange: "metro" | "busan";       // 지역 구분
  actualDistance: number;                 // 실제 거리 (km)
  
  // 추가 정보
  printerImages: File[];                  // ✅ 사진/영상 파일
  additionalNotes: string;                // 추가 메모
}
```

---

## 📧 EmailJS 템플릿 설정 가이드

### 현재 사용 중인 설정
```javascript
Service ID: "service_dtiuz62"
Template ID: "template_wplcfmf"
Public Key: "U5X12dcF7LuZ84ptU"
```

### EmailJS 템플릿 파라미터 매핑

아래 변수들을 EmailJS 템플릿 에디터에서 사용하세요:

#### 📌 기본 정보
| 변수명 | 설명 | 예시 |
|--------|------|------|
| `{{to_email}}` | 수신 이메일 | tseizou@naver.com |
| `{{request_id}}` | 요청 번호 | ABC123XYZ |
| `{{request_date}}` | 요청 일시 | 2026. 2. 9. 오후 3:00:00 |
| `{{mail_subject}}` | 메일 제목 | [ENX 수리접수] 엡손1390 - 홍길동 님의 수리 요청입니다 |

#### 🖨️ 프린터 정보
| 변수명 | 설명 | 예시 |
|--------|------|------|
| `{{printer_type}}` | 프린터 기종 | 엡손1390 |
| `{{symptoms}}` | 고장 증상 (줄바꿈 포함) | • 잉크 막힘: 노즐 막힘<br>• 작동 불량: 인쇄 안됨 |

#### 👤 고객 정보
| 변수명 | 설명 | 예시 |
|--------|------|------|
| `{{customer_name}}` | 고객명 | 홍길동 |
| `{{customer_phone}}` | 전화번호 | 010-1234-5678 |
| `{{recipient_phone}}` | 수신 연락처 (하이픈 제거용) | 01012345678 |

#### 📍 방문 정보
| 변수명 | 설명 | 예시 |
|--------|------|------|
| `{{visit_address}}` | 방문 주소 | 서울특별시 강남구 테헤란로 123 |
| `{{visit_address_detail}}` | 상세 주소 | 3층 |
| `{{move_date}}` | 방문 날짜 | 2026-02-10 |
| `{{move_time}}` | 방문 시간 | 10:00-12:00 |

#### 💰 견적 정보
| 변수명 | 설명 | 예시 |
|--------|------|------|
| `{{distance_range}}` | 거리 정보 | 약 35km |
| `{{base_price}}` | 기본 출장비 | 400,000원 |
| `{{additional_cost}}` | 거리 추가비 | 0원 |
| `{{total_price}}` | 총 견적 금액 | 400,000원 |

#### 📎 추가 정보
| 변수명 | 설명 | 예시 |
|--------|------|------|
| `{{additional_notes}}` | 추가 메모 | 빠른 방문 부탁드립니다 |
| `{{printer_images}}` | 첨부 사진 HTML | `<p>파일명 리스트</p>` |
| `{{image_count}}` | 사진 개수 | 2 |

---

## 📝 EmailJS 템플릿 HTML 예시

EmailJS 대시보드에서 템플릿을 다음과 같이 작성하세요:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>{{mail_subject}}</title>
</head>
<body style="font-family: 'Malgun Gothic', sans-serif; background-color: #f5f5f5; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    
    <!-- 헤더 -->
    <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">🖨️ ENX 프린터 수리 접수</h1>
      <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 14px;">새로운 수리 요청이 접수되었습니다</p>
    </div>
    
    <!-- 요청 정보 -->
    <div style="padding: 30px;">
      <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 14px; color: #1e40af;">
          <strong>요청번호:</strong> {{request_id}}<br>
          <strong>요청일시:</strong> {{request_date}}
        </p>
      </div>
      
      <!-- 프린터 정보 -->
      <h2 style="font-size: 18px; color: #1f2937; margin: 25px 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb;">
        🖨️ 프린터 정보
      </h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="padding: 10px; background-color: #f9fafb; font-weight: bold; width: 120px; color: #6b7280;">프린터 기종</td>
          <td style="padding: 10px; background-color: white;">{{printer_type}}</td>
        </tr>
        <tr>
          <td style="padding: 10px; background-color: #f9fafb; font-weight: bold; color: #6b7280; vertical-align: top;">고장 증상</td>
          <td style="padding: 10px; background-color: white; white-space: pre-line;">{{symptoms}}</td>
        </tr>
      </table>
      
      <!-- 고객 정보 -->
      <h2 style="font-size: 18px; color: #1f2937; margin: 25px 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb;">
        👤 고객 정보
      </h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="padding: 10px; background-color: #f9fafb; font-weight: bold; width: 120px; color: #6b7280;">고객명</td>
          <td style="padding: 10px; background-color: white;">{{customer_name}}</td>
        </tr>
        <tr>
          <td style="padding: 10px; background-color: #f9fafb; font-weight: bold; color: #6b7280;">연락처</td>
          <td style="padding: 10px; background-color: white;">{{customer_phone}}</td>
        </tr>
      </table>
      
      <!-- 방문 정보 -->
      <h2 style="font-size: 18px; color: #1f2937; margin: 25px 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb;">
        📍 방문 정보
      </h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="padding: 10px; background-color: #f9fafb; font-weight: bold; width: 120px; color: #6b7280;">방문 주소</td>
          <td style="padding: 10px; background-color: white;">
            {{visit_address}}<br>
            <span style="color: #6b7280; font-size: 14px;">{{visit_address_detail}}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px; background-color: #f9fafb; font-weight: bold; color: #6b7280;">방문 날짜</td>
          <td style="padding: 10px; background-color: white;">{{move_date}}</td>
        </tr>
        <tr>
          <td style="padding: 10px; background-color: #f9fafb; font-weight: bold; color: #6b7280;">방문 시간</td>
          <td style="padding: 10px; background-color: white;">{{move_time}}</td>
        </tr>
      </table>
      
      <!-- 견적 정보 -->
      <h2 style="font-size: 18px; color: #1f2937; margin: 25px 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb;">
        💰 견적 정보
      </h2>
      <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">거리</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold;">{{distance_range}}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">기본 출장비</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold;">{{base_price}}원</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">거리 추가비</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold;">{{additional_cost}}원</td>
          </tr>
          <tr style="border-top: 2px solid #2563eb;">
            <td style="padding: 12px 0; color: #1f2937; font-weight: bold; font-size: 16px;">예상 출장 점검비</td>
            <td style="padding: 12px 0; text-align: right; font-weight: bold; font-size: 20px; color: #2563eb;">{{total_price}}원</td>
          </tr>
        </table>
        <p style="margin: 15px 0 0 0; font-size: 12px; color: #6b7280; text-align: center;">
          ※ 부품 교체 및 수리비는 현장 점검 후 별도 안내됩니다
        </p>
      </div>
      
      <!-- 추가 메모 -->
      <h2 style="font-size: 18px; color: #1f2937; margin: 25px 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb;">
        📝 추가 요청사항
      </h2>
      <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <p style="margin: 0; white-space: pre-line;">{{additional_notes}}</p>
      </div>
      
      <!-- 첨부 사진 -->
      <h2 style="font-size: 18px; color: #1f2937; margin: 25px 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb;">
        📸 첨부 사진/영상 ({{image_count}}개)
      </h2>
      <div style="margin-bottom: 20px;">
        {{printer_images}}
      </div>
    </div>
    
    <!-- 푸터 -->
    <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #6b7280; font-size: 14px;">
        <strong>ENX 프린터 수리 서비스</strong><br>
        📧 tseizou@naver.com | 📱 010-2435-2482
      </p>
    </div>
    
  </div>
</body>
</html>
```

---

## 🎯 EmailJS 템플릿 설정 방법

### 1. EmailJS 대시보드 접속
https://dashboard.emailjs.com/

### 2. 템플릿 수정
1. **Email Services** → `service_dtiuz62` 클릭
2. **Email Templates** → `template_wplcfmf` 클릭 (또는 새 템플릿 생성)
3. **Edit** 버튼 클릭

### 3. 템플릿 설정
- **Template Name**: `ENX 프린터 수리 접수 알림`
- **Subject**: `{{mail_subject}}`
- **Content (HTML)**: 위의 HTML 코드 복사/붙여넣기

### 4. 테스트
- **Test** 버튼으로 샘플 데이터 테스트
- 파라미터 값 입력 예시:
  ```json
  {
    "to_email": "tseizou@naver.com",
    "request_id": "ABC123XYZ",
    "printer_type": "엡손1390",
    "symptoms": "• 잉크 막힘: 노즐 막힘\n• 작동 불량",
    "customer_name": "홍길동",
    "customer_phone": "010-1234-5678",
    "visit_address": "서울특별시 강남구 테헤란로 123",
    "move_date": "2026-02-10",
    "move_time": "10:00-12:00",
    "total_price": "400,000"
  }
  ```

### 5. 저장
- **Save** 버튼 클릭

---

## 🚀 시스템 테스트 절차

### 1. 프론트엔드 테스트
```bash
# 1. 견적 요청 폼 작성
- 프린터 기종 입력
- 고장 증상 선택 (복수)
- 사진/영상 업로드 (선택)
- 방문 날짜/시간 선택
- 고객 정보 입력
- 주소 입력 (자동 거리 계산)

# 2. 제출 버튼 클릭

# 3. 콘솔 확인 (F12)
✅ 🚀 견적 요청 제출 시작
✅ 📋 폼 데이터: {...}
✅ ✅ 필수 입력값 검증 완료
✅ 📝 요청 ID 생성: abc123xyz
✅ 📧 이메일 전송 시작...
✅ 📧 EmailJS send 호출 중...
✅ ✅ 이메일 전송 완료: {status: 200, text: "OK"}
✅ 🎉 견적 요청 처리 완료!

# 4. 성공 페이지 확인
/success 페이지로 리다이렉트
- 요청번호 표시
- 고객명 표시
- 연락처 표시
```

### 2. 이메일 수신 확인
```bash
# tseizou@naver.com 메일함 확인
✅ 제목: [ENX 수리접수] 엡손1390 - 홍길동 님의 수리 요청입니다
✅ 본문: 프린터 정보, 고객 정보, 방문 정보, 견적 정보 모두 포함
✅ 사진 정보: 파일명 리스트 표시
```

### 3. 관리자 대시보드 확인
```bash
# /admin 접속
- 비밀번호: 2482

✅ 수리 접수 내역에 새 요청 표시
✅ 프린터 기종 표시 (Printer 아이콘)
✅ 고장 증상 표시 (Wrench 아이콘)
✅ 방문 주소 표시 (MapPin 아이콘)
✅ 견적 금액 강조 표시
✅ 전화, SMS, 상세보기 버튼 작동
```

---

## 📊 데이터 흐름도

```
[고객 폼 제출]
      ↓
[필수 입력값 검증]
      ↓
[요청 ID 생성]
      ↓
[EmailJS 파라미터 생성]
   ├─ printer_type (프린터 기종)
   ├─ symptoms (고장 증상)
   ├─ customer_name (고객명)
   ├─ customer_phone (연락처)
   ├─ visit_address (방문 주소)
   ├─ move_date (방문 날짜)
   ├─ move_time (방문 시간)
   ├─ total_price (총 견적)
   └─ ... (기타)
      ↓
[EmailJS 이메일 전송]
      ↓
[tseizou@naver.com 수신]
      ↓
[localStorage 백업 저장]
      ↓
[성공 페이지 이동]
```

---

## ⚠️ 주의사항

### 1. EmailJS 템플릿 변수명 정확히 일치
- ❌ `{{printerType}}` (카멜케이스)
- ✅ `{{printer_type}}` (언더스코어)

### 2. 이메일 본문 HTML 작성 시
- `white-space: pre-line` 속성 사용 (줄바꿈 유지)
- 테이블 레이아웃 사용 (일관된 표시)
- 반응형 디자인 (모바일 대응)

### 3. 사진/영상 파일
- 현재는 파일명만 이메일로 전송
- 실제 이미지 URL은 Supabase 업로드 필요 (선택사항)

### 4. 관리자 비밀번호
- 현재: `2482`
- 변경 위치: `/src/app/components/AdminDashboard.tsx` 79번째 줄

---

## 🔧 커스터마이징

### 출장비 기본 설정 변경
```typescript
// /src/app/components/AdminDashboard.tsx
// "출장비 기본 설정" 탭에서 변경 가능
- 서울·경기·인천 기본료: 400,000원
- km당 추가 요금: 1,428원
```

### 예약 불가능 날짜 설정
```typescript
// /src/app/components/AdminDashboard.tsx
// "예약 불가능 날짜 관리" 탭에서 설정
- Supabase blocked_dates 테이블에 저장
- 실시간 동기화 (5초마다)
```

---

## 📞 문의

시스템 관련 문의:
- 이메일: tseizou@naver.com
- 전화: 010-2435-2482

---

**마지막 업데이트:** 2026년 2월 9일
**버전:** 1.0.0 (프린터 수리 전용)
