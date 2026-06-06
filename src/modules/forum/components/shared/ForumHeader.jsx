import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../../shared/components/Icon';
import Logo from '../../../../shared/components/Logo';

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    icon: 'trending_up',
    iconBg: 'bg-red-50 text-red-600',
    title: 'Sơn KOVA CT-11A tăng +55%',
    desc: 'Nhu cầu tăng mạnh tại Hà Nội và TP.HCM.',
    time: '5 phút trước',
    unread: true,
  },
  {
    id: 2,
    icon: 'inventory_2',
    iconBg: 'bg-amber-50 text-amber-600',
    title: 'Máy Thổi Lá Cmart sắp hết',
    desc: 'Chỉ còn 3 cái trong kho. Cần nhập thêm.',
    time: '30 phút trước',
    unread: true,
  },
  {
    id: 3,
    icon: 'forum',
    iconBg: 'bg-blue-50 text-[#004785]',
    title: 'Có 12 phản hồi mới',
    desc: 'Trong bài viết "Có nên nhập thêm sơn KOVA..."',
    time: '2 giờ trước',
    unread: false,
  },
  {
    id: 4,
    icon: 'new_releases',
    iconBg: 'bg-emerald-50 text-emerald-600',
    title: '3 sản phẩm mới về kho',
    desc: 'Đầu nối Parker, Van gang DN50, Đá cắt Hải Dương.',
    time: 'Hôm qua',
    unread: false,
  },
  {
    id: 5,
    icon: 'check_circle',
    iconBg: 'bg-slate-100 text-slate-500',
    title: 'Đơn nhập kho đã duyệt',
    desc: 'Đơn SP34405804 - Xi măng Bút Sơn đã được duyệt.',
    time: '2 ngày trước',
    unread: false,
  },
];

const ForumHeader = ({ onCreatePostClick }) => {
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => n.unread).length;

  return (
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

          <div className="flex items-center gap-3" ref={notifRef}>
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen(!notifOpen)}
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
                <div className="absolute right-0 top-full mt-1 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl">
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
                          <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-400">{n.desc}</p>
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

            <img
              alt="User Profile Avatar"
              onClick={() => {
                navigate('/forum/profile');
              }}
              className="h-10 w-10 cursor-pointer rounded-lg border border-slate-200 object-cover transition-opacity hover:opacity-80"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjYqYBGkR_Iadb7O3sIeQNtpWqJ9ThFzKm9BOnEoOjeAE90A3wKJFFf_2bunkuTYMCqxG-rZhI2sPranFao-yWEOh0ApqhjfAAZbuje4uAJVypcId7wA_hljomIOwQcSCCah1Fy-OvCW8q4Fu_GOKEK8rcUHnVgFEuCEYDJGKLI7qI0pVrjInnAhtDOJTjOxgm3_qIjxQV1OQT-PS9-tSwqZFR6TBj4W3czn_RYk-psKet5iM85xrN2qNW9iI1H_BG-KYPwDIYPCHf"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default ForumHeader;
