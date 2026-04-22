# SMS 인증 실제 구현 가이드

## 🔐 실제 서비스 구현 방법

### 1️⃣ NCP SENS 사용 (추천)

#### 📋 준비사항
1. 네이버 클라우드 플랫폼 가입
2. SENS 서비스 신청
3. 발신번호 등록 (통신사 승인 필요, 1~2일 소요)
4. Access Key, Secret Key 발급

#### 💰 비용
- SMS: 건당 9원
- LMS(긴 문자): 건당 30원
- 월 최소 비용: 0원 (사용한 만큼만)

---

### 📱 Node.js + Supabase Edge Function 구현

```typescript
// supabase/functions/send-sms/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const NCP_SERVICE_ID = Deno.env.get('NCP_SERVICE_ID')!
const NCP_ACCESS_KEY = Deno.env.get('NCP_ACCESS_KEY')!
const NCP_SECRET_KEY = Deno.env.get('NCP_SECRET_KEY')!
const SENDER_PHONE = Deno.env.get('SENDER_PHONE')! // 등록된 발신번호

serve(async (req) => {
  try {
    const { phone } = await req.json()
    
    // 인증번호 생성 (6자리)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Redis 또는 Supabase에 인증번호 저장 (5분 유효)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    
    await supabase.from('verification_codes').insert({
      phone,
      code: verificationCode,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      used: false,
    })
    
    // NCP SENS API 호출
    const timestamp = Date.now().toString()
    const url = \`/sms/v2/services/\${NCP_SERVICE_ID}/messages\`
    const signature = makeSignature(url, timestamp)
    
    const response = await fetch(
      \`https://sens.apigw.ntruss.com\${url}\`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ncp-apigw-timestamp': timestamp,
          'x-ncp-iam-access-key': NCP_ACCESS_KEY,
          'x-ncp-apigw-signature-v2': signature,
        },
        body: JSON.stringify({
          type: 'SMS',
          from: SENDER_PHONE,
          content: \`[마카롱 프린터 렌탈] 인증번호는 [\${verificationCode}] 입니다. 5분 내에 입력해주세요.\`,
          messages: [{ to: phone }],
        }),
      }
    )
    
    if (!response.ok) {
      throw new Error('SMS 전송 실패')
    }
    
    return new Response(
      JSON.stringify({ success: true, message: 'SMS 전송 완료' }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

// HMAC-SHA256 서명 생성
function makeSignature(url: string, timestamp: string): string {
  const space = ' '
  const newLine = '\n'
  const method = 'POST'
  
  const message = []
  message.push(method)
  message.push(space)
  message.push(url)
  message.push(newLine)
  message.push(timestamp)
  message.push(newLine)
  message.push(NCP_ACCESS_KEY)
  
  const signature = hmacSha256(message.join(''), NCP_SECRET_KEY)
  return signature.toString('base64')
}
```

---

### 🔍 인증번호 확인 API

```typescript
// supabase/functions/verify-sms/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const { phone, code } = await req.json()
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    
    // 인증번호 조회
    const { data, error } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('phone', phone)
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (error || !data) {
      return new Response(
        JSON.stringify({ success: false, message: '인증번호가 올바르지 않습니다' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // 인증번호 사용 처리
    await supabase
      .from('verification_codes')
      .update({ used: true })
      .eq('id', data.id)
    
    return new Response(
      JSON.stringify({ success: true, message: '인증 완료' }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

---

### 🗄️ Supabase 테이블 생성

```sql
-- 인증번호 저장 테이블
CREATE TABLE verification_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_verification_codes_phone ON verification_codes(phone);
CREATE INDEX idx_verification_codes_expires ON verification_codes(expires_at);

-- 오래된 인증번호 자동 삭제 (1일 후)
CREATE OR REPLACE FUNCTION delete_old_verification_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM verification_codes
  WHERE created_at < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;
```

---

## 🎨 프론트엔드 연동

```typescript
// src/app/utils/smsVerification.ts

const SUPABASE_URL = 'your-supabase-url'
const SUPABASE_ANON_KEY = 'your-anon-key'

// SMS 발송
export async function sendVerificationSMS(phone: string) {
  const response = await fetch(\`\${SUPABASE_URL}/functions/v1/send-sms\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${SUPABASE_ANON_KEY}\`,
    },
    body: JSON.stringify({ phone }),
  })
  
  return response.json()
}

// 인증번호 확인
export async function verifySMSCode(phone: string, code: string) {
  const response = await fetch(\`\${SUPABASE_URL}/functions/v1/verify-sms\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${SUPABASE_ANON_KEY}\`,
    },
    body: JSON.stringify({ phone, code }),
  })
  
  return response.json()
}
```

---

## 💡 다른 서비스 사용 시

### 알리고 (Aligo)
```typescript
const response = await fetch('https://apis.aligo.in/send/', {
  method: 'POST',
  body: new URLSearchParams({
    key: 'your-api-key',
    user_id: 'your-user-id',
    sender: '01012345678',
    receiver: phone,
    msg: \`[마카롱 프린터] 인증번호: \${code}\`,
  }),
})
```

### 쿨SMS
```typescript
const response = await fetch('https://api.coolsms.co.kr/messages/v4/send', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${ACCESS_TOKEN}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: {
      to: phone,
      from: '01012345678',
      text: \`[마카롱 프린터] 인증번호: \${code}\`,
    },
  }),
})
```

### Twilio (해외 서비스)
```typescript
import twilio from 'twilio'

const client = twilio(ACCOUNT_SID, AUTH_TOKEN)

await client.messages.create({
  body: \`[마카롱 프린터] 인증번호: \${code}\`,
  from: '+12345678901',
  to: \`+82\${phone}\`, // 한국 국가코드
})
```

---

## 🔒 보안 고려사항

1. **Rate Limiting (속도 제한)**
   - 동일 번호로 1분에 1회만 발송
   - IP당 시간당 10회 제한

2. **인증번호 보안**
   - 6자리 숫자 사용
   - 5분 후 자동 만료
   - 1회 사용 후 무효화

3. **전화번호 검증**
   - 한국 전화번호 형식 확인 (010-XXXX-XXXX)
   - 국제번호 차단 (필요시)

4. **비용 관리**
   - 일일 발송 제한 설정
   - 이상 패턴 감지 (스팸 방지)

---

## 📊 예상 비용

| 서비스 | SMS 단가 | 월 1,000건 | 월 10,000건 |
|--------|----------|-----------|------------|
| NCP SENS | 9원 | 9,000원 | 90,000원 |
| 알리고 | 10원 | 10,000원 | 100,000원 |
| 쿨SMS | 7원 | 7,000원 | 70,000원 |
| 카카오 알림톡 | 8원 | 8,000원 | 80,000원 |

---

## 🚀 빠른 시작 (NCP SENS)

1. **네이버 클라우드 가입**: https://www.ncloud.com
2. **SENS 서비스 신청**: Console > Application Service > Simple & Easy Notification Service
3. **발신번호 등록**: 휴대폰/사업자 인증 필요
4. **API Key 발급**: API 인증키 관리에서 생성
5. **Supabase에 환경변수 설정**:
   - NCP_SERVICE_ID
   - NCP_ACCESS_KEY
   - NCP_SECRET_KEY
   - SENDER_PHONE

---

## ✅ 추천 순서

1. **소규모/테스트**: 알리고 (간편한 설정)
2. **중대형 서비스**: NCP SENS (안정성 + 가격)
3. **대량 발송**: 쿨SMS (가격 우위)
4. **높은 도달률 필요**: 카카오 알림톡

---

## 📞 문의처

- **NCP SENS**: support@ncloud.com
- **알리고**: 1661-0126
- **쿨SMS**: 02-3489-9969
- **카카오**: https://cs.kakao.com/
