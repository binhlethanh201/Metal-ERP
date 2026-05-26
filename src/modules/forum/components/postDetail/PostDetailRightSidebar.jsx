/**
 * Cột phải trang Chi tiết bài đăng
 */
import React from 'react';
// Import trực tiếp các icon cần thiết từ thư viện lucide-react
import { TrendingUp, ShieldAlert } from 'lucide-react';

const PostDetailRightSidebar = ({ trends, relatedPosts, tags }) => (
  <>
    {/* Khối xu hướng sản phẩm */}
    <section className="rounded-2xl border border-slate-100/40 bg-white p-4 shadow-sm">
      <h4 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
        <TrendingUp className="text-[#004785]" size={16} />
        Xu hướng sản phẩm
      </h4>
      <ul className="space-y-3 text-sm font-semibold text-slate-600">
        {trends.map((trend, idx) => (
          <li key={idx} className="group flex items-center justify-between">
            <span className="line-clamp-1 cursor-pointer transition-colors group-hover:text-[#004785]">
              {trend.name}
            </span>
            <span
              className={`shrink-0 pl-2 text-xs font-bold ${trend.isPositive ? 'text-green-600' : 'text-red-500'}`}
            >
              {trend.change}
            </span>
          </li>
        ))}
      </ul>
    </section>

    {/* Khối bài viết liên quan */}
    <section className="rounded-2xl border border-slate-100/40 bg-white p-4 shadow-sm">
      <h4 className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">
        Bài viết liên quan
      </h4>
      <div className="space-y-4">
        {relatedPosts.map((rp) => (
          <button
            key={rp.id}
            type="button"
            className="group block w-full text-left font-medium outline-none"
          >
            <p className="line-clamp-2 text-sm font-bold leading-snug text-slate-700 transition-colors group-hover:text-[#004785]">
              {rp.title}
            </p>
            <span className="mt-1 block text-xs font-medium text-slate-400">
              {rp.comments} bình luận • {rp.date}
            </span>
          </button>
        ))}
      </div>
    </section>

    {/* Khối hashtag tags liên quan */}
    <section className="rounded-2xl border border-slate-100/40 bg-white p-4 shadow-sm">
      <h4 className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">
        Tags liên quan
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className="cursor-pointer rounded-xl border border-slate-200/60 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-[#004785]"
          >
            #{tag}
          </span>
        ))}
      </div>
    </section>

    {/* Khối quy định cộng đồng chân trang */}
    <section className="rounded-2xl border border-slate-100/40 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-slate-500">
        <ShieldAlert size={16} className="text-[#004785]" />
        <h4 className="text-xs font-black uppercase tracking-widest">Quy định cộng đồng</h4>
      </div>
      <p className="text-xs font-medium leading-relaxed text-slate-500">
        Vui lòng tuân thủ quy tắc ứng xử văn minh. Không đăng tin rác, quảng cáo sai sự thật. Các
        bài viết sai quy định sẽ bị gỡ bỏ real-time.
      </p>
      <button
        type="button"
        className="mt-3 inline-block p-0.5 text-xs font-bold text-[#004785] hover:underline"
      >
        Xem chi tiết quy định
      </button>
    </section>
  </>
);

export default PostDetailRightSidebar;
