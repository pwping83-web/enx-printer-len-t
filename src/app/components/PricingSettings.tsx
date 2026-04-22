import { useState, useEffect } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import { PricingConfig, ModelPricing, getPricingConfig, savePricingConfig, resetPricingConfig } from '../utils/pricingConfig';

export function PricingSettings() {
  const [config, setConfig] = useState<PricingConfig>(getPricingConfig());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setConfig(getPricingConfig());
  }, []);

  const handleSave = () => {
    try {
      savePricingConfig(config);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      // 페이지 새로고침하여 변경사항 반영
      window.dispatchEvent(new Event('pricingConfigUpdated'));
    } catch (error) {
      alert('저장에 실패했습니다.');
    }
  };

  const handleReset = () => {
    if (confirm('기본 설정으로 초기화하시겠습니까?')) {
      resetPricingConfig();
      setConfig(getPricingConfig());
      window.dispatchEvent(new Event('pricingConfigUpdated'));
    }
  };

  const updateModelPricing = (
    model: keyof PricingConfig['models'],
    period: keyof ModelPricing,
    value: number
  ) => {
    setConfig((prev) => ({
      ...prev,
      models: {
        ...prev.models,
        [model]: {
          ...prev.models[model],
          [period]: value,
        },
      },
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">가격 설정 관리</h2>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            초기화
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            저장
          </button>
        </div>
      </div>

      {saved && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
          ✓ 가격 설정이 저장되었습니다.
        </div>
      )}

      <div className="space-y-8">
        {/* Epson 3156 A4 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Epson 3156 A4 (소형)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                3개월 계약 (기본)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">₩</span>
                <input
                  type="number"
                  value={config.models.epson3156A4.threeMonths}
                  onChange={(e) => updateModelPricing('epson3156A4', 'threeMonths', Number(e.target.value))}
                  className="w-full pl-8 pr-16 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  step="1000"
                />
                <span className="absolute right-3 top-2.5 text-gray-500">/월</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                6개월 계약 (할인가)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">₩</span>
                <input
                  type="number"
                  value={config.models.epson3156A4.sixMonths}
                  onChange={(e) => updateModelPricing('epson3156A4', 'sixMonths', Number(e.target.value))}
                  className="w-full pl-8 pr-16 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  step="1000"
                />
                <span className="absolute right-3 top-2.5 text-gray-500">/월</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                12개월 계약 (최저가)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">₩</span>
                <input
                  type="number"
                  value={config.models.epson3156A4.twelveMonths}
                  onChange={(e) => updateModelPricing('epson3156A4', 'twelveMonths', Number(e.target.value))}
                  className="w-full pl-8 pr-16 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  step="1000"
                />
                <span className="absolute right-3 top-2.5 text-gray-500">/월</span>
              </div>
            </div>
          </div>
        </div>

        {/* Epson 1390 A3 */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Epson 1390 A3 ⭐ (중형)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                3개월 계약 (기본)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">₩</span>
                <input
                  type="number"
                  value={config.models.epson1390A3.threeMonths}
                  onChange={(e) => updateModelPricing('epson1390A3', 'threeMonths', Number(e.target.value))}
                  className="w-full pl-8 pr-16 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  step="1000"
                />
                <span className="absolute right-3 top-2.5 text-gray-500">/월</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                6개월 계약 (할인가)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">₩</span>
                <input
                  type="number"
                  value={config.models.epson1390A3.sixMonths}
                  onChange={(e) => updateModelPricing('epson1390A3', 'sixMonths', Number(e.target.value))}
                  className="w-full pl-8 pr-16 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  step="1000"
                />
                <span className="absolute right-3 top-2.5 text-gray-500">/월</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                12개월 계약 (최저가)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">₩</span>
                <input
                  type="number"
                  value={config.models.epson1390A3.twelveMonths}
                  onChange={(e) => updateModelPricing('epson1390A3', 'twelveMonths', Number(e.target.value))}
                  className="w-full pl-8 pr-16 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  step="1000"
                />
                <span className="absolute right-3 top-2.5 text-gray-500">/월</span>
              </div>
            </div>
          </div>
        </div>

        {/* Epson 3880/P800 A2 */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Epson 3880/P800 A2 (대형)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                3개월 계약 (기본)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">₩</span>
                <input
                  type="number"
                  value={config.models.epson3880P800A2.threeMonths}
                  onChange={(e) => updateModelPricing('epson3880P800A2', 'threeMonths', Number(e.target.value))}
                  className="w-full pl-8 pr-16 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  step="1000"
                />
                <span className="absolute right-3 top-2.5 text-gray-500">/월</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                6개월 계약 (할인가)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">₩</span>
                <input
                  type="number"
                  value={config.models.epson3880P800A2.sixMonths}
                  onChange={(e) => updateModelPricing('epson3880P800A2', 'sixMonths', Number(e.target.value))}
                  className="w-full pl-8 pr-16 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  step="1000"
                />
                <span className="absolute right-3 top-2.5 text-gray-500">/월</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                12개월 계약 (최저가)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">₩</span>
                <input
                  type="number"
                  value={config.models.epson3880P800A2.twelveMonths}
                  onChange={(e) => updateModelPricing('epson3880P800A2', 'twelveMonths', Number(e.target.value))}
                  className="w-full pl-8 pr-16 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  step="1000"
                />
                <span className="absolute right-3 top-2.5 text-gray-500">/월</span>
              </div>
            </div>
          </div>
        </div>

        {/* 추가 옵션 */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">추가 옵션</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                인쇄 프로그램 월 임대료
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">₩</span>
                <input
                  type="number"
                  value={config.softwarePrice}
                  onChange={(e) => setConfig({ ...config, softwarePrice: Number(e.target.value) })}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  step="1000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                최초 설치비 (1회)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">₩</span>
                <input
                  type="number"
                  value={config.installationFee}
                  onChange={(e) => setConfig({ ...config, installationFee: Number(e.target.value) })}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  step="10000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                1개월 계약 할증률 (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={config.surcharges.oneMonth * 100}
                  onChange={(e) => setConfig({ 
                    ...config, 
                    surcharges: { 
                      ...config.surcharges, 
                      oneMonth: Number(e.target.value) / 100 
                    } 
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  step="1"
                  min="0"
                  max="100"
                />
                <span className="absolute right-3 top-2.5 text-gray-500">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 가격 계산 예시 */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">가격 계산 예시</h3>
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-6 space-y-3">
            <div className="grid grid-cols-4 gap-4 text-sm font-semibold text-gray-700 pb-2 border-b border-gray-300">
              <div>모델</div>
              <div className="text-center">3개월</div>
              <div className="text-center">6개월</div>
              <div className="text-center">12개월</div>
            </div>
            
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div className="text-gray-700 font-medium">A4</div>
              <div className="text-center">₩{config.models.epson3156A4.threeMonths.toLocaleString()}</div>
              <div className="text-center text-green-600 font-semibold">₩{config.models.epson3156A4.sixMonths.toLocaleString()}</div>
              <div className="text-center text-blue-600 font-bold">₩{config.models.epson3156A4.twelveMonths.toLocaleString()}</div>
            </div>

            <div className="grid grid-cols-4 gap-4 text-sm">
              <div className="text-gray-700 font-medium">A3 ⭐</div>
              <div className="text-center">₩{config.models.epson1390A3.threeMonths.toLocaleString()}</div>
              <div className="text-center text-green-600 font-semibold">₩{config.models.epson1390A3.sixMonths.toLocaleString()}</div>
              <div className="text-center text-blue-600 font-bold">₩{config.models.epson1390A3.twelveMonths.toLocaleString()}</div>
            </div>

            <div className="grid grid-cols-4 gap-4 text-sm">
              <div className="text-gray-700 font-medium">A2</div>
              <div className="text-center">₩{config.models.epson3880P800A2.threeMonths.toLocaleString()}</div>
              <div className="text-center text-green-600 font-semibold">₩{config.models.epson3880P800A2.sixMonths.toLocaleString()}</div>
              <div className="text-center text-blue-600 font-bold">₩{config.models.epson3880P800A2.twelveMonths.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}