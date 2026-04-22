import { useState } from 'react';
import { Wrench, Send, Phone, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { sendContactUsEmail } from '../utils/emailNotification';

interface RepairRequest {
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  printerModel: string;
  issue: string;
  address: string;
  preferredDate: string;
}

export default function Repair() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [form, setForm] = useState<RepairRequest>({
    companyName: '',
    contactName: '',
    phone: '',
    email: '',
    printerModel: '',
    issue: '',
    address: '',
    preferredDate: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const message = [
        `[프린터 수리 접수]`,
        `프린터 모델: ${form.printerModel || '미기재'}`,
        `고장 증상: ${form.issue || '미기재'}`,
        `방문 주소: ${form.address || '미기재'}`,
        `희망 방문일: ${form.preferredDate || '미기재'}`,
      ].join('\n');

      await sendContactUsEmail({
        companyName: form.companyName || '미기재',
        contactName: form.contactName,
        phone: form.phone,
        email: form.email,
        message,
      });

      // Local backup for admin/reference
      const key = 'repair_requests';
      const prev = JSON.parse(localStorage.getItem(key) || '[]');
      prev.push({
        ...form,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem(key, JSON.stringify(prev));

      setIsDone(true);
      toast.success('수리 접수가 완료되었습니다.');
    } catch (error) {
      console.error('Repair request failed:', error);
      toast.error('수리 접수 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isDone) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-lg mx-auto bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-xl font-black text-gray-900 mb-2">수리 접수 완료</h1>
          <p className="text-sm text-gray-600 mb-6">
            접수가 정상 처리되었습니다. 담당자가 확인 후 연락드립니다.
          </p>
          <div className="flex gap-3">
            <Link
              to="/"
              className="flex-1 py-3 text-center rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
            >
              홈으로
            </Link>
            <a
              href="tel:010-4639-2673"
              className="flex-1 py-3 text-center rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors"
            >
              전화 상담
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 pb-24">
      <div className="max-w-lg mx-auto">
        <div className="mb-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-4 h-4" />
            렌탈 메인으로
          </Link>
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white mb-4">
          <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center mb-3">
            <Wrench className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black leading-tight">프린터 수리 접수</h1>
          <p className="text-sm text-white/80 mt-2">고장 증상을 남겨주시면 출장 수리 견적을 안내합니다.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3">
            <input
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              placeholder="회사명 (선택)"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            />
            <input
              required
              name="contactName"
              value={form.contactName}
              onChange={handleChange}
              placeholder="담당자명 *"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            />
            <input
              required
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="연락처 *"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            />
            <input
              required
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="이메일 *"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            />
            <input
              name="printerModel"
              value={form.printerModel}
              onChange={handleChange}
              placeholder="프린터 모델명"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            />
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="방문 주소"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            />
            <input
              type="date"
              name="preferredDate"
              value={form.preferredDate}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            />
            <textarea
              required
              name="issue"
              value={form.issue}
              onChange={handleChange}
              rows={5}
              placeholder="고장 증상을 자세히 적어주세요 *"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSubmitting ? '접수 중...' : '수리 접수하기'}
            {!isSubmitting && <Send className="w-4 h-4" />}
          </button>

          <a
            href="tel:010-4639-2673"
            className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold flex items-center justify-center gap-2 hover:bg-gray-50"
          >
            <Phone className="w-4 h-4" />
            전화 상담 연결
          </a>
        </form>
      </div>
    </div>
  );
}
