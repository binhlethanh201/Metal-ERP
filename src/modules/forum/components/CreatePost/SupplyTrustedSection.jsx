/**
 * SupplyTrustedSection - Bước 3+4 cho dạng Tìm nguồn hàng  Mua chung.
 * Gắn sản phẩm từ kho (search + toggle) + Thông số kỹ thuật (nhiều SP, điều hướng, thêm/xóa/sửa).
 * Hỗ trợ quản lý nhiều sản phẩm với điều hướng Prev/Next, thêm/xóa SP.
 * Props: form (từ useCreatePostForm), quoteProduct.
 */
import MaterialIconBase from '../shared/MaterialIcon';

const MaterialIcon = (props) => <MaterialIconBase opsz={24} {...props} />;
const ToggleRow = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2">
    <span className="text-sm text-on-surface-variant">{label}</span>
    <label className="relative inline-flex scale-75 cursor-pointer items-center">
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span className="h-6 w-11 rounded-full bg-slate-300 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full" />
    </label>
  </div>
);

const SupplyTrustedSection = ({ form, quoteProduct }) => (
  <>
    <div className="space-y-5 rounded-lg border border-outline-variant bg-white p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <MaterialIcon name="inventory_2" className="text-[20px] text-primary" fill />
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
            3. Gắn sản phẩm từ kho (tùy chọn)
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
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              className="w-full rounded-lg border border-outline-variant bg-surface-bright py-3 pl-12 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-container"
              placeholder="Tìm sản phẩm trong kho..."
              type="text"
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Sản phẩm đã chọn
            </p>
            <div className="rounded-lg border border-outline-variant p-4">
              <div className="mb-4 flex items-start gap-4">
                <img
                  src={quoteProduct.image}
                  alt={quoteProduct.name}
                  className="h-20 w-20 flex-shrink-0 rounded-lg border border-outline-variant object-cover"
                />
                <div className="flex-1 space-y-1">
                  <h4 className="text-base font-medium text-on-surface">{quoteProduct.name}</h4>
                  <p className="text-xs text-on-surface-variant">{quoteProduct.description}</p>
                  <div className="flex gap-4 text-[10px] font-bold uppercase text-slate-400">
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
                </div>
                <button
                  type="button"
                  className="flex flex-col items-center text-error"
                  aria-label="Xóa sản phẩm"
                >
                  <MaterialIcon name="delete" className="text-[20px]" />
                  <span className="text-[10px] font-bold">Xóa khỏi bài</span>
                </button>
              </div>
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
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

    <div className="space-y-5 rounded-lg border border-outline-variant bg-white p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <MaterialIcon name="settings" className="text-[20px] text-primary" fill />
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
            {form.isTrustedPost
              ? '4. Thông tin & Thông số kỹ thuật sản phẩm'
              : '4. Thông số kỹ thuật sản phẩm'}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-on-surface-variant">Hiển thị thông tin</span>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              className="peer sr-only"
              type="checkbox"
              checked={form.showTrustedSpecs}
              onChange={(e) => form.setShowTrustedSpecs(e.target.checked)}
            />
            <span className="h-6 w-11 rounded-full bg-slate-200 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-200 after:bg-white after:transition-transform after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full" />
          </label>
        </div>
      </div>

      {form.showTrustedSpecs && (
        <>
          <div className="mb-6 flex items-center justify-between rounded-lg border border-outline-variant bg-surface-container-low p-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={form.handleSupplyRemoveProduct}
                className="flex items-center gap-1 rounded-lg border border-error/20 px-3 py-1.5 text-sm font-medium text-error transition-all hover:bg-error/10"
              >
                <MaterialIcon name="remove" className="text-[20px]" />
                <span>Giảm sản phẩm</span>
              </button>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={form.handleSupplyPrevProduct}
                  className="rounded-full p-1 text-primary transition-colors hover:bg-primary/10"
                >
                  <MaterialIcon name="chevron_left" className="text-[20px]" />
                </button>
                <span className="min-w-[100px] text-center font-medium text-on-surface">
                  Sản phẩm {form.currentProductIndex + 1} / {form.supplyProducts.length}
                </span>
                <button
                  type="button"
                  onClick={form.handleSupplyNextProduct}
                  className="rounded-full p-1 text-primary transition-colors hover:bg-primary/10"
                >
                  <MaterialIcon name="chevron_right" className="text-[20px]" />
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={form.handleSupplyAddProduct}
              className="flex items-center gap-1 rounded-lg border border-primary/20 px-3 py-1.5 text-sm font-medium text-primary transition-all hover:bg-primary-container/10"
            >
              <MaterialIcon name="add" className="text-[20px]" />
              <span>Thêm sản phẩm</span>
            </button>
          </div>
          {form.supplyProducts[form.currentProductIndex] && (
            <div className="space-y-6">
              <div className="flex flex-col gap-6 md:flex-row">
                <div className="w-full md:w-auto md:flex-shrink-0">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Ảnh SP
                  </label>
                  {form.supplyProducts[form.currentProductIndex].image &&
                  form.supplyProducts[form.currentProductIndex].image !== quoteProduct.image ? (
                    <div className="group relative aspect-square h-32 w-32 overflow-hidden rounded-lg bg-slate-200">
                      <img
                        src={form.supplyProducts[form.currentProductIndex].image}
                        alt="Product"
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
                        className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
                      >
                        <MaterialIcon name="close" className="text-[16px]" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex aspect-square h-32 w-32 flex-col items-center justify-center rounded-lg border-2 border-dashed border-outline-variant bg-surface-bright text-on-surface-variant transition-all hover:border-primary hover:bg-primary-container/5">
                      <MaterialIcon name="add_a_photo" className="text-2xl" />
                      <span className="mt-1 text-[10px]">Tải ảnh</span>
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
                <div className="flex-1 space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Tiêu đề sản phẩm
                  </label>
                  <input
                    className="w-full rounded-lg border border-outline-variant bg-surface-bright px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-container"
                    placeholder="Ví dụ: Máy khoan bê tông chuyên dụng"
                    type="text"
                    value={form.supplyProducts[form.currentProductIndex].title}
                    onChange={(e) => form.handleSupplyProductChange('title', e.target.value)}
                  />
                  <p className="text-[11px] text-slate-400">
                    Tên sản phẩm cụ thể giúp khách hàng dễ dàng tra cứu kỹ thuật.
                  </p>
                </div>
              </div>
              {form.isTrustedPost && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-on-surface">Giá sỉ (VNĐ)</label>
                    <input
                      className="w-full rounded-lg border border-outline-variant bg-surface-bright px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-container"
                      placeholder="Thỏa thuận"
                      type="text"
                      value={form.productWholesalePrice}
                      onChange={(e) => form.setProductWholesalePrice(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-on-surface">Giá lẻ (VNĐ)</label>
                    <input
                      className="w-full rounded-lg border border-outline-variant bg-surface-bright px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-container"
                      placeholder="Liên hệ"
                      type="text"
                      value={form.productRetailPrice}
                      onChange={(e) => form.setProductRetailPrice(e.target.value)}
                    />
                  </div>
                </div>
              )}
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-4 px-2">
                  <div className="col-span-5">
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                      Tên thông số
                    </label>
                  </div>
                  <div className="col-span-6">
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                      Giá trị / Nội dung
                    </label>
                  </div>
                  <div className="col-span-1" />
                </div>
                <div className="space-y-3">
                  {form.supplyProducts[form.currentProductIndex].specs.map((spec) => (
                    <div key={spec.id} className="grid grid-cols-12 items-center gap-4">
                      <div className="col-span-5">
                        <input
                          className="w-full rounded-lg border border-outline-variant bg-white px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20"
                          placeholder="Ví dụ: Độ phủ lý thuyết"
                          type="text"
                          value={spec.name}
                          onChange={(e) =>
                            form.handleSupplySpecChange(spec.id, 'name', e.target.value)
                          }
                        />
                      </div>
                      <div className="col-span-6">
                        <input
                          className="w-full rounded-lg border border-outline-variant bg-white px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20"
                          placeholder="Ví dụ: 10-12 m²/lít"
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
                          className="rounded p-1 text-slate-300 transition-colors hover:text-error"
                        >
                          <MaterialIcon name="delete" className="text-[18px]" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={form.handleSupplyAddSpec}
                  className="flex w-fit items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-primary transition-all hover:bg-primary/5"
                >
                  <MaterialIcon name="add_circle" className="text-[20px]" />
                  <span>Thêm thông số khác</span>
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
