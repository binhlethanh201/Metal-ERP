/**
 * ForumNewProducts - Trang "Sản phẩm mới nổi bật".
 * Tổng hợp dữ liệu từ tất cả các kho trong hệ thống, phân tích và xếp hạng
 * sản phẩm mới nhập đang có tín hiệu hot (nhiều shop quan tâm, bán nhanh).
 */
import { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import { newProductsList as rawProducts } from '../data/forumPageData';
import ForumNewProductsRightSidebar from '../components/newProducts/ForumNewProductsRightSidebar';
import AddToWarehouseModal from '../components/shared/AddToWarehouseModal';

const KHU_VUC = ['Tất cả', 'Toàn quốc', 'Hà Nội', 'TP.HCM', 'Miền Bắc', 'Miền Nam', 'Miền Trung'];
const SORT_OPTIONS = [
  { key: 'hot', label: 'Hot nhất', icon: 'local_fire_department' },
  { key: 'new', label: 'Mới nhất', icon: 'schedule' },
  { key: 'sales', label: 'Bán chạy nhất', icon: 'trending_up' },
];

const getHotAccent = (score) => {
  if (score >= 85)
    return {
      border: 'border-red-500',
      text: 'text-red-600',
      bg: 'bg-red-500',
      badge: 'bg-red-50 text-red-700',
      label: 'Cực hot',
    };
  if (score >= 70)
    return {
      border: 'border-[#004785]',
      text: 'text-[#004785]',
      bg: 'bg-[#004785]',
      badge: 'bg-blue-50 text-[#004785]',
      label: 'Hot',
    };
  if (score >= 55)
    return {
      border: 'border-orange-500',
      text: 'text-orange-600',
      bg: 'bg-orange-500',
      badge: 'bg-orange-50 text-orange-700',
      label: 'Tiềm năng',
    };
  return {
    border: 'border-emerald-500',
    text: 'text-emerald-600',
    bg: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700',
    label: 'Mới',
  };
};

const daysSince = (dateStr) => {
  const diff = Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Hôm nay';
  if (diff === 1) return '1 ngày trước';
  return `${diff} ngày trước`;
};

const ForumNewProducts = () => {
  const [sortBy, setSortBy] = useState('hot');
  const [khuVuc, setKhuVuc] = useState('Tất cả');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalProducts, setAddModalProducts] = useState([]);
  const ITEMS_PER_PAGE = 6;
  const { setRightSidebar } = useOutletContext();

  const productsWithId = useMemo(
    () => rawProducts.map((p, i) => ({ ...p, id: p.id || `np-${i}` })),
    []
  );

  const filteredProducts = useMemo(() => {
    let list = [...productsWithId];
    if (khuVuc !== 'Tất cả') list = list.filter((p) => p.khuVuc.includes(khuVuc));

    switch (sortBy) {
      case 'new':
        return list.sort((a, b) => new Date(b.ngayNhapKho) - new Date(a.ngayNhapKho));
      case 'sales':
        return list.sort((a, b) => b.tocDoBan - a.tocDoBan);
      case 'hot':
      default:
        return list.sort((a, b) => b.diemHot - a.diemHot);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [khuVuc, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const pageProducts = filteredProducts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [khuVuc, sortBy]);

  useEffect(() => {
    setRightSidebar?.(<ForumNewProductsRightSidebar products={productsWithId} />);
    return () => setRightSidebar?.(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setRightSidebar]);

  return (
    <div className="space-y-4">
      <header className="px-1">
        <h2 className="mb-2 text-xl font-bold leading-tight text-gray-900">Sản phẩm mới nổi bật</h2>
        <p className="text-sm text-slate-500 opacity-90">
          Tổng hợp sản phẩm mới nhập từ tất cả kho hàng trên hệ thống, xếp hạng theo tín hiệu quan
          tâm và tốc độ bán thực tế từ POS.
        </p>
      </header>

      {/* Filter bar */}
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {/* Sort + Area + Category */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setSortBy(opt.key)}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-bold transition-all ${
                  sortBy === opt.key
                    ? 'bg-[#004785] text-white shadow-md'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                }`}
              >
                <Icon name={opt.icon} size={16} />
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Icon name="location_on" size={16} className="text-slate-400" />
            <select
              value={khuVuc}
              onChange={(e) => setKhuVuc(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-[#004785] focus:ring-0"
            >
              {KHU_VUC.map((a) => (
                <option key={a} value={a}>
                  {a === 'Tất cả' ? 'Tất cả khu vực' : a}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Product cards */}
      {filteredProducts.length === 0 ? (
        <div className="py-12 text-center">
          <Icon name="search" size={32} className="mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-semibold text-slate-500">Không có sản phẩm nào phù hợp</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pageProducts.map((product, index) => {
            const c = getHotAccent(product.diemHot);
            return (
              <article
                key={product.title}
                className={`group relative flex flex-col overflow-hidden rounded-2xl border-l-4 bg-white shadow-sm transition-all hover:shadow-md md:flex-row ${c.border}`}
              >
                <div className="flex w-full flex-col items-center gap-5 p-5 md:flex-row">
                  {/* Ảnh sản phẩm */}
                  <div className="relative flex h-32 w-32 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                    <img
                      alt={product.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      src={product.image}
                    />
                    <span
                      className={`absolute right-1 top-1 rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase ${c.badge}`}
                    >
                      {c.label}
                    </span>
                  </div>

                  {/* Thông tin chính */}
                  <div className="w-full flex-1 md:w-auto">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400">
                        {product.danhMuc}
                      </span>
                      <span className="text-[11px] text-slate-300">|</span>
                      <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                        <Icon name="warehouse" size={12} />
                        {product.nguonKho}
                      </span>
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
                      {product.giaBanSi}{' '}
                      <span className="pl-1 text-[10px] font-medium uppercase text-slate-400">
                        giá sỉ tham khảo
                      </span>
                    </p>
                  </div>

                  {/* Cột chỉ số + nút hành động */}
                  <div className="flex w-full shrink-0 flex-col justify-center gap-3 border-t border-slate-100 pt-3 md:w-52 md:border-t-0 md:pt-0">
                    {/* Điểm hot */}
                    <div className="flex items-center gap-2">
                      <span className={`text-xl font-black ${c.text}`}>{product.diemHot}</span>
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        điểm hot
                      </span>
                    </div>

                    {/* Chỉ số nhanh */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Icon name="schedule" size={11} />
                          {daysSince(product.ngayNhapKho)}
                        </span>
                        <span className="font-bold text-slate-600">
                          {product.soShopQuanTam} shop
                        </span>
                      </div>
                      <div className="flex items-center text-[11px]">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Icon name="trending_up" size={11} />
                          Bán {product.tocDoBan}/ngày
                        </span>
                      </div>
                    </div>

                    {/* Nút */}
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setAddModalProducts([product]);
                          setAddModalOpen(true);
                        }}
                        className="rounded-xl bg-[#004785] py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-black active:scale-95"
                      >
                        Thêm vào kho
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelected(product)}
                        className="rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-95"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
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
          const c = getHotAccent(selected.diemHot);
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
                    <span className={`text-3xl font-black ${c.text}`}>{selected.diemHot} điểm</span>
                    <span
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold uppercase ${c.badge}`}
                    >
                      {c.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {selected.danhMuc} &middot; {selected.khuVuc}
                  </p>
                  <p className="text-xs text-slate-500">
                    <Icon name="warehouse" size={12} className="mr-1 inline" />
                    {selected.nguonKho} &middot; Nhập kho: {selected.ngayNhapKho}
                  </p>
                  <div className="space-y-2 rounded-xl bg-slate-50 p-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Giá bán sỉ</span>
                      <span className="font-bold text-[#004785]">{selected.giaBanSi}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Tốc độ bán</span>
                      <span className="font-bold text-slate-700">{selected.tocDoBan}/ngày</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Shop quan tâm</span>
                      <span className="font-bold text-slate-700">{selected.soShopQuanTam}</span>
                    </div>
                  </div>
                  {selected.khuyenNghi && (
                    <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3">
                      <Icon name="lightbulb" size={16} className="mt-0.5 shrink-0 text-amber-500" />
                      <p className="text-xs font-semibold text-slate-700">{selected.khuyenNghi}</p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {selected.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
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

      <AddToWarehouseModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        products={addModalProducts.length > 0 ? addModalProducts : productsWithId}
      />
    </div>
  );
};

export default ForumNewProducts;
