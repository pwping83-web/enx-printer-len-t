import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://omqsbenvwyemjbmqgrqw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tcXNiZW52d3llbWpibXFncnF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MTIyMDAsImV4cCI6MjA4NjE4ODIwMH0.0BcO4B74LDz2DXO6e4H5FOKyw0GAIzJ_wmnKUl8TbJA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

// Quotation 저장
export async function saveQuotation(quotation: Omit<SupabaseQuotation, 'created_at'>) {
  const { data, error } = await supabase
    .from('quotations')
    .insert([quotation])
    .select()
    .single();

  if (error) {
    console.error('Quotation 저장 오류:', error);
    throw error;
  }

  return data;
}

// 모든 Quotation 가져오기
export async function getAllQuotations() {
  const { data, error } = await supabase
    .from('quotations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Quotation 조회 오류:', error);
    throw error;
  }

  return data;
}

// Quotation 업데이트
export async function updateQuotation(id: string, updates: Partial<SupabaseQuotation>) {
  const { data, error } = await supabase
    .from('quotations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Quotation 업데이트 오류:', error);
    throw error;
  }

  return data;
}

// Quotation 삭제
export async function deleteQuotation(id: string) {
  const { error } = await supabase
    .from('quotations')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Quotation 삭제 오류:', error);
    throw error;
  }
}

// 모든 Quotation 삭제
export async function deleteAllQuotations() {
  const { error } = await supabase
    .from('quotations')
    .delete()
    .neq('id', ''); // 모든 행 삭제

  if (error) {
    console.error('모든 Quotation 삭제 오류:', error);
    throw error;
  }
}

// localStorage에서 Supabase로 마이그레이션
export async function migrateFromLocalStorage() {
  try {
    const localData = localStorage.getItem('quotations');
    if (!localData) {
      console.log('마이그레이션할 데이터가 없습니다.');
      return;
    }

    const quotations = JSON.parse(localData);
    console.log(`${quotations.length}개의 견적서를 마이그레이션합니다...`);

    for (const q of quotations) {
      const supabaseQuotation: Omit<SupabaseQuotation, 'created_at'> = {
        id: q.id,
        company_name: q.data.companyName,
        contact_name: q.data.contactName,
        phone: q.data.phone,
        email: q.data.email,
        printer_model: q.data.printerModel,
        quantity: q.data.quantity,
        rental_period: q.data.rentalPeriod,
        usage: q.data.usage,
        print_types: q.data.printTypes,
        daily_print_quantity: q.data.dailyPrintQuantity,
        address: q.data.address,
        detailed_address: q.data.detailedAddress,
        signature: q.signature,
        status: q.status,
        signed_at: q.signedAt,
        submitted_at: q.submittedAt,
        quotation_data: q.data,
      };

      await saveQuotation(supabaseQuotation);
    }

    console.log('마이그레이션 완료!');
    // 백업 후 삭제
    localStorage.setItem('quotations_backup', localData);
    localStorage.removeItem('quotations');
  } catch (error) {
    console.error('마이그레이션 오류:', error);
    throw error;
  }
}
