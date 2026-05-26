/**
 * SupplyTrustedSection - Bước 3+4 cho dạng Tìm nguồn hàng / Mua chung
 */
import React from 'react';
import {
  Package,
  Search,
  Trash2,
  Settings,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  Camera,
  X,
} from 'lucide-react'; // Import trực tiếp từ thư viện lucide-react

// Thành phần dòng Toggle chuyển đổi trạng thái bo góc rounded-xl
const ToggleRow = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs font-semibold text-slate-600">
    <span>{label}</span>
    <label className="relative inline-flex scale-75 cursor-pointer items-center">
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span className="h-6 w-11 rounded-full bg-slate-300 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-[#004785] peer-checked:after:translate-x-full" />
    </label>
  </div>
);

const SupplyTrustedSection = ({ form, quoteProduct }) => (
  <>
    {/* 🌟 KHỐI 3: GẮN SẢN PHẨM TỪ KHO (TÙY CHỌN) */}
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
      <div className="flex items-center justify-between gap-4 border-b border-slate-50 pb-3">
        <div className="flex items-center gap-2">
          <Package className="text-[#004785]" size={18} />
          <h3 className="text-xs font-black uppercase tracking-widest text-[#004785]">
            3. Gắn sản phẩm từ kho (tùy chọn)
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

      {form.quoteOptions.attachProduct && (
        <div className="space-y-4">
          {/* Thanh tìm kiếm sản phẩm */}
          <div className="relative">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm font-semibold outline-none focus:border-[#004785] focus:bg-white"
              placeholder="Tìm sản phẩm trong kho..."
              type="text"
            />
          </div>

          <div className="space-y-2">
            <p className="pl-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
              Sản phẩm đã chọn
            </p>
            <div className="shadow-sm/5 rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-4 flex items-start gap-4">
                <img
                  src={quoteProduct.image}
                  alt={quoteProduct.name}
                  className="h-20 w-20 flex-shrink-0 rounded-xl border border-slate-100 object-cover"
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
                </div>

                <button
                  type="button"
                  className="flex shrink-0 flex-col items-center gap-0.5 rounded-xl p-1 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                  onClick={() =>
                    form.setQuoteOptions((prev) => ({ ...prev, attachProduct: false }))
                  }
                  aria-label="Xóa sản phẩm"
                >
                  <Trash2 size={16} />
                  <span className="text-[9px] font-black uppercase tracking-wider">Xóa sỉ</span>
                </button>
              </div>

              {/* Hàng Toggles */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
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
        </div>
      )}
    </div>

    {/* 🌟 KHỐI 4: THÔNG TIN & THÔNG SỐ KỸ THUẬT SẢN PHẨM PHÂN MẢNH */}
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
      <div className="flex items-center justify-between gap-4 border-b border-slate-50 pb-3">
        <div className="flex items-center gap-2">
          <Settings className="text-[#004785]" size={18} />
          <h3 className="text-xs font-black uppercase tracking-widest text-[#004785]">
            {form.isTrustedPost
              ? '4. Thông tin & Thông số kỹ thuật sản phẩm'
              : '4. Thông số kỹ thuật sản phẩm'}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-400">Hiển thị thông tin</span>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              className="peer sr-only"
              type="checkbox"
              checked={form.showTrustedSpecs}
              onChange={(e) => form.setShowTrustedSpecs(e.target.checked)}
            />
            <span className="h-6 w-11 rounded-full bg-slate-200 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white peer-checked:bg-[#004785] peer-checked:after:translate-x-full" />
          </label>
        </div>
      </div>

      {form.showTrustedSpecs && (
        <>
          {/* Bộ điều hướng nhiều sản phẩm */}
          <div className="shadow-sm/5 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-2">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={form.handleSupplyRemoveProduct}
                className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 transition-all hover:bg-red-50"
              >
                <Minus size={14} />
                <span>Giảm hàng</span>
              </button>

              <div className="flex items-center gap-4 text-xs font-bold text-slate-700">
                <button
                  type="button"
                  onClick={form.handleSupplyPrevProduct}
                  className="shadow-sm/5 rounded border border-slate-200 p-0.5 text-[#004785] transition-colors hover:bg-white"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="min-w-[90px] text-center">
                  Sản phẩm {form.currentProductIndex + 1} / {form.supplyProducts.length}
                </span>
                <button
                  type="button"
                  onClick={form.handleSupplyNextProduct}
                  className="shadow-sm/5 rounded border border-slate-200 p-0.5 text-[#004785] transition-colors hover:bg-white"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={form.handleSupplyAddProduct}
              className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-bold text-[#004785] transition-all hover:bg-blue-50"
            >
              <Plus size={14} />
              <span>Thêm hàng</span>
            </button>
          </div>

          {form.supplyProducts[form.currentProductIndex] && (
            <div className="space-y-4 pt-1">
              <div className="flex flex-col items-start gap-4 md:flex-row">
                {/* Khu vực xử lý upload ảnh */}
                <div className="w-full md:w-auto md:flex-shrink-0">
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Ảnh SP
                  </label>
                  {form.supplyProducts[form.currentProductIndex].image &&
                  form.supplyProducts[form.currentProductIndex].image !== quoteProduct.image ? (
                    <div className="group relative aspect-square h-28 w-28 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                      <img
                        src={form.supplyProducts[form.currentProductIndex].image}
                        alt="Product Preview"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          form.setSupplyProducts((prev) => {
                            const u = [...prev];
                            u[form.currentProductIndex].image = quoteProduct.image;
                            return u;
                          });
                        }}
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-lg bg-black/60 text-white shadow-md transition-colors group-hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex aspect-square h-28 w-28 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 transition-all hover:border-[#004785] hover:text-[#004785]">
                      <Camera size={20} />
                      <span className="mt-1 text-[9px] font-black uppercase tracking-wider">
                        Tải ảnh
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            const r = new FileReader();
                            r.onload = (ev) => {
                              form.setSupplyProducts((prev) => {
                                const u = [...prev];
                                u[form.currentProductIndex].image = ev.target.result;
                                return u;
                              });
                            };
                            r.readAsDataURL(f);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>

                {/* Tiêu đề sản phẩm con */}
                <div className="w-full flex-1 space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Tiêu đề sản phẩm
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-semibold outline-none transition-all focus:border-[#004785] focus:bg-white"
                    placeholder="Ví dụ: Máy khoan bê tông chuyên dụng đời mới"
                    type="text"
                    value={form.supplyProducts[form.currentProductIndex].title}
                    onChange={(e) => form.handleSupplyProductChange('title', e.target.value)}
                  />
                  <p className="text-[11px] font-medium text-slate-400">
                    Tên sản phẩm cụ thể giúp khách hàng đại lý dễ dàng tra cứu thông số kỹ thuật.
                  </p>
                </div>
              </div>

              {/* Trường giá tích hợp riêng của dạng Trusted post mua chung */}
              {form.isTrustedPost && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Giá sỉ (VNĐ)</label>
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-bold text-[#004785]"
                      placeholder="Thỏa thuận sỉ"
                      type="text"
                      value={form.productWholesalePrice}
                      onChange={(e) => form.setProductWholesalePrice(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Giá lẻ (VNĐ)</label>
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-bold text-slate-700"
                      placeholder="Liên hệ"
                      type="text"
                      value={form.productRetailPrice}
                      onChange={(e) => form.setProductRetailPrice(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Form lập bảng liệt kê các dòng thuộc tính thông số con */}
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-12 gap-4 px-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <div className="col-span-5">
                    <span>Tên thông số kỹ thuật</span>
                  </div>
                  <div className="col-span-6">
                    <span>Giá trị / Nội dung chi tiết</span>
                  </div>
                  <div className="col-span-1" />
                </div>

                <div className="space-y-2">
                  {form.supplyProducts[form.currentProductIndex].specs.map((spec) => (
                    <div key={spec.id} className="grid grid-cols-12 items-center gap-4">
                      <div className="col-span-5">
                        <input
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm font-semibold outline-none focus:border-[#004785] focus:bg-white"
                          placeholder="Ví dụ: Công suất máy"
                          type="text"
                          value={spec.name}
                          onChange={(e) =>
                            form.handleSupplySpecChange(spec.id, 'name', e.target.value)
                          }
                        />
                      </div>
                      <div className="col-span-6">
                        <input
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm font-semibold outline-none focus:border-[#004785] focus:bg-white"
                          placeholder="Ví dụ: 750W hành trình liên tục"
                          type="text"
                          value={spec.value}
                          onChange={(e) =>
                            form.handleSupplySpecChange(spec.id, 'value', e.target.value)
                          }
                        />
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <button
                          type="button"
                          onClick={() => form.handleSupplyRemoveSpec(spec.id)}
                          className="rounded-lg p-1 text-slate-400 transition-colors hover:text-red-500"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={form.handleSupplyAddSpec}
                  className="mt-1 flex items-center gap-1.5 p-1 text-xs font-bold text-[#004785] hover:underline"
                >
                  <Plus size={14} />
                  <span>Thêm thông số kỹ thuật khác</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  </>
);

export default SupplyTrustedSection;
