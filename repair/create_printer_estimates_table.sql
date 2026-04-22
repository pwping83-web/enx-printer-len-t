-- 프린터 AS 견적 시스템 테이블 생성 (처음부터 새로 만드는 경우)
-- 실행 방법: Supabase Dashboard > SQL Editor에서 실행

-- 1. 기존 테이블이 있다면 삭제 (주의: 데이터가 모두 삭제됩니다!)
-- DROP TABLE IF EXISTS estimates;

-- 2. 새 테이블 생성
CREATE TABLE IF NOT EXISTS estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 고객 정보
  from_customer_name TEXT,
  from_customer_phone TEXT,
  to_customer_name TEXT,
  to_customer_phone TEXT,
  recipient_phone TEXT NOT NULL, -- 견적서 받을 번호
  
  -- 프린터 정보
  model_name TEXT, -- 프린터 모델명
  printer_type TEXT, -- 프린터 종류: UV평판, 솔벤, 일반평판
  symptoms TEXT, -- 고장 증상: 잉크막힘, 보드불량, 인식불가 등
  
  -- 주소 정보
  visit_address TEXT, -- AS 방문 주소
  visit_address_detail TEXT, -- 상세 주소
  
  -- 날짜 정보
  move_date TEXT, -- 방문 희망일
  move_time TEXT, -- 방문 희망 시간
  
  -- 이미지 (여러 장 가능)
  image_url TEXT[], -- 프린터 상태 사진들
  
  -- 견적 정보
  request_id TEXT UNIQUE, -- 견적 요청 고유번호
  estimated_price INTEGER, -- 예상 견적 금액
  distance INTEGER, -- 거리 (km)
  distance_range TEXT, -- 거리 범위
  
  -- 추가 정보
  details TEXT, -- 기타 상세 정보
  status TEXT DEFAULT 'pending', -- 상태: pending, completed, cancelled
  admin_memo TEXT, -- 관리자 메모
  
  -- 체크 제약조건
  CONSTRAINT printer_type_check 
    CHECK (printer_type IN ('UV평판', '솔벤', '일반평판', '') OR printer_type IS NULL)
);

-- 3. 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_estimates_request_id ON estimates(request_id);
CREATE INDEX IF NOT EXISTS idx_estimates_created_at ON estimates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_estimates_status ON estimates(status);
CREATE INDEX IF NOT EXISTS idx_estimates_printer_type ON estimates(printer_type);

-- 4. RLS (Row Level Security) 정책 설정
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 INSERT 가능 (견적 요청)
CREATE POLICY "Anyone can insert estimates" 
  ON estimates FOR INSERT 
  WITH CHECK (true);

-- 인증된 사용자만 조회 가능 (관리자)
CREATE POLICY "Authenticated users can view estimates" 
  ON estimates FOR SELECT 
  USING (auth.role() = 'authenticated');

-- 인증된 사용자만 수정 가능 (관리자)
CREATE POLICY "Authenticated users can update estimates" 
  ON estimates FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- 5. 컬럼 설명 추가
COMMENT ON TABLE estimates IS '프린터 AS 견적 요청 테이블';
COMMENT ON COLUMN estimates.printer_type IS '프린터 종류: UV평판, 솔벤, 일반평판';
COMMENT ON COLUMN estimates.visit_address IS 'AS 방문 주소';
COMMENT ON COLUMN estimates.symptoms IS '고장 증상: 잉크막힘, 보드불량, 인식불가 등';
COMMENT ON COLUMN estimates.image_url IS '프린터 상태 사진 (여러 장 가능)';
COMMENT ON COLUMN estimates.request_id IS '견적 요청 고유번호 (예: ABC123XYZ)';

-- 6. 테이블 생성 확인
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'estimates'
ORDER BY ordinal_position;
