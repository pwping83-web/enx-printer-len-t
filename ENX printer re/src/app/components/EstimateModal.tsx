interface EstimateModalProps {
  formData: any;
  calculateAIEstimate: any;
  onClose: () => void;
}

export function EstimateModal({ formData, calculateAIEstimate, onClose }: EstimateModalProps) {
  // 🔥 만원 단위로 변환하는 함수
  const formatPriceInManwon = (price: number): string => {
    const manwon = price / 10000;
    if (manwon === Math.floor(manwon)) {
      // 정수인 경우 (예: 40만원, 80만원)
      return `${manwon}만원`;
    } else {
      // 소수점이 있는 경우 (예: 45.5만원)
      return `${manwon.toFixed(1)}만원`;
    }
  };

  const handlePayment = () => {
    alert("결제 페이지로 이동합니다.\n(실제 구현 시 결제 모듈 연동)");
    onClose();
  };

  // 고장 증상 포맷팅
  const symptomsText = formData.symptoms?.length > 0 
    ? formData.symptoms.map((s: string) => {
        const detail = formData.symptomDetails?.[s];
        return detail ? `• ${s}: ${detail}` : `• ${s}`;
      }).join('\n')
    : '선택 안함';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full my-8">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-lg">
          <h3 className="text-xl font-bold mb-2">프린터 수리 견적서</h3>
          <p className="text-sm text-blue-100">ENX 프린터 | 견적서 다운로드 서비스</p>
        </div>

        {/* 견적서 내용 */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* 프린터 기본 정보 */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b-2 border-gray-200">
              🖨️ 프린터 기본 정보
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">프린터 기종</span>
                <span className="font-semibold">{formData.printerType || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">고장 증상</span>
                <span className="font-semibold text-right ml-4 whitespace-pre-line">
                  {symptomsText}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">방문 희망 날짜</span>
                <span className="font-semibold">{formData.moveDate || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">방문 희망 시간</span>
                <span className="font-semibold">{formData.moveTime || '-'}</span>
              </div>
            </div>
          </div>

          {/* 고객 정보 */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b-2 border-gray-200">
              👤 고객 정보
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">고객명</span>
                <span className="font-semibold">{formData.customerName || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">연락처</span>
                <span className="font-semibold">{formData.customerPhone || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">방문 주소</span>
                <span className="font-semibold text-right ml-4">
                  {formData.visitAddress || '-'}
                  {formData.visitAddressDetail && <><br />{formData.visitAddressDetail}</>}
                </span>
              </div>
            </div>
          </div>

          {/* 견적 정보 */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b-2 border-gray-200">
              💰 견적 정보
            </h4>
            <div className="space-y-2 text-sm bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between">
                <span className="text-gray-600">기본 출장비</span>
                <span className="font-semibold">
                  {formatPriceInManwon(calculateAIEstimate.basePrice || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">거리 추가비</span>
                <span className="font-semibold">
                  {formatPriceInManwon(calculateAIEstimate.additionalCost || 0)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t-2 border-blue-200">
                <span className="text-gray-900 font-bold">예상 출장 점검비</span>
                <span className="font-bold text-blue-600 text-lg">
                  {formatPriceInManwon(calculateAIEstimate.totalPrice || 0)}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              ※ 부품 교체 및 수리비는 현장 점검 후 별도 안내됩니다.
            </p>
          </div>

          {/* 추가 메모 */}
          {formData.additionalNotes && (
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-2 pb-2 border-b-2 border-gray-200">
                📝 추가 요청사항
              </h4>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded whitespace-pre-line">
                {formData.additionalNotes}
              </p>
            </div>
          )}

          {/* 사진 정보 */}
          {formData.printerImages?.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-2 pb-2 border-b-2 border-gray-200">
                📸 첨부 사진/영상
              </h4>
              <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                <p className="font-semibold mb-2">총 {formData.printerImages.length}개 파일</p>
                <ul className="space-y-1 text-xs">
                  {formData.printerImages.map((file: File, idx: number) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-blue-600">•</span>
                      <span>{file.name}</span>
                      <span className="text-gray-500">({(file.size / 1024).toFixed(1)}KB)</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* 하단 서비스 안내 */}
        <div className="px-6 pb-4">
          <div className="bg-purple-50 border-2 border-purple-200 p-4 rounded-lg mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-900">견적서 PDF 다운로드</span>
              <span className="text-xl font-bold text-purple-600">2,200원</span>
            </div>
            <p className="text-xs text-gray-600">
              결제 후 이메일 또는 문자로 PDF 견적서가 즉시 전송됩니다.
            </p>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handlePayment}
              className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors shadow-md"
            >
              결제하고 다운로드
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}