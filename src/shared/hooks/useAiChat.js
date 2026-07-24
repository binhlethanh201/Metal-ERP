/**
 * Hook dùng chung cho Trợ lý AI - quản lý state hội thoại + gọi API.
 */
import { useState, useCallback, useEffect } from 'react';
import { sendChatMessage } from '../../services/chatbotService';

const STORAGE_KEY = 'mep_chat_history';

const WELCOME_MSG = {
  id: 'welcome',
  role: 'bot',
  text: 'Xin chào! Tôi là trợ lý ảo của hệ thống MEP Management System. Bạn cần hỗ trợ gì ạ?',
};

let msgCounter = 0;
const nextId = () => `m_${Date.now()}_${msgCounter++}`;

const loadHistory = () => {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    // sessionStorage có thể bị chặn (private mode) → bỏ qua, dùng default
  }
  return [WELCOME_MSG];
};

export const useAiChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [messages, setMessages] = useState(loadHistory);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      // ignore
    }
  }, [messages]);

  const toggle = useCallback((next) => {
    setIsOpen((prev) => (typeof next === 'function' ? next(prev) : next));
  }, []);

  const toggleFull = useCallback(() => setIsFull((prev) => !prev), []);

  const send = useCallback(
    async (suggestedText) => {
      const text = (typeof suggestedText === 'string' ? suggestedText : input).trim();
      if (!text || loading) return;

      setMessages((prev) => [...prev, { id: nextId(), role: 'user', text }]);
      if (typeof suggestedText !== 'string') setInput('');
      setLoading(true);

      try {
        const res = await sendChatMessage(text);
        const botText =
          (res && res.success && res.data) ||
          res?.message ||
          'Xin lỗi, tôi chưa thể trả lời câu này.';
        setMessages((prev) => [...prev, { id: nextId(), role: 'bot', text: botText }]);
      } catch (error) {
        const botText =
          error?.data?.message || error?.message || 'Có lỗi xảy ra, vui lòng thử lại.';
        setMessages((prev) => [...prev, { id: nextId(), role: 'bot', text: botText }]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading]
  );

  const clearChat = useCallback(() => {
    const cleared = [
      {
        id: nextId(),
        role: 'bot',
        text: 'Lịch sử trò chuyện đã được xóa. Tôi có thể giúp gì cho bạn?',
      },
    ];
    setMessages(cleared);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  }, []);

  return {
    isOpen,
    toggle,
    isFull,
    toggleFull,
    messages,
    setMessages,
    input,
    setInput,
    send,
    loading,
    clearChat,
  };
};

export default useAiChat;
