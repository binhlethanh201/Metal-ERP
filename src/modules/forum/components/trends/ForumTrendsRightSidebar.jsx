/**
 * src/modules/forum/components/trends/ForumTrendsRightSidebar.jsx
 * Cột phải trang Xu hướng dữ liệu.
 * Đã sửa toàn bộ lỗi tên gọi biến và đồng bộ 100% sang bộ Icon Lucide.
 */
import React from 'react';
import Icon from '../../../../shared/components/Icon';

const containerStyles = {
  'secondary-container': { bg: 'bg-orange-50', text: 'text-orange-600' },
  'primary-container': { bg: 'bg-blue-50', text: 'text-[#004785]' },
  'tertiary-container': { bg: 'bg-violet-50', text: 'text-violet-600' },
};

const ForumTrendsRightSidebar = ({ quickTrends, popularTags }) => (
  <>
    {/* Khối xu hướng nhanh */}
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h4 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-400">
        Xu hướng nhanh
      </h4>
      <div className="space-y-4">
        {quickTrends.map((trend) => (
          <div key={trend.name} className="flex items-center justify-between font-medium">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${containerStyles[trend.tone].bg} ${containerStyles[trend.tone].text}`}
              >
                <Icon name={trend.icon} size={16} />
              </div>
              <span className="text-sm text-slate-700">{trend.name}</span>
            </div>
            <span className="text-xs font-bold text-slate-800">{trend.percent}</span>
          </div>
        ))}
      </div>
    </section>

    {/* Khối từ khóa phổ biến */}
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h4 className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">
        Từ khóa phổ biến
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {popularTags.map((tag) => (
          <span
            key={tag}
            className="cursor-pointer rounded-full border border-slate-100 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 transition-all hover:bg-[#004785]/10 hover:text-[#004785]"
          >
            {tag}
          </span>
        ))}
      </div>
    </section>

    {/* Tình trạng kho đồng bộ từ hệ thống POS */}
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h4 className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">
        Tình trạng kho
      </h4>
      <div className="space-y-2.5">
        <div className="flex items-center gap-3 rounded-xl bg-red-500 p-3.5 shadow-sm">
          <Icon name="error" className="text-white" size={20} />
          <div>
            <p className="text-sm font-bold text-white">3 mặt hàng sắp hết</p>
            <p className="mt-0.5 text-xs font-medium text-white/80">Cần nhập hàng trước thứ 6</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-violet-500 p-3.5 shadow-sm">
          <Icon name="check_circle" className="text-white" size={20} />
          <div>
            <p className="text-sm font-bold text-white">12 mặt hàng ổn định</p>
            <p className="mt-0.5 text-xs font-medium text-white/80">Tồn kho đủ cho 15 ngày</p>
          </div>
        </div>
      </div>
    </section>

    {/* Card Đề xuất Nhà cung cấp */}
    <section className="group relative h-40 overflow-hidden rounded-2xl shadow-sm">
      <img
        alt="Industrial hardware shelf"
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdd85W_tZw8_bNfMaBmz5oStFGPKIvQx6HEMyxnfQzLcnpkg7ZbiWxYRRVdqvLHWnFlV_kG4bneLoQJD1D1tTF5Fo7qcaie7u6BMiXsHxptbObVO9Cxj8j3QrSu38Jc4aEqOBL_9MnowPmp9jlWdVw6uTRtbihXe5Y3u4jWVezTsfAEgLWMnFTYYVMejieUOehjNm9YKONEQCK9S4sc1iYPRp9LgrnV0MqMyTQGARkWnv9cBJ98kd0_y3kYuSbrZ4i2qHDxyxfl0AM"
      />
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4">
        <span className="mb-0.5 text-[9px] font-black uppercase tracking-wider text-amber-400">
          Đề xuất nhà cung cấp
        </span>
        <h5 className="text-sm font-bold text-white">Hợp tác sỉ: Kim khí Miền Bắc</h5>
        <button
          type="button"
          className="mt-2 flex items-center gap-1 text-xs font-bold text-white/90 transition-colors hover:text-white"
        >
          Khám phá ngay <Icon name="arrow_forward" size={12} />
        </button>
      </div>
    </section>

    {/* Quy định bảo mật cộng đồng */}
    <section className="flex h-36 flex-col justify-between rounded-2xl bg-[#004785] p-4 text-white shadow-md">
      <div className="flex items-center gap-2">
        <Icon name="verified_user" className="text-white" size={18} />
        <h4 className="text-xs font-black uppercase tracking-widest text-white/90">
          Quy định cộng đồng
        </h4>
      </div>
      <p className="text-xs font-medium leading-relaxed text-white/85">
        Đảm bảo thông tin trung thực về giá và nguồn hàng để bảo vệ quyền lợi chung của cộng đồng
        đại lý Kim Khí Hub.
      </p>
      <div className="mt-1 flex items-center justify-between border-t border-white/20 pt-2">
        <span className="text-[9px] font-black uppercase tracking-widest opacity-70">
          Uy tín hàng đầu
        </span>
        <Icon name="shield" className="text-white/40" size={14} />
      </div>
    </section>
  </>
);

// Khóa chết tên biến trùng khớp 100% tránh lỗi ESLint hoán đổi biến mẹ
export default ForumTrendsRightSidebar;
