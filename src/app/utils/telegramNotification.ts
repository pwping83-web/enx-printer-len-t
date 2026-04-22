// 텔레그램 봇 알림 관련 타입 정의
export interface TelegramNotification {
  id: string;
  type: 'quotation_created' | 'quotation_signed' | 'system_test';
  message: string;
  timestamp: string;
  status: 'sent' | 'failed' | 'pending';
}

// 텔레그램 봇 설정 가져오기
const getTelegramConfig = () => {
  const config = localStorage.getItem('telegram_config');
  if (config) {
    return JSON.parse(config);
  }
  return null;
};

// 텔레그램 메시지 전송 함수
export const sendTelegramNotification = async (
  type: 'quotation_created' | 'quotation_signed' | 'system_test',
  data: Record<string, string>
): Promise<TelegramNotification> => {
  const config = getTelegramConfig();
  
  if (!config || !config.connected || !config.botToken || !config.chatId) {
    throw new Error('텔레그램 봇이 설정되지 않았습니다');
  }

  // 메시지 템플릿 생성
  let message = '';
  
  if (type === 'quotation_created') {
    message = `🎨 *새로운 견적서 접수*\n\n` +
              `📋 *회사명:* ${data.companyName}\n` +
              `👤 *담당자:* ${data.contactName}\n` +
              `🖨️ *프린터:* ${data.printerModel}\n` +
              `📐 *사이즈:* ${data.printerSize}\n` +
              `🔢 *수량:* ${data.quantity}대\n` +
              `📅 *렌탈기간:* ${data.rentalPeriod}개월\n` +
              `🆔 *견적서ID:* ${data.quotationId}\n\n` +
              `⏰ ${new Date().toLocaleString('ko-KR')}`;
  } else if (type === 'quotation_signed') {
    message = `✅ *견적서 서명 완료*\n\n` +
              `📋 *회사명:* ${data.companyName}\n` +
              `👤 *담당자:* ${data.contactName}\n` +
              `🖨️ *프린터:* ${data.printerModel}\n` +
              `🔢 *수량:* ${data.quantity}대\n\n` +
              `✍️ *서명 완료 처리되었습니다*\n` +
              `⏰ ${new Date().toLocaleString('ko-KR')}`;
  } else if (type === 'system_test') {
    message = `🔔 *시스템 테스트 알림*\n\n` +
              `⏰ *테스트 시간:* ${data.testTime}\n` +
              `✅ *상태:* ${data.status}\n\n` +
              `텔레그램 봇 알림이 정상 작동합니다!`;
  }

  try {
    // 텔레그램 API 호출
    const response = await fetch(
      `https://api.telegram.org/bot${config.botToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: config.chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      }
    );

    const result = await response.json();

    const notification: TelegramNotification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date().toISOString(),
      status: result.ok ? 'sent' : 'failed',
    };

    // 로컬스토리지에 이력 저장
    const existingNotifications = JSON.parse(
      localStorage.getItem('telegram_notifications') || '[]'
    );
    existingNotifications.push(notification);
    localStorage.setItem('telegram_notifications', JSON.stringify(existingNotifications));

    if (result.ok) {
      return notification;
    } else {
      throw new Error(result.description || '전송 실패');
    }
  } catch (error) {
    const notification: TelegramNotification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date().toISOString(),
      status: 'failed',
    };

    // 실패 이력도 저장
    const existingNotifications = JSON.parse(
      localStorage.getItem('telegram_notifications') || '[]'
    );
    existingNotifications.push(notification);
    localStorage.setItem('telegram_notifications', JSON.stringify(existingNotifications));

    throw error;
  }
};

// 알림 이력 조회
export const getTelegramNotifications = (): TelegramNotification[] => {
  const notifications = localStorage.getItem('telegram_notifications');
  return notifications ? JSON.parse(notifications) : [];
};

// 알림 통계
export const getTelegramStats = () => {
  const notifications = getTelegramNotifications();
  return {
    total: notifications.length,
    sent: notifications.filter((n) => n.status === 'sent').length,
    failed: notifications.filter((n) => n.status === 'failed').length,
    pending: notifications.filter((n) => n.status === 'pending').length,
  };
};

// 텔레그램 봇 연결 테스트
export const testTelegramConnection = async (
  botToken: string,
  chatId: string
): Promise<boolean> => {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: '🎉 텔레그램 봇 연결 테스트 성공!\n\nMacaPrint 알림 시스템이 정상 작동합니다.',
          parse_mode: 'Markdown',
        }),
      }
    );

    const result = await response.json();
    return result.ok;
  } catch (error) {
    return false;
  }
};
