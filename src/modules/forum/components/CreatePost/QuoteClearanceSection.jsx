/**
 * QuoteClearanceSection - Bước 3 cho dạng Hỏi giá  Thanh lý kho.
 * Gắn sản phẩm từ kho (tìm kiếm + hiển thị + toggle) + Giá sỉ/thanh lý.
 * Toggle: Hiển thị giá / Hiển thị tồn kho / Hiển thị NCC.
 * Props: form (từ useCreatePostForm), quoteProduct.
 */
import MaterialIconBase from '../shared/MaterialIcon';

const MaterialIcon = (props) => <MaterialIconBase opsz={24} {...props} />;

const ToggleRow = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2">
    <span className="text-sm text-on-surface-variant">{label}</span>
    <label className="relative inline-flex scale-75 cursor-pointer items-center">
      <input className="peer sr-only" type="checkbox" checked={checked} onChange={onChange} />
      <span className="peer h-6 w-11 rounded-full bg-slate-300 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full" />
    </label>
  </div>
);

const QuoteClearanceSection = ({ form, quoteProduct }) => (
  <div className="space-y-5 rounded-lg border border-outline-variant bg-white p-4 md:p-6">
    <div className="mb-1 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <MaterialIcon name="inventory_2" className="text-[20px] text-primary" fill />
        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
          3. Gắn sản phẩm từ kho (tuỳ chọn)
        </h3>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-on-surface-variant">Gắn sản phẩm vào bài viết</span>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            className="peer sr-only"
            type="checkbox"
            checked={form.quoteOptions.attachProduct}
            onChange={(e) =>
              form.setQuoteOptions((prev) => ({ ...prev, attachProduct: e.target.checked }))
            }
          />
          <span className="h-6 w-11 rounded-full bg-slate-200 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-200 after:bg-white after:transition-transform after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full" />
        </label>
      </div>
    </div>

    {form.quoteOptions.attachProduct && (
      <div className="space-y-4">
        <div className="relative">
          <MaterialIcon
            name="search"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[18px] text-slate-400"
          />
          <input
            className="w-full rounded-lg border border-outline-variant bg-surface-bright py-3 pl-12 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-container"
            placeholder="Tìm sản phẩm trong kho..."
            type="text"
          />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            SẢN PHẨM ĐÃ CHỌN
          </p>
          <div className="rounded-lg border border-outline-variant p-4">
            <div className="mb-4 flex items-start gap-4">
              <img
                alt={quoteProduct.name}
                className="h-20 w-20 rounded-lg border border-outline-variant object-cover"
                src={quoteProduct.image}
              />
              <div className="min-w-0 flex-1">
                <h4 className="mb-1 text-base font-semibold text-on-surface">
                  {quoteProduct.name}
                </h4>
                <p className="mb-2 text-xs text-on-surface-variant">{quoteProduct.description}</p>
                <div className="flex flex-wrap gap-4 text-[10px] font-bold uppercase text-slate-400">
                  <span>SKU: {quoteProduct.sku}</span>
                  <span>NSX: {quoteProduct.supplier}</span>
                </div>

                {form.isTrustedPost && (
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                        Giá sỉ (VNĐ)
                      </label>
                      <input
                        className="w-full rounded-lg border border-outline-variant bg-surface-bright px-3 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-container"
                        placeholder="Nhập giá..."
                        type="text"
                        value={form.attachedWholesalePrice}
                        onChange={(e) => form.setAttachedWholesalePrice(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                        Giá lẻ (VNĐ)
                      </label>
                      <input
                        className="w-full rounded-lg border border-outline-variant bg-surface-bright px-3 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-container"
                        placeholder="Liên hệ"
                        type="text"
                        value={form.attachedRetailPrice}
                        onChange={(e) => form.setAttachedRetailPrice(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {form.isClearancePost && (
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:gap-6">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                        Giá bán sỉ (VNĐ)
                      </label>
                      <div className="relative max-w-[180px]">
                        <input
                          className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 pr-12 text-sm font-semibold text-on-surface"
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
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-error">
                        Giá bán thanh lý
                      </label>
                      <div className="relative max-w-[180px]">
                        <input
                          className="w-full rounded-lg border border-error/30 bg-error-container/10 px-3 py-2 pr-12 text-sm font-bold text-error outline-none transition-all focus:border-error focus:ring-2 focus:ring-error/20"
                          placeholder="Nhập giá..."
                          type="text"
                          value={form.clearancePrice}
                          onChange={(e) => form.setClearancePrice(e.target.value)}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-error/60">
                          VNĐ
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <button type="button" className="flex flex-col items-center text-error">
                <MaterialIcon name="delete" />
                <span className="text-[10px] font-bold">Xóa khỏi bài</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 md:grid-cols-3">
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
