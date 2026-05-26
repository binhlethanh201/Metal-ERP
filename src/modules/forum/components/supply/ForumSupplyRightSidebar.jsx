/**
 * src/modules/forum/components/supply/ForumSupplyRightSidebar.jsx
 * Cột phải phân hệ Kết nối nguồn hàng - Đã chuyển hóa sang hệ thống Icon Lucide.
 */
import React from 'react';
import Icon from '../../../../shared/components/Icon';

const ForumSupplyRightSidebar = ({ newSourcePosts, featuredSale }) => (
  <>
    {/* Khối nguồn hàng mới nhất */}
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h4 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
        <Icon name="update" className="text-[#004785]" size={16} />
        Nguồn hàng mới nhất
      </h4>
      <div className="space-y-4">
        {newSourcePosts.map((item) => (
          <button key={item.id} type="button" className="group block w-full text-left">
            <p className="line-clamp-2 text-sm font-bold leading-tight text-slate-700 transition-colors group-hover:text-[#004785]">
              {item.title}
            </p>
            <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-slate-400">
              {item.author}
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              {item.time}
            </p>
          </button>
        ))}
      </div>
    </section>

    {/* Khối bán sỉ nổi bật banner */}
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h4 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
        <Icon name="workspace_premium" className="text-orange-500" size={16} />
        Bán sỉ nổi bật
      </h4>
      <div className="mb-3 overflow-hidden rounded-xl border border-slate-100">
        <img
          alt="Featured Sale"
          className="group-hover:scale-102 aspect-video h-full w-full object-cover transition-transform duration-300"
          src={featuredSale.image}
        />
      </div>
      <p className="mb-1 text-sm font-bold leading-snug text-slate-800">{featuredSale.title}</p>
      <p className="mb-4 text-xs font-medium leading-relaxed text-slate-500">
        {featuredSale.description}
      </p>
      <button
        type="button"
        className="w-full rounded-xl bg-[#004785] py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-black active:scale-95"
      >
        Xem ngay
      </button>
    </section>

    {/* Khối an toàn giao dịch B2B */}
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-2.5 flex items-center gap-2 text-rose-600">
        <Icon name="gpp_maybe" size={16} />
        <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">
          An toàn giao dịch
        </h4>
      </div>
      <p className="mb-3 text-xs font-medium leading-relaxed text-slate-600">
        Cẩn trọng với yêu cầu thanh toán trước 100% cho nhà cung cấp chưa xác minh danh tính. Ưu
        tiên giao dịch trực tiếp.
      </p>
      <button
        type="button"
        className="p-0.5 text-xs font-bold text-[#004785] transition-colors hover:underline"
      >
        Tìm hiểu quy trình an toàn
      </button>
    </section>
  </>
);

export default ForumSupplyRightSidebar;
