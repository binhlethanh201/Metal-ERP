/**
 * QuoteClearanceSection - cho dạng Hỏi giá / Thanh lý kho
 */
import React from 'react';
import { Package, Search, Trash2 } from 'lucide-react'; // Import trực tiếp từ thư viện lucide-react

// Thành phần dòng Toggle chuyển đổi trạng thái bo góc rounded-xl
const ToggleRow = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs font-semibold text-slate-600">
    <span>{label}</span>
    <label className="relative inline-flex scale-75 cursor-pointer items-center">
      <input className="peer sr-only" type="checkbox" checked={checked} onChange={onChange} />
      <span className="h-6 w-11 rounded-full bg-slate-300 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-[#004785] peer-checked:after:translate-x-full" />
    </label>
  </div>
);

const QuoteClearanceSection = ({ form, quoteProduct }) => (
  <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
    {/* TIÊU ĐỀ PHÂN HỆ VÀ NUT SWITCH GẮN SẢN PHẨM */}
    <div className="flex items-center justify-between gap-4 border-b border-slate-50 pb-3">
      <div className="flex items-center gap-2">
        <Package className="text-[#004785]" size={18} />
        <h3 className="text-xs font-black uppercase tracking-widest text-[#004785]">
          3. Gắn sản phẩm từ kho (tuỳ chọn)
        </h3>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-slate-400">Gắn sản phẩm vào bài viết</span>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            className="peer sr-only"
            type="checkbox"
            checked={form.quoteOptions.attachProduct}
            onChange={(e) =>
              form.setQuoteOptions((prev) => ({ ...prev, attachProduct: e.target.checked }))
            }
          />
          <span className="h-6 w-11 rounded-full bg-slate-200 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white peer-checked:bg-[#004785] peer-checked:after:translate-x-full" />
        </label>
      </div>
    </div>

    {/* KHUNG HIỂN THỊ CHI TIẾT KHI BẬT ATTACH PRODUCT */}
    {form.quoteOptions.attachProduct && (
      <div className="space-y-4">
        {/* Thanh tìm kiếm sản phẩm nội khu */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm font-semibold outline-none focus:border-[#004785] focus:bg-white"
            placeholder="Tìm sản phẩm trong kho..."
            type="text"
          />
        </div>

        {/* Khối hiển thị thông tin sản phẩm sỉ đính kèm */}
        <div className="space-y-2">
          <p className="pl-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
            SẢN PHẨM ĐÃ CHỌN
          </p>
          <div className="shadow-sm/5 rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-4 flex items-start gap-4">
              <img
                alt={quoteProduct.name}
                className="h-20 w-20 shrink-0 rounded-xl border border-slate-100 object-cover"
                src={quoteProduct.image}
              />
              <div className="min-w-0 flex-1">
                <h4 className="truncate text-sm font-bold text-slate-800">{quoteProduct.name}</h4>
                <p className="mt-0.5 line-clamp-1 text-xs font-medium text-slate-400">
                  {quoteProduct.description}
                </p>
                <div className="mt-2 flex flex-wrap gap-4 text-[10px] font-black uppercase text-slate-400">
                  <span>SKU: {quoteProduct.sku}</span>
                  <span>NSX: {quoteProduct.supplier}</span>
                </div>

                {/* Section riêng biệt của dạng Trusted post mua chung */}
                {form.isTrustedPost && (
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Giá sỉ (VNĐ)
                      </label>
                      <input
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm font-bold text-[#004785]"
                        placeholder="Nhập giá..."
                        type="text"
                        value={form.attachedWholesalePrice}
                        onChange={(e) => form.setAttachedWholesalePrice(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Giá lẻ (VNĐ)
                      </label>
                      <input
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm font-bold text-slate-700"
                        placeholder="Liên hệ"
                        type="text"
                        value={form.attachedRetailPrice}
                        onChange={(e) => form.setAttachedRetailPrice(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Section riêng biệt của dạng Thanh lý kho */}
                {form.isClearancePost && (
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Giá bán sỉ (VNĐ)
                      </label>
                      <div className="relative">
                        <input
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 pr-12 text-sm font-bold text-slate-700"
                          placeholder="Nhập giá..."
                          type="text"
                          value={form.retailPrice}
                          onChange={(e) => form.setRetailPrice(e.target.value)}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                          VNĐ
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-red-500">
                        Giá bán thanh lý
                      </label>
                      <div className="relative">
                        <input
                          className="w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2 pr-12 text-sm font-bold text-red-600 outline-none transition-all focus:border-red-500"
                          placeholder="Nhập giá..."
                          type="text"
                          value={form.clearancePrice}
                          onChange={(e) => form.setClearancePrice(e.target.value)}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-red-400">
                          VNĐ
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Nút xóa sản phẩm khỏi khung */}
              <button
                type="button"
                className="flex shrink-0 flex-col items-center gap-0.5 rounded-xl p-1 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                onClick={() => {
                  form.setQuoteOptions((prev) => ({ ...prev, attachProduct: false }));
                }}
              >
                <Trash2 size={16} />
                <span className="text-[9px] font-black uppercase tracking-wider">Xóa khỏi bài</span>
              </button>
            </div>

            {/* Khối quản lý điều kiện ẩn/hiển thị thông số */}
            <div className="grid grid-cols-1 gap-2 border-t border-slate-100 pt-3 md:grid-cols-3">
              <ToggleRow
                label="Hiển thị giá"
                checked={form.quoteOptions.showPrice}
                onChange={(e) =>
                  form.setQuoteOptions((prev) => ({ ...prev, showPrice: e.target.checked }))
                }
              />
              <ToggleRow
                label="Hiển thị tồn kho"
                checked={form.quoteOptions.showStock}
                onChange={(e) =>
                  form.setQuoteOptions((prev) => ({ ...prev, showStock: e.target.checked }))
                }
              />
              <ToggleRow
                label="Hiển thị nhà cung cấp"
                checked={form.quoteOptions.showSupplier}
                onChange={(e) =>
                  form.setQuoteOptions((prev) => ({ ...prev, showSupplier: e.target.checked }))
                }
              />
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);

export default QuoteClearanceSection;
