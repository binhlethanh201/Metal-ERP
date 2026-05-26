/**
 * MobileFooter - Thanh điều hướng dưới cùng cho mobile trong form đăng bài.
 */
import React from 'react';
import { Home, MessageSquare, User } from 'lucide-react'; // Import trực tiếp từ thư viện lucide-react

const MobileFooter = () => (
  <footer className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-slate-200 bg-white px-4 shadow-lg md:hidden">
    {/* Nút Trang chủ */}
    <button type="button" className="flex flex-col items-center gap-1 text-[#004785]">
      <Home size={20} className="fill-[#004785]/10" />
      <span className="text-[10px] font-black uppercase tracking-wider">Trang chủ</span>
    </button>

    {/* Nút Tin nhắn */}
    <button
      type="button"
      className="flex flex-col items-center gap-1 text-slate-400 transition-colors hover:text-[#004785]"
    >
      <MessageSquare size={20} />
      <span className="text-[10px] font-bold uppercase tracking-wider">Tin nhắn</span>
    </button>

    {/* Nút Cá nhân */}
    <button
      type="button"
      className="flex flex-col items-center gap-1 text-slate-400 transition-colors hover:text-[#004785]"
    >
      <User size={20} />
      <span className="text-[10px] font-bold uppercase tracking-wider">Cá nhân</span>
    </button>
  </footer>
);

export default MobileFooter;
