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
    background: 'bg-secondary-container/20',
    text: 'text-secondary',
  },
  'primary-container': {
    background: 'bg-primary-container/20',
    text: 'text-primary',
  },
  'tertiary-container': {
    background: 'bg-tertiary-container/20',
    text: 'text-tertiary',
  },
};

const ForumTrends = () => {
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background font-sans text-on-surface antialiased">
      <ForumHeader onCreatePostClick={() => setIsCreatePostModalOpen(true)} />

      <div className="relative mx-auto flex max-w-[1200px] gap-4">
        <ForumLeftSidebar activeKey="trend" />

        <main className="min-w-0 flex-1 bg-surface py-4">
          <div className="flex flex-col gap-8 p-6 lg:flex-row lg:p-8">
            <div className="flex-1 space-y-8">
              <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded bg-tertiary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-tertiary">
                      Thị trường
                    </span>
                    <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                      <MaterialIcon name="update" className="text-[14px]" /> 10:45 hôm nay
                    </span>
                  </div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">
                    Xu hướng ngành kim khí
                  </h1>
                  <p className="mt-1 text-sm italic text-on-surface-variant">
                    Dữ liệu tổng hợp từ POS &amp; Thị trường toàn quốc
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-surface-container-high p-1">
                  <button className="rounded-lg bg-white px-4 py-2 text-sm font-semibold shadow-sm">
                    30 ngày
                  </button>
                  <button className="rounded-lg px-4 py-2 text-sm font-semibold hover:bg-white/50">
                    Toàn quốc
                  </button>
                </div>
              </section>

              <section>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-bold">
                    <span className="h-6 w-2 rounded bg-secondary" /> Top sản phẩm tăng trưởng nóng
                  </h2>
                  <button className="text-xs font-bold text-primary hover:underline">
                    Xem tất cả
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {topProducts.map((item) => (
                    <article
                      key={item.title}
                      className={`flex flex-col rounded-2xl border-l-4 bg-white p-6 shadow-sm ${
                        item.accent === 'secondary' ? 'border-secondary' : 'border-primary'
                      }`}
                    >
                      <div className="mb-4 flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold">{item.title}</h3>
                          <p className="text-xs text-on-surface-variant">{item.market}</p>
                        </div>
                        <span
                          className={`text-2xl font-black leading-none ${
                            item.accent === 'secondary' ? 'text-secondary' : 'text-primary'
                          }`}
                        >
                          {item.percent}
                        </span>
                      </div>

                      <div className="mb-6 space-y-3">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                          <span>Nhu cầu {item.demand}%</span>
                          <span>Mùa vụ {item.season}%</span>
                          <span>Giá {item.priceShare}%</span>
                        </div>
                        <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full ${item.accent === 'secondary' ? 'bg-secondary' : 'bg-primary'}`}
                            style={{ width: `${item.demand}%` }}
                          />
                          <div
                            className={`h-full ${item.accent === 'secondary' ? 'bg-secondary/60' : 'bg-primary/60'}`}
                            style={{ width: `${item.season}%` }}
                          />
                          <div
                            className={`h-full ${item.accent === 'secondary' ? 'bg-secondary/30' : 'bg-primary/30'}`}
                            style={{ width: `${item.priceShare}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-auto flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <MaterialIcon name="lightbulb" className="text-lg text-tertiary" fill />
                          <span className="text-sm font-medium">{item.tip}</span>
                        </div>
                        <button className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all hover:bg-primary hover:text-white">
                          Nhập hàng POS
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md lg:col-span-2">
                  <div className="mb-8 flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-widest text-on-surface-variant">
                      Biểu đồ nhu cầu tháng
                    </h3>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-tertiary">
                      <span className="h-1.5 w-1.5 rounded-full bg-tertiary" /> TĂNG TRƯỞNG ỔN ĐỊNH
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
                          className={`mb-1 text-[10px] font-black ${bar.active ? 'text-primary' : 'text-slate-400'}`}
                        >
                          {bar.value}
                        </div>
                        <div
                          className={`w-12 rounded-t-lg ${bar.active ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-primary/40'} ${bar.height}`}
                        />
                        <span
                          className={`mt-1 text-[10px] font-bold ${
                            bar.active
                              ? 'uppercase tracking-tighter text-primary'
                              : 'text-on-surface-variant'
                          }`}
                        >
                          {bar.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                <aside className="rounded-3xl bg-gradient-to-br from-[#1A2533] to-[#2D3E50] p-6 text-white shadow-xl">
                  <div className="mb-6 flex items-center gap-2">
                    <MaterialIcon name="psychology" className="text-secondary-fixed" />
                    <h3 className="text-sm font-bold uppercase tracking-tight">Gợi ý tồn kho AI</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-xs text-white/60">Tồn hiện tại</span>
                      <span className="font-bold">08 cái</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-xs text-white/60">Tốc độ bán</span>
                      <span className="font-bold text-tertiary-fixed">1.2/ngày</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-xs text-white/60">Số ngày còn lại</span>
                      <span className="text-2xl font-black text-[#b91c1c]">~ 6 ngày</span>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs leading-relaxed">
                      <span className="font-bold text-secondary-fixed">CẢNH BÁO:</span> Sắp hết
                      hàng.
                      <span className="mt-1 block font-medium italic text-on-tertiary-container">
                        Khuyến nghị: Nhập thêm 20 sản phẩm
                      </span>
                    </p>
                  </div>
                </aside>
              </div>

              <section>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-on-surface">
                    Danh sách sản phẩm xu hướng
                  </h2>
                  <button className="text-sm font-bold text-primary hover:underline">
                    Xem tất cả
                  </button>
                </div>

                <div className="space-y-6">
                  {trendProducts.map((product, index) => (
                    <article
                      key={product.title}
                      className="group relative flex flex-col overflow-hidden rounded-3xl border border-surface-variant bg-white shadow-sm transition-shadow hover:shadow-md md:flex-row"
                    >
                      <div
                        className={`absolute bottom-0 left-0 top-0 w-1.5 ${index === 0 ? 'bg-primary' : 'bg-secondary'}`}
                      />
                      <div className="flex w-full flex-col gap-6 p-6 md:flex-row">
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
                              className={`rounded px-2 py-1 text-[10px] font-black uppercase ${index === 0 ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-secondary-fixed text-on-secondary-fixed'}`}
                            >
                              {product.badge}
                            </span>
                            <span className="text-[10px] font-medium text-on-surface-variant">
                              {product.area}
                            </span>
                          </div>
                          <h3 className="mb-1 text-xl font-extrabold text-on-surface">
                            {product.title}
                          </h3>
                          <div className="mb-4 flex flex-wrap gap-2">
                            {product.tags.map((tag) => (
                              <span key={tag} className="text-xs font-bold text-primary">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <p className="text-lg font-black text-on-surface">
                            {product.price}{' '}
                            <span className="text-xs font-medium uppercase text-on-surface-variant">
                              giá tham khảo
                            </span>
                          </p>
                        </div>

                        <div className="flex w-full flex-col justify-center gap-3 md:w-48">
                          <button className="rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90">
                            Thêm vào kho
                          </button>
                          <button className="rounded-xl border border-primary bg-white py-3 text-sm font-bold text-primary transition-all hover:bg-primary/5">
                            Xem chi tiết
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <aside className="w-full space-y-6 lg:w-80">
              <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <h3 className="mb-6 text-xs font-black uppercase tracking-widest text-on-surface-variant">
                  Xu hướng nhanh
                </h3>
                <div className="space-y-6">
                  {quickTrends.map((trend) => (
                    <div key={trend.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${trendToneStyles[trend.tone].background} ${trendToneStyles[trend.tone].text}`}
                        >
                          <MaterialIcon name={trend.icon} className="text-lg" />
                        </div>
                        <span className="text-sm font-medium">{trend.name}</span>
                      </div>
                      <span className="text-xs font-black">{trend.percent}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-on-surface-variant">
                  Từ khóa phổ biến
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag, index) => (
                    <span
                      key={tag}
                      className={`cursor-pointer rounded-full px-3 py-1.5 text-[11px] font-bold transition-all ${
                        index === 2
                          ? 'bg-secondary-container text-on-secondary-container'
                          : 'bg-slate-100 text-on-surface-variant hover:bg-secondary-container hover:text-on-secondary-container'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </section>

              <section className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant">
                  Tình trạng kho
                </h3>
                <div className="flex items-center gap-3 rounded-2xl border-2 border-error bg-error p-4 shadow-sm">
                  <MaterialIcon name="error" className="text-white" fill />
                  <div>
                    <p className="text-sm font-black text-white">3 mặt hàng sắp hết</p>
                    <p className="text-xs font-medium text-white/90">Cần nhập hàng trước thứ 6</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border-2 border-tertiary bg-tertiary p-4 shadow-sm">
                  <MaterialIcon name="check_circle" className="text-white" fill />
                  <div>
                    <p className="text-sm font-black text-white">12 mặt hàng ổn định</p>
                    <p className="text-xs font-medium text-white/90">Tồn kho đủ cho 15 ngày</p>
                  </div>
                </div>
              </section>

              <section className="group relative h-44 overflow-hidden rounded-3xl shadow-sm">
                <img
                  alt="Industrial hardware shelf"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdd85W_tZw8_bNfMaBmz5oStFGPKIvQx6HEMyxnfQzLcnpkg7ZbiWxYRRVdqvLHWnFlV_kG4bneLoQJD1D1tTF5Fo7qcaie7u6BMiXsHxptbObVO9Cxj8j3QrSu38Jc4aEqOBL_9MnowPmp9jlWdVw6uTRtbihXe5Y3u4jWVezTsfAEgLWMnFTYYVMejieUOehjNm9YKONEQCK9S4sc1iYPRp9LgrnV0MqMyTQGARkWnv9cBJ98kd0_y3kYuSbrZ4i2qHDxyxfl0AM"
                />
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent p-6">
                  <span className="mb-1 text-[10px] font-bold uppercase text-secondary-fixed">
                    Đề xuất nhà cung cấp
                  </span>
                  <h4 className="font-bold text-white">Hợp tác sỉ: Kim khí Miền Bắc</h4>
                  <button className="mt-3 flex items-center gap-1 text-[10px] font-bold text-white">
                    Khám phá ngay <MaterialIcon name="arrow_forward" className="text-xs" />
                  </button>
                </div>
              </section>

              <section className="rounded-3xl border border-primary-container bg-primary p-6 text-white shadow-lg">
                <div className="mb-3 flex items-center gap-2">
                  <MaterialIcon name="verified_user" className="text-[24px] text-white" fill />
                  <h3 className="text-sm font-black uppercase tracking-widest">
                    Quy định cộng đồng
                  </h3>
                </div>
                <p className="text-[12px] font-semibold leading-relaxed text-white/90">
                  Đảm bảo thông tin trung thực về giá và nguồn hàng để bảo vệ quyền lợi chung của
                  cộng đồng đại lý Kim Khí Hub.
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-white/20 pt-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                    Uy tín hàng đầu
                  </span>
                  <MaterialIcon name="shield" className="text-white/60" />
                </div>
              </section>
            </aside>
          </div>
        </main>
      </div>
      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
      />
    </div>
  );
};

export default ForumTrends;
