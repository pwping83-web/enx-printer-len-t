import { useEffect, useState } from 'react';

/**
 * @deprecated 더 이상 사용하지 않습니다. KakaoMap 컴포넌트가 자체적으로 로딩을 처리합니다.
 */
export function useKakaoLoader() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 아무것도 하지 않음 - deprecated
    console.warn('⚠️ useKakaoLoader는 더 이상 사용되지 않습니다.');
  }, []);

  return { isLoaded, error };
}
