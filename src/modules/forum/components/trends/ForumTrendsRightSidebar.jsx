/**
 * ForumTrendsRightSidebar - Cột phải trang Xu hướng.
 * 5 khối: Xu hướng nhanh, Từ khóa phổ biến, Tình trạng kho, Đề xuất NCC, Quy định cộng đồng.
 * Props: quickTrends, popularTags.
 */
import MaterialIcon from '../shared/MaterialIcon';

const styles = {
  'secondary-container': { bg: 'bg-orange-50', text: 'text-orange-600' },
  'primary-container': { bg: 'bg-blue-50', text: 'text-[#004785]' },
  'tertiary-container': { bg: 'bg-violet-50', text: 'text-violet-600' },
};

const ForumTrendsRightSidebar = ({ quickTrends, popularTags }) => (
  <>
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
        Xu hướng nhanh
      </h3>
      <div className="space-y-4">
        {quickTrends.map((trend) => (
          <div key={trend.name} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${styles[trend.tone].bg} ${styles[trend.tone].text}`}
              >
                <MaterialIcon name={trend.icon} className="text-lg" />
              </div>
              <span className="text-sm font-medium text-slate-700">{trend.name}</span>
            </div>
            <span className="text-xs font-black text-slate-700">{trend.percent}</span>
          </div>
        ))}
      </div>
    </section>
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
        Từ khóa phổ biến
      </h3>
      <div className="flex flex-wrap gap-2">
        {popularTags.map((tag) => (
          <span
            key={tag}
            className="cursor-pointer rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition-all hover:bg-[#004785]/10 hover:text-[#004785]"
          >
            {tag}
          </span>
        ))}
      </div>
    </section>
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
        Tình trạng kho
      </h3>
      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-2xl bg-red-500 p-4 shadow-sm">
          <MaterialIcon name="error" className="text-white" fill />
          <div>
            <p className="text-sm font-bold text-white">3 mặt hàng sắp hết</p>
            <p className="text-xs font-medium text-white/80">Cần nhập hàng trước thứ 6</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-violet-500 p-4 shadow-sm">
          <MaterialIcon name="check_circle" className="text-white" fill />
          <div>
            <p className="text-sm font-bold text-white">12 mặt hàng ổn định</p>
            <p className="text-xs font-medium text-white/80">Tồn kho đủ cho 15 ngày</p>
          </div>
        </div>
      </div>
    </section>
    <section className="group relative h-44 overflow-hidden rounded-2xl shadow-sm">
      <img
        alt="Industrial hardware shelf"
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdd85W_tZw8_bNfMaBmz5oStFGPKIvQx6HEMyxnfQzLcnpkg7ZbiWxYRRVdqvLHWnFlV_kG4bneLoQJD1D1tTF5Fo7qcaie7u6BMiXsHxptbObVO9Cxj8j3QrSu38Jc4aEqOBL_9MnowPmp9jlWdVw6uTRtbihXe5Y3u4jWVezTsfAEgLWMnFTYYVMejieUOehjNm9YKONEQCK9S4sc1iYPRp9LgrnV0MqMyTQGARkWnv9cBJ98kd0_y3kYuSbrZ4i2qHDxyxfl0AM"
      />
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent p-4">
        <span className="mb-1 text-[10px] font-bold uppercase text-amber-400">
          Đề xuất nhà cung cấp
        </span>
        <h4 className="font-bold text-white">Hợp tác sỉ: Kim khí Miền Bắc</h4>
        <button className="mt-2 flex items-center gap-1 text-xs font-bold text-white">
          Khám phá ngay <MaterialIcon name="arrow_forward" className="text-xs" />
        </button>
      </div>
    </section>
    <section className="rounded-2xl bg-[#004785] p-4 text-white shadow-md">
      <div className="mb-2 flex items-center gap-2">
        <MaterialIcon name="verified_user" className="text-[24px] text-white" fill />
        <h3 className="text-sm font-bold uppercase tracking-widest">Quy định cộng đồng</h3>
      </div>
      <p className="text-xs font-medium leading-relaxed text-white/80">
        Đảm bảo thông tin trung thực về giá và nguồn hàng để bảo vệ quyền lợi chung của cộng đồng
        đại lý Kim Khí Hub.
      </p>
      <div className="mt-3 flex items-center justify-between border-t border-white/20 pt-3">
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">
          Uy tín hàng đầu
        </span>
        <MaterialIcon name="shield" className="text-white/50" />
      </div>
    </section>
  </>
);

export default ForumTrendsRightSidebar;
