/**
 * src/modules/forum/pages/ForumTrends.jsx
 * Trang Xu hướng kim khí - Đã sửa lỗi trùng lặp Layout, tinh chỉnh cỡ chữ,
 * và đồng bộ thanh lọc sang dạng Hộp Box Pills Segmented trẻ trung.
 */
import { useEffect, useState, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import ForumTrendsRightSidebar from '../components/trends/ForumTrendsRightSidebar';
import Icon from '../../../shared/components/Icon';
import {
  trendsTopProducts as topProducts,
  trendsTrendProducts as trendProducts,
  trendsQuickTrends as quickTrends,
  trendsPopularTags as popularTags,
} from '../data/forumPageData';
import AddToWarehouseModal from '../components/shared/AddToWarehouseModal';

const getAccent = (percent) => {
  const n = parseInt(percent);
  if (n >= 50)
    return {
      border: 'border-red-500',
      text: 'text-red-600',
      bar: 'bg-red-500',
      barM: 'bg-red-500/60',
      barL: 'bg-red-500/30',
      badge: 'bg-red-50 text-red-700',
      label: 'Bùng nổ',
    };
  if (n >= 35)
    return {
      border: 'border-[#004785]',
      text: 'text-[#004785]',
      bar: 'bg-[#004785]',
      barM: 'bg-[#004785]/60',
      barL: 'bg-[#004785]/30',
      badge: 'bg-blue-50 text-[#004785]',
      label: 'Tăng mạnh',
    };
  if (n >= 25)
    return {
      border: 'border-orange-500',
      text: 'text-orange-600',
      bar: 'bg-orange-500',
      barM: 'bg-orange-500/60',
      barL: 'bg-orange-500/30',
      badge: 'bg-orange-50 text-orange-700',
      label: 'Tăng khá',
    };
  return {
    border: 'border-emerald-500',
    text: 'text-emerald-600',
    bar: 'bg-emerald-500',
    barM: 'bg-emerald-500/60',
    barL: 'bg-emerald-500/30',
    badge: 'bg-emerald-50 text-emerald-700',
    label: 'Ổn định',
  };
};

const ForumTrends = () => {
  const [activeTime, setActiveTime] = useState('30 ngày');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalProducts, setAddModalProducts] = useState([]);
  const navigate = useNavigate();

  const topProductsWithId = useMemo(
    () => topProducts.map((p, i) => ({ ...p, id: p.id || `trend-${i}` })),
    []
  );

  const top2 = useMemo(
    () =>
      [...topProductsWithId].sort((a, b) => parseInt(b.percent) - parseInt(a.percent)).slice(0, 2),
    [topProductsWithId]
  );

  // Hứng hàm cập nhật sidebar từ rễ ForumLayout.jsx xuống
  const { setRightSidebar } = useOutletContext();

  // Bắn cụm Right Sidebar lên Layout mẹ ngay khi Page render
  useEffect(() => {
    if (setRightSidebar) {
      setRightSidebar(
        <ForumTrendsRightSidebar quickTrends={quickTrends} popularTags={popularTags} />
      );
    }
    return () => setRightSidebar?.(null);
  }, [setRightSidebar]);

  return (
    <div className="space-y-4">
      {/* HEADER ĐỒNG BỘ CỠ CHỮ & FONT CHỮ CHUẨN HỆ THỐNG */}
      <header className="px-1">
        <h2 className="mb-1 text-xl font-bold leading-tight text-gray-900">
          Xu hướng ngành kim khí
        </h2>
        <p className="text-sm text-slate-500 opacity-90">
          Dữ liệu tổng hợp real-time từ hệ thống POS & Đối tác chuỗi cung ứng toàn quốc.
        </p>
      </header>

      {/* 🌟 BỘ LỌC DẠNG HỘP BOX PILLS SEGMENTED ĐỒNG BỘ PHÂN HỆ */}
      <section className="rounded-2xl border border-slate-100 bg-white p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100/80 p-1">
          {['30 ngày', 'Toàn quốc'].map((tab) => {
            const isActive = activeTime === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTime(tab)}
                className={`rounded-lg py-2.5 text-center text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? 'scale-[1.01] bg-white text-[#004785] shadow-sm ring-1 ring-black/5'
                    : 'text-slate-500 hover:bg-white/40 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </section>

      {/* Top sản phẩm tăng trưởng nóng */}
      <section className="pt-2">
        <div className="mb-4 flex items-center justify-between px-1">
          <h3 className="flex items-center gap-2 text-base font-bold text-gray-900">
            <span className="h-4 w-1.5 rounded-full bg-orange-500" /> Top sản phẩm tăng trưởng nóng
          </h3>
          <button
            type="button"
            onClick={() => navigate('/forum/top-products')}
            className="text-xs font-bold text-[#004785] hover:underline"
          >
            Xem tất cả
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {top2.map((item) => {
            const c = getAccent(item.percent);
            return (
              <article
                key={item.title}
                className={`flex flex-col rounded-2xl border-l-4 bg-white p-5 shadow-sm transition-all hover:shadow-md ${c.border}`}
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-slate-800">{item.title}</h4>
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase ${c.badge}`}
                      >
                        {c.label}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] font-medium text-slate-400">{item.market}</p>
                  </div>
                  <span className={`text-xl font-black ${c.text}`}>{item.percent}</span>
                </div>

                <div className="mb-4 mt-1 space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <span>Nhu cầu {item.demand}%</span>
                    <span>Mùa vụ {item.season}%</span>
                    <span>Giá {item.priceShare}%</span>
                  </div>
                  <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full ${c.bar}`} style={{ width: `${item.demand}%` }} />
                    <div className={`h-full ${c.barM}`} style={{ width: `${item.season}%` }} />
                    <div className={`h-full ${c.barL}`} style={{ width: `${item.priceShare}%` }} />
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-50 pt-2">
                  <div className="flex items-center gap-1.5">
                    <Icon name="lightbulb" className="fill-amber-500 text-amber-500" size={16} />
                    <span className="line-clamp-1 text-xs font-semibold text-slate-600">
                      {item.tip}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAddModalProducts([item]);
                      setAddModalOpen(true);
                    }}
                    className="shrink-0 rounded-xl bg-[#004785] px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-black active:scale-95"
                  >
                    Thêm vào kho
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Biểu đồ & Widget Gợi ý AI */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-100/50 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">
              Biểu đồ nhu cầu tháng
            </h4>
            <span className="flex items-center gap-1 text-[10px] font-bold text-violet-600">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-500" /> TĂNG TRƯỞNG ỔN ĐỊNH
            </span>
          </div>
          <div className="relative mt-8 flex h-44 items-end justify-between px-2">
            <div className="absolute bottom-6 left-0 right-0 h-px bg-slate-100" />
            {[
              { value: '42%', height: 'h-20', label: 'Tuần 1', active: false },
              { value: '58%', height: 'h-28', label: 'Tuần 2', active: false },
              { value: '85%', height: 'h-36', label: 'Tuần 3', active: true },
              { value: '72%', height: 'h-32', label: 'Hiện tại', active: false },
            ].map((bar) => (
              <div
                key={bar.label}
                className="group relative z-10 flex w-1/4 flex-col items-center gap-1.5"
              >
                <span
                  className={`text-[11px] font-black ${bar.active ? 'text-[#004785]' : 'text-slate-400'}`}
                >
                  {bar.value}
                </span>
                <div
                  className={`w-10 rounded-t-md transition-all duration-300 ${bar.active ? 'bg-[#004785] shadow-md shadow-[#004785]/10' : 'bg-[#004785]/30 group-hover:bg-[#004785]/50'} ${bar.height}`}
                />
                <span
                  className={`mt-1 text-[10px] font-bold ${bar.active ? 'font-black text-[#004785]' : 'text-slate-400'}`}
                >
                  {bar.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        <aside className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-[#1A2533] to-[#2D3E50] p-5 text-white shadow-md">
          <div>
            <div className="mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
              <Icon name="psychology" className="text-amber-400" size={20} />
              <h4 className="text-xs font-black uppercase tracking-widest text-white/90">
                Gợi ý tồn kho AI
              </h4>
            </div>
            <div className="space-y-3 font-medium">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-xs text-white/60">Tồn hiện tại</span>
                <span className="text-sm font-bold">08 cái</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-xs text-white/60">Tốc độ bán</span>
                <span className="text-sm font-bold text-amber-400">1.2 / ngày</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-white/60">Dự kiến cạn kho</span>
                <span className="text-xl font-black text-red-400">~ 6 ngày</span>
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-xs font-medium leading-relaxed">
            <p>
              <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wide text-amber-400">
                ⚠️ Khuyến nghị AI:
              </span>
              Tốc độ tiêu thụ đang tăng mạnh. Hãy nạp thêm tối thiểu{' '}
              <span className="font-black text-white underline">20 sản phẩm</span> vào kho POS trước
              chu kỳ cuối tuần.
            </p>
          </div>
        </aside>
      </div>

      {/* Danh sách sản phẩm xu hướng */}
      <section className="pt-2">
        <div className="mb-4 flex items-center justify-between px-1">
          <h3 className="text-base font-bold text-gray-900">Danh sách sản phẩm xu hướng</h3>
          <button
            type="button"
            onClick={() => navigate('/forum/new-products')}
            className="text-xs font-bold text-[#004785] hover:underline"
          >
            Xem tất cả
          </button>
        </div>

        <div className="space-y-4">
          {trendProducts.map((product, index) => (
            <article
              key={product.title}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md md:flex-row"
            >
              <div
                className={`absolute bottom-0 left-0 top-0 w-1.5 ${index === 0 ? 'bg-[#004785]' : 'bg-orange-500'}`}
              />
              <div className="flex w-full flex-col items-center gap-5 p-5 md:flex-row">
                <div className="flex h-32 w-32 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                  <img
                    alt={product.title}
                    className="group-hover:scale-102 h-full w-full object-cover transition-transform duration-300"
                    src={product.image}
                  />
                </div>
                <div className="w-full flex-1 md:w-auto">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase ${index === 0 ? 'bg-violet-100 text-violet-700' : 'bg-orange-100 text-orange-700'}`}
                    >
                      {product.badge}
                    </span>
                    <span className="text-xs font-medium text-slate-400">{product.area}</span>
                  </div>
                  <h4 className="mb-1 text-lg font-bold text-slate-800">{product.title}</h4>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <span key={tag} className="text-xs font-bold text-[#004785]">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-base font-black text-slate-950">
                    {product.price}{' '}
                    <span className="pl-1 text-[10px] font-medium uppercase text-slate-400">
                      giá sỉ tham khảo
                    </span>
                  </p>
                </div>
                <div className="flex w-full shrink-0 flex-col justify-center gap-2 border-t border-slate-100 pt-3 md:w-44 md:border-t-0 md:pt-0">
                  <button
                    type="button"
                    onClick={() => {
                      setAddModalProducts([{ ...product, id: `trend-list-${product.title}` }]);
                      setAddModalOpen(true);
                    }}
                    className="rounded-xl bg-[#004785] py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-black active:scale-95"
                  >
                    Thêm vào kho
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <AddToWarehouseModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        products={addModalProducts.length > 0 ? addModalProducts : topProductsWithId}
      />
    </div>
  );
};

export default ForumTrends;
