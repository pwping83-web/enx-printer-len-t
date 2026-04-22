import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// 🔥 싱글톤 Supabase 클라이언트
let supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = `https://${projectId}.supabase.co`;
    supabaseClient = createClient(supabaseUrl, publicAnonKey, {
      // 🔥 모바일 네트워크 최적화
      global: {
        headers: {
          'X-Client-Info': 'printer-repair-mobile'
        }
      },
      db: {
        schema: 'public'
      },
      // 🔥 재시도 설정 추가
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      }
    });
    console.log('✅ Supabase 클라이언트 초기화 완료 (모바일 최적화)');
  }
  return supabaseClient;
}
