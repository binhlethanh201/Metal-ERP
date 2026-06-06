/**
 * ForumTopProducts - Trang "Top sản phẩm bán chạy".
 */
import { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import { trendsTopProducts as rawProducts } from '../data/forumPageData';
import ForumTopProductsRightSidebar from '../components/topProducts/ForumTopProductsRightSidebar';

const TIME_TABS = ['30 ngày', '7 ngày', 'Hôm nay'];
const AREAS = ['Tất cả', 'Toàn quốc', 'Hà Nội', 'TP.HCM', 'Miền Bắc', 'Miền Nam', 'Miền Trung'];

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

const ForumTopProducts = () => {
  const [activeTime, setActiveTime] = useState('30 ngày');
  const [area, setArea] = useState('Tất cả');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const ITEMS_PER_PAGE = 6;
  const { setRightSidebar } = useOutletContext();

  const sortedProducts = useMemo(
    () => [...rawProducts].sort((a, b) => parseInt(b.percent) - parseInt(a.percent)),
    []
  );

  const filteredProducts = useMemo(() => {
    if (area === 'Tất cả') return sortedProducts;
    return sortedProducts.filter((p) => p.market.includes(area));
  }, [sortedProducts, area]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const pageProducts = filteredProducts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [area]);

  useEffect(() => {
    setRightSidebar?.(<ForumTopProductsRightSidebar />);
    return () => setRightSidebar?.(null);
  }, [setRightSidebar]);

  return (
    <div className="space-y-4">
      <header className="px-1">
        <h2 className="mb-2 text-xl font-bold leading-tight text-gray-900">
          Top sản phẩm bán chạy
        </h2>
        <p className="text-sm text-slate-500 opacity-90">
          Sản phẩm có nhu cầu cao nhất dựa trên dữ liệu thực tế từ hệ thống POS và đối tác.
        </p>
      </header>

      {/* Filter bar: Hot button + Area selector + Time tabs */}
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Nút 10 sản phẩm hot */}
          <button
            type="button"
            onClick={() => setArea('Tất cả')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
              area === 'Tất cả'
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-red-50 text-red-600 hover:bg-red-100'
            }`}
          >
            <Icon name="local_fire_department" size={18} />
            10 sản phẩm hot nhất
          </button>

          {/* Area selector */}
          <div className="flex items-center gap-2">
            <Icon name="location_on" size={16} className="text-slate-400" />
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-[#004785] focus:ring-0"
            >
              {AREAS.map((a) => (
                <option key={a} value={a}>
                  {a === 'Tất cả' ? 'Tất cả khu vực' : a}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Time filter */}
        <div className="flex gap-1 rounded-xl bg-slate-100/80 p-1">
          {TIME_TABS.map((tab) => {
            const isActive = activeTime === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTime(tab)}
                className={`flex-1 rounded-lg py-2 text-center text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-[#004785] shadow-sm ring-1 ring-black/5'
                    : 'text-slate-500 hover:bg-white/40 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product cards grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-12 text-center">
          <Icon name="search" size={32} className="mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-semibold text-slate-500">
            Không có sản phẩm nào ở khu vực "{area}"
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {pageProducts.map((item) => {
            const c = getAccent(item.percent);
            return (
              <article
                key={item.title}
                onClick={() => setSelected(item)}
                className={`flex cursor-pointer flex-col rounded-2xl border-l-4 bg-white p-5 shadow-sm transition-all hover:shadow-md ${c.border}`}
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
                    className="shrink-0 rounded-xl bg-[#004785] px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-black active:scale-95"
                  >
                    Thêm vào kho
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-[#004785] hover:text-[#004785] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Icon name="chevron_left" size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPage(n)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                page === n
                  ? 'bg-[#004785] text-white'
                  : 'border border-slate-200 bg-white text-slate-500 hover:border-[#004785] hover:text-[#004785]'
              }`}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-[#004785] hover:text-[#004785] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Icon name="chevron_right" size={16} />
          </button>
        </div>
      )}

      {/* Product detail popup */}
      {selected &&
        (() => {
          const c = getAccent(parseInt(selected.percent));
          const color =
            parseInt(selected.percent) >= 50
              ? '#dc2626'
              : parseInt(selected.percent) >= 35
                ? '#004785'
                : parseInt(selected.percent) >= 25
                  ? '#ea580c'
                  : '#059669';
          return (
            <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <h3 className="text-base font-bold text-slate-900">{selected.title}</h3>
                  <button
                    onClick={() => setSelected(null)}
                    className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
                  >
                    <Icon name="close" size={18} />
                  </button>
                </div>
                <div className="space-y-4 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black" style={{ color }}>
                      {selected.percent}
                    </span>
                    <span
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold uppercase ${parseInt(selected.percent) >= 50 ? 'bg-red-50 text-red-700' : parseInt(selected.percent) >= 35 ? 'bg-blue-50 text-[#004785]' : parseInt(selected.percent) >= 25 ? 'bg-orange-50 text-orange-700' : 'bg-emerald-50 text-emerald-700'}`}
                    >
                      {c.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{selected.market}</p>
                  {selected.referencePrice && (
                    <p className="text-sm">
                      Giá tham khảo:{' '}
                      <span className="font-bold text-[#004785]">{selected.referencePrice}</span>
                    </p>
                  )}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      <span>Nhu cầu {selected.demand}%</span>
                      <span>Mùa vụ {selected.season}%</span>
                      <span>Giá {selected.priceShare}%</span>
                    </div>
                    <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full ${c.bar}`} style={{ width: `${selected.demand}%` }} />
                      <div
                        className={`h-full ${c.barM}`}
                        style={{ width: `${selected.season}%` }}
                      />
                      <div
                        className={`h-full ${c.barL}`}
                        style={{ width: `${selected.priceShare}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Icon name="lightbulb" size={14} className="text-amber-500" />
                    <span>{selected.tip}</span>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="w-full rounded-xl bg-[#004785] py-2.5 text-sm font-bold text-white transition-colors hover:bg-black"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
};

export default ForumTopProducts;
