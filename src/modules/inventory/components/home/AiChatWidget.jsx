/**
 * Widget Trợ lý AI - Chat popup góc phải dưới màn hình Dashboard.
 * Props: isOpen, onToggle, messages, input, setInput, onSend.
 */
import MaterialIcon from '../shared/MaterialIcon';

const AiChatWidget = ({ isOpen, onToggle, messages, input, setInput, onSend }) => (
  <>
    <div
      className={`fixed bottom-24 right-4 z-[60] w-[calc(100vw-2rem)] max-w-[380px] rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all duration-200 lg:right-8 ${isOpen ? 'visible translate-y-0 opacity-100' : 'invisible translate-y-4 opacity-0'}`}
    >
      <div className="flex items-center justify-between rounded-t-2xl bg-primary px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <MaterialIcon name="smart_toy" className="text-lg" />
          <p className="text-sm font-bold">Trợ lý ảo MetalERP</p>
        </div>
        <button
          type="button"
          className="rounded-md p-1 text-white/80 transition hover:bg-white/15 hover:text-white"
          onClick={() => onToggle(false)}
        >
          <MaterialIcon name="close" className="text-base" />
        </button>
      </div>
      <div className="max-h-[280px] space-y-3 overflow-y-auto px-4 py-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[88%] rounded-xl px-3 py-2 text-sm ${msg.role === 'user' ? 'ml-auto bg-primary text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 border-t border-slate-100 p-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder="Nhập câu hỏi cho trợ lý..."
          className="h-10 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-primary"
        />
        <button
          type="button"
          onClick={onSend}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white transition hover:brightness-110"
        >
          <MaterialIcon name="send" className="text-lg" />
        </button>
      </div>
    </div>

    <button
      type="button"
      className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-2xl transition-transform hover:scale-110"
      onClick={() => onToggle((prev) => !prev)}
    >
      <MaterialIcon name="chat" className="text-2xl" />
      <span className="absolute -right-1 -top-1 flex h-4 w-4">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold">
          1
        </span>
      </span>
    </button>
  </>
);

export default AiChatWidget;
