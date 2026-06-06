/**
 * AttachProductSection - Section 3: Gắn sản phẩm từ kho (dùng cho supply/trusted).
 */
import React from 'react';
import { Package, Search, Trash2 } from 'lucide-react';
import Toggle from '../../../../shared/components/Toggle';

const AttachProductSection = ({ form, quoteProduct }) => (
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
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
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
                    <PriceField
                      label="Giá sỉ (VNĐ)"
                      value={form.attachedWholesalePrice}
                      onChange={form.setAttachedWholesalePrice}
                      tone="primary"
                    />
                    <PriceField
                      label="Giá lẻ (VNĐ)"
                      value={form.attachedRetailPrice}
                      onChange={form.setAttachedRetailPrice}
                    />
                  </div>
                )}
              </div>

              <button
                type="button"
                className="flex shrink-0 flex-col items-center gap-0.5 rounded-xl p-1 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                onClick={() => form.setQuoteOptions((prev) => ({ ...prev, attachProduct: false }))}
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
);

const PriceField = ({ label, value, onChange, tone }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
      {label}
    </label>
    <input
      className={`w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm font-bold ${tone === 'primary' ? 'text-[#004785]' : 'text-slate-700'}`}
      placeholder="Nhập giá..."
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default AttachProductSection;
