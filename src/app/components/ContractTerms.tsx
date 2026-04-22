import { ScrollText } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ContractTermsProps {
  isEditMode?: boolean;
  onSave?: (html: string) => void;
}

export function ContractTerms({ isEditMode = false, onSave }: ContractTermsProps) {
  const [termsHtml, setTermsHtml] = useState('');
  const [editedContent, setEditedContent] = useState('');

  useEffect(() => {
    loadTerms();
    
    // 약관 업데이트 이벤트 리스너
    const handleTermsUpdate = () => {
      loadTerms();
    };
    
    window.addEventListener('contractTermsUpdated', handleTermsUpdate);
    
    return () => {
      window.removeEventListener('contractTermsUpdated', handleTermsUpdate);
    };
  }, []);

  useEffect(() => {
    if (isEditMode) {
      setEditedContent(termsHtml);
    }
  }, [isEditMode, termsHtml]);

  const loadTerms = () => {
    const saved = localStorage.getItem('contract_terms');
    if (saved) {
      setTermsHtml(saved);
    } else {
      // 기본 약관
      const defaultTerms = getDefaultTerms();
      setTermsHtml(defaultTerms);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(editedContent);
    }
  };

  const getDefaultTerms = () => {
    return `<h2 style="text-align: center; font-weight: bold; font-size: 1.5rem; margin-bottom: 2rem;">식용 프린터기 렌탈 계약서</h2>

<p style="margin-bottom: 1.5rem; line-height: 1.8;">
  <strong>(EN)프린터</strong> (이하 "갑"이라 칭함.) 와 <strong>________________</strong> (이하 "을"이라 칭함.) 와의 
  물품 <strong>식용 평판프린터 기기</strong> 의 공유(이하 "공유물건"이라 칭함.)에 관하여 다음과 같이 계약을 체결한다.
</p>

<h3 style="font-weight: bold; margin-top: 2rem; margin-bottom: 1rem;">제 1 조 (렌탈 장비 및 계약기간)</h3>
<div style="margin-left: 1.5rem; line-height: 1.8;">
  <p>1. 렌탈 장비는 식용 프린터 및 관련 출력 장비 일체로 한다.</p>
  <p>2. 기본 렌탈 계약기간은 최소 3개월로 하며, 계약기간 내 중도 해지 시 잔여 기간 렌탈료가 청구될 수 있다.</p>
  <p>3. 계약 종료 후 연장 여부는 상호 협의에 따라 결정한다.</p>
  <p>4. 계약 연장 시 연장 1주전까지 을의 별도 의사표시가 없을 시 계약은 자동 종료된다.</p>
</div>

<h3 style="font-weight: bold; margin-top: 2rem; margin-bottom: 1rem;">제 2 조 (비용)</h3>
<div style="margin-left: 1.5rem; line-height: 1.8;">
  <p>설치비용 (선결제) <strong>150,000원 ~ 170,000원 (vat별도)</strong></p>
  <p>회수비용 (선결제) <strong>170,000원 (vat별도)</strong></p>
  <p>3개월 후 반납시 회수비 <strong>170,000원 (vat별도)</strong></p>
  <p>6개월 후 반납시 회수비 <strong>85,000원 (vat별도)</strong></p>
  <p>9개월 후 반납시 <strong>회수비 없음</strong></p>
  <p style="margin-top: 0.5rem;">설치비용과 회수비용은 선결제로 한다.</p>
  <p>2회, 3회차 계약 갱신시 마다 회수 비용은 렌탈 사용료에서 차감된다.</p>
</div>

<h3 style="font-weight: bold; margin-top: 2rem; margin-bottom: 1rem;">제 3 조 (장비 관리 책임)</h3>
<p style="margin-left: 1.5rem; line-height: 1.8;">
  "을"은 공유물건에 대하여 항상 최선의 주의를 하며 선량한 관리자의 주의로써 상용하고 
  손상, 훼손하지 않도록 노력한다.
  만약 "을"의 귀책사유로 손해가 발생한 경우는 즉시 "갑"에게 보고하고 "을"의 비용으로 
  완전히 보상한다. (화재, 누수, 파손, 기타등...)
</p>

<h3 style="font-weight: bold; margin-top: 2rem; margin-bottom: 1rem;">제 4 조 (장비 반납)</h3>
<p style="margin-left: 1.5rem; line-height: 1.8;">
  본 계약이 완료했을 경우 "을"은 즉시 공유물건을 반납하며 반납 전 점검 후 보수 완비하고 "을"의 귀책사유로 손해가 발생한 경우는 "을"의 비용으로 완전히 보상 후 "갑"에게 반환한다.
  (프린터 부품손실, 손상 기타등등)
</p>

<h3 style="font-weight: bold; margin-top: 2rem; margin-bottom: 1rem;">제 5 조 (계약 해제)</h3>
<div style="margin-left: 1.5rem; line-height: 1.8;">
  <p>다음의 경우 "갑"은 "을"에 대한 보상 없이 단독의사로 계약을 해제할 수 있다:</p>
  <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
    <li style="margin: 0.5rem 0;">• 렌탈료 2회 이상 미납</li>
    <li style="margin: 0.5rem 0;">• 장비 임의 개조</li>
    <li style="margin: 0.5rem 0;">• 제3자 재임대 또는 양도</li>
    <li style="margin: 0.5rem 0;">• 계약 조항 위반</li>
  </ul>
</div>

<h3 style="font-weight: bold; margin-top: 2rem; margin-bottom: 1rem;">제 6 조 (중도 해지)</h3>
<p style="margin-left: 1.5rem; line-height: 1.8;">
  계약 중 을이 계약해지 시 계약금은 반환되지 않는다.
</p>

<h3 style="font-weight: bold; margin-top: 2rem; margin-bottom: 1rem;">제 7 조 (설치 및 교육)</h3>
<div style="margin-left: 1.5rem; line-height: 1.8;">
  <p>7-1. "갑"은 지그판 정렬 및 맞춤을 1회 설정한다.</p>
  <p>7-2. 최초 설치 시 기본 사용 방법 및 관리 교육이 제공된다.</p>
  <p>7-3. 일러스트 편집 프로그램과, 인쇄프로그램 작동법을 "을"이 사용 가능한 상태로 교육해 준다.</p>
  <p>7-4. 설치 및 교육은 1회임 (추가 요청시 거리에 따른 비용이 추가 발생함)</p>
  <p>7-5. 설치 완료 및 교육 이후 발생하는 사용자 관리 미숙 문제는 사용자 책임으로 간주된다.</p>
  <p>7-6. 설치 교육은 사진 또는 영상 기록으로 보관될 수 있다.</p>
</div>

<h3 style="font-weight: bold; margin-top: 2rem; margin-bottom: 1rem;">제 8 조 (장비 사용 및 관리 의무)</h3>
<div style="margin-left: 1.5rem; line-height: 1.8;">
  <p style="margin-bottom: 0.75rem;"><strong>"을"은 장비 보호를 위해 다음 사항을 준수해야 한다:</strong></p>
  
  <p>8-1. 잉크 추가 보충은 "을"이 보충 한다.</p>
  <p>8-2. 잉크 색상 맞춤 작업은 교육받은 프로그램에서 "을"이 한다.</p>
  <p>8-3. <strong>헤드 청소를 정해진 기간마다 인쇄 시작 전 실행한다.</strong></p>
  <p>8-4. <strong>최소 주 2회 이상 테스트 출력을 권장한다.</strong></p>
  <p>8-5. <strong>정기 노즐 체크 및 세척을 수행한다.</strong></p>
  <p>8-6. <strong>지정 환경(온도·습도)을 유지한다.</strong></p>
  <p>8-7. 공유물건 사용 시 사용자가 상주해야 하며 사용 종료 시 전원을 차단 시킨다.</p>
  <p>8-8. 주변에 전자기기를 두면 오작동 할 수 있다.</p>
  <p style="margin-top: 0.75rem; color: #dc2626; font-weight: 600;">
    ※ 미사용 또는 관리 소홀로 발생한 문제는 유지보수 대상에서 제외된다.
  </p>
</div>

<h3 style="font-weight: bold; margin-top: 2rem; margin-bottom: 1rem;">제 9 조 (소모품 규정)</h3>
<div style="margin-left: 1.5rem; line-height: 1.8;">
  <p>9-1. 식용 잉크 및 소모품은 사용자가 별도 구매한다.</p>
  <p>9-2. "갑"은 "을"에게 국산잉크(국내 허가) 와 수입산(국내 불허가) 잉크가 있다는 것을 고지한다.</p>
  <p>9-3. 수입산 잉크보다 국산잉크의 비용이 높지만 국산 잉크가 더 자주 막힌다.</p>
  <p>9-4. 비정상 소모품 사용 또는 혼합 사용으로 발생한 고장은 유상 처리된다.</p>
  <p>9-5. "을"의 잘못된 판단으로 인한 출장시 거리에 따른 비용이 추가 발생한다.<br>
       &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(유통기한 지난 잉크, 용도와 맞지 않는 잉크, 기타등등)</p>
  <p>9-6. 일러스트는 체험판15일이 지나면 원칙상 어도비측에 사용료를 지불하여야 한다.</p>
</div>

<h3 style="font-weight: bold; margin-top: 2rem; margin-bottom: 1rem;">제 10 조 (무상 유지보수 범위)</h3>
<div style="margin-left: 1.5rem; line-height: 1.8;">
  <p style="margin-bottom: 0.75rem;">
    <strong>무상 유지보수는 다음 항목에 한하여 제공된다:</strong>
  </p>
  <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
    <li style="margin: 0.5rem 0;">• 장비 자체의 기계적 또는 전자적 결함</li>
    <li style="margin: 0.5rem 0;">• 정상 사용 중 발생한 시스템 오류</li>
    <li style="margin: 0.5rem 0;">• "을"이 사용하는 프린터의 잉크를 제외한 기기작동 부위는 "갑"이 모두 관리</li>
  </ul>
  
  <p style="margin-top: 1rem; margin-bottom: 0.5rem;"><strong>다음 사항은 사용자 관리 영역으로 유상 처리된다:</strong></p>
  <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
    <li style="margin: 0.5rem 0;">• 장기간 미사용으로 인한 헤드 막힘</li>
    <li style="margin: 0.5rem 0;">• 비정상 잉크 주입 및 공기 유입</li>
    <li style="margin: 0.5rem 0;">• 사용자 세척 미이행</li>
    <li style="margin: 0.5rem 0;">• 환경(온도/습도) 관리 소홀로 인한 문제</li>
    <li style="margin: 0.5rem 0;">• 사용자 과실로 인한 장비 이상</li>
    <li style="margin: 0.5rem 0;">• "을"의 인쇄물 높이조절 부주의로 헤드나 기타 부속장치에 부딪힘이 반복되어 기계 장치가 손상된 경우</li>
  </ul>
  
  <p style="margin-top: 0.75rem;">
    위 항목으로 인한 A/S 출장 시 지역에 따라 별도의 출장비 및 수리비가 발생할 수 있다.
  </p>
  
  <p style="margin-top: 0.75rem;">
    프린터 노즐 검사시 잉크 노즐이 정상적으로 나오면 프린터는 정상작동하는 것으로 간주한다.
  </p>
</div>

<h3 style="font-weight: bold; margin-top: 2rem; margin-bottom: 1rem;">제 11 조 (원격 지원 및 방문 서비스)</h3>
<div style="margin-left: 1.5rem; line-height: 1.8;">
  <p style="margin-bottom: 0.75rem;"><strong>원격 지원:</strong></p>
  <ul style="margin-left: 1.5rem;">
    <li style="margin: 0.5rem 0;">• 기본 원격 지원은 월 1회 무상 제공</li>
    <li style="margin: 0.5rem 0;">• 추가 원격 지원 요청 시 회당 30,000원 부과</li>
  </ul>
  
  <p style="margin-top: 1rem; margin-bottom: 0.75rem;"><strong>방문 AS 비용:</strong></p>
  <ul style="margin-left: 1.5rem;">
    <li style="margin: 0.5rem 0;">• 일반 방문 점검 : 70,000원 ~ 120,000원</li>
    <li style="margin: 0.5rem 0;">• 장거리 지역 : 거리별 추가 비용 발생</li>
  </ul>
  
  <p style="margin-top: 0.75rem; color: #dc2626;">
    ※ 현장 방문 서비스는 별도 출장비가 발생합니다.
  </p>
</div>

<h3 style="font-weight: bold; margin-top: 2rem; margin-bottom: 1rem;">제 12 조 (점검 및 수리 원칙)</h3>
<div style="margin-left: 1.5rem; line-height: 1.8;">
  <p>1. 모든 유지보수는 원격 지원 또는 장비 회수 점검을 원칙으로 한다.</p>
  <p>2. 현장 방문은 불가피한 경우에 한하여 진행된다.</p>
  <p>3. 구동부와 분리형 프린터로써 지역에 따라 수리가 필요한 프린터는 택배 발송 수리할 수 있다.</p>
  <p>4. 택배 회수 점검 시 왕복 배송비는 사용자 부담을 원칙으로 한다.</p>
</div>

<h3 style="font-weight: bold; margin-top: 2rem; margin-bottom: 1rem;">제 13 조 (장비 운송 및 이전)</h3>
<div style="margin-left: 1.5rem; line-height: 1.8;">
  <p>1. 장비 이동 또는 재설치는 반드시 공급자 사전 협의 후 진행해야 한다.</p>
  <p>2. 무단 이동으로 발생한 장비 손상은 사용자 책임이다.</p>
</div>

<h3 style="font-weight: bold; margin-top: 2rem; margin-bottom: 1rem;">제 14 조 (판매 책임)</h3>
<p style="margin-left: 1.5rem; line-height: 1.8;">
  "을"의 판매상 발생하는 상품의 모든 문제는 "을"이 책임진다.
</p>

<h3 style="font-weight: bold; margin-top: 2rem; margin-bottom: 1rem;">제 15 조 (기타)</h3>
<p style="margin-left: 1.5rem; line-height: 1.8;">
  본 계약의 조항 이외의 분쟁이 발생하였을 때는 "갑"과 "을"이 협의하여 정한다.
  본 계약체결을 증명하기 위하여 본 증서 2통을 작성하여 "갑"과 "을"이 각 1통씩 보관한다.
</p>

<hr style="margin: 2.5rem 0; border: none; border-top: 1px solid #e5e7eb;">

<div style="text-align: center; margin-top: 2rem;">
  <p style="font-size: 1.125rem; font-weight: bold; margin-bottom: 3rem;">계약일: 20____ 년 ____ 월 ____ 일</p>

  <div style="margin-top: 2.5rem; text-align: left; display: inline-block; min-width: 400px;">
    <p style="font-weight: bold; font-size: 1.125rem; margin-bottom: 1rem;">갑 (EN)프린터</p>
    <p style="margin: 0.5rem 0;">주 &nbsp;&nbsp;&nbsp; 소 : _________________________________</p>
    <p style="margin: 0.5rem 0;">대 표 자 : _________________________________</p>
    <p style="margin: 0.5rem 0;">연 락 처 : _________________________________</p>
  </div>

  <div style="margin-top: 3rem; text-align: left; display: inline-block; min-width: 400px;">
    <p style="font-weight: bold; font-size: 1.125rem; margin-bottom: 1rem;">을</p>
    <p style="margin: 0.5rem 0;">회 사 명 : _________________________________</p>
    <p style="margin: 0.5rem 0;">주 &nbsp;&nbsp;&nbsp; 소 : _________________________________</p>
    <p style="margin: 0.5rem 0;">대 표 자 : _________________________________</p>
    <p style="margin: 0.5rem 0;">연 락 처 : _________________________________</p>
  </div>
</div>

<div style="margin-top: 3rem; padding: 1.5rem; background: #f9fafb; border-radius: 0.75rem; border: 1px solid #e5e7eb;">
  <h4 style="font-weight: bold; margin-bottom: 1rem; font-size: 1.125rem;">문의처</h4>
  <p style="font-size: 0.9375rem; margin: 0.5rem 0; line-height: 1.6;">상호: (EN)프린터</p>
  <p style="font-size: 0.9375rem; margin: 0.5rem 0; line-height: 1.6;">주소: 서울특별시 강남구 테헤란로 123</p>
  <p style="font-size: 0.9375rem; margin: 0.5rem 0; line-height: 1.6;">대표전화: 1588-0000</p>
  <p style="font-size: 0.9375rem; margin: 0.5rem 0; line-height: 1.6;">이메일: contact@enprinter.com</p>
  <p style="font-size: 0.9375rem; margin: 0.5rem 0; line-height: 1.6;">사업자등록번호: 123-45-67890</p>
</div>`;
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b">
        <ScrollText className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-lg text-gray-900">계약 약관</h3>
      </div>

      {isEditMode ? (
        <div className="space-y-4">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm"
            placeholder="HTML 형식으로 약관을 작성하세요..."
          />
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
            >
              저장하기
            </button>
          </div>
        </div>
      ) : (
        <div 
          className="space-y-4 text-sm text-gray-700 prose prose-sm max-w-none max-h-96 overflow-y-auto"
          dangerouslySetInnerHTML={{ __html: termsHtml }}
        />
      )}
    </div>
  );
}

export function TermsAgreement({ 
  agreed, 
  onAgree 
}: { 
  agreed: boolean; 
  onAgree: (checked: boolean) => void;
}) {
  const [termsVisible, setTermsVisible] = useState(false); // 기본값을 false로 변경

  useEffect(() => {
    loadVisibility();
    
    // 약관 가시성 업데이트 이벤트 리스너
    const handleTermsUpdate = () => {
      loadVisibility();
    };
    
    window.addEventListener('contractTermsUpdated', handleTermsUpdate);
    
    return () => {
      window.removeEventListener('contractTermsUpdated', handleTermsUpdate);
    };
  }, []);

  const loadVisibility = () => {
    const visibility = localStorage.getItem('terms_visibility');
    if (visibility !== null) {
      setTermsVisible(visibility === 'true');
    } else {
      // 기본값을 비공개(false)로 설정
      setTermsVisible(false);
      localStorage.setItem('terms_visibility', 'false');
    }
  };

  // 약관이 숨겨져 있으면 렌더링하지 않음
  if (!termsVisible) {
    return null;
  }

  return (
    <div className="space-y-4">
      <ContractTerms />
      
      <label className="flex items-start gap-3 cursor-pointer p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => onAgree(e.target.checked)}
          className="mt-1 w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-600 focus:ring-2"
        />
        <div>
          <div className="font-semibold text-gray-900">
            프린터 렌탈 계약 약관에 동의합니다 (필수)
          </div>
          <div className="text-sm text-gray-600 mt-1">
            위 약관을 모두 읽었으며, 그 내용에 동의합니다.
          </div>
        </div>
      </label>
    </div>
  );
}