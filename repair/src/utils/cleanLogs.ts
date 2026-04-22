// 콘솔 로그 정리 유틸리티
export const cleanupLogs = () => {
  // 프로덕션 환경에서는 console.log 비활성화
  if (process.env.NODE_ENV === 'production') {
    console.log = () => {};
    console.warn = () => {};
  }
};
