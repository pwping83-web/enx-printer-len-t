import { useState, useEffect } from 'react';
import { Mail, Save, AlertCircle } from 'lucide-react';
import { EmailConfig, saveEmailConfig } from '../utils/emailNotification';
import { toast } from 'sonner';

export default function EmailSettings() {
  const [config, setConfig] = useState<EmailConfig>({
    serviceId: 'service_fqfr4aj',
    templateId: 'template_cswgob8',
    publicKey: 'ZO6lfTIKXQoZzu-TU',
    adminEmail: 'tseizou@naver.com',
    enabled: true, // 항상 활성화
  });

  useEffect(() => {
    // 로컬 스토리지에서 설정 불러오기
    const saved = localStorage.getItem('email_config');
    if (saved) {
      const savedConfig = JSON.parse(saved);
      // enabled는 항상 true로 강제
      setConfig({ ...savedConfig, enabled: true });
    } else {
      // 저장된 설정이 없으면 기본값을 localStorage에 저장
      const defaultConfig = {
        serviceId: 'service_fqfr4aj',
        templateId: 'template_cswgob8',
        publicKey: 'ZO6lfTIKXQoZzu-TU',
        adminEmail: 'tseizou@naver.com',
        enabled: true,
      };
      localStorage.setItem('email_config', JSON.stringify(defaultConfig));
      setConfig(defaultConfig);
    }
  }, []);

  const handleSave = () => {
    if (!config.serviceId || !config.templateId || !config.publicKey || !config.adminEmail) {
      toast.error('모든 필드를 입력해주세요.');
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(config.adminEmail)) {
      toast.error('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    // enabled는 항상 true로 강제
    const configToSave = { ...config, enabled: true };
    saveEmailConfig(configToSave);
    toast.success('이메일 설정이 저장되었습니다.');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <Mail className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">이메일 알림 설정</h2>
        </div>

        {/* 안내 메시지 */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-700">
              <p className="font-semibold mb-2">📧 견적서 제출 시 자동으로 이메일 알림이 전송됩니다</p>
              <p className="text-xs text-gray-600">
                아래 EmailJS 정보를 입력하고 저장하세요. 무료 플랜은 월 200회까지 전송 가능합니다.
              </p>
            </div>
          </div>
        </div>

        {/* 설정 폼 */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service ID
            </label>
            <input
              type="text"
              value={config.serviceId}
              onChange={(e) => setConfig({ ...config, serviceId: e.target.value })}
              placeholder="service_xxxxxxx"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template ID
            </label>
            <input
              type="text"
              value={config.templateId}
              onChange={(e) => setConfig({ ...config, templateId: e.target.value })}
              placeholder="template_xxxxxxx"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Public Key
            </label>
            <input
              type="text"
              value={config.publicKey}
              onChange={(e) => setConfig({ ...config, publicKey: e.target.value })}
              placeholder="abcdefghijklmnopqr"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              관리자 이메일
            </label>
            <input
              type="email"
              value={config.adminEmail}
              onChange={(e) => setConfig({ ...config, adminEmail: e.target.value })}
              placeholder="admin@company.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              알림을 받을 관리자의 이메일 주소
            </p>
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="mt-6">
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Save className="w-5 h-5" />
            설정 저장
          </button>
        </div>

        {/* 이메일 템플릿 가이드 */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm font-semibold text-gray-900 mb-2">
            📧 이메일 템플릿 변수 (EmailJS에서 사용):
          </p>
          <div className="text-xs text-gray-600 space-y-1 font-mono">
            <p>• {`{{to_email}}`} - 수신자 이메일</p>
            <p>• {`{{company_name}}`} - 회사명</p>
            <p>• {`{{contact_name}}`} - 담당자명</p>
            <p>• {`{{phone}}`} - 연락처</p>
            <p>• {`{{email}}`} - 고객 이메일</p>
            <p>• {`{{printer_model}}`} - 프린터 모델</p>
            <p>• {`{{rental_period}}`} - 렌탈 기간</p>
            <p>• {`{{usage}}`} - 사용 용도</p>
            <p>• {`{{start_date}}`} - 시작일</p>
            <p>• {`{{total_price}}`} - 총 가격</p>
            <p>• {`{{quotation_id}}`} - 견적서 ID</p>
            <p>• {`{{admin_link}}`} - 관리자 페이지 링크</p>
            <p>• {`{{created_at}}`} - 생성일시</p>
          </div>
        </div>
      </div>
    </div>
  );
}