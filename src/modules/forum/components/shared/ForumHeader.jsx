import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../../shared/components/Icon';
import Logo from '../../../../shared/components/Logo';
import { useChat } from '../../contexts/ChatContext';
import { MOCK_NOTIFICATIONS } from '../../data/headerMockData';
import MiniChat from './MiniChat';

const ForumHeader = ({ onCreatePostClick }) => {
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const chatRef = useRef(null);
  const {
    totalUnread: totalUnreadChats,
    chatPopOpen,
    setChatPopOpen,
    chatSearch,
    setChatSearch,
    filteredConvs,
    openChatWith,
    openChats,
    closeChat,
  } = useChat();

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (chatRef.current && !chatRef.current.contains(e.target)) setChatPopOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1650px] items-center justify-between px-6">
          <div className="w-[260px] shrink-0">
            <button type="button" onClick={() => navigate('/forum')} className="block text-left">
              <Logo moduleName="Cộng đồng" />
            </button>
          </div>

          <div className="ml-6 hidden h-10 max-w-[900px] flex-1 items-center rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 transition-all focus-within:border-slate-300 focus-within:bg-white md:flex">
            <Icon name="search" className="mr-2 text-slate-400" />
            <input
              className="w-full border-none bg-transparent py-0 text-sm outline-none placeholder:text-slate-400 focus:ring-0"
              placeholder="Tìm kiếm bài viết, xu hướng..."
              type="text"
            />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-4">
            <button
              type="button"
              onClick={onCreatePostClick}
              className="flex items-center gap-x-2 rounded-xl bg-[#004785] px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-black active:scale-95"
            >
              <Icon name="add" className="text-sm" />
              <span>Đăng bài viết</span>
            </button>
            <div className="h-8 w-px bg-slate-200" />

            <div className="flex items-center gap-1" ref={notifRef}>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setNotifOpen(!notifOpen);
                    setChatPopOpen(false);
                  }}
                  className="relative rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100"
                >
                  <Icon name="notifications" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 top-full z-[150] mt-1 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">
                        Thông báo
                      </h4>
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">
                        {unreadCount} chưa đọc
                      </span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {MOCK_NOTIFICATIONS.map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => setNotifOpen(false)}
                          className={`flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${n.unread ? 'bg-blue-50/30' : ''}`}
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${n.iconBg}`}
                          >
                            <Icon name={n.icon} size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-xs font-bold text-slate-700">{n.title}</p>
                              {n.unread && (
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#004785]" />
                              )}
                            </div>
                            <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-400">
                              {n.desc}
                            </p>
                            <p className="mt-1 text-[10px] text-slate-300">{n.time}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-slate-100 px-4 py-2.5">
                      <button
                        type="button"
                        onClick={() => setNotifOpen(false)}
                        className="w-full text-center text-[11px] font-bold text-[#004785] hover:underline"
                      >
                        Đánh dấu tất cả đã đọc
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="relative" ref={chatRef}>
              <button
                type="button"
                onClick={() => {
                  setChatPopOpen(!chatPopOpen);
                  setNotifOpen(false);
                }}
                className="relative rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100"
              >
                <Icon name="chat" />
                {totalUnreadChats > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white">
                    {totalUnreadChats}
                  </span>
                )}
              </button>
              {chatPopOpen && (
                <div className="absolute right-0 top-full z-[150] mt-1 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">
                      Nhắn tin
                    </h4>
                    <div className="mt-2 flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
                      <Icon name="search" size={14} className="mr-2 text-slate-400" />
                      <input
                        value={chatSearch}
                        onChange={(e) => setChatSearch(e.target.value)}
                        className="w-full border-none bg-transparent text-xs outline-none placeholder:text-slate-400"
                        placeholder="Tìm kiếm hội thoại..."
                        type="text"
                      />
                    </div>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {filteredConvs.length === 0 ? (
                      <p className="px-4 py-8 text-center text-xs text-slate-400">
                        Không tìm thấy hội thoại
                      </p>
                    ) : (
                      filteredConvs.map((conv) => (
                        <button
                          key={conv.id}
                          type="button"
                          onClick={() => openChatWith(conv)}
                          className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                        >
                          <div className="relative shrink-0">
                            <img
                              alt={conv.name}
                              className="h-11 w-11 rounded-full object-cover"
                              src={conv.avatar}
                            />
                            {conv.online && (
                              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="truncate text-sm font-bold text-slate-800">
                                {conv.name}
                              </span>
                              <span className="shrink-0 text-[10px] text-slate-400">
                                {conv.time}
                              </span>
                            </div>
                            <p className="truncate text-[11px] text-slate-500">{conv.lastMsg}</p>
                          </div>
                          {conv.unread > 0 && (
                            <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                              {conv.unread}
                            </span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <img
              alt="User Profile Avatar"
              onClick={() => navigate('/forum/profile')}
              className="h-10 w-10 cursor-pointer rounded-lg border border-slate-200 object-cover transition-opacity hover:opacity-80"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjYqYBGkR_Iadb7O3sIeQNtpWqJ9ThFzKm9BOnEoOjeAE90A3wKJFFf_2bunkuTYMCqxG-rZhI2sPranFao-yWEOh0ApqhjfAAZbuje4uAJVypcId7wA_hljomIOwQcSCCah1Fy-OvCW8q4Fu_GOKEK8rcUHnVgFEuCEYDJGKLI7qI0pVrjInnAhtDOJTjOxgm3_qIjxQV1OQT-PS9-tSwqZFR6TBj4W3czn_RYk-psKet5iM85xrN2qNW9iI1H_BG-KYPwDIYPCHf"
            />
          </div>
        </div>
      </header>

      {openChats.length > 0 && (
        <div className="fixed bottom-0 right-4 z-[200] flex items-end gap-3">
          {openChats.map((conv) => (
            <MiniChat key={conv.id} conv={conv} onClose={() => closeChat(conv)} />
          ))}
        </div>
      )}
    </>
  );
};

export default ForumHeader;
