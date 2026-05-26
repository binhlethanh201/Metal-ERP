/**
 * src/modules/forum/components/news/ForumNewsRightSidebar.jsx
 * Cột phải trang Tin tức ngành.
 * Đã đồng bộ hoàn toàn sang bộ cấu trúc Icon Lucide mới.
 */
import React from 'react';
import Icon from '../../../../shared/components/Icon';

const ForumNewsRightSidebar = ({ hotProductNews, forumDiscussions }) => (
  <>
    {/* Khối tin sản phẩm hot */}
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h4 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
        <Icon name="local_fire_department" className="text-orange-500" size={16} />
        Tin liên quan sản phẩm hot
      </h4>
      <div className="space-y-4">
        {hotProductNews.map((item) => (
          <div key={item.id} className="group cursor-pointer">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {item.brand}
            </p>
            <h5 className="line-clamp-2 text-sm font-bold text-slate-700 transition-colors group-hover:text-[#004785]">
              {item.title}
            </h5>
          </div>
        ))}
      </div>
    </section>

    {/* Khối thảo luận diễn đàn tương ứng */}
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h4 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
        <Icon name="forum" className="text-violet-500" size={16} />
        Thảo luận diễn đàn
      </h4>
      <div className="space-y-1">
        {forumDiscussions.map((item) => (
          <button
            key={item.id}
            type="button"
            className="group block w-full rounded-xl p-2.5 text-left transition-colors hover:bg-slate-50"
          >
            <p className="mb-1 line-clamp-2 text-sm font-bold text-slate-700 transition-colors group-hover:text-[#004785]">
              {item.title}
            </p>
            <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
              <span className="flex items-center gap-1">
                <Icon name="chat_bubble" size={12} /> {item.comments} bình luận
              </span>
              <span>•</span>
              <span>{item.views} lượt xem</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  </>
);

export default ForumNewsRightSidebar;
