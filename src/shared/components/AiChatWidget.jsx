/**
 * Widget Trợ lý AI dùng chung toàn hệ thống
 */
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import Icon from './Icon';
import useAiChat from '../hooks/useAiChat';

// Các component override để bảng/list/heading markdown khớp style Tailwind của hệ thống
const markdownComponents = {
  h1: ({ children }) => (
    <h1 className="mb-2 mt-3 text-base font-bold text-slate-800">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 mt-3 text-[15px] font-bold text-slate-800">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-1.5 mt-2.5 text-sm font-bold text-slate-800">{children}</h3>
  ),
  p: ({ children }) => <p className="mb-2 leading-relaxed last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-bold text-slate-900">{children}</strong>,
  ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-1">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-1">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noreferrer" className="text-primary underline">
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="mb-2 overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full min-w-[420px] border-collapse text-xs">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-slate-100">{children}</thead>,
  th: ({ children }) => (
    <th className="border-b border-slate-200 px-2 py-1.5 text-left font-bold text-slate-700">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-slate-100 px-2 py-1.5 text-slate-700">{children}</td>
  ),
  code: ({ children }) => (
    <code className="rounded bg-slate-100 px-1 py-0.5 text-[12px] text-slate-800">{children}</code>
  ),
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

  const handleClear = () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ lịch sử trò chuyện?')) {
      clearChat();
    }
  };

  return (
    <>
      <div
        className={`fixed z-[100] flex origin-bottom-right flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all duration-200 ${
          isOpen
            ? 'visible scale-100 opacity-100'
            : 'pointer-events-none invisible scale-95 opacity-0'
        } ${
          isFull
            ? 'inset-0 h-[100dvh] w-[100dvw] rounded-none sm:inset-4 sm:h-[calc(100vh-32px)] sm:w-[calc(100vw-32px)] sm:rounded-[1.5rem]'
            : 'bottom-24 right-4 h-[550px] w-[calc(100vw-2rem)] max-w-[380px] lg:right-8'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between rounded-t-2xl bg-primary px-4 py-3 text-white">
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
        <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/60 px-4 py-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm ${
                  msg.role === 'user'
                    ? 'rounded-tr-sm bg-primary text-white'
                    : 'rounded-tl-sm border border-slate-200 bg-white text-slate-700 shadow-sm'
                }`}
              >
                {msg.role === 'bot' ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkBreaks]}
                    components={markdownComponents}
                  >
                    {msg.text}
                  </ReactMarkdown>
                ) : (
                  <span className="whitespace-pre-wrap">{msg.text}</span>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                <span
                  className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                  style={{ animationDelay: '0.15s' }}
                />
                <span
                  className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                  style={{ animationDelay: '0.3s' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 border-t border-slate-100 p-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                send();
              }
            }}
            disabled={loading}
            placeholder="Nhập câu hỏi cho trợ lý..."
            className="h-10 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-primary disabled:opacity-60"
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

      {/* Nút mở chat */}
      <button
        type="button"
        onClick={() => toggle((prev) => !prev)}
        className={`fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-2xl transition-transform hover:scale-110 ${
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <Icon name="chat" className="text-2xl" />
      </button>
    </>
  );
};

export default AiChatWidget;
