import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Supabase 클라이언트 생성
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Storage bucket 초기화 (앱 시작 시 실행)
const initStorage = async () => {
  try {
    // 🔥 여러 버킷 생성
    const buckets = [
      { name: 'make-24714dd6-quote-uploads', public: false }, // 기존 버킷 (private)
      { name: 'printer-images', public: true } // ✅ 프린터 사진 업로드용 버킷 (PUBLIC)
    ];
    
    const { data: existingBuckets } = await supabase.storage.listBuckets();
    
    for (const bucket of buckets) {
      const bucketExists = existingBuckets?.some(b => b.name === bucket.name);
      
      if (!bucketExists) {
        await supabase.storage.createBucket(bucket.name, {
          public: bucket.public,
          fileSizeLimit: bucket.name === 'printer-images' ? 52428800 : 10485760, // printer-images는 50MB, 나머지는 10MB
        });
        console.log(`✅ Storage bucket 생성 완료: ${bucket.name} (public: ${bucket.public})`);
      } else {
        console.log('✅ Storage bucket 이미 존재:', bucket.name);
        
        // 🔥 기존 버킷을 public으로 업데이트 + 용량 제한 업데이트
        if (bucket.name === 'printer-images') {
          try {
            await supabase.storage.updateBucket(bucket.name, {
              public: true,
              fileSizeLimit: 52428800 // 50MB (50 * 1024 * 1024)
            });
            console.log('✅ printer-images 버킷을 PUBLIC으로 업데이트 + 50MB 제한 적용 완료!');
          } catch (updateError) {
            console.error('❌ 버킷 업데이트 실패:', updateError);
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Storage bucket 초기화 실패:', error);
  }
};

// 초기화 실행
initStorage();

// 🔥 DB 테이블 자동 생성 (앱 시작 시 실행)
const initDatabase = async () => {
  try {
    // blocked_dates 테이블 존재 확인
    const { error: checkBlocked } = await supabase
      .from('blocked_dates')
      .select('id', { count: 'exact', head: true });
    
    if (checkBlocked?.code === 'PGRST205' || checkBlocked?.code === '42P01') {
      console.log('📦 blocked_dates 테이블 생성 중...');
      // REST API로 SQL 실행 (service role 사용)
      const dbUrl = Deno.env.get('SUPABASE_DB_URL');
      if (dbUrl) {
        const { default: postgres } = await import("npm:postgres@3.4.7");
        const sql = postgres(dbUrl);
        
        await sql`
          CREATE TABLE IF NOT EXISTS public.blocked_dates (
            id BIGSERIAL PRIMARY KEY,
            date TEXT NOT NULL UNIQUE,
            created_at TIMESTAMPTZ DEFAULT NOW()
          )
        `;
        await sql`CREATE INDEX IF NOT EXISTS idx_blocked_dates_date ON public.blocked_dates(date)`;
        await sql`ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY`;
        await sql`
          DO $$ BEGIN
            CREATE POLICY "Public can read blocked_dates" ON public.blocked_dates FOR SELECT TO public USING (true);
          EXCEPTION WHEN duplicate_object THEN NULL;
          END $$
        `;
        await sql`
          DO $$ BEGIN
            CREATE POLICY "Public can insert blocked_dates" ON public.blocked_dates FOR INSERT TO public WITH CHECK (true);
          EXCEPTION WHEN duplicate_object THEN NULL;
          END $$
        `;
        await sql`
          DO $$ BEGIN
            CREATE POLICY "Public can delete blocked_dates" ON public.blocked_dates FOR DELETE TO public USING (true);
          EXCEPTION WHEN duplicate_object THEN NULL;
          END $$
        `;
        await sql`
          DO $$ BEGIN
            CREATE POLICY "Public can update blocked_dates" ON public.blocked_dates FOR UPDATE TO public USING (true) WITH CHECK (true);
          EXCEPTION WHEN duplicate_object THEN NULL;
          END $$
        `;
        await sql.end();
        console.log('✅ blocked_dates 테이블 생성 완료');
      }
    } else {
      console.log('✅ blocked_dates 테이블 이미 존재');
    }
    
    // printer_repair_requests 테이블 존재 확인
    const { error: checkRepair } = await supabase
      .from('printer_repair_requests')
      .select('id', { count: 'exact', head: true });
    
    if (checkRepair?.code === 'PGRST205' || checkRepair?.code === '42P01') {
      console.log('📦 printer_repair_requests 테이블 생성 중...');
      const dbUrl = Deno.env.get('SUPABASE_DB_URL');
      if (dbUrl) {
        const { default: postgres } = await import("npm:postgres@3.4.7");
        const sql = postgres(dbUrl);
        
        await sql`
          CREATE TABLE IF NOT EXISTS public.printer_repair_requests (
            id BIGSERIAL PRIMARY KEY,
            customer_name TEXT NOT NULL,
            customer_phone TEXT NOT NULL,
            customer_address TEXT NOT NULL,
            customer_address_detail TEXT,
            printer_model TEXT,
            symptoms TEXT[] DEFAULT '{}',
            visit_date TEXT,
            visit_time TEXT,
            total_price BIGINT DEFAULT 0,
            description TEXT,
            image_urls TEXT[] DEFAULT '{}',
            actual_distance REAL,
            created_at TIMESTAMPTZ DEFAULT NOW()
          )
        `;
        await sql`CREATE INDEX IF NOT EXISTS idx_printer_repair_requests_created_at ON public.printer_repair_requests(created_at DESC)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_printer_repair_requests_visit_date ON public.printer_repair_requests(visit_date)`;
        await sql`ALTER TABLE public.printer_repair_requests ENABLE ROW LEVEL SECURITY`;
        await sql`
          DO $$ BEGIN
            CREATE POLICY "Public can read printer_repair_requests" ON public.printer_repair_requests FOR SELECT TO public USING (true);
          EXCEPTION WHEN duplicate_object THEN NULL;
          END $$
        `;
        await sql`
          DO $$ BEGIN
            CREATE POLICY "Public can insert printer_repair_requests" ON public.printer_repair_requests FOR INSERT TO public WITH CHECK (true);
          EXCEPTION WHEN duplicate_object THEN NULL;
          END $$
        `;
        await sql`
          DO $$ BEGIN
            CREATE POLICY "Public can delete printer_repair_requests" ON public.printer_repair_requests FOR DELETE TO public USING (true);
          EXCEPTION WHEN duplicate_object THEN NULL;
          END $$
        `;
        await sql`
          DO $$ BEGIN
            CREATE POLICY "Public can update printer_repair_requests" ON public.printer_repair_requests FOR UPDATE TO public USING (true) WITH CHECK (true);
          EXCEPTION WHEN duplicate_object THEN NULL;
          END $$
        `;
        // Realtime 활성화 (Supabase Realtime 구독용)
        await sql`
          DO $$ BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.printer_repair_requests;
          EXCEPTION WHEN duplicate_object THEN NULL;
          END $$
        `;
        await sql`
          DO $$ BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.blocked_dates;
          EXCEPTION WHEN duplicate_object THEN NULL;
          END $$
        `;
        await sql.end();
        console.log('✅ printer_repair_requests 테이블 생성 완료 (Realtime 활성화)');
      }
    } else {
      console.log('✅ printer_repair_requests 테이블 이미 존재');
    }
    
    // PostgREST 스키마 캐시 갱신을 위해 NOTIFY 전송
    try {
      const dbUrl = Deno.env.get('SUPABASE_DB_URL');
      if (dbUrl) {
        const { default: postgres } = await import("npm:postgres@3.4.7");
        const sql = postgres(dbUrl);
        await sql`NOTIFY pgrst, 'reload schema'`;
        await sql.end();
        console.log('✅ PostgREST 스키마 캐시 갱신 요청 완료');
      }
    } catch (notifyError) {
      console.error('⚠️ 스키마 캐시 갱신 실패 (무시 가능):', notifyError);
    }
  } catch (error) {
    console.error('❌ DB 테이블 초기화 실패:', error);
  }
};

// DB 초기화 실행
initDatabase();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-36c58641/health", (c) => {
  return c.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    version: "2.5.0" // 🔥 자동 DB 테이블 생성 추가
  });
});

// 🔥 DB 테이블 수동 초기화 엔드포인트
app.post("/make-server-36c58641/init-db", async (c) => {
  try {
    await initDatabase();
    return c.json({ success: true, message: '테이블 초기화 완료' });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// 🔥 Kakao API 키 조회 (프론트엔드에서 사용)
app.get("/make-server-36c58641/kakao-key", (c) => {
  try {
    // 🔥 카카오 JavaScript 키 사용
    const kakaoJsKey = '36fc6f155420efd856b99ed5a9b180e6';
    
    return c.json({ success: true, key: kakaoJsKey });
  } catch (error) {
    console.error('❌ Kakao API 키 조회 실패:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// 🔥 주소를 좌표로 변환 (Kakao Geocoding API 프록시)
app.get("/make-server-36c58641/geocode", async (c) => {
  try {
    const address = c.req.query('address');
    
    if (!address) {
      return c.json({ success: false, error: '주소가 필요합니다.' }, 400);
    }
    
    const kakaoKey = Deno.env.get('KAKAO_REST_API_KEY');
    
    console.log('🔑 Kakao REST API 키:', kakaoKey);
    console.log('🔑 키 길이:', kakaoKey?.length);
    console.log('🔑 키 앞 10자:', kakaoKey ? `${kakaoKey.substring(0, 10)}...` : '없음');
    
    if (!kakaoKey) {
      console.error('❌ Kakao API 키가 설정되지 않았습니다.');
      return c.json({ success: false, error: 'Kakao API 키가 설정되지 않았습니다.' }, 500);
    }
    
    // 🔥 주소 정제: 괄호 부분 제거
    const cleanAddress = address.replace(/\s*\([^)]*\)/g, '').trim();
    
    console.log('🔍 주소 검색 요청:', { 원본: address, 제: cleanAddress });
    
    // 1. 주소 검색 API 시도
    let url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(cleanAddress)}`;
    console.log('📡 API 요청 URL:', url);
    
    let response = await fetch(url, {
      headers: {
        'Authorization': `KakaoAK ${kakaoKey}`,
      },
    });
    
    console.log('📥 주소 검색 API 응답 상태:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📦 주소 검색 응답:', JSON.stringify(data, null, 2));
      
      if (data.documents && data.documents.length > 0) {
        const { y, x, address_name } = data.documents[0];
        console.log('✅ 주 검색 성공:', address_name);
        return c.json({ 
          success: true, 
          lat: parseFloat(y), 
          lng: parseFloat(x),
          address_name 
        });
      }
    } else {
      const errorText = await response.text();
      console.error('❌ 주소 검색 API 실패:', response.status, errorText);
    }
    
    // 2. 키워드 검색 API 시도 (주소 검색 실패 시)
    console.log('🔄 키워드 검색으로 재시도...');
    url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(cleanAddress)}`;
    response = await fetch(url, {
      headers: {
        'Authorization': `KakaoAK ${kakaoKey}`,
      },
    });
    
    console.log('📥 키워드 검색 응답 상태:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📦 키워드 검색 응답:', JSON.stringify(data, null, 2));
      
      if (data.documents && data.documents.length > 0) {
        const { y, x, place_name, address_name } = data.documents[0];
        console.log('✅ 키워드 검색 성공:', place_name || address_name);
        return c.json({ 
          success: true, 
          lat: parseFloat(y), 
          lng: parseFloat(x),
          address_name: place_name || address_name
        });
      }
    } else {
      const errorText = await response.text();
      console.error('❌ 키워드 검색 API 실패:', response.status, errorText);
    }
    
    // 3. 원본 주소로 한 번 더 시도 (괄호 포함)
    if (cleanAddress !== address) {
      console.log('🔄 원본 주소로 재시도...');
      url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(address)}`;
      response = await fetch(url, {
        headers: {
          'Authorization': `KakaoAK ${kakaoKey}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.documents && data.documents.length > 0) {
          const { y, x, place_name, address_name } = data.documents[0];
          console.log('✅ 원본 주소 검색 성공:', place_name || address_name);
          return c.json({ 
            success: true, 
            lat: parseFloat(y), 
            lng: parseFloat(x),
            address_name: place_name || address_name
          });
        }
      }
    }
    
    console.error('❌ 주소를 찾을 수 없습니다:', address);
    return c.json({ success: false, error: '주소를 찾을 수 없습니다.' }, 404);
    
  } catch (error) {
    console.error('❌ Geocoding 실패:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// 파일 업로드 API
app.post("/make-server-36c58641/upload", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ success: false, error: '파일이 없습니다.' }, 400);
    }

    // 파일 이름 생성 (timestamp + random + original extension)
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const extension = file.name.split('.').pop();
    const fileName = `${timestamp}_${random}.${extension}`;
    
    // 파일을 ArrayBuffer로 변환
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Supabase Storage에 업로드
    const bucketName = 'make-24714dd6-quote-uploads';
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, uint8Array, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('파일 업로드 실패:', error);
      return c.json({ success: false, error: error.message }, 500);
    }

    // Signed URL 생성 (7일간 유효)
    const { data: signedUrlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 60 * 60 * 24 * 7); // 7일

    console.log('파일 업로드 완료:', fileName);

    return c.json({ 
      success: true, 
      fileName,
      url: signedUrlData?.signedUrl || '',
      path: data.path,
    });
  } catch (error) {
    console.error('파일 업로드 처리 실패:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// 🔥 고객 사진 업로드 API (booth-images 버킷용)
app.post("/make-server-36c58641/upload-image", async (c) => {
  try {
    console.log('📤 upload-image 엔드포인트 호출됨');
    
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'exterior' or 'interior'
    
    if (!file) {
      console.error('❌ 파일이 없습니다');
      return c.json({ success: false, error: '파일이 없습니다.' }, 400);
    }

    console.log(`📤 ${type} 사진 업로드 시작:`, file.name, file.size, 'bytes', file.type);

    // 파일 이름 생성 (type + timestamp + random + extension)
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const extension = file.name.split('.').pop();
    const fileName = `${type || 'file'}_${timestamp}_${random}.${extension}`;
    
    console.log('📝 생성된 파일명:', fileName);
    
    // 파일을 ArrayBuffer로 변환
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    console.log('🔄 파일 변환 완료, 크기:', uint8Array.length, 'bytes');
    
    // 🔥 printer-images 버킷에 업로드 (SERVICE_ROLE_KEY 사용하므로 RLS 우회)
    const bucketName = 'printer-images'; // ✅ 버킷 이름 통일
    console.log('📦 업로드 대상 버킷:', bucketName);
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, uint8Array, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error(`❌ ${type} 사진 업로드 실패:`, error);
      return c.json({ success: false, error: error.message }, 500);
    }

    console.log('✅ 스토리지 업로드 성공, path:', data.path);

    // Public URL 가져오기 (버킷이 PUBLIC이므로 바로 접근 가능)
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    console.log(`✅ ${type} 사진 업로드 성공:`, publicUrlData.publicUrl);

    return c.json({ 
      success: true, 
      fileName,
      url: publicUrlData.publicUrl,
      path: data.path,
    });
  } catch (error) {
    console.error('❌ 사진 업로드 처리 실패:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// 🔥 Signed Upload URL 생성 API (모바일 안정성 개선)
app.post("/make-server-36c58641/create-upload-url", async (c) => {
  try {
    const { fileName, contentType } = await c.req.json();
    
    if (!fileName) {
      return c.json({ success: false, error: '파일명이 필요합니다.' }, 400);
    }
    
    console.log('🔑 Signed Upload URL 생성 요청:', { fileName, contentType });
    
    // Signed Upload URL 생성 (1시간 유)
    const { data, error } = await supabase.storage
      .from('printer-images')
      .createSignedUploadUrl(fileName);
    
    if (error) {
      console.error('❌ Signed URL 생성 실패:', error);
      return c.json({ success: false, error: error.message }, 500);
    }
    
    console.log('✅ Signed Upload URL 생성 완료:', data.signedUrl);
    
    return c.json({
      success: true,
      signedUrl: data.signedUrl,
      token: data.token,
      path: data.path,
      fileName
    });
  } catch (error) {
    console.error('❌ Signed URL 생성 처리 실패:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// 견적 요청 저장
app.post("/make-server-36c58641/quotes", async (c) => {
  try {
    const data = await c.req.json();
    
    // 고유 ID 생성 (timestamp + random)
    const quoteId = `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 저장할 데이터 구조
    const quoteData = {
      id: quoteId,
      ...data,
      createdAt: new Date().toISOString(),
    };
    
    // KV Store에 저장
    await kv.set(quoteId, quoteData);
    
    console.log('견적 요청 저장 완료:', quoteId);
    
    return c.json({ success: true, id: quoteId, data: quoteData });
  } catch (error) {
    console.error('견적 요청 저장 실패:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// 모든 견적 요청 조회
app.get("/make-server-36c58641/quotes", async (c) => {
  try {
    // quote_ prefix로 시작하는 든 키 조회
    const quotes = await kv.getByPrefix('quote_');
    
    // 최신순으로 정렬 (createdAt 기준)
    const sortedQuotes = quotes.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
    
    console.log(`견적 요청 조회: ${quotes.length}개`);
    
    return c.json({ success: true, quotes: sortedQuotes });
  } catch (error) {
    console.error('견적 요청 조회 실패:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// 특정 견적 요청 삭제
app.delete("/make-server-36c58641/quotes/:id", async (c) => {
  try {
    const id = c.req.param('id');
    
    // KV Store에서 삭제
    await kv.del(id);
    
    console.log('견적 요청 삭제 완료:', id);
    
    return c.json({ success: true, id });
  } catch (error) {
    console.error('견적 요청 삭제 실패:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// 모든 견적 요청 삭제 (관리자용)
app.delete("/make-server-36c58641/quotes", async (c) => {
  try {
    // quote_ prefix로 시작하는 모든 키 조회
    const quotes = await kv.getByPrefix('quote_');
    
    // 모든 견적 요청 삭제
    const ids = quotes.map(q => q.id);
    if (ids.length > 0) {
      await kv.mdel(ids);
    }
    
    console.log(`모든 견적 요청 삭제 완료: ${ids.length}개`);
    
    return c.json({ success: true, deletedCount: ids.length });
  } catch (error) {
    console.error('모든 견적 요청 삭제 실패:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// 🔥 예약 불가능 날짜 조회
app.get("/make-server-36c58641/disabled-dates", async (c) => {
  try {
    // Supabase 테이블에서 조회
    const { data, error } = await supabase
      .from('blocked_dates')
      .select('date')
      .order('date', { ascending: true });

    if (error) {
      console.error('예약 불가능 날짜 조회 DB 에러:', error);
      return c.json({ success: false, error: error.message }, 500);
    }

    // date 필드만 추출하여 배열로 변환
    const disabledDates = data?.map(row => row.date) || [];
    
    console.log(`예약 불가능 날짜 조회: ${disabledDates.length}개`);
    
    return c.json({ success: true, disabledDates });
  } catch (error) {
    console.error('예약 불가능 날짜 조회 실패:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// 🔥 예약 불가능 날짜 저장 (차이점만 업데이트)
app.post("/make-server-36c58641/disabled-dates", async (c) => {
  try {
    const { disabledDates } = await c.req.json();
    
    console.log('🔄 예약 불가능 날짜 저장 요청:', disabledDates);
    
    // 1. 현재 DB에 있는 날짜들 조회
    const { data: existingData, error: selectError } = await supabase
      .from('blocked_dates')
      .select('date');
    
    if (selectError) {
      console.error('❌ 기존 데이터 조회 실패:', selectError);
      return c.json({ success: false, error: selectError.message }, 500);
    }
    
    const existingDates = existingData?.map(row => row.date) || [];
    const newDates = disabledDates || [];
    
    console.log('📊 기존 DB 날짜:', existingDates);
    console.log('📊 새로 선택된 날짜:', newDates);
    
    // 2. 추가할 날짜 찾기 (newDates에는 있지만 existingDates에는 없는 것)
    const datesToAdd = newDates.filter((date: string) => !existingDates.includes(date));
    
    // 3. 삭제할 날짜 찾기 (existingDates에는 있지만 newDates에는 없 것)
    const datesToRemove = existingDates.filter(date => !newDates.includes(date));
    
    console.log('➕ 추가할 날짜:', datesToAdd);
    console.log('➖ 삭제할 날짜:', datesToRemove);
    
    // 4. 새로운 날짜 INSERT
    if (datesToAdd.length > 0) {
      const insertData = datesToAdd.map((date: string) => ({ date }));
      const { error: insertError } = await supabase
        .from('blocked_dates')
        .insert(insertData);
      
      if (insertError) {
        console.error('❌ 날짜 추가 실패:', insertError);
        return c.json({ success: false, error: insertError.message }, 500);
      }
      console.log(`✅ ${datesToAdd.length}개 날짜 추가 완료`);
    }
    
    // 5. 선택 해제된 날짜 DELETE
    if (datesToRemove.length > 0) {
      const { error: deleteError } = await supabase
        .from('blocked_dates')
        .delete()
        .in('date', datesToRemove);
      
      if (deleteError) {
        console.error('❌ 날짜 삭제 실패:', deleteError);
        return c.json({ success: false, error: deleteError.message }, 500);
      }
      console.log(`✅ ${datesToRemove.length}개 날짜 삭제 완료`);
    }
    
    console.log(`💾 예약 불가능 날짜 저장 완료: 총 ${newDates.length}개`);
    
    return c.json({ 
      success: true, 
      disabledDates: newDates,
      added: datesToAdd.length,
      removed: datesToRemove.length 
    });
  } catch (error) {
    console.error('❌ 예약 불가능 날짜 저장 실패:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// 🔥 견적 전송 완료 상태 저장
app.post("/make-server-36c58641/completed-requests", async (c) => {
  try {
    const { completedRequests } = await c.req.json();
    
    // KV Store에 저장
    await kv.set('completed_requests', {
      requests: completedRequests,
      updatedAt: new Date().toISOString(),
    });
    
    console.log(`완료된 견적 요청 저장 완료: ${completedRequests.length}개`);
    
    return c.json({ success: true, completedRequests });
  } catch (error) {
    console.error('완료된 견적 요청 저장 실패:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// 🔥 거리별 기본 비용 조회
app.get("/make-server-36c58641/distance-prices", async (c) => {
  try {
    const data = await kv.get('distance_prices');
    // 기본값 설정
    const distancePrices = data?.prices || {
      metro: 500000,
      "100km": 600000,
      "200km": 700000,
      "300km": 800000
    };
    
    console.log('거리별 기본 용 조회 완료');
    
    return c.json({ success: true, distancePrices });
  } catch (error) {
    console.error('거리별 기본 비용 조회 실패:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// 🔥 거리별 기본 비용 저장
app.post("/make-server-36c58641/distance-prices", async (c) => {
  try {
    const { distancePrices } = await c.req.json();
    
    // KV Store에 저장
    await kv.set('distance_prices', {
      prices: distancePrices,
      updatedAt: new Date().toISOString(),
    });
    
    console.log('거리별 기본 비용 저장 완료:', distancePrices);
    
    return c.json({ success: true, distancePrices });
  } catch (error) {
    console.error('거리별 기본 비용 저장 실패:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// 🔥 예약 불가 날짜 조회 (KV Store 사용)
app.get("/make-server-36c58641/blocked-dates", async (c) => {
  try {
    console.log('📅 예약 불가 날짜 조회 (KV Store)');
    
    const data = await kv.get('blocked_dates');
    const dates = data?.dates || [];
    
    console.log(`✅ 예약 불가 날짜 조회 완료: ${dates.length}개`);
    
    return c.json(dates);
  } catch (error) {
    console.error('❌ 예약 불가 날짜 조회 실패:', error);
    return c.json([], 200); // 에러 시 빈 배열 반환
  }
});

// 🔥 예약 불가 날짜 저장 (KV Store 사용)
app.post("/make-server-36c58641/blocked-dates", async (c) => {
  try {
    const body = await c.req.json();
    const dates = body.dates || body.disabledDates || [];
    
    console.log('💾 예약 불가 날짜 저장 요청:', dates);
    
    // KV Store에 저장
    await kv.set('blocked_dates', {
      dates: dates,
      updatedAt: new Date().toISOString(),
    });
    
    console.log(`✅ 예약 불가 날짜 저장 완료: ${dates.length}개`);
    
    return c.json({ 
      success: true, 
      dates: dates,
      count: dates.length 
    });
  } catch (error) {
    console.error('❌ 예약 불가 날짜 저장 실패:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);