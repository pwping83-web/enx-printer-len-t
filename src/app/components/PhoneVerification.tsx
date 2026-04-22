import { useState } from 'react';
import { Shield, Check, Phone } from 'lucide-react';
import { toast } from 'sonner';

interface PhoneVerificationProps {
  onVerified: () => void;
}

export function PhoneVerification({ onVerified }: PhoneVerificationProps) {
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [showVerificationInput, setShowVerificationInput] = useState(false);

  const handleSendCode = () => {
    if (!phone || phone.length < 10) {
      toast.error('올바른 전화번호를 입력해주세요');
      return;
    }

    // 6자리 인증번호 생성
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setShowVerificationInput(true);
    
    toast.success(`인증번호가 발송되었습니다: ${code}`, {
      duration: 5000,
      description: '실제 서비스에서는 SMS로 전송됩니다',
    });
  };

  const handleVerify = () => {
    if (verificationCode === generatedCode) {
      toast.success('✅ 인증이 완료되었습니다!');
      onVerified();
    } else {
      toast.error('❌ 인증번호가 일치하지 않습니다');
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300 rounded-xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-blue-600 rounded-full">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">업체 인증 필요</h3>
          <p className="text-sm text-gray-600">견적서 내용 확인을 위해 전화번호 인증이 필요합니다</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4" />
            전화번호
          </label>
          <div className="flex gap-2">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-0000-0000"
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              disabled={showVerificationInput}
            />
            <button
              type="button"
              onClick={handleSendCode}
              disabled={showVerificationInput}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
            >
              인증번호 받기
            </button>
          </div>
        </div>

        {showVerificationInput && (
          <div className="space-y-3 p-4 bg-white rounded-lg border-2 border-blue-200">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Check className="w-4 h-4 text-blue-600" />
              인증번호 입력
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="6자리 인증번호 입력"
                maxLength={6}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-center font-mono text-xl tracking-wider"
              />
              <button
                type="button"
                onClick={handleVerify}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold whitespace-nowrap"
              >
                인증 확인
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center">
              💡 데모용: 발송된 인증번호는 <span className="font-mono font-bold text-blue-600">{generatedCode}</span> 입니다
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-xs text-gray-700">
          <strong className="text-yellow-800">🔒 개인정보 보호:</strong> 견적서의 가격 정보는 업체 관계자만 확인 가능합니다
        </p>
      </div>
    </div>
  );
}
