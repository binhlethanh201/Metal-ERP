/**
 * ModalAttachmentSection - Section 3 "Gắn sản phẩm từ kho" cho CreatePostModal.
 */
import React from 'react';
import { Trash2 } from 'lucide-react';
import Toggle from '../../../../shared/components/Toggle';

const toggleFields = [
  ['Hiển thị giá', 'showPrice'],
  ['Hiển thị tồn kho', 'showStock'],
  ['Hiển thị nhà cung cấp', 'showSupplier'],
];

const ModalAttachmentSection = ({ p, h }) => (
  <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
    <div className="flex items-center justify-between gap-4 border-b border-slate-50 pb-3">
      <h3 className="text-xs font-black uppercase tracking-widest text-[#004785]">
        3. Gắn sản phẩm từ kho (tuỳ chọn)
      </h3>
      <Toggle
        checked={p.quoteOptions.attachProduct}
        onChange={(v) => h.setQuoteOptions((prev) => ({ ...prev, attachProduct: v }))}
      />
    </div>

    {p.quoteOptions.attachProduct && p.activeProduct && (
      <div className="space-y-4">
        <div className="relative">
          <input
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm font-semibold outline-none focus:border-[#004785] focus:bg-white"
            placeholder="Tìm sản phẩm trong kho..."
            type="text"
          />
        </div>

        <div className="shadow-sm/5 rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-4 flex items-start gap-4">
            <img
              alt={p.quoteProduct.name}
              className="h-20 w-20 shrink-0 rounded-xl border border-slate-100 object-cover"
              src={p.activeProduct.image || p.quoteProduct.image}
            />
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-sm font-bold text-slate-800">
                {p.activeProduct.title || p.quoteProduct.name}
              </h4>
              <p className="mt-0.5 line-clamp-1 text-xs font-medium text-slate-400">
                {p.quoteProduct.description}
              </p>
              <div className="mt-2 flex flex-wrap gap-4 text-[10px] font-black uppercase text-slate-400">
                <span>SKU: {p.quoteProduct.sku}</span>
                <span>NSX: {p.quoteProduct.supplier}</span>
              </div>

              {/* Trusted post: giá sỉ + giá lẻ */}
              {!p.isSupplyPost && !p.isQuotePost && !p.isClearancePost && (
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <PriceInput
                    label="Giá sỉ (VNĐ)"
                    value={p.attachedWholesalePrice}
                    onChange={h.setAttachedWholesalePrice}
                    tone="primary"
                  />
                  <PriceInput
                    label="Giá lẻ (VNĐ)"
                    value={p.attachedRetailPrice}
                    onChange={h.setAttachedRetailPrice}
                  />
                </div>
              )}

              {/* Clearance post: giá bán lẻ + giá thanh lý */}
              {p.isClearancePost && (
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <PriceInput
                    label="Giá bán lẻ (VNĐ)"
                    value={p.retailPrice}
                    onChange={h.setRetailPrice}
                  />
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-red-500">
                      Giá thanh lý (VNĐ)
                    </label>
                    <input
                      className="w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-600"
                      type="text"
                      value={p.clearancePrice}
                      onChange={(e) => h.setClearancePrice(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              className="flex shrink-0 flex-col items-center gap-0.5 rounded-xl p-1 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 size={16} />
              <span className="text-[9px] font-black uppercase tracking-wider">Xóa</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-600 md:grid-cols-3">
            {toggleFields.map(([label, key]) => (
              <div
                key={key}
                className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5"
              >
                <span>{label}</span>
                <Toggle
                  size="sm"
                  checked={p.quoteOptions[key]}
                  onChange={(v) => h.setQuoteOptions((prev) => ({ ...prev, [key]: v }))}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
  </div>
);

const PriceInput = ({ label, value, onChange, tone }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
      {label}
    </label>
    <input
      className={`w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm font-bold ${tone === 'primary' ? 'text-[#004785]' : 'text-slate-700'}`}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default ModalAttachmentSection;
