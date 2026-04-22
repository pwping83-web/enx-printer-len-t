const QUOTATIONS_STORAGE_KEY = 'quotations';

// Quotation 타입 정의
export interface SupabaseQuotation {
  id: string;
  company_name: string;
  contact_name: string;
  phone: string;
  email: string;
  printer_model: string;
  quantity: number;
  rental_period: number;
  usage?: string;
  print_types?: string[];
  daily_print_quantity?: string;
  address?: string;
  detailed_address?: string;
  signature?: string;
  status: 'pending' | 'signed' | 'submitted';
  created_at: string;
  signed_at?: string;
  submitted_at?: string;
  quotation_data: any; // 전체 데이터 JSON 저장
}

const readQuotations = (): SupabaseQuotation[] => {
  const raw = localStorage.getItem(QUOTATIONS_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Quotation 파싱 오류:', error);
    return [];
  }
};

const writeQuotations = (quotations: SupabaseQuotation[]) => {
  localStorage.setItem(QUOTATIONS_STORAGE_KEY, JSON.stringify(quotations));
};

// Quotation 저장 (localStorage)
export async function saveQuotation(quotation: Omit<SupabaseQuotation, 'created_at'>) {
  const now = new Date().toISOString();
  const nextItem: SupabaseQuotation = {
    ...quotation,
    created_at: now,
  };

  const quotations = readQuotations();
  const index = quotations.findIndex((item) => item.id === nextItem.id);

  if (index >= 0) {
    quotations[index] = {
      ...nextItem,
      created_at: quotations[index].created_at || now,
    };
  } else {
    quotations.push(nextItem);
  }

  writeQuotations(quotations);
  return nextItem;
}

// 모든 Quotation 가져오기 (최신순)
export async function getAllQuotations() {
  return readQuotations().sort((a, b) => {
    const aTime = new Date(a.created_at || 0).getTime();
    const bTime = new Date(b.created_at || 0).getTime();
    return bTime - aTime;
  });
}

// Quotation 업데이트 (partial merge)
export async function updateQuotation(id: string, updates: Partial<SupabaseQuotation>) {
  const quotations = readQuotations();
  const index = quotations.findIndex((item) => item.id === id);

  if (index < 0) {
    throw new Error(`Quotation not found: ${id}`);
  }

  const updated = {
    ...quotations[index],
    ...updates,
  };
  quotations[index] = updated;
  writeQuotations(quotations);

  return updated;
}

// Quotation 삭제
export async function deleteQuotation(id: string) {
  const quotations = readQuotations();
  const filtered = quotations.filter((item) => item.id !== id);
  writeQuotations(filtered);
}

// 모든 Quotation 삭제
export async function deleteAllQuotations() {
  localStorage.removeItem(QUOTATIONS_STORAGE_KEY);
}

// 레거시 localStorage 데이터 정규화 (호환용)
export async function migrateFromLocalStorage() {
  try {
    const localData = localStorage.getItem(QUOTATIONS_STORAGE_KEY);
    if (!localData) {
      console.log('정규화할 데이터가 없습니다.');
      return;
    }

    const parsed = JSON.parse(localData);
    if (!Array.isArray(parsed)) {
      writeQuotations([]);
      return;
    }

    const normalized = parsed.map((q) => {
      // 신규 포맷이면 그대로 유지
      if (q.company_name && q.contact_name && q.quotation_data) {
        return q as SupabaseQuotation;
      }

      // 레거시 포맷을 현재 포맷으로 변환
      return {
        id: q.id || `Q-${Date.now()}`,
        company_name: q.data?.companyName || '',
        contact_name: q.data?.contactName || '',
        phone: q.data?.phone || '',
        email: q.data?.email || '',
        printer_model: q.data?.printerModel || '',
        quantity: q.data?.quantity || 1,
        rental_period: q.data?.rentalPeriod || 3,
        usage: Array.isArray(q.data?.usage) ? q.data.usage.join(', ') : (q.data?.usage || ''),
        print_types: q.data?.printTypes,
        daily_print_quantity: q.data?.dailyPrintQuantity,
        address: q.data?.address,
        detailed_address: q.data?.detailedAddress,
        signature: q.signature,
        status: (q.status || 'pending') as 'pending' | 'signed' | 'submitted',
        created_at: q.createdAt || new Date().toISOString(),
        signed_at: q.signedAt,
        submitted_at: q.submittedAt,
        quotation_data: q.data || {},
      } as SupabaseQuotation;
    });

    writeQuotations(normalized);
    console.log(`${normalized.length}개 견적 데이터 정규화 완료`);
  } catch (error) {
    console.error('데이터 정규화 오류:', error);
    throw error;
  }
}
