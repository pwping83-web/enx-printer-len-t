import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from './emailConfig';

/**
 * Email Notification Utility
 * - Handles EmailJS integration for quotation notifications
 * - Sends emails to admin when quotations are created/signed
 * - Supports dynamic configuration from admin dashboard
 * 
 * Features:
 * - Quotation creation notifications
 * - Signature completion notifications
 * - Configurable email settings
 * - Error handling and logging
 */

// Initialize EmailJS (runs once on import)
emailjs.init(EMAILJS_CONFIG.publicKey);

// Track if 1st notification has been sent this session (prevent duplicates)
let customerInfoEmailSent = false;

export const resetCustomerInfoEmailFlag = () => {
  customerInfoEmailSent = false;
};

/**
 * Email Configuration Interface
 * - Stores EmailJS credentials and settings
 */
export interface EmailConfig {
  serviceId: string;      // EmailJS Service ID
  templateId: string;     // EmailJS Template ID
  publicKey: string;      // EmailJS Public Key
  adminEmail: string;     // Recipient email address
  enabled: boolean;       // Enable/disable email notifications
}

interface BaseTemplateData {
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  subject: string;
  quotationId?: string;
  printerModel?: string;
  rentalPeriod?: number | string;
  usage?: string | string[];
  startDate?: string;
  totalPrice?: number | string;
}

/**
 * Get Email Configuration
 * - Loads config from localStorage or uses defaults
 * - Admin can customize settings in dashboard
 * @returns {EmailConfig} Current email configuration
 */
const getEmailConfig = (): EmailConfig => {
  const config = localStorage.getItem('email_config');
  if (config) {
    const parsedConfig = JSON.parse(config);
    // Use admin-configured settings if enabled
    if (parsedConfig.enabled) {
      return parsedConfig;
    }
  }
  
  // Use default configuration (always enabled)
  return {
    serviceId: EMAILJS_CONFIG.serviceId,
    templateId: EMAILJS_CONFIG.templateId,
    publicKey: EMAILJS_CONFIG.publicKey,
    adminEmail: EMAILJS_CONFIG.recipientEmail,
    enabled: true,
  };
};

/**
 * Save Email Configuration
 * - Saves config to localStorage
 * @param {EmailConfig} config - Email configuration to save
 */
export const saveEmailConfig = (config: EmailConfig) => {
  localStorage.setItem('email_config', JSON.stringify(config));
};

const normalizeUsage = (usage?: string | string[]) => {
  if (!usage) return '미선택';
  return Array.isArray(usage) ? usage.join(', ') : usage;
};

const normalizeTotalPrice = (totalPrice?: number | string) => {
  if (typeof totalPrice === 'string') return totalPrice;
  if (typeof totalPrice === 'number') return `${(totalPrice / 10000).toFixed(0)}`;
  return '0';
};

const buildTemplateParams = (config: EmailConfig, payload: BaseTemplateData) => ({
  to_email: config.adminEmail,
  to_name: 'ENX 관리자',
  from_name: 'ENX 마카롱 프린터',
  reply_to: config.adminEmail,
  subject: payload.subject,
  company_name: payload.companyName,
  contact_name: payload.contactName,
  phone: payload.phone,
  email: payload.email,
  printer_model: payload.printerModel || '(미선택)',
  rental_period: payload.rentalPeriod ?? '(미선택)',
  usage: normalizeUsage(payload.usage),
  start_date: payload.startDate || '(미선택)',
  total_price: normalizeTotalPrice(payload.totalPrice),
  quotation_id: payload.quotationId || '-',
  admin_link: `${window.location.origin}/admin`,
  created_at: new Date().toLocaleString('ko-KR'),
});

/**
 * Send Customer Info Notification Email (1st Alert)
 * - Sent when customer completes all info fields (company, name, phone, email)
 * - Blind overlay disappears at this point
 * - Only customer info is included (no quotation details)
 */
export const sendCustomerInfoEmail = async (data: {
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
}) => {
  // Prevent duplicate sends
  if (customerInfoEmailSent) {
    console.log('📧 1차 알림 이미 전송됨 (중복 방지)');
    return;
  }

  const config = getEmailConfig();

  if (!config || !config.enabled) {
    console.log('이메일 알림이 비활성화되어 있습니다.');
    return;
  }

  try {
    customerInfoEmailSent = true;

    const templateParams = buildTemplateParams(config, {
      companyName: data.companyName,
      contactName: data.contactName,
      phone: data.phone,
      email: data.email,
      subject: `📋 [1차 알림] 새 고객 접수 - ${data.companyName}`,
      totalPrice: '(미확정)',
    });

    console.log('📧 1차 알림 이메일 전송 시작 (고객정보 입력 완료):', templateParams);

    const response = await emailjs.send(
      config.serviceId,
      config.templateId,
      templateParams
    );

    console.log('✅ 1차 알림 이메일 전송 성공:', response);
    return response;
  } catch (error) {
    console.error('❌ 1차 알림 이메일 전송 실패:', error);
    customerInfoEmailSent = false; // Allow retry on failure
    throw error;
  }
};

/**
 * Send Quotation Creation Email
 * - Sends email notification when new quotation is created
 * - Includes all quotation details
 * 
 * @param {Object} data - Quotation data
 * @returns {Promise} EmailJS response
 */
export const sendQuotationEmail = async (data: {
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  printerModel: string;
  rentalPeriod: number;
  usage?: string[];
  startDate: string;
  totalPrice: number;
  quotationId: string;
}) => {
  const config = getEmailConfig();
  
  if (!config || !config.enabled) {
    console.log('이메일 알림이 비활성화되어 있습니다.');
    return;
  }

  try {
    // Email template parameters
    const templateParams = buildTemplateParams(config, {
      companyName: data.companyName,
      contactName: data.contactName,
      phone: data.phone,
      email: data.email,
      subject: `🍰 [마카롱 견적서] ${data.companyName} - ${data.printerModel}`,
      quotationId: data.quotationId,
      printerModel: data.printerModel,
      rentalPeriod: data.rentalPeriod,
      usage: data.usage,
      startDate: data.startDate,
      totalPrice: data.totalPrice,
    });

    console.log('📧 이메일 전송 시작:', {
      serviceId: config.serviceId,
      templateId: config.templateId,
      templateParams,
    });

    // Send email via EmailJS
    const response = await emailjs.send(
      config.serviceId,
      config.templateId,
      templateParams
    );

    console.log('✅ 이메일 전송 성공:', response);
    return response;
  } catch (error) {
    console.error('❌ 이메일 전송 실패:', error);
    throw error;
  }
};

/**
 * Send Signature Completion Email
 * - Sends email notification when quotation is signed
 * - Confirms contract agreement
 * 
 * @param {Object} data - Signed quotation data
 * @returns {Promise} EmailJS response
 */
export const sendSignatureEmail = async (data: {
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  printerModel: string;
  rentalPeriod: number;
  startDate: string;
  totalPrice: number;
  quotationId: string;
}) => {
  const config = getEmailConfig();
  
  if (!config || !config.enabled) {
    console.log('이메일 알림이 비활성화되어 있습니다.');
    return;
  }

  try {
    const templateParams = buildTemplateParams(config, {
      companyName: data.companyName,
      contactName: data.contactName,
      phone: data.phone,
      email: data.email,
      subject: `✅ [서명 완료] ${data.companyName} - ${data.contactName}`,
      quotationId: data.quotationId,
      printerModel: data.printerModel,
      rentalPeriod: data.rentalPeriod,
      usage: '마카롱 프린터 렌탈',
      startDate: data.startDate,
      totalPrice: `${(data.totalPrice / 10000).toFixed(0)}만원`,
    });

    console.log('📧 서명 완료 이메일 전송 시작:', {
      serviceId: config.serviceId,
      templateId: config.templateId,
      templateParams,
    });

    const response = await emailjs.send(
      config.serviceId,
      config.templateId,
      templateParams
    );

    console.log('✅ 서명 완료 이메일 전송 성공:', response);
    return response;
  } catch (error) {
    console.error('❌ 서명 완료 이메일 전송 실패:', error);
    throw error;
  }
};

/**
 * Send Contact Us Email
 * - 문의 전용 템플릿 전송 유틸
 * - template_cswgob8 기준 필드 매핑 사용
 */
export const sendContactUsEmail = async (data: {
  companyName?: string;
  contactName: string;
  phone: string;
  email: string;
  message: string;
}) => {
  const config = getEmailConfig();

  if (!config || !config.enabled) {
    console.log('이메일 알림이 비활성화되어 있습니다.');
    return;
  }

  try {
    const companyName = data.companyName?.trim() || '미기재';
    const templateParams = buildTemplateParams(config, {
      companyName,
      contactName: data.contactName,
      phone: data.phone,
      email: data.email,
      subject: `📩 [Contact Us] ${companyName} - ${data.contactName}`,
      usage: data.message,
    });

    const response = await emailjs.send(
      config.serviceId,
      config.templateId,
      templateParams
    );

    console.log('✅ Contact Us 이메일 전송 성공:', response);
    return response;
  } catch (error) {
    console.error('❌ Contact Us 이메일 전송 실패:', error);
    throw error;
  }
};