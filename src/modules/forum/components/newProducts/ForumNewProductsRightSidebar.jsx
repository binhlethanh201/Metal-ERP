/**
 * ForumNewProductsRightSidebar - Cột phải trang Sản phẩm mới nổi bật.
 */
import React, { useState, useMemo } from 'react';
import Icon from '../../../../shared/components/Icon';

const ForumNewProductsRightSidebar = ({ products = [] }) => {
  const [selected, setSelected] = useState(null);

  const latestProducts = useMemo(
    () =>
      [...products].sort((a, b) => new Date(b.ngayNhapKho) - new Date(a.ngayNhapKho)).slice(0, 3),
    [products]
  );

  const tongSanPham = products.length;
  const shopTrungBinh = useMemo(
    () => Math.round(products.reduce((s, p) => s + p.soShopQuanTam, 0) / products.length),
    [products]
  );
  const khoPhanPhoi = useMemo(() => [...new Set(products.map((p) => p.nguonKho))], [products]);

  return (
    <>
      {/* Mới nhập gần đây */}
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h4 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-400">
          Mới nhập gần đây
        </h4>
        <div className="space-y-4">
          {latestProducts.map((product) => (
            <div
              key={product.title}
              onClick={() => setSelected(product)}
              className="flex cursor-pointer items-start gap-3 rounded-xl p-2 transition-colors hover:bg-slate-50"
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                <img
                  alt={product.title}
                  className="h-full w-full object-cover"
                  src={product.image}
                />
              </div>
              <div className="min-w-0 flex-1">
                <h5 className="line-clamp-2 text-sm font-bold text-slate-700">{product.title}</h5>
                <p className="mt-0.5 text-xs font-semibold text-[#004785]">{product.giaBanSi}</p>
                <p className="mt-0.5 text-[10px] text-slate-400">
                  {product.nguonKho} &middot; {product.ngayNhapKho}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Thống kê tổng hợp từ hệ thống */}
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h4 className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">
          Dữ liệu hệ thống
        </h4>
        <div className="space-y-2.5">
          <div className="flex items-center gap-3 rounded-xl bg-emerald-500 p-3.5 shadow-sm">
            <Icon name="inventory_2" className="text-white" size={20} />
            <div>
              <p className="text-sm font-bold text-white">{tongSanPham} sản phẩm mới</p>
              <p className="mt-0.5 text-xs font-medium text-white/80">Trong 30 ngày qua</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-[#004785] p-3.5 shadow-sm">
            <Icon name="storefront" className="text-white" size={20} />
            <div>
              <p className="text-sm font-bold text-white">{khoPhanPhoi.length} kho phân phối</p>
              <p className="mt-0.5 text-xs font-medium text-white/80">
                TB {shopTrungBinh} shop quan tâm / sản phẩm
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cách tính điểm hot */}
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h4 className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">
          Cách tính điểm Hot
        </h4>
        <div className="space-y-2.5 text-xs leading-relaxed text-slate-500">
          <p className="flex items-start gap-2">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-red-100 text-[9px] font-black text-red-600">
              M
            </span>
            <span>
              <strong className="text-slate-700">Độ mới</strong> - Mới nhập trong 7 ngày được điểm
              cao hơn
            </span>
          </p>
          <p className="flex items-start gap-2">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-blue-100 text-[9px] font-black text-[#004785]">
              Q
            </span>
            <span>
              <strong className="text-slate-700">Bán chạy</strong> - Số shop theo dõi / hỏi giá
            </span>
          </p>
          <p className="flex items-start gap-2">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-orange-100 text-[9px] font-black text-orange-600">
              B
            </span>
            <span>
              <strong className="text-slate-700">Tốc độ bán</strong> - Dữ liệu thực tế từ POS các
              kho
            </span>
          </p>
        </div>
      </section>

      {/* Quy định */}
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

      {/* Product detail popup */}
      {selected && (
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
              <p className="text-sm">
                Giá sỉ tham khảo:{' '}
                <span className="font-bold text-[#004785]">{selected.giaBanSi}</span>
              </p>
              <p className="text-xs text-slate-500">{selected.khuVuc}</p>
              <p className="text-xs text-slate-500">
                <Icon name="warehouse" size={12} className="mr-1 inline" />
                {selected.nguonKho} &middot; Nhập kho: {selected.ngayNhapKho}
              </p>
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
                Thêm vào kho
              </button>
              <button
                onClick={() => setSelected(null)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ForumNewProductsRightSidebar;
