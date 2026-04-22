/**
 * 실제 SMS 인증 서비스 통합 유틸리티
 * 
 * 사용 가능한 서비스:
 * 1. NCP SENS (Naver Cloud Platform) - 추천 ⭐
 * 2. 알리고 (Aligo)
 * 3. 쿨SMS (CoolSMS)
 */

// ========================================
// 환경 변수 설정 (.env 파일에 추가)
// ========================================
// VITE_SMS_SERVICE=ncp_sens
// VITE_SUPABASE_URL=your-supabase-url
// VITE_SUPABASE_ANON_KEY=your-anon-key

export type SMSService = 'ncp_sens' | 'aligo' | 'coolsms' | 'demo';

interface SMSConfig {
  service: SMSService;
  supabaseUrl?: string;
  supabaseKey?: string;
}

const config: SMSConfig = {
  service: (import.meta.env.VITE_SMS_SERVICE as SMSService) || 'demo',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
};

/**
 * SMS 인증번호 발송
 * @param phone 전화번호 (예: "01012345678" 또는 "010-1234-5678")
 * @returns Promise<{ success: boolean; message: string; code?: string }>
 */
export async function sendVerificationSMS(phone: string): Promise<{
  success: boolean;
  message: string;
  code?: string; // 데모 모드에서만 반환
}> {
  // 전화번호 포맷 정리 (하이픈 제거)
  const cleanPhone = phone.replace(/-/g, '');
  
  // 전화번호 유효성 검사
  if (!isValidKoreanPhone(cleanPhone)) {
    return {
      success: false,
      message: '올바른 전화번호 형식이 아닙니다',
    };
  }

  // 데모 모드 (실제 SMS 발송 안 함)
  if (config.service === 'demo') {
    const code = generateVerificationCode();
    console.log(`[데모 모드] 인증번호: ${code}`);
    return {
      success: true,
      message: 'SMS가 발송되었습니다 (데모 모드)',
      code, // 데모에서만 코드 반환
    };
  }

  // 실제 SMS 발송 (Supabase Edge Function 호출)
  try {
    const response = await fetch(`${config.supabaseUrl}/functions/v1/send-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.supabaseKey}`,
      },
      body: JSON.stringify({
        phone: cleanPhone,
        service: config.service,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'SMS 발송 실패');
    }

    return {
      success: true,
      message: 'SMS가 발송되었습니다',
    };
  } catch (error) {
    console.error('SMS 발송 오류:', error);
    return {
      success: false,
      message: 'SMS 발송에 실패했습니다. 잠시 후 다시 시도해주세요.',
    };
  }
}

/**
 * 인증번호 확인
 * @param phone 전화번호
 * @param code 인증번호
 * @returns Promise<{ success: boolean; message: string }>
 */
export async function verifyCode(phone: string, code: string): Promise<{
  success: boolean;
  message: string;
}> {
  const cleanPhone = phone.replace(/-/g, '');

  // 데모 모드는 프론트엔드에서 바로 검증
  if (config.service === 'demo') {
    // 데모 모드에서는 PhoneVerification 컴포넌트에서 자체 검증
    return {
      success: true,
      message: '인증이 완료되었습니다',
    };
  }

  // 실제 인증 확인 (Supabase Edge Function 호출)
  try {
    const response = await fetch(`${config.supabaseUrl}/functions/v1/verify-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.supabaseKey}`,
      },
      body: JSON.stringify({
        phone: cleanPhone,
        code,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || '인증 실패');
    }

    return {
      success: true,
      message: '인증이 완료되었습니다',
    };
  } catch (error) {
    console.error('인증 확인 오류:', error);
    return {
      success: false,
      message: '인증번호가 올바르지 않습니다',
    };
  }
}

/**
 * 6자리 인증번호 생성
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 한국 전화번호 유효성 검사
 * @param phone 전화번호 (하이픈 제거된 상태)
 * @returns boolean
 */
export function isValidKoreanPhone(phone: string): boolean {
  // 010, 011, 016, 017, 018, 019로 시작하는 11자리 숫자
  const phoneRegex = /^01[0-9]{9}$/;
  return phoneRegex.test(phone);
}

/**
 * 전화번호 포맷팅 (010-1234-5678)
 * @param phone 전화번호
 * @returns 포맷팅된 전화번호
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

// ========================================
// Supabase Edge Function 예시 코드
// ========================================

/*
=== 파일: supabase/functions/send-sms/index.ts ===

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const { phone, service } = await req.json()
    
    // 인증번호 생성
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Supabase에 저장 (5분 유효)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    
    await supabase.from('verification_codes').insert({
      phone,
      code,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      used: false,
    })
    
    // SMS 발송 (서비스별 로직)
    if (service === 'ncp_sens') {
      await sendViaNCP(phone, code)
    } else if (service === 'aligo') {
      await sendViaAligo(phone, code)
    } else if (service === 'coolsms') {
      await sendViaCoolSMS(phone, code)
    }
    
    return new Response(
      JSON.stringify({ success: true, message: 'SMS 발송 완료' }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

=== 파일: supabase/functions/verify-sms/index.ts ===

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const { phone, code } = await req.json()
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    
    // 인증번호 확인
    const { data, error } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('phone', phone)
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single()
    
    if (error || !data) {
      return new Response(
        JSON.stringify({ success: false, message: '인증번호가 올바르지 않습니다' }),
        { status: 400 }
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
      JSON.stringify({ success: false, message: error.message }),
      { status: 500 }
    )
  }
})
*/
