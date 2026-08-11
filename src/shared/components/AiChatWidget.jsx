/**
 * Widget Trợ lý AI dùng chung toàn hệ thống
 */
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import Icon from './Icon';
import useAiChat from '../hooks/useAiChat';

// ==================== HELPERS ====================
const parseMessageWithTables = (rawText) => {
  if (!rawText) return [];
  // Thêm newline để regex bắt được dòng cuối cùng nếu AI không trả về xuống dòng ở cuối
  const text = rawText + '\n';
  const tableRegex = /((?:^[ \t]*\|[^\n]*\r?\n){2,})/gm;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = tableRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
    }
    parts.push({ type: 'table', content: match[0] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < rawText.length) {
    parts.push({ type: 'text', content: rawText.substring(lastIndex) });
  }

  return parts;
};

// ==================== CUSTOM MARKDOWN RENDERERS (inline chat) ====================
const markdownComponents = {
  h1: ({ children }) => (
    <h1 className="mb-2 mt-3 text-base font-bold text-slate-800 dark:text-[#e5e5e5]">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 mt-3 text-[15px] font-bold text-slate-800 dark:text-[#e5e5e5]">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-1.5 mt-2.5 text-sm font-bold text-slate-800 dark:text-[#e5e5e5]">{children}</h3>
  ),
  p: ({ children }) => <p className="mb-1.5 leading-relaxed last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-bold text-slate-900 dark:text-[#e5e5e5]">{children}</strong>,
  ul: ({ children }) => <ul className="mb-1.5 ml-4 list-disc space-y-0.5">{children}</ul>,
  ol: ({ children }) => <ol className="mb-1.5 ml-4 list-decimal space-y-0.5">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noreferrer" className="text-primary underline">
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="rounded bg-slate-100 px-1 py-0.5 text-[12px] text-slate-800 dark:bg-[#272727] dark:text-[#d4d4d4]">{children}</code>
  ),
};

// ==================== CUSTOM MARKDOWN RENDERERS (table modal) ====================
const modalMarkdownComponents = {
  table: ({ children }) => (
    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm dark:border-[#333333]">
      <table className="w-full border-collapse bg-white text-sm dark:bg-[#0f0f0f]">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 dark:bg-[#1a1a1a]/80 dark:text-[#b3b3b3] dark:border-[#333333]">
      {children}
    </thead>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className="hover:bg-blue-50/50 transition-colors odd:bg-white even:bg-slate-50/30 dark:odd:bg-[#0f0f0f] dark:even:bg-[#1a1a1a]/50 dark:hover:bg-blue-900/30">
      {children}
    </tr>
  ),
  th: ({ children }) => (
    <th className="px-4 py-3 text-left border-r last:border-r-0 border-slate-200 font-semibold dark:border-[#333333] dark:text-[#d4d4d4]">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-3 border-b border-r last:border-r-0 border-slate-100 text-slate-700 dark:border-[#333333] dark:text-[#b3b3b3]">
      {children}
    </td>
  ),
  p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-bold text-slate-900 dark:text-[#e5e5e5]">{children}</strong>,
};

const AiChatWidget = () => {
  const {
    isOpen,
    toggle,
    isFull,
    toggleFull,
    messages,
    input,
    setInput,
    send,
    loading,
    clearChat,
  } = useAiChat();

  const [activeTableModal, setActiveTableModal] = useState(null);

  // Drag logic
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const hasDragged = useRef(false);

  const handleMouseDown = (e) => {
    if (isFull) return; // Không cho kéo khi đang phóng to
    
    const isChatToggleBtn = e.currentTarget.id === 'chat-toggle-btn';
    
    if (!isChatToggleBtn) {
      // Bỏ qua kéo thả nếu click vào:
      // 1. Các thẻ button, input, textarea, a
      // 2. Nội dung bong bóng tin nhắn (để người dùng có thể bôi đen chữ)
      if (
        e.target.closest('button') || 
        e.target.closest('input') || 
        e.target.closest('textarea') || 
        e.target.closest('a') ||
        e.target.closest('.chat-bubble')
      ) {
        return;
      }

      // Tránh kéo khi click vào thanh cuộn của vùng tin nhắn
      const scrollArea = e.target.closest('.chat-scroll-area');
      if (scrollArea && e.target === scrollArea) {
        const rect = scrollArea.getBoundingClientRect();
        if (e.clientX > rect.right - 20) { // Click vào thanh cuộn (khoảng 20px bên phải)
          return;
        }
      }
    }

    hasDragged.current = false;
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      hasDragged.current = true;
      setPosition({
        x: e.clientX - dragStartPos.current.x,
        y: e.clientY - dragStartPos.current.y
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none'; // Tránh bôi đen chữ
    } else {
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  // Đặt lại vị trí khi đổi chế độ phóng to
  useEffect(() => {
    if (isFull) {
      setPosition({ x: 0, y: 0 });
    }
  }, [isFull]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isOpen]);

  const handleClear = () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ lịch sử trò chuyện?')) {
      clearChat();
    }
  };

  const renderBotMessage = (text) => {
    const parts = parseMessageWithTables(text);
    if (parts.length === 0) return null;

    return (
      <div className="space-y-2">
        {parts.map((part, idx) => {
          if (part.type === 'text') {
            return (
              <ReactMarkdown
                key={idx}
                remarkPlugins={[remarkGfm, remarkBreaks]}
                components={markdownComponents}
              >
                {part.content}
              </ReactMarkdown>
            );
          }
          // Table part → render as clickable card
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveTableModal(part.content)}
              className="w-full rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-3 text-left shadow-sm transition-all hover:border-blue-300 hover:shadow-md active:scale-[0.98] dark:border-blue-800 dark:from-blue-950 dark:to-[#0f0f0f] dark:hover:border-blue-700"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                  <Icon name="table" className="text-xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-[#e5e5e5]">
                    Báo cáo / Bảng dữ liệu chi tiết
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-[#999999]">
                    Nhấp vào đây để xem bảng đầy đủ cột
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-110">
                    Xem chi tiết
                    <Icon name="arrow_forward" className="text-sm" />
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <div
        onMouseDown={handleMouseDown}
        style={{
          transform: isFull ? 'none' : `translate(${position.x}px, ${position.y}px) scale(${isOpen ? 1 : 0.95})`,
        }}
        className={`fixed z-[100] flex origin-bottom-right flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-[#333333] dark:bg-[#0f0f0f] ${
          isDragging ? 'transition-none' : 'transition-all duration-200'
        } ${
          isOpen
            ? 'visible opacity-100'
            : 'pointer-events-none invisible opacity-0'
        } ${
          isFull
            ? 'inset-0 h-[100dvh] w-[100dvw] rounded-none sm:inset-4 sm:h-[calc(100vh-32px)] sm:w-[calc(100vw-32px)] sm:rounded-[1.5rem]'
            : 'bottom-24 right-4 h-[550px] w-[calc(100vw-2rem)] max-w-[380px] lg:right-8'
        }`}
      >
        {/* Header */}
        <div 
          className={`flex items-center justify-between rounded-t-2xl bg-primary px-4 py-3 text-white ${!isFull ? 'cursor-move' : ''}`}
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
            </span>
            <div>
              <p className="text-sm font-bold leading-none">Trợ lý ảo MEP</p>
              <p className="mt-0.5 text-[11px] font-medium text-white/70">Đang hoạt động</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleClear}
              title="Xóa lịch sử trò chuyện"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white"
            >
              <Icon name="delete" className="text-base" />
            </button>
            <button
              type="button"
              onClick={toggleFull}
              title={isFull ? 'Thu nhỏ' : 'Phóng to toàn màn hình'}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white"
            >
              <Icon name={isFull ? 'Minimize' : 'Expand'} className="text-base" />
            </button>
            <button
              type="button"
              onClick={() => toggle(false)}
              title="Đóng"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white"
            >
              <Icon name="close" className="text-base" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="chat-scroll-area flex-1 space-y-3 overflow-y-auto bg-slate-50/60 px-4 py-3 dark:bg-[#1a1a1a]/60">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`chat-bubble max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm ${
                  msg.role === 'user'
                    ? 'rounded-tr-sm bg-primary text-white'
                    : 'rounded-tl-sm border border-slate-200 bg-white text-slate-700 shadow-sm dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#b3b3b3]'
                }`}
              >
                {msg.role === 'bot' ? (
                  renderBotMessage(msg.text)
                ) : (
                  <span className="whitespace-pre-wrap">{msg.text}</span>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-[#404040] dark:bg-[#1a1a1a]">
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
                <span
                  className="h-2 w-2 animate-bounce rounded-full bg-primary"
                  style={{ animationDelay: '0.15s' }}
                />
                <span
                  className="h-2 w-2 animate-bounce rounded-full bg-primary"
                  style={{ animationDelay: '0.3s' }}
                />
                <span className="ml-1 text-xs text-slate-500 dark:text-[#999999]">
                  Vui lòng đợi trong giây lát, AI đang xử lý...
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 border-t border-slate-100 p-3 dark:border-[#333333]">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={loading ? 'AI đang xử lý, vui lòng đợi...' : 'Nhập câu hỏi cho trợ lý...'}
            className="h-10 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-primary disabled:opacity-60 dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#d4d4d4] dark:placeholder:text-[#808080]"
          />
          <button
            type="button"
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white transition hover:brightness-110 disabled:opacity-50"
          >
            <Icon name="send" className="text-lg" />
          </button>
        </div>
      </div>

      {/* ==================== TABLE MODAL ==================== */}
      {activeTableModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setActiveTableModal(null)}
          />

          {/* Modal Card */}
          <div className="relative bg-white rounded-2xl max-w-4xl w-[92vw] max-h-[85vh] shadow-2xl flex flex-col border border-slate-100 overflow-hidden dark:bg-[#0f0f0f] dark:border-[#333333]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-[#333333]">
              <h2 className="text-lg font-bold text-slate-800 dark:text-[#e5e5e5]">
                Chi tiết bảng dữ liệu
              </h2>
              <button
                type="button"
                onClick={() => setActiveTableModal(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:text-[#808080] dark:hover:bg-[#272727] dark:hover:text-[#b3b3b3]"
              >
                <Icon name="close" className="text-xl" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-auto flex-1 bg-slate-50/50 dark:bg-[#1a1a1a]/50">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={modalMarkdownComponents}
              >
                {activeTableModal}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {/* Nút mở chat */}
      <button
        id="chat-toggle-btn"
        type="button"
        onMouseDown={handleMouseDown}
        onClick={(e) => {
          if (hasDragged.current) {
            e.preventDefault();
            return;
          }
          toggle((prev) => !prev);
        }}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${isOpen ? 0 : 1})`,
        }}
        className={`fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-2xl hover:brightness-110 ${
          isDragging ? 'transition-none cursor-move' : 'transition-all duration-200 cursor-pointer'
        } ${
          isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <Icon name="chat" className="text-2xl" />
      </button>
    </>
  );
};

export default AiChatWidget;
