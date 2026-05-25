/**
 * Trang Xu hướng - Top sản phẩm tăng trưởng, biểu đồ nhu cầu, danh sách SP xu hướng.
 * Kèm gợi ý tồn kho AI.
 */
import ForumLayout from '../components/shared/ForumLayout';
import ForumTrendsRightSidebar from '../components/trends/ForumTrendsRightSidebar';
import MaterialIcon from '../components/shared/MaterialIcon';
import {
  trendsTopProducts as topProducts,
  trendsTrendProducts as trendProducts,
  trendsQuickTrends as quickTrends,
  trendsPopularTags as popularTags,
} from '../data/forumPageData';

const ForumTrends = () => (
  <ForumLayout
    activeKey="trend"
    rightSidebar={<ForumTrendsRightSidebar quickTrends={quickTrends} popularTags={popularTags} />}
  >
    <section>
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded-lg bg-violet-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-600">
          Thị trường
        </span>
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <MaterialIcon name="update" className="text-[14px]" /> 10:45 hôm nay
        </span>
      </div>
      <h1 className="text-xl font-bold text-gray-900">Xu hướng ngành kim khí</h1>
      <p className="mt-1 text-sm text-slate-500">
        Dữ liệu tổng hợp từ POS &amp; Thị trường toàn quốc
      </p>
    </section>

    <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white p-1.5 shadow-sm">
      <button className="rounded-xl bg-[#004785] px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-[#004785]/20">
        30 ngày
      </button>
      <button className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-gray-100">
        Toàn quốc
      </button>
    </div>

    <section className="mt-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
          <span className="h-6 w-2 rounded-full bg-orange-500" /> Top sản phẩm tăng trưởng nóng
        </h2>
        <button className="text-sm font-bold text-[#004785] hover:underline">Xem tất cả</button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {topProducts.map((item) => (
          <article
            key={item.title}
            className={`flex flex-col rounded-2xl border-l-4 bg-white p-5 shadow-sm ${item.accent === 'secondary' ? 'border-orange-500' : 'border-[#004785]'}`}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                <p className="text-xs text-slate-400">{item.market}</p>
              </div>
              <span
                className={`text-2xl font-black leading-none ${item.accent === 'secondary' ? 'text-orange-500' : 'text-[#004785]'}`}
              >
                {item.percent}
              </span>
            </div>
            <div className="mb-6 space-y-3">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>Nhu cầu {item.demand}%</span>
                <span>Mùa vụ {item.season}%</span>
                <span>Giá {item.priceShare}%</span>
              </div>
              <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full ${item.accent === 'secondary' ? 'bg-orange-500' : 'bg-[#004785]'}`}
                  style={{ width: `${item.demand}%` }}
                />
                <div
                  className={`h-full ${item.accent === 'secondary' ? 'bg-orange-500/60' : 'bg-[#004785]/60'}`}
                  style={{ width: `${item.season}%` }}
                />
                <div
                  className={`h-full ${item.accent === 'secondary' ? 'bg-orange-500/30' : 'bg-[#004785]/30'}`}
                  style={{ width: `${item.priceShare}%` }}
                />
              </div>
            </div>
            <div className="mt-auto flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <MaterialIcon name="lightbulb" className="text-lg text-amber-500" fill />
                <span className="text-sm font-medium text-slate-600">{item.tip}</span>
              </div>
              <button className="rounded-xl bg-[#004785] px-4 py-2 text-xs font-bold text-white transition-all hover:bg-[#00376b]">
                Nhập hàng POS
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>

    <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
      <section className="rounded-2xl bg-white p-5 shadow-sm lg:col-span-2">
        <div className="mb-8 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Biểu đồ nhu cầu tháng
          </h3>
          <span className="flex items-center gap-1 text-[10px] font-bold text-violet-600">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500" /> TĂNG TRƯỞNG ỔN ĐỊNH
          </span>
        </div>
        <div className="relative flex h-48 items-end justify-between px-4">
          <div className="absolute bottom-8 left-4 right-4 h-px bg-slate-100" />
          {[
            { value: '42%', height: 'h-24', label: 'Tuần 1', active: false },
            { value: '58%', height: 'h-32', label: 'Tuần 2', active: false },
            { value: '85%', height: 'h-40', label: 'Tuần 3', active: true },
            { value: '72%', height: 'h-36', label: 'Tuần hiện tại', active: false },
          ].map((bar) => (
            <div key={bar.label} className="group relative flex w-1/4 flex-col items-center gap-2">
              <div
                className={`mb-1 text-[10px] font-black ${bar.active ? 'text-[#004785]' : 'text-slate-400'}`}
              >
                {bar.value}
              </div>
              <div
                className={`w-12 rounded-t-lg ${bar.active ? 'bg-[#004785] shadow-lg shadow-[#004785]/20' : 'bg-[#004785]/40'} ${bar.height}`}
              />
              <span
                className={`mt-1 text-[10px] font-bold ${bar.active ? 'uppercase tracking-tighter text-[#004785]' : 'text-slate-400'}`}
              >
                {bar.label}
              </span>
            </div>
          ))}
        </div>
      </section>
      <aside className="rounded-2xl bg-gradient-to-br from-[#1A2533] to-[#2D3E50] p-5 text-white shadow-md">
        <div className="mb-6 flex items-center gap-2">
          <MaterialIcon name="psychology" className="text-amber-400" />
          <h3 className="text-sm font-bold uppercase tracking-tight">Gợi ý tồn kho AI</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs text-white/60">Tồn hiện tại</span>
            <span className="font-bold">08 cái</span>
          </div>
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs text-white/60">Tốc độ bán</span>
            <span className="font-bold text-amber-400">1.2/ngày</span>
          </div>
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs text-white/60">Số ngày còn lại</span>
            <span className="text-2xl font-black text-red-500">~ 6 ngày</span>
          </div>
        </div>
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs leading-relaxed">
            <span className="font-bold text-amber-400">CẢNH BÁO:</span> Sắp hết hàng.
            <span className="mt-1 block font-medium italic text-white/70">
              Khuyến nghị: Nhập thêm 20 sản phẩm
            </span>
          </p>
        </div>
      </aside>
    </div>

    <section className="mt-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Danh sách sản phẩm xu hướng</h2>
        <button className="text-sm font-bold text-[#004785] hover:underline">Xem tất cả</button>
      </div>
      <div className="space-y-4">
        {trendProducts.map((product, index) => (
          <article
            key={product.title}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-shadow hover:shadow-md md:flex-row"
          >
            <div
              className={`absolute bottom-0 left-0 top-0 w-1.5 ${index === 0 ? 'bg-[#004785]' : 'bg-orange-500'}`}
            />
            <div className="flex w-full flex-col gap-6 p-5 md:flex-row">
              <div className="flex h-40 w-full flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-50 md:w-40">
                <img
                  alt={product.title}
                  className="h-full w-full object-cover"
                  src={product.image}
                />
              </div>
              <div className="flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase ${index === 0 ? 'bg-violet-100 text-violet-700' : 'bg-orange-100 text-orange-700'}`}
                  >
                    {product.badge}
                  </span>
                  <span className="text-xs font-medium text-slate-400">{product.area}</span>
                </div>
                <h3 className="mb-1 text-xl font-bold text-gray-900">{product.title}</h3>
                <div className="mb-4 flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span key={tag} className="text-sm font-medium text-[#004785]">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-lg font-black text-gray-900">
                  {product.price}{' '}
                  <span className="text-xs font-medium uppercase text-slate-400">
                    giá tham khảo
                  </span>
                </p>
              </div>
              <div className="flex w-full flex-col justify-center gap-3 md:w-48">
                <button className="rounded-xl bg-[#004785] py-3 text-sm font-bold text-white shadow-md shadow-[#004785]/20 transition-all hover:bg-[#00376b]">
                  Thêm vào kho
                </button>
                <button className="rounded-xl border border-[#004785] bg-white py-3 text-sm font-bold text-[#004785] transition-all hover:bg-[#004785]/5">
                  Xem chi tiết
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  </ForumLayout>
);

export default ForumTrends;
