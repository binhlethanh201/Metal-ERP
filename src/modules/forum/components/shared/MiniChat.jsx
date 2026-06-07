/**
 * MiniChat - Cửa sổ chat nhỏ dock góc phải màn hình, kiểu Facebook Messenger.
 */
import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../../shared/components/Icon';
import { MOCK_MSGS } from '../../data/headerMockData';

const MiniChat = ({ conv, onClose }) => {
  const [msgs, setMsgs] = useState(MOCK_MSGS);
  const [txt, setTxt] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const send = () => {
    if (!txt.trim()) return;
    const now = new Date();
    setMsgs((p) => [
      ...p,
      {
        id: Date.now(),
        from: 'me',
        text: txt,
        time: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`,
      },
    ]);
    setTxt('');
  };

  return (
    <div className="flex w-96 flex-col overflow-hidden rounded-t-2xl border border-b-0 border-slate-200 bg-white shadow-2xl">
      <div
        className="flex cursor-pointer items-center gap-2 bg-[#004785] px-4 py-2.5 text-white"
        onClick={onClose}
      >
        <div className="relative shrink-0">
          <img alt={conv.name} className="h-8 w-8 rounded-full object-cover" src={conv.avatar} />
          {conv.online && (
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
          )}
        </div>
        <span className="flex-1 truncate text-sm font-bold">{conv.name}</span>
        <Icon name="close" size={16} className="text-white/70 hover:text-white" />
      </div>
      <div className="h-[420px] overflow-y-auto bg-slate-50 p-3">
        <div className="space-y-2.5">
          {msgs.map((m) => (
            <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2 ${m.from === 'me' ? 'bg-[#004785] text-white' : 'border border-slate-100 bg-white text-slate-700'}`}
              >
                <p className="text-sm leading-relaxed">{m.text}</p>
                <p
                  className={`mt-0.5 text-right text-[10px] ${m.from === 'me' ? 'text-white/50' : 'text-slate-400'}`}
                >
                  {m.time}
                </p>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </div>
      <div className="flex items-center gap-2 border-t border-slate-100 px-3 py-2.5">
        <input
          value={txt}
          onChange={(e) => setTxt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') send();
          }}
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none"
          placeholder="Nhập tin nhắn..."
          type="text"
        />
        <button
          type="button"
          onClick={send}
          className="rounded-xl bg-[#004785] p-2 text-white transition-colors hover:bg-black"
        >
          <Icon name="send" size={16} />
        </button>
      </div>
    </div>
  );
};

export default MiniChat;
