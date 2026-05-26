/**
 * ForumSupplyRightSidebar - Cột phải trang Nguồn hàng.
 * 3 khối: Nguồn hàng mới nhất, Bán sỉ nổi bật, An toàn giao dịch.
 * Props: newSourcePosts, featuredSale.
 */
import MaterialIcon from '../shared/MaterialIcon';

const ForumSupplyRightSidebar = ({ newSourcePosts, featuredSale }) => (
  <>
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-700">
        <MaterialIcon name="update" className="text-[20px] text-[#004785]" />
        Nguồn hàng mới nhất
      </h4>
      <div className="space-y-4">
        {newSourcePosts.map((item) => (
          <button key={item.id} type="button" className="group block w-full text-left">
            <p className="text-sm font-bold leading-tight text-slate-700 transition-colors group-hover:text-[#004785]">
              {item.title}
            </p>
            <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
              {item.author}
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              {item.time}
            </p>
          </button>
        ))}
      </div>
    </section>
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-700">
        <MaterialIcon name="workspace_premium" className="text-[20px] text-orange-500" />
        Bán sỉ nổi bật
      </h4>
      <div className="mb-3.5 overflow-hidden rounded-xl">
        <img
          alt="Featured"
          className="aspect-video h-full w-full object-cover"
          src={featuredSale.image}
        />
      </div>
      <p className="mb-1.5 text-sm font-bold leading-snug text-slate-700">{featuredSale.title}</p>
      <p className="mb-4 text-xs leading-relaxed text-slate-500">{featuredSale.description}</p>
      <button className="w-full rounded-xl bg-[#004785] py-2.5 text-xs font-bold text-white transition-all hover:bg-[#00376b]">
        Xem ngay
      </button>
    </section>
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-2.5 flex items-center gap-2 text-rose-600">
        <MaterialIcon name="gpp_maybe" className="text-[20px]" />
        <h4 className="text-xs font-bold uppercase tracking-widest">An toàn giao dịch</h4>
      </div>
      <p className="mb-4 text-xs leading-relaxed text-slate-600">
        Cẩn trọng với yêu cầu thanh toán trước 100% cho nhà cung cấp chưa xác minh. Ưu tiên giao
        dịch qua hệ thống.
      </p>
      <button
        type="button"
        className="text-xs font-bold text-[#004785] transition-colors hover:underline"
      >
        Tìm hiểu quy trình an toàn
      </button>
    </section>
  </>
);

export default ForumSupplyRightSidebar;
