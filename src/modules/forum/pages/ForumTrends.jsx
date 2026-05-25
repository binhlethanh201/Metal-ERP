import ForumHeader from '../components/ForumHeader';
import { useState } from 'react';
import CreatePostModal from '../components/CreatePostModal';
import ForumLeftSidebar from '../components/ForumLeftSidebar';

const MaterialIcon = ({ name, className = '', fill = false }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{ fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 20` }}
  >
    {name}
  </span>
);

const topProducts = [
  {
    title: 'Bộ lục giác Chrome-Vanadium',
    market: 'Sức mua: Toàn quốc • 120 shop quan tâm',
    percent: '+42%',
    accent: 'secondary',
    demand: 60,
    season: 25,
    priceShare: 15,
    tip: 'Nhập 15–25 sản phẩm',
  },
  {
    title: 'Kìm bấm cos thủy lực',
    market: 'Sức mua: TP.HCM • 85 shop quan tâm',
    percent: '+38%',
    accent: 'primary',
    demand: 45,
    season: 40,
    priceShare: 15,
    tip: 'Nhập 10–15 sản phẩm',
  },
];

const trendProducts = [
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCOhDh5_pTo2uI5k89QcHwi-UOzrY-VLkP5MQ7b5ja0zqPHk9G7yzwPtVou3-oZu4K2gaVOrYNuuCBsynJSVS2qHqA7oJsSJ5zgSsFLSRefbn0-tTlGbiCpc-p9Syq4x01mTseB8v-V4m6vyqx3xbMbvICX06kvB5qAiWbqKT1dogXnTsZeS8obxK0yE-5_8YxlGt-E3IZN2vabJweuaABHmKjwB79YNzV5FP1QUWHsYI16tu1KbT3VGzKNks66DvsvnjA9COtQcl7g',
    badge: '+35% Tăng trưởng',
    area: 'Khu vực: Hà Nội / TP.HCM',
    title: 'Sơn chống thấm KOVA CT-11A Gold',
    tags: ['#kim_khi', '#vat_tu_xay_dung'],
    price: '850k – 950k',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuASFDg0zUn1Bu4MMXniXu2pblrP5gXI0UyUAacU5ecu8QtqfNPPIU46ctcOgIlGtF-dnFg-xjeavs_ie0kiKHgYjUnKxGoFuCAw01ENI5hfVVgLrXStNd1DtP3Zxrl_GmXwuA5R3POpfntW79m3wbUVPSW0ogu5DY5JXMPVLT8d01qr5Frx11uY-JMn_85Pw5JJhh1zc1SwfIirxUoU6MpeFEwedKTt6unLqYi6XXsyKDhf14fMvfCdN8vWyDx54wSCgqnLjPYnT2QU',
    badge: '+28% Tăng trưởng',
    area: 'Khu vực: Toàn quốc',
    title: 'Bộ vít Inox 304 đa dụng (Hộp 500pcs)',
    tags: ['#oc_vit', '#co_khi'],
    price: '320k – 380k',
  },
];

const quickTrends = [
  { name: 'Khoan pin 24V', icon: 'bolt', percent: '+124%', tone: 'secondary-container' },
  { name: 'Vòi sen inox 304', icon: 'water_drop', percent: '+56%', tone: 'primary-container' },
  { name: 'Búa cán nhựa', icon: 'construction', percent: '+32%', tone: 'tertiary-container' },
];

const popularTags = ['#kim_khi', '#gia_si', '#dien_dan_tho'];

const trendToneStyles = {
  'secondary-container': {
    background: 'bg-orange-50',
    text: 'text-orange-600',
  },
  'primary-container': {
    background: 'bg-blue-50',
    text: 'text-[#004785]',
  },
  'tertiary-container': {
    background: 'bg-violet-50',
    text: 'text-violet-600',
  },
};

const ForumTrends = () => {
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans text-slate-900 antialiased">
      <ForumHeader onCreatePostClick={() => setIsCreatePostModalOpen(true)} />

      <div className="mx-auto flex max-w-[1400px] justify-center gap-4 px-4 py-4">
        {/* Left Sidebar */}
        <aside className="sticky top-[64px] hidden h-[calc(100vh-64px)] w-[300px] shrink-0 overflow-y-auto lg:block">
          <ForumLeftSidebar activeKey="trend" />
        </aside>

        {/* Main Feed */}
        <main className="w-full min-w-0 max-w-[720px] space-y-4">
          {/* Header */}
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

          {/* Date Filter */}
          <div className="flex items-center gap-2 rounded-2xl bg-white p-1.5 shadow-sm">
            <button className="rounded-xl bg-[#004785] px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-[#004785]/20">
              30 ngày
            </button>
            <button className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-gray-100">
              Toàn quốc
            </button>
          </div>

          {/* Top Products */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <span className="h-6 w-2 rounded-full bg-orange-500" /> Top sản phẩm tăng trưởng
                nóng
              </h2>
              <button className="text-sm font-bold text-[#004785] hover:underline">
                Xem tất cả
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {topProducts.map((item) => (
                <article
                  key={item.title}
                  className={`flex flex-col rounded-2xl border-l-4 bg-white p-5 shadow-sm ${
                    item.accent === 'secondary' ? 'border-orange-500' : 'border-[#004785]'
                  }`}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                      <p className="text-xs text-slate-400">{item.market}</p>
                    </div>
                    <span
                      className={`text-2xl font-black leading-none ${
                        item.accent === 'secondary' ? 'text-orange-500' : 'text-[#004785]'
                      }`}
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

          {/* Chart + AI Section */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
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
                  <div
                    key={bar.label}
                    className="group relative flex w-1/4 flex-col items-center gap-2"
                  >
                    <div
                      className={`mb-1 text-[10px] font-black ${bar.active ? 'text-[#004785]' : 'text-slate-400'}`}
                    >
                      {bar.value}
                    </div>
                    <div
                      className={`w-12 rounded-t-lg ${bar.active ? 'bg-[#004785] shadow-lg shadow-[#004785]/20' : 'bg-[#004785]/40'} ${bar.height}`}
                    />
                    <span
                      className={`mt-1 text-[10px] font-bold ${
                        bar.active ? 'uppercase tracking-tighter text-[#004785]' : 'text-slate-400'
                      }`}
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

          {/* Trend Products List */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Danh sách sản phẩm xu hướng</h2>
              <button className="text-sm font-bold text-[#004785] hover:underline">
                Xem tất cả
              </button>
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
        </main>

        {/* Right Sidebar */}
        <aside className="sticky top-[64px] hidden h-[calc(100vh-64px)] w-[300px] shrink-0 space-y-4 overflow-y-auto xl:block">
          {/* Xu hướng nhanh */}
          <section className="rounded-2xl bg-white p-4 shadow-sm">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
              Xu hướng nhanh
            </h3>
            <div className="space-y-4">
              {quickTrends.map((trend) => (
                <div key={trend.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${trendToneStyles[trend.tone].background} ${trendToneStyles[trend.tone].text}`}
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

          {/* Từ khóa phổ biến */}
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

          {/* Tình trạng kho */}
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

          {/* Đề xuất nhà cung cấp */}
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

          {/* Quy định cộng đồng */}
          <section className="rounded-2xl bg-[#004785] p-4 text-white shadow-md">
            <div className="mb-2 flex items-center gap-2">
              <MaterialIcon name="verified_user" className="text-[24px] text-white" fill />
              <h3 className="text-sm font-bold uppercase tracking-widest">Quy định cộng đồng</h3>
            </div>
            <p className="text-xs font-medium leading-relaxed text-white/80">
              Đảm bảo thông tin trung thực về giá và nguồn hàng để bảo vệ quyền lợi chung của cộng
              đồng đại lý Kim Khí Hub.
            </p>
            <div className="mt-3 flex items-center justify-between border-t border-white/20 pt-3">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                Uy tín hàng đầu
              </span>
              <MaterialIcon name="shield" className="text-white/50" />
            </div>
          </section>
        </aside>
      </div>

      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
      />
    </div>
  );
};

export default ForumTrends;
