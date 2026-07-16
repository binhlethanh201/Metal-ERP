/**
 * Chatbot Service - Gửi câu hỏi tới trợ lý AI và nhận câu trả lời.
 */
import { apiPost } from './apiClient';
import ENDPOINTS from './endpoints';

/**
 * Gửi 1 message tới chatbot.
 * @param {string} message - Nội dung câu hỏi của người dùng.
 * @returns {Promise<{success: boolean, message: string, data: string, errors: any}>}
 */
export const sendChatMessage = async (message) => {
  const trimmed = (message || '').trim();
  if (!trimmed) {
    // Chặn sớm ở FE, khỏi cần gọi API để nhận lỗi "message trống"
    const err = new Error('Vui lòng nhập nội dung câu hỏi.');
    err.status = 400;
    throw err;
  }

  return apiPost(ENDPOINTS.CHATBOT.SEND_MESSAGE, { message: trimmed });
};

const chatbotService = { sendChatMessage };

export default chatbotService;
