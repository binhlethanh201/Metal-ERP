import React from 'react';
import { TrendingUp, ShieldAlert } from 'lucide-react';

const PostDetailRightSidebar = ({ trends = [], relatedPosts = [], tags = [] }) => (
  <>
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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
              className={`shrink-0 pl-2 text-xs font-bold ${
                trend.isPositive ? 'text-green-600' : 'text-red-500'
              }`}
            >
              {trend.change}
            </span>
          </li>
        ))}
      </ul>
    </section>

    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-4">
        <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">
          Giao thương liên quan
        </h4>
        <button type="button" className="text-xs font-bold text-[#004785] hover:underline">
          Tất cả
        </button>
      </div>
      <div className="space-y-4 p-4">
        {relatedPosts.map((rp) => (
          <div key={rp.id} className="group flex cursor-pointer gap-3">
            {rp.image ? (
              <img
                src={rp.image}
                alt={rp.title}
                className="h-16 w-16 shrink-0 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                <TrendingUp size={20} className="text-slate-400" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h5 className="line-clamp-2 text-sm font-bold leading-snug text-slate-800 transition-colors group-hover:text-[#004785]">
                {rp.title}
              </h5>
              {rp.price && <p className="mt-0.5 text-xs font-bold text-[#004785]">{rp.price}</p>}
              {rp.badge && (
                <p className={`mt-0.5 text-xs font-bold ${rp.badgeTone || 'text-secondary'}`}>
                  {rp.badge}
                </p>
              )}
              <p className="mt-0.5 text-[10px] text-slate-400">
                {[rp.author, rp.location, rp.time].filter(Boolean).join(' • ')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h4 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-400">
        Từ khóa phổ biến
      </h4>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className="cursor-pointer rounded-full bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-600 transition-all hover:bg-[#004785] hover:text-white"
          >
            #{typeof tag === 'string' ? tag.replace(/\s/g, '_').toLowerCase() : tag}
          </span>
        ))}
      </div>
    </section>

    <section className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50/60 p-6">
      <div className="mb-5 flex items-center gap-2 text-emerald-700">
        <ShieldAlert className="text-emerald-600" size={16} />
        <h4 className="text-xs font-black uppercase tracking-widest">Mẹo giao dịch an toàn</h4>
      </div>
      <ul className="relative z-10 space-y-4">
        <li className="flex items-start gap-3">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
            1
          </span>
          <p className="text-xs font-medium leading-relaxed text-slate-700">
            Nên giao dịch trực tiếp với các đơn vị có tick xanh xác minh.
          </p>
        </li>
        <li className="flex items-start gap-3">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
            2
          </span>
          <p className="text-xs font-medium leading-relaxed text-slate-700">
            Yêu cầu xem hóa đơn chứng từ, CO/CQ của hàng hóa trước khi đặt cọc.
          </p>
        </li>
        <li className="flex items-start gap-3">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
            3
          </span>
          <p className="text-xs font-medium leading-relaxed text-slate-700">
            Sử dụng hệ thống thanh toán qua BuildMarket để được bảo vệ đơn hàng.
          </p>
        </li>
      </ul>
      <button
        type="button"
        className="mt-6 w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white transition-opacity hover:opacity-90"
      >
        Tìm hiểu thêm
      </button>
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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
