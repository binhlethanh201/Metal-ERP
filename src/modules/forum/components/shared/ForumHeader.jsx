import React, { useState, useRef, useEffect, useCallback } from 'react';
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

const CONVERSATIONS = [
  {
    id: 1,
    name: 'Trần Văn Hoàng',
    role: 'Chủ thầu xây dựng',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB7q0UeyjkmVy04LF7tf5IA0ygKOw2S_vmOCkwCiXBrQfV4j9kPFOsXFxfzjdt4i3-ckzsX5RrdHr3KhVUQgrrbDPhNWmism_mk-ExVFrfK7u7FTS3Ic3Y7MzINxNvtmyfdL4ATFPv0zt1IBynDrLVb0tABvI2lk6dB0grlwTJbKrYhVmFRgXeadptejbxFOZ731PmbzcnwFXmFx0MZmW7qvgsvNvGwe97svkGokZhOcQLW66PA7fde14LdktF4mhUtdcOqnkhn2Apf',
    lastMsg: 'Báo giá thép hộp mới nhất đi anh',
    time: '2 phút',
    unread: 3,
    online: true,
  },
  {
    id: 2,
    name: 'Quốc Mạnh Hardware',
    role: 'Đại lý cấp 1',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuARQdi4aUjEhq51ggqlTnuIcc0VpZNbVIyHq4o-nUM6ns5h_jkW35Ra6TTnsOx3cehJ3sFf30Lp9e4PaJnKStpqcBTntpjUcjwVxXEoI6Vz0On3t1TGWljo1rJiq5cYi0UZ6oIakFojxDUFOJtMOTeSXTJXpmBo3by3LDxJRP0E6-wjhBjR9v9YY7_piKxZSNoFajlnkWeMP_VWpDxElb6Z2H-yZAS-xyw2XwCdkRlxsGdsxrTwmMqijimScpWn8O6nKEoXuN1WrMPx',
    lastMsg: 'Ok em, để anh check kho rồi báo',
    time: '1 giờ',
    unread: 0,
    online: true,
  },
  {
    id: 3,
    name: 'Lan Anh',
    role: 'Nhà bán hàng',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCwn57sYKJ4x9dol__RYMVwM3H1yt7Kz-lnw17fAFH5wQ6czVBRC7JQDbA-GbZzZYuDtwUXBm9bCM8SdRkXP9x1s2g2Vm1KdH2t4fCgX0wFteum7_-swPIdrWnmdVeJuz1pcMos4g732-27Piwx59PbdTsYD-RLxrksdx6SWFVxPumNVqm-CLTcJTTKT7x1rntPejnh0mPaCATzRUmm2oaVhc80iuZHWgGTOu7YVpp1xP_jcAZEwi7JSKmqHQ6gqjbZq6fpmHv6BFdS',
    lastMsg: 'Cảm ơn anh, hàng về em sẽ nhắn ngay',
    time: 'Hôm qua',
    unread: 0,
    online: false,
  },
  {
    id: 4,
    name: 'Kim Khí Hòa Phát',
    role: 'Nhà cung cấp',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD4I6w_ItLfuYmY_1AfuhlHvLjjxOGbzBCUPzNC0NMjVqIJ2rL752szrVKiipMNHjUpYrtvuNViqdd0hHjkOeeQUq_uwN61EpST_-wKJU4xa7zcDpdJmrS4kQKXyn7Q8BxwbWTegPTH7QS9-bn4SONcdseIhWos53ZtwU0h8UG5xF4klqJktolGinrB26apa8551CH8P6ahSuw0tjpEk9Mc1QOmfy-PrhzzlZJPoE86Y7Y_zZF0RYvokngEIVX3R1fAfS_0NJenw_HV',
    lastMsg: 'Đơn hàng #DH-2026-06 đã được xác nhận',
    time: '2 ngày',
    unread: 0,
    online: false,
  },
  {
    id: 5,
    name: 'Minh Nguyễn',
    role: 'Chuyên gia',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBZWykIdoBcv3hsnrKrDb3I7RuCyGP1qMnHJzwNnpJqntdhAzj56h6-hgnP0JTtExf8a2WnsZH5IS-kdCNnP-XwjuWJrxhCGBnFSDLwFurTw2WyvXX7gUYnYAMIt-_G4km8LP68TP9n14ZRtnurgMrgJln-DtPJvZZ0bU-ocmMejXjNuVvnOcVouGnokgdNy4bHi5CDv_c8hIi3jbRioAowGvaIPhwEMr4vUE7Sy9gjTw15nDdRPttPFXdhN_f6NjszHkYucdmZAqCY',
    lastMsg: 'Bài viết mới của anh rất hay, em học hỏi nhiều',
    time: '1 tuần',
    unread: 0,
    online: false,
  },
];

const MOCK_MSGS = [
  {
    id: 1,
    from: 'them',
    text: 'Chào anh, bên em đang cần báo giá thép hộp Hòa Phát 50x100mm',
    time: '10:30',
  },
  {
    id: 2,
    from: 'me',
    text: 'Chào em, để anh kiểm tra kho rồi gửi báo giá ngay nhé',
    time: '10:32',
  },
  {
    id: 3,
    from: 'them',
    text: 'Dạ, bên em cần gấp ạ. Khoảng 200 cây, giao tại Hà Nội',
    time: '10:33',
  },
  {
    id: 4,
    from: 'me',
    text: 'Hiện tại kho anh còn khoảng 350 cây. Giá sỉ 185k/cây, lấy trên 100 cây chiết khấu thêm 5%',
    time: '10:35',
  },
  {
    id: 5,
    from: 'them',
    text: 'Giá tốt quá anh ơi. Cho em xin báo giá chính thức qua email luôn nhé',
    time: '10:36',
  },
  {
    id: 6,
    from: 'me',
    text: 'Ok em, anh gửi mail ngay. Có cần thêm ống thép mạ kẽm D60 không?',
    time: '10:38',
  },
  {
    id: 7,
    from: 'them',
    text: 'Dạ có, anh gửi luôn báo giá ống D60 giúp em. Số lượng tầm 100 cây',
    time: '10:40',
  },
];

/* Mini chat window for a single conversation */
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

const ForumHeader = ({ onCreatePostClick }) => {
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [openChats, setOpenChats] = useState([]);
  const [chatSearch, setChatSearch] = useState('');
  const notifRef = useRef(null);
  const chatRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (chatRef.current && !chatRef.current.contains(e.target)) setChatOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openChatWith = useCallback((conv) => {
    setOpenChats((prev) => {
      if (prev.find((c) => c.id === conv.id)) return prev;
      return [...prev, conv];
    });
    setChatOpen(false);
  }, []);

  const closeChat = useCallback((conv) => {
    setOpenChats((prev) => prev.filter((c) => c.id !== conv.id));
  }, []);

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => n.unread).length;
  const totalUnreadChats = CONVERSATIONS.reduce((s, c) => s + c.unread, 0);

  const filteredConvs = chatSearch
    ? CONVERSATIONS.filter((c) => c.name.toLowerCase().includes(chatSearch.toLowerCase()))
    : CONVERSATIONS;

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
                    setChatOpen(false);
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
                  setChatOpen(!chatOpen);
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
              {chatOpen && (
                <div className="absolute right-0 top-full mt-1 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl">
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

      {/* Mini chat windows docked at bottom-right */}
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
