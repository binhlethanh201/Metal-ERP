/**
 * Chatbot Service - Gửi câu hỏi tới trợ lý AI và nhận câu trả lời.
 */
import { apiPost } from './apiClient';
import ENDPOINTS from './endpoints';

/**
 * Gửi 1 message tới chatbot.
 * @param {string} message - Nội dung câu hỏi của người dùng.
 * @param {Array} history - Lịch sử trò chuyện trước đó.
 * @returns {Promise<{success: boolean, message: string, data: string, errors: any}>}
 */
export const sendChatMessage = async (message, history = []) => {
  const trimmed = (message || '').trim();
  if (!trimmed) {
    // Chặn sớm ở FE, khỏi cần gọi API để nhận lỗi "message trống"
    const err = new Error('Vui lòng nhập nội dung câu hỏi.');
    err.status = 400;
    throw err;
  }

  // Chỉ lấy role và content text (hoặc text tuỳ vào key dùng trong history)
  const formattedHistory = history.map((msg) => ({
    role: msg.role === 'bot' ? 'assistant' : 'user',
    content: msg.text || '',
  }));

  return apiPost(ENDPOINTS.CHATBOT.SEND_MESSAGE, { message: trimmed, history: formattedHistory });
};

const chatbotService = { sendChatMessage };

export default chatbotService;
