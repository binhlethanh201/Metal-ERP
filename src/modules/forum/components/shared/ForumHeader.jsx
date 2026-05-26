import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../../shared/components/Icon';
import Logo from '../../../../shared/components/Logo';

const ForumHeader = ({ onCreatePostClick }) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      {/* KHUNG CHỨA TRẦN MAX-W-1650PX ĐỒNG BỘ LAYOUT DƯỚI */}
      <div className="mx-auto flex h-16 w-full max-w-[1650px] items-center justify-between px-6">
        {/* KHỐI TRÁI: LOGO HỆ THỐNG (TÁCH BIỆT KHỎI HỘP SEARCH ĐỂ ĐỊNH VỊ) */}
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

        {/* KHỐI PHẢI: ACTIONS ĐỒNG BỘ KÍCH CỠ BUTTON & AVATAR CỦA POS */}
        <div className="ml-auto flex shrink-0 items-center gap-4">
          {/* Nút Đăng bài */}
          <button
            type="button"
            onClick={onCreatePostClick}
            className="flex items-center gap-x-2 rounded-xl bg-[#004785] px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-black active:scale-95"
          >
            <Icon name="add" className="text-sm" />
            <span>Đăng bài viết</span>
          </button>

          {/* Vạch chia nhẹ ngăn cách action */}
          <div className="h-8 w-px bg-slate-200" />

          {/* Tiện ích thông báo & ảnh đại diện */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="relative rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100"
            >
              <Icon name="notifications" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <div className="flex items-center gap-3 pl-2">
              <img
                alt="User Profile Avatar"
                className="h-10 w-10 rounded-lg border border-slate-200 object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjYqYBGkR_Iadb7O3sIeQNtpWqJ9ThFzKm9BOnEoOjeAE90A3wKJFFf_2bunkuTYMCqxG-rZhI2sPranFao-yWEOh0ApqhjfAAZbuje4uAJVypcId7wA_hljomIOwQcSCCah1Fy-OvCW8q4Fu_GOKEK8rcUHnVgFEuCEYDJGKLI7qI0pVrjInnAhtDOJTjOxgm3_qIjxQV1OQT-PS9-tSwqZFR6TBj4W3czn_RYk-psKet5iM85xrN2qNW9iI1H_BG-KYPwDIYPCHf"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ForumHeader;
