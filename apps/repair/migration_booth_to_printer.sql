-- 방음부스 이전 시스템 → 프린터 AS 견적 시스템 마이그레이션
-- 실행 방법: Supabase Dashboard > SQL Editor에서 실행

-- 1. 기존 테이블 백업 (선택사항)
-- CREATE TABLE estimates_backup AS SELECT * FROM estimates;

-- 2. 컬럼명 변경 및 타입 수정
ALTER TABLE estimates 
  RENAME COLUMN booth_size TO printer_type;

ALTER TABLE estimates 
  RENAME COLUMN departure_address TO visit_address;

ALTER TABLE estimates 
  RENAME COLUMN options TO symptoms;

-- 3. 불필요한 컬럼 삭제
ALTER TABLE estimates 
  DROP COLUMN IF EXISTS arrival_address;

-- 4. printer_type에 체크 제약조건 추가 (선택사항)
ALTER TABLE estimates 
  ADD CONSTRAINT printer_type_check 
  CHECK (printer_type IN ('UV평판', '솔벤', '일반평판', '') OR printer_type IS NULL);

-- 5. image_url을 배열로 변경 (여러 장 업로드 가능)
-- 기존 image_url이 TEXT 타입이라면:
ALTER TABLE estimates 
  ALTER COLUMN image_url TYPE TEXT[] 
  USING CASE 
    WHEN image_url IS NULL OR image_url = '' THEN ARRAY[]::TEXT[]
    ELSE ARRAY[image_url]
  END;

-- 6. symptoms 컬럼에 설명 추가 (주석)
COMMENT ON COLUMN estimates.printer_type IS '프린터 종류: UV평판, 솔벤, 일반평판';
COMMENT ON COLUMN estimates.visit_address IS 'AS 방문 주소';
COMMENT ON COLUMN estimates.symptoms IS '고장 증상: 잉크막힘, 보드불량, 인식불가 등';
COMMENT ON COLUMN estimates.image_url IS '프린터 상태 사진 (여러 장 가능)';

-- 7. 마이그레이션 완료 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'estimates'
ORDER BY ordinal_position;
