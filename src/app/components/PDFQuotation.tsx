import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { QuotationData } from './QuotationForm';
import { getPricingConfig } from '../utils/pricingConfig';

interface PDFQuotationProps {
  data: QuotationData;
  signature: string;
}

export function PDFQuotation({ data, signature }: PDFQuotationProps) {
  const config = getPricingConfig();
  
  const printerModels = [
    { 
      id: 'Epson-3156-A4', 
      name: 'Epson 3156 A4', 
      pricing: config.models.epson3156A4,
      installationFee: 150000
    },
    { 
      id: 'Epson-1390-A3', 
      name: 'Epson 1390 A3', 
      pricing: config.models.epson1390A3,
      installationFee: 170000
    },
    { 
      id: 'Epson-3880-P800-A2', 
      name: 'Epson 3880/P800 A2', 
      pricing: config.models.epson3880P800A2,
      installationFee: 170000
    },
  ];
  
  const selectedModel = printerModels.find((m) => m.id === data.printerModel);

  // Calculate monthly price based on rental period (same logic as main form)
  let monthlyPrice = 0;
  if (selectedModel) {
    if (data.rentalPeriod === 1) {
      monthlyPrice = Math.round(selectedModel.pricing.threeMonths * 1.35);
    } else if (data.rentalPeriod >= 12) {
      monthlyPrice = selectedModel.pricing.twelveMonths;
    } else if (data.rentalPeriod >= 6) {
      monthlyPrice = selectedModel.pricing.sixMonths;
    } else {
      monthlyPrice = selectedModel.pricing.threeMonths;
    }
  }

  const totalPrice = monthlyPrice * data.rentalPeriod * data.quantity;
  const installationFee = selectedModel?.installationFee || 170000;
  const subtotal = totalPrice + installationFee;
  const vat = Math.round(subtotal * 0.1);
  const grandTotalWithVat = subtotal + vat;

  const endDate = new Date(data.startDate);
  endDate.setMonth(endDate.getMonth() + data.rentalPeriod);

  return (
    <div style={{ 
      fontFamily: "'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
      padding: '18px 28px',
      paddingBottom: '18px',
      backgroundColor: '#ffffff',
      color: '#000000',
      fontSize: '11px'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#2563eb',
        color: '#ffffff',
        padding: '13px 18px',
        borderRadius: '6px',
        marginBottom: '12px'
      }}>
        <h1 style={{ 
          fontSize: '21px', 
          fontWeight: 'bold', 
          marginTop: 0,
          marginBottom: '3px',
          marginLeft: 0,
          marginRight: 0
        }}>
          렌탈 견적서
        </h1>
        <p style={{ fontSize: '12px', margin: '3px 0 0 0', color: '#dbeafe' }}>
          플랫베드 프린터 렌탈
        </p>
      </div>

      {/* Company Info */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '18px',
        marginBottom: '12px'
      }}>
        <div>
          <h2 style={{ 
            fontSize: '11px', 
            fontWeight: 'bold', 
            color: '#6b7280',
            marginBottom: '7px'
          }}>
            고객 정보
          </h2>
          <div style={{ lineHeight: '1.45', fontSize: '10px' }}>
            <p style={{ margin: '2px 0' }}>
              <strong>회사명:</strong> {data.companyName}
            </p>
            <p style={{ margin: '2px 0' }}>
              <strong>담당자:</strong> {data.contactName}
            </p>
            <p style={{ margin: '2px 0' }}>
              <strong>연락처:</strong> {data.phone}
            </p>
            <p style={{ margin: '2px 0' }}>
              <strong>이메일:</strong> {data.email}
            </p>
          </div>
        </div>

        <div>
          <h2 style={{ 
            fontSize: '11px', 
            fontWeight: 'bold', 
            color: '#6b7280',
            marginBottom: '7px'
          }}>
            공급자 정보
          </h2>
          <div style={{ lineHeight: '1.45', fontSize: '10px' }}>
            <p style={{ margin: '2px 0' }}>
              <strong>회사명:</strong> 이앤엑스 (ENX)
            </p>
            <p style={{ margin: '2px 0' }}>
              <strong>사업자번호:</strong> 302-47-00920
            </p>
            <p style={{ margin: '2px 0' }}>
              <strong>연락처:</strong> 010-4639-2673
            </p>
            <p style={{ margin: '2px 0' }}>
              <strong>주소:</strong> 인천 중구 운북동 506-59
            </p>
          </div>
        </div>
      </div>

      {/* Rental Details */}
      <div style={{ 
        borderTop: '1px solid #e5e7eb',
        paddingTop: '11px',
        marginBottom: '12px'
      }}>
        <h2 style={{ 
          fontSize: '11px', 
          fontWeight: 'bold', 
          color: '#6b7280',
          marginBottom: '7px'
        }}>
          렌탈 상세 내역
        </h2>
        <div style={{
          backgroundColor: '#f9fafb',
          padding: '11px',
          borderRadius: '6px',
          fontSize: '10px'
        }}>
          <div style={{ marginBottom: '5px', display: 'flex', justifyContent: 'space-between' }}>
            <span>프린터 모델</span>
            <strong>{selectedModel?.name}</strong>
          </div>
          <div style={{ marginBottom: '5px', display: 'flex', justifyContent: 'space-between' }}>
            <span>수량</span>
            <strong>{data.quantity}대</strong>
          </div>
          <div style={{ marginBottom: '5px', display: 'flex', justifyContent: 'space-between' }}>
            <span>렌탈 기간</span>
            <strong>{data.rentalPeriod}개월</strong>
          </div>
          <div style={{ marginBottom: '5px', display: 'flex', justifyContent: 'space-between' }}>
            <span>시작일</span>
            <strong>
              {format(new Date(data.startDate), 'yyyy년 MM월 dd일', { locale: ko })}
            </strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>종료일</span>
            <strong>
              {format(endDate, 'yyyy년 MM월 dd일', { locale: ko })}
            </strong>
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      <div style={{ 
        borderTop: '1px solid #e5e7eb',
        paddingTop: '11px',
        marginBottom: '12px'
      }}>
        <h2 style={{ 
          fontSize: '11px', 
          fontWeight: 'bold', 
          color: '#6b7280',
          marginBottom: '7px'
        }}>
          가격 산출 내역
        </h2>
        <div style={{ lineHeight: '1.55', fontSize: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span>프린터 월 렌탈료</span>
            <span>{monthlyPrice.toLocaleString()}원</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span>인쇄 프로그램 임대료</span>
            <span style={{ color: '#16a34a', fontWeight: 'bold' }}>무료 이벤트 (0원)</span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '3px',
            paddingTop: '5px',
            borderTop: '1px solid #d1d5db'
          }}>
            <span style={{ fontWeight: 'bold' }}>월 렌탈료 합계</span>
            <span style={{ fontWeight: 'bold' }}>{monthlyPrice.toLocaleString()}원</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span>수량</span>
            <span>× {data.quantity}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span>렌탈 기간</span>
            <span>× {data.rentalPeriod}개월</span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '3px',
            paddingTop: '7px',
            borderTop: '1px solid #d1d5db'
          }}>
            <span style={{ fontWeight: 'bold' }}>소계</span>
            <span style={{ fontWeight: 'bold' }}>{totalPrice.toLocaleString()}원</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span>설치비</span>
            <span>{installationFee.toLocaleString()}원</span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            paddingTop: '9px',
            borderTop: '2px solid #4b5563',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            <span>최종 결제 금액</span>
            <span style={{ color: '#2563eb' }}>{subtotal.toLocaleString()}원</span>
          </div>
          <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '3px' }}>
            부가세 별도 · 인쇄 프로그램 무료
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginTop: '8px',
            paddingTop: '8px',
            borderTop: '1px solid #d1d5db',
            fontSize: '10px'
          }}>
            <span>부가세 (10%)</span>
            <span>{vat.toLocaleString()}원</span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginTop: '5px',
            padding: '8px 10px',
            backgroundColor: '#fdf2f8',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            <span>부가세 포함 총금액</span>
            <span style={{ color: '#db2777' }}>{grandTotalWithVat.toLocaleString()}원</span>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div style={{ 
        borderTop: '1px solid #e5e7eb',
        paddingTop: '11px',
        marginBottom: '11px'
      }}>
        <h2 style={{ 
          fontSize: '11px', 
          fontWeight: 'bold',
          marginBottom: '7px'
        }}>
          📝 서비스 내용
        </h2>
        <ul style={{ 
          lineHeight: '1.35',
          paddingLeft: '15px',
          fontSize: '9px',
          color: '#374151',
          margin: 0
        }}>
          <li>정기 점검 및 유지보수 서비스가 포함되어 있습니다.</li>
          <li>소모품 및 부품 교체는 무상으로 제공됩니다.</li>
          <li>식용잉크는 국내산·수입산 구매 링크를 제공해 드립니다.</li>
          <li>중도 해지 시 위약금은 없으며, 기납부 렌탈료는 소멸됩니다.</li>
          <li>계약 기간 종료 후 재계약 또는 반환을 선택하실 수 있습니다.</li>
        </ul>
      </div>

      {/* Validity Notice */}
      <div style={{
        backgroundColor: '#fffbeb',
        border: '1px solid #fde68a',
        borderRadius: '6px',
        padding: '10px 12px',
        marginBottom: '12px',
        fontSize: '10px'
      }}>
        <p style={{ fontWeight: 'bold', color: '#92400e', margin: '0 0 4px 0' }}>
          견적 유효기간 안내
        </p>
        <p style={{ color: '#a16207', margin: 0, lineHeight: '1.5' }}>
          본 견적서는 서명일로부터 2주간(14일) 유효합니다.
          유효기간 경과 후에는 가격 및 조건이 변경될 수 있으며, 새로운 견적서를 요청해 주시기 바랍니다.
        </p>
      </div>

      {/* Signature */}
      <div style={{ 
        borderTop: '1px solid #e5e7eb',
        paddingTop: '11px'
      }}>
        <h2 style={{ 
          fontSize: '11px', 
          fontWeight: 'bold', 
          color: '#6b7280',
          marginBottom: '7px'
        }}>
          전자 서명
        </h2>
        <div style={{
          backgroundColor: '#f9fafb',
          padding: '11px',
          borderRadius: '6px'
        }}>
          <p style={{ fontSize: '10px', marginBottom: '8px' }}>
            위 내용을 확인하였으며, 계약 조건에 동의합니다.
          </p>
          <div style={{
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            backgroundColor: '#ffffff',
            padding: '7px',
            display: 'inline-block',
            marginBottom: '8px'
          }}>
            <img
              src={signature}
              alt="전자 서명"
              style={{ height: '50px', width: 'auto' }}
            />
          </div>
          <div style={{ fontSize: '9px', color: '#6b7280' }}>
            <p style={{ margin: '2px 0' }}>
              서명: {format(new Date(), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}
            </p>
            <p style={{ margin: '2px 0' }}>서명자: {data.contactName}</p>
          </div>
        </div>
      </div>
    </div>
  );
}