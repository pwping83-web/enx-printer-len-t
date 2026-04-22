-- ========================================
-- SMS 인증번호 관리 테이블 및 함수
-- ========================================
-- 
-- Supabase SQL Editor에서 실행하세요:
-- https://app.supabase.com/project/_/sql
--

-- 1. 인증번호 저장 테이블 생성
CREATE TABLE IF NOT EXISTS verification_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE
);

-- 2. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_verification_codes_phone 
  ON verification_codes(phone);

CREATE INDEX IF NOT EXISTS idx_verification_codes_expires 
  ON verification_codes(expires_at);

CREATE INDEX IF NOT EXISTS idx_verification_codes_phone_used 
  ON verification_codes(phone, used);

-- 3. Row Level Security (RLS) 활성화
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책: 서비스 롤만 접근 가능
CREATE POLICY "Service role can do everything" 
  ON verification_codes 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- 5. 오래된 인증번호 자동 삭제 함수
CREATE OR REPLACE FUNCTION delete_old_verification_codes()
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1일이 지난 인증번호 삭제
  DELETE FROM verification_codes
  WHERE created_at < NOW() - INTERVAL '1 day';
  
  -- 만료된 인증번호도 삭제 (선택사항)
  -- DELETE FROM verification_codes
  -- WHERE expires_at < NOW() AND used = true;
END;
$$;

-- 6. 일일 자동 청소 작업 (pg_cron 사용)
-- Supabase Dashboard > Database > Extensions에서 pg_cron 활성화 필요
-- SELECT cron.schedule(
--   'delete-old-verification-codes',
--   '0 3 * * *', -- 매일 오전 3시
--   'SELECT delete_old_verification_codes();'
-- );

-- 7. Rate Limiting용 뷰 (선택사항)
CREATE OR REPLACE VIEW verification_attempts AS
SELECT 
  phone,
  COUNT(*) as attempt_count,
  MAX(created_at) as last_attempt
FROM verification_codes
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY phone;

-- 8. 통계 조회용 뷰
CREATE OR REPLACE VIEW verification_stats AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_sent,
  COUNT(CASE WHEN used = true THEN 1 END) as verified,
  COUNT(CASE WHEN used = false AND expires_at < NOW() THEN 1 END) as expired,
  ROUND(
    COUNT(CASE WHEN used = true THEN 1 END)::numeric / 
    NULLIF(COUNT(*), 0) * 100, 
    2
  ) as verification_rate
FROM verification_codes
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- ========================================
-- 테스트 쿼리
-- ========================================

-- 최근 인증번호 조회
-- SELECT * FROM verification_codes 
-- ORDER BY created_at DESC 
-- LIMIT 10;

-- 특정 번호의 인증 이력
-- SELECT * FROM verification_codes 
-- WHERE phone = '01012345678'
-- ORDER BY created_at DESC;

-- 오늘의 통계
-- SELECT * FROM verification_stats
-- WHERE date = CURRENT_DATE;

-- 시간당 발송량 조회
-- SELECT 
--   DATE_TRUNC('hour', created_at) as hour,
--   COUNT(*) as count
-- FROM verification_codes
-- WHERE created_at > NOW() - INTERVAL '24 hours'
-- GROUP BY hour
-- ORDER BY hour DESC;

-- ========================================
-- 관리자용 함수
-- ========================================

-- 특정 번호의 인증번호 수동 무효화
CREATE OR REPLACE FUNCTION invalidate_verification_code(
  p_phone TEXT,
  p_code TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE verification_codes
  SET used = true, used_at = NOW()
  WHERE phone = p_phone AND code = p_code;
  
  RETURN FOUND;
END;
$$;

-- 특정 번호의 모든 인증번호 무효화
CREATE OR REPLACE FUNCTION invalidate_all_codes_for_phone(
  p_phone TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  UPDATE verification_codes
  SET used = true, used_at = NOW()
  WHERE phone = p_phone AND used = false;
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN affected_rows;
END;
$$;

-- Rate Limiting 체크 함수
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_phone TEXT,
  p_max_attempts INTEGER DEFAULT 5,
  p_time_window INTERVAL DEFAULT INTERVAL '1 hour'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO attempt_count
  FROM verification_codes
  WHERE phone = p_phone 
    AND created_at > NOW() - p_time_window;
  
  -- 제한 횟수 초과 시 false 반환
  RETURN attempt_count < p_max_attempts;
END;
$$;

-- ========================================
-- 알림 설정 (선택사항)
-- ========================================

-- 인증 시도가 과도할 때 알림
CREATE OR REPLACE FUNCTION notify_excessive_verification_attempts()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  -- 최근 1시간 동안 같은 번호로 10회 이상 시도 시
  SELECT COUNT(*) INTO recent_count
  FROM verification_codes
  WHERE phone = NEW.phone 
    AND created_at > NOW() - INTERVAL '1 hour';
  
  IF recent_count >= 10 THEN
    -- 로그 기록 또는 관리자 알림
    RAISE WARNING 'Excessive verification attempts for phone: %', NEW.phone;
  END IF;
  
  RETURN NEW;
END;
$$;

-- CREATE TRIGGER check_excessive_attempts
--   AFTER INSERT ON verification_codes
--   FOR EACH ROW
--   EXECUTE FUNCTION notify_excessive_verification_attempts();

-- ========================================
-- 정기 청소 작업 수동 실행
-- ========================================

-- SELECT delete_old_verification_codes();

-- ========================================
-- 백업 및 복구
-- ========================================

-- 백업 테이블 생성 (선택사항)
-- CREATE TABLE verification_codes_backup AS 
-- SELECT * FROM verification_codes;

-- 복구
-- INSERT INTO verification_codes 
-- SELECT * FROM verification_codes_backup;
