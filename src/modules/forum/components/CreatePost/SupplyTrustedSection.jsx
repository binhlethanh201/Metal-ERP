/**
 * SupplyTrustedSection - Bước 3+4 cho dạng Tìm nguồn hàng / Mua chung
 */
import React from 'react';
import { Package, Search, Trash2, Settings, Plus, X } from 'lucide-react';
import Toggle from '../../../../shared/components/Toggle';
import ProductNavBar from './ProductNavBar';
import ProductImageField from './ProductImageField';

const SupplyTrustedSection = ({ form, quoteProduct }) => {
  const currentProduct = form.supplyProducts[form.currentProductIndex];

  const handleImageUpload = (e) => {
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
  };

  return (
    <>
      {/* 3. Gắn sản phẩm từ kho */}
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
            <Toggle
              checked={form.quoteOptions.attachProduct}
              onChange={(v) => form.setQuoteOptions((prev) => ({ ...prev, attachProduct: v }))}
            />
          </div>
        </div>

        {form.quoteOptions.attachProduct && (
          <div className="space-y-4">
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
                    <h4 className="truncate text-sm font-bold text-slate-800">
                      {quoteProduct.name}
                    </h4>
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

                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                    {[
                      ['Hiển thị giá', 'showPrice'],
                      ['Hiển thị tồn kho', 'showStock'],
                      ['Hiển thị nhà cung cấp', 'showSupplier'],
                    ].map(([label, key]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs font-semibold text-slate-600"
                      >
                        <span>{label}</span>
                        <Toggle
                          size="sm"
                          checked={form.quoteOptions[key]}
                          onChange={(v) => form.setQuoteOptions((prev) => ({ ...prev, [key]: v }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Thông tin & Thông số kỹ thuật */}
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
            <Toggle checked={form.showTrustedSpecs} onChange={form.setShowTrustedSpecs} />
          </div>
        </div>

        {form.showTrustedSpecs && currentProduct && (
          <div className="space-y-4 pt-1">
            <ProductNavBar
              currentIndex={form.currentProductIndex}
              total={form.supplyProducts.length}
              onPrev={form.handleSupplyPrevProduct}
              onNext={form.handleSupplyNextProduct}
              onAdd={form.handleSupplyAddProduct}
              onRemove={form.handleSupplyRemoveProduct}
            />

            <div className="flex flex-col items-start gap-4 md:flex-row">
              <div className="w-full md:w-auto md:flex-shrink-0">
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Ảnh SP
                </label>
                <ProductImageField
                  image={currentProduct.image}
                  defaultImage={quoteProduct.image}
                  onRemove={() => {
                    form.setSupplyProducts((prev) => {
                      const u = [...prev];
                      u[form.currentProductIndex].image = quoteProduct.image;
                      return u;
                    });
                  }}
                  onUpload={handleImageUpload}
                />
              </div>

              <div className="w-full flex-1 space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Tiêu đề sản phẩm
                </label>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-semibold outline-none transition-all focus:border-[#004785] focus:bg-white"
                  placeholder="Ví dụ: Máy khoan bê tông chuyên dụng đời mới"
                  type="text"
                  value={currentProduct.title}
                  onChange={(e) => form.handleSupplyProductChange('title', e.target.value)}
                />
                <p className="text-[11px] font-medium text-slate-400">
                  Tên sản phẩm cụ thể giúp khách hàng đại lý dễ dàng tra cứu thông số kỹ thuật.
                </p>
              </div>
            </div>

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

            {/* Spec table */}
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
                {currentProduct.specs.map((spec) => (
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
      </div>
    </>
  );
};

export default SupplyTrustedSection;
