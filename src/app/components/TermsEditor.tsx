import { useState, useEffect, useRef } from 'react';
import { Save, RotateCcw, FileText, AlertCircle, EyeOff, Eye } from 'lucide-react';
import { ContractTerms } from './ContractTerms';

/**
 * Default Contract Terms Template
 * - HTML-formatted contract terms with pricing checkboxes
 * - Includes all printer models and rental periods
 * - Supports contentEditable WYSIWYG editing
 */
const DEFAULT_TERMS = `<h3 style="text-align: center; font-weight: bold; margin-bottom: 1rem;">식용 프린터기 렌탈 계약서</h3>

<p style="margin-bottom: 1rem;">ENX 프린터 (이하 "갑"이라 칭함)와 ____________ (이하 "을"이라 칭함)는 식용 평판프린터 기기 렌탈에 관하여 다음과 같이 계약을 체결한다.</p>

<h4 style="font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.5rem;">제 1 조 (렌탈 요금)</h4>

<p style="margin-bottom: 0.5rem;"><strong>Epson 3156 A4 (소형)</strong></p>
<ul style="margin-left: 1.5rem; margin-bottom: 1rem; list-style: none;">
<li><input type="checkbox"> 1개월 계약: 월 201,000원 (VAT 별도)</li>
<li><input type="checkbox"> 3개월 계약: 월 149,000원 (VAT 별도)</li>
<li><input type="checkbox"> 6개월 계약: 월 139,000원 (VAT 별도)</li>
<li><input type="checkbox"> 12개월 계약: 월 129,000원 (VAT 별도)</li>
</ul>

<p style="margin-bottom: 0.5rem;"><strong>Epson 1390 A3 (중형) ⭐ 추천</strong></p>
<ul style="margin-left: 1.5rem; margin-bottom: 1rem; list-style: none;">
<li><input type="checkbox"> 1개월 계약: 월 296,000원 (VAT 별도)</li>
<li><input type="checkbox"> 3개월 계약: 월 219,000원 (VAT 별도)</li>
<li><input type="checkbox"> 6개월 계약: 월 209,000원 (VAT 별도)</li>
<li><input type="checkbox"> 12개월 계약: 월 199,000원 (VAT 별도)</li>
</ul>

<p style="margin-bottom: 0.5rem;"><strong>Epson 3880/P800 A2 (대형)</strong></p>
<ul style="margin-left: 1.5rem; margin-bottom: 1rem; list-style: none;">
<li><input type="checkbox"> 1개월 계약: 월 377,000원 (VAT 별도)</li>
<li><input type="checkbox"> 3개월 계약: 월 279,000원 (VAT 별도)</li>
<li><input type="checkbox"> 6개월 계약: 월 269,000원 (VAT 별도)</li>
<li><input type="checkbox"> 12개월 계약: 월 259,000원 (VAT 별도)</li>
</ul>

<p style="color: #dc2626; margin-bottom: 0.5rem;">※ 인쇄 프로그램 월 임대료: <strong>15,000원 (VAT 별도)</strong></p>
<p style="color: #dc2626; margin-bottom: 1rem;">※ 최초 설치비: <strong>170,000원 (1회 한정, VAT 별도)</strong></p>

<h4 style="font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.5rem;">제 2 조 (보관 및 관리)</h4>
<p style="margin-bottom: 1rem;">"을"은 장비 대여에 따른 완전한 보관 의무가 있으며, 장비 파손으로 인한 손상 시 배상 의무가 있다. 단, "을"의 과실이 없는 자연적 고장의 경우 "갑"이 무상 수리한다.</p>

<h4 style="font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.5rem;">제 3 조 (반납)</h4>
<p style="margin-bottom: 1rem;">계약이 종료되면 장비를 안전한 보관 상태로 "갑"에게 반납하여야 하며, 파손 또는 분실 시 "을"이 배상한다.</p>

<h4 style="font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.5rem;">제 4 조 (계약 기간)</h4>
<p style="margin-bottom: 1rem;">본 계약의 기간은 계약서에 명시된 기간으로 하며, 연장 시에는 상호 협의하여 결정한다.</p>

<h4 style="font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.5rem;">제 5 조 (사용료 납부)</h4>
<ol style="margin-left: 1.5rem; margin-bottom: 1rem;">
<li>"을"은 매월 초 렌탈료를 "갑"에게 납부한다.</li>
<li>납부 지연 시 연체료가 부과될 수 있다.</li>
<li>"을"의 납부 지연이 3회 이상 발생할 경우 계약이 해지될 수 있다.</li>
</ol>

<h4 style="font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.5rem;">제 6 조 (문제 발생 시)</h4>
<p style="margin-bottom: 0.5rem;"><strong>6-1</strong> "갑"의 책임</p>
<ul style="margin-left: 1.5rem; margin-bottom: 1rem;">
<li>자연 고장 발생 시 "갑"이 무상으로 수리한다.</li>
<li>수리가 불가능한 경우 동일 기종으로 교체한다.</li>
</ul>

<p style="margin-bottom: 0.5rem;"><strong>6-2</strong> "을"의 책임</p>
<ul style="margin-left: 1.5rem; margin-bottom: 1rem;">
<li>"을"의 과실로 인한 파손은 "을"이 수리비를 부담한다.</li>
<li>임의 분해, 개조 등으로 인한 고장은 "을"의 책임으로 한다.</li>
</ul>

<h4 style="font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.5rem;">제 7 조 (계약 해지)</h4>
<p style="margin-bottom: 1rem;">계약 기간 중 중도 해지 시에는 위약금이 부과될 수 있으며, 상호 협의하여 결정한다.</p>

<h4 style="font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.5rem;">제 8 조 (기타)</h4>
<p style="margin-bottom: 1rem;">본 계약서에 명시되지 않은 사항은 "갑"과 "을"이 상호 협의하여 결정한다. 본 계약 체결을 증명하기 위하여 본 증서 2통을 작성하여 "갑"과 "을"이 각 1통씩 보관한다.</p>

<hr style="margin: 2rem 0; border: 1px solid #ccc;">

<div style="text-align: center; margin-top: 2rem;">
<p><strong>2026년    월    일</strong></p>

<div style="margin-top: 2rem;">
<p><strong>갑 (공급자):</strong></p>
<p>회사명: ENX 프린터</p>
<p>대표자: ___________</p>
<p>주   소: ___________</p>
</div>

<div style="margin-top: 2rem;">
<p><strong>을 (임차인):</strong></p>
<p>회사명: ___________</p>
<p>대표자: ___________</p>
<p>주   소: ___________</p>
</div>
</div>`;

/**
 * Terms Editor Component
 * - WYSIWYG editor for contract terms management
 * - Features: contentEditable div, live preview, visibility toggle
 * - Saves to localStorage for persistence
 * 
 * Key Features:
 * - contentEditable div for direct HTML editing (like Word)
 * - Live preview with split-screen layout
 * - Show/Hide toggle for customer-facing quotations
 * - Save/Reset functionality
 * - Auto-sync with quotation preview
 * 
 * Storage Keys:
 * - contract_terms: HTML content of terms
 * - terms_visibility: true/false for customer visibility
 */
export default function TermsEditor() {
  const [terms, setTerms] = useState('');
  const [isSaved, setIsSaved] = useState(true);
  const [termsVisible, setTermsVisible] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Load terms and visibility on mount
  useEffect(() => {
    loadTerms();
    loadVisibility();
  }, []);

  const loadTerms = () => {
    const saved = localStorage.getItem('contract_terms');
    if (saved) {
      setTerms(saved);
    } else {
      setTerms(DEFAULT_TERMS);
    }
  };

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

  const handleSave = () => {
    // contentEditable div에서 HTML 가져오기
    const content = editorRef.current?.innerHTML || '';
    localStorage.setItem('contract_terms', content);
    setTerms(content);
    setIsSaved(true);
    
    // 약관 업데이트 이벤트 발생
    window.dispatchEvent(new Event('contractTermsUpdated'));
    
    alert('계약 약관이 저장되었습니다! ✅');
  };

  const handleToggleVisibility = () => {
    const newVisibility = !termsVisible;
    setTermsVisible(newVisibility);
    localStorage.setItem('terms_visibility', String(newVisibility));
    
    // 약관 가시성 업데이트 이벤트 발생
    window.dispatchEvent(new Event('contractTermsUpdated'));
    
    alert(newVisibility ? '약관이 고객에게 표시됩니다. ✅' : '약관이 고객에게 숨겨집니다. 🔒');
  };

  const handleReset = () => {
    if (confirm('기본 약관으로 되돌리시겠습니까? 현재 내용은 삭제됩니다.')) {
      setTerms(DEFAULT_TERMS);
      if (editorRef.current) {
        editorRef.current.innerHTML = DEFAULT_TERMS;
      }
      setIsSaved(false);
    }
  };

  const handleInput = () => {
    setIsSaved(false);
  };

  return (
    <div className="space-y-3 sm:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-lg">
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <FileText className="w-5 h-5 sm:w-7 sm:h-7" />
            <h2 className="text-lg sm:text-2xl font-bold">계약 약관 관리</h2>
          </div>
          <p className="text-xs sm:text-base text-blue-100">
            약관 수정 및 관리
          </p>
          
          {/* 약관 표시 토글 스위치 */}
          <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 py-2 sm:px-4 sm:py-3">
            <span className="text-xs sm:text-sm font-semibold">고객 표시</span>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={handleToggleVisibility}
                className={`relative inline-flex h-6 w-11 sm:h-7 sm:w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 ${
                  termsVisible ? 'bg-green-500' : 'bg-gray-400'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 sm:h-5 sm:w-5 transform rounded-full bg-white shadow-lg transition-transform ${
                    termsVisible ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              {termsVisible ? (
                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleSave}
          disabled={isSaved}
          className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg text-xs sm:text-sm font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          저장
        </button>

        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg text-xs sm:text-sm font-bold hover:shadow-lg transition-all"
        >
          <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          {showPreview ? '미리보기 숨김' : '미리보기'}
        </button>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-lg text-xs sm:text-sm font-bold hover:shadow-lg transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          초기화
        </button>
      </div>

      {/* Save Status */}
      {!isSaved && (
        <div className="flex items-center gap-2 p-3 sm:p-4 bg-orange-50 border-2 border-orange-200 rounded-lg sm:rounded-xl text-orange-800">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <p className="text-xs sm:text-sm font-medium">
            저장되지 않은 변경사항이 있습니다.
          </p>
        </div>
      )}

      {/* 약관 가시성 안내 */}
      {!termsVisible && (
        <div className="flex items-center gap-2 p-3 sm:p-4 bg-gray-50 border-2 border-gray-300 rounded-lg sm:rounded-xl text-gray-700">
          <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <p className="text-xs sm:text-sm font-medium">
            약관 <strong>숨김</strong> 상태 (고객은 약관 동의 없이 서명 가능)
          </p>
        </div>
      )}

      {/* Editor + Preview 동시 표시 */}
      <div className={`grid ${showPreview ? 'lg:grid-cols-2' : 'grid-cols-1'} gap-3 sm:gap-4`}>
        {/* Editor */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-2 border-slate-200 p-3 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
              약관 편집
            </h3>
            <div className="text-xs sm:text-sm text-slate-600 hidden sm:block">
              HTML 태그 사용 가능
            </div>
          </div>

          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            className="w-full h-[500px] sm:h-[700px] px-3 py-2 sm:px-4 sm:py-3 border-2 border-slate-200 rounded-lg sm:rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-xs sm:text-sm overflow-y-auto bg-white"
            dangerouslySetInnerHTML={{ __html: terms }}
            style={{ 
              minHeight: '500px',
              lineHeight: '1.6'
            }}
          />
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-2 border-slate-200 p-3 sm:p-6">
            <h3 className="text-base sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
              미리보기
            </h3>
            <div className="p-3 sm:p-6 border-2 border-blue-200 rounded-lg sm:rounded-xl bg-blue-50/50 h-[500px] sm:h-[700px] overflow-y-auto">
              <div 
                className="prose prose-sm max-w-none text-xs sm:text-sm"
                dangerouslySetInnerHTML={{ __html: terms }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Instructions - 데스크톱에만 표시 */}
      <div className="hidden sm:block bg-blue-50 border-2 border-blue-200 rounded-xl p-4 sm:p-5">
        <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          사용 방법
        </h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">1.</span>
            <span>텍스트 영역에서 약관 내용을 수정하세요</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">2.</span>
            <span>HTML 태그로 제목, 강조, 색상 등을 적용하세요</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">3.</span>
            <span>"미리보기" 버튼으로 표시될 모습을 확인하세요</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">4.</span>
            <span>"저장" 버튼을 눌러야 변경사항이 적용됩니다</span>
          </li>
        </ul>
      </div>
    </div>
  );
}