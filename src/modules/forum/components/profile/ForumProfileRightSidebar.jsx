/**
 * ForumProfileRightSidebar - Cột phải trang Hồ sơ.
 */
import React from 'react';
import Icon from '../../../../shared/components/Icon';
import { useChat } from '../../contexts/ChatContext';

const ForumProfileRightSidebar = ({ isOwnProfile = false }) => {
  const { convos, openChatWith } = useChat();

  const handleChat = () => {
    if (isOwnProfile) return;
    if (convos.length > 0) openChatWith(convos[0]);
  };

  return (
    <div className="space-y-4">
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h4 className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">
          Liên hệ
        </h4>
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleChat}
            disabled={isOwnProfile}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold transition-all active:scale-95 ${isOwnProfile ? 'cursor-not-allowed bg-slate-100 text-slate-400' : 'bg-[#004785] text-white hover:bg-black'}`}
          >
            <Icon name="mail" size={16} />
            Nhắn tin
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50"
          >
            <Icon name="share" size={16} />
            Chia sẻ hồ sơ
          </button>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h4 className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">
          Thông tin
        </h4>
        <div className="space-y-2.5 text-xs text-slate-600">
          <p className="flex items-center gap-2">
            <Icon name="work" size={14} className="text-slate-400" />
            Nhà phân phối kim khí
          </p>
          <p className="flex items-center gap-2">
            <Icon name="location_on" size={14} className="text-slate-400" />
            Hà Nội
          </p>
          <p className="flex items-center gap-2">
            <Icon name="calendar_today" size={14} className="text-slate-400" />
            Tham gia 12/2024
          </p>
          <p className="flex items-center gap-2">
            <Icon name="forum" size={14} className="text-slate-400" />
            126 bài viết
          </p>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h4 className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">
          Bài viết gần đây
        </h4>
        <div className="space-y-3">
          {[
            { title: 'Chiến lược tối ưu hóa kho bãi VLXD', time: '2 ngày trước', likes: 452 },
            { title: 'Quản lý công nợ khách lẻ hiệu quả', time: '5 ngày trước', likes: 128 },
            { title: 'Kinh nghiệm chọn NCC sơn chống thấm', time: '1 tuần trước', likes: 95 },
          ].map((post, i) => (
            <div
              key={i}
              className="group cursor-pointer rounded-lg p-2 transition-colors hover:bg-slate-50"
            >
              <p className="line-clamp-2 text-xs font-bold text-slate-700 group-hover:text-[#004785]">
                {post.title}
              </p>
              <div className="mt-1 flex items-center gap-3 text-[10px] text-slate-400">
                <span>{post.time}</span>
                <span className="flex items-center gap-1">
                  <Icon name="thumb_up" size={10} />
                  {post.likes}
                </span>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="w-full pt-1 text-center text-[11px] font-bold text-[#004785] hover:underline"
          >
            Xem tất cả
          </button>
        </div>
      </section>

      <button
        type="button"
        className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[11px] font-bold text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
      >
        <Icon name="flag" size={14} />
        Báo cáo hồ sơ
      </button>
    </div>
  );
};

export default ForumProfileRightSidebar;
