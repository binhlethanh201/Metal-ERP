/**
 * ModalSpecsSection - Section 4 "Thông số kỹ thuật" cho CreatePostModal.
 */
import React from 'react';
import { X, Camera, ChevronLeft, ChevronRight, Plus, Minus, Trash2 } from 'lucide-react';
import Toggle from '../../../../shared/components/Toggle';
import SpecEditorModal from '../../../../shared/components/SpecEditorModal';

const ModalSpecsSection = ({ p, h }) => {
  const product = p.activeProduct;
  if (!product) return null;

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
      <div className="flex items-center justify-between gap-4 border-b border-slate-50 pb-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-[#004785]">
          4. Thông số kỹ thuật sản phẩm
        </h3>
        <Toggle checked={p.showTrustedSpecs} onChange={h.setShowTrustedSpecs} />
      </div>

      {p.showTrustedSpecs && (
        <>
          {/* Product Navigation Bar */}
          <div className="shadow-sm/5 rounded-xl border border-slate-100 bg-slate-50 p-2">
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={h.handleSupplyRemoveProduct}
                className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 transition-all hover:bg-red-50"
              >
                <Minus size={14} />
                <span>Giảm hàng</span>
              </button>
              <div className="flex items-center gap-4 text-xs font-bold text-slate-700">
                <button
                  type="button"
                  onClick={() => h.setCurrentProductIndex((p) => Math.max(0, p - 1))}
                  className="shadow-sm/5 rounded border border-slate-200 p-0.5 text-[#004785] hover:bg-white"
                >
                  <ChevronLeft size={16} />
                </button>
                <span>
                  Sản phẩm {p.currentProductIndex + 1} / {p.supplyProducts.length}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    h.setCurrentProductIndex((p) => Math.min(p.supplyProducts.length - 1, p + 1))
                  }
                  className="shadow-sm/5 rounded border border-slate-200 p-0.5 text-[#004785] hover:bg-white"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              <button
                type="button"
                onClick={h.handleSupplyAddProduct}
                className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-bold text-[#004785] transition-all hover:bg-blue-50"
              >
                <Plus size={14} />
                <span>Thêm hàng</span>
              </button>
            </div>
          </div>

          {/* Product Image + Title */}
          <div className="grid grid-cols-1 items-start gap-4 pt-1 md:grid-cols-12">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-400">
                Ảnh SP
              </label>
              {product.image ? (
                <div className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                  <img src={product.image} alt="Sản phẩm" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() =>
                      h.setSupplyProducts((prev) =>
                        prev.map((it, i) =>
                          i === p.currentProductIndex ? { ...it, image: null } : it
                        )
                      )
                    }
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-lg bg-black/60 text-white shadow-md group-hover:bg-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 transition-all hover:border-[#004785] hover:text-[#004785]">
                  <Camera size={20} />
                  <span className="mt-1 text-[9px] font-black uppercase tracking-wider">
                    Tải ảnh
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={h.handleSpecImageUpload}
                  />
                </label>
              )}
            </div>

            <div className="space-y-1.5 md:col-span-10">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                Tiêu đề sản phẩm cụ thể
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-semibold outline-none transition-all focus:border-[#004785] focus:bg-white"
                placeholder="Nhập tên sản phẩm cụ thể để khách tra cứu kỹ thuật..."
                type="text"
                value={product.title}
                onChange={(e) => h.handleSupplyProductChange('title', e.target.value)}
              />
              <div className="mt-2 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-700">
                    {product.specDetail ? (
                      <>
                        <div className={p.expandedSpecDetail ? '' : 'line-clamp-3'}>
                          {product.specDetail}
                        </div>
                        {product.specDetail.length > 150 && (
                          <button
                            type="button"
                            onClick={() => h.setExpandedSpecDetail(!p.expandedSpecDetail)}
                            className="mt-1 text-xs font-semibold text-[#004785] hover:underline"
                          >
                            {p.expandedSpecDetail ? 'Thu gọn' : 'Xem thêm'}
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="text-slate-400">Chưa có mô tả chi tiết</div>
                    )}
                  </div>
                </div>
                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={() => h.setOpenSpecEditorIndex(p.currentProductIndex)}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Viết chi tiết
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Trusted post prices */}
          {!p.isSupplyPost && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Giá sỉ (VNĐ)</label>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-bold text-[#004785]"
                  type="text"
                  value={p.productWholesalePrice}
                  onChange={(e) => h.setProductWholesalePrice(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Giá lẻ (VNĐ)</label>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-bold text-slate-700"
                  type="text"
                  value={p.productRetailPrice}
                  onChange={(e) => h.setProductRetailPrice(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Spec Table */}
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

            {p.openSpecEditorIndex !== null && (
              <SpecEditorModal
                value={p.supplyProducts[p.openSpecEditorIndex]?.specDetail || ''}
                onChange={(val) =>
                  h.setSupplyProducts((prev) =>
                    prev.map((it, i) =>
                      i === p.openSpecEditorIndex ? { ...it, specDetail: val } : it
                    )
                  )
                }
                onClose={() => h.setOpenSpecEditorIndex(null)}
              />
            )}

            <div className="space-y-2">
              {product.specs.map((spec) => (
                <div key={spec.id} className="grid grid-cols-12 items-center gap-4">
                  <div className="col-span-5">
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm font-semibold outline-none focus:border-[#004785] focus:bg-white"
                      placeholder="Ví dụ: Độ rộng chân bu-lông"
                      type="text"
                      value={spec.name}
                      onChange={(e) => h.handleSupplySpecChange(spec.id, 'name', e.target.value)}
                    />
                  </div>
                  <div className="col-span-6">
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm font-semibold outline-none focus:border-[#004785] focus:bg-white"
                      placeholder="Ví dụ: M24 nhúng kẽm nóng"
                      type="text"
                      value={spec.value}
                      onChange={(e) => h.handleSupplySpecChange(spec.id, 'value', e.target.value)}
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button
                      type="button"
                      onClick={() => h.handleSupplyRemoveSpec(spec.id)}
                      className="rounded-lg p-1 text-slate-400 transition-colors hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={h.handleSupplyAddSpec}
              className="mt-1 flex items-center gap-1.5 p-1 text-xs font-bold text-[#004785] hover:underline"
            >
              <Plus size={14} />
              <span>Thêm thông số kỹ thuật khác</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ModalSpecsSection;
