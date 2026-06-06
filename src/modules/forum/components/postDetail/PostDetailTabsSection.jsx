import React, { useState } from 'react';
import PostDetailSpecsTable from './PostDetailSpecsTable';
import ProductImageCarousel from './ProductImageCarousel';
import PriceInfoGrid from './PriceInfoGrid';
import Icon from '../../../../shared/components/Icon';

const tabs = ['Mô tả sản phẩm', 'Thông số kỹ thuật'];

const PostDetailTabsSection = ({
  activeTab,
  setActiveTab,
  validType,
  hasProducts,
  totalProducts,
  productIdx,
  onPrev,
  onNext,
  detailImages,
  productName,
  postDescription,
  currentProduct,
  isEditing,
  onUpdateProduct,
  onUpdateSpec,
  onAddSpec,
  onRemoveSpec,
}) => {
  const [localTab, setLocalTab] = useState('description');
  const tab = isEditing ? localTab : activeTab;
  const setTab = isEditing ? setLocalTab : setActiveTab;

  const specs = currentProduct?.specs || [];

  return (
    <div className="relative">
      {hasProducts && totalProducts > 1 && (
        <>
          <div className="absolute -left-12 top-1/2 z-10 hidden -translate-y-1/2 xl:flex">
            <button
              type="button"
              onClick={onPrev}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:border-[#004785] hover:text-[#004785]"
            >
              <Icon name="chevron_left" size={20} />
            </button>
          </div>
          <div className="absolute -right-12 top-1/2 z-10 hidden -translate-y-1/2 xl:flex">
            <button
              type="button"
              onClick={onNext}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:border-[#004785] hover:text-[#004785]"
            >
              <Icon name="chevron_right" size={20} />
            </button>
          </div>
        </>
      )}

      <div
        className={`overflow-hidden rounded-2xl border bg-white ${isEditing ? 'border-2 border-[#004785]' : 'border-slate-200'}`}
      >
        <nav className="flex border-b border-slate-100">
          {tabs.map((label, i) => {
            const key = i === 0 ? 'description' : 'specs';
            return (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`px-8 py-4 text-sm font-bold transition-colors ${tab === key ? 'border-b-2 border-[#004785] text-[#004785]' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {label}
              </button>
            );
          })}
        </nav>

        <div className="p-8">
          {tab === 'description' && !isEditing && (
            <section>
              <h3 className="mb-6 text-xl font-bold text-slate-900">Chi tiết sản phẩm</h3>
              {currentProduct?.detailImages?.length > 0 && (
                <div className="mb-8">
                  <ProductImageCarousel
                    key={productIdx}
                    images={detailImages}
                    productName={productName}
                  />
                </div>
              )}
              <div className="space-y-4 text-center text-sm leading-relaxed text-slate-600">
                <p>{postDescription}</p>
                <p>
                  <span className="font-bold text-slate-900">Ưu điểm nổi bật:</span> Chống thấm
                  tuyệt đối, ngăn chặn nấm mốc, bền màu với thời gian và đặc biệt an toàn cho người
                  sử dụng với hàm lượng VOC cực thấp.
                </p>
              </div>
            </section>
          )}

          {tab === 'description' && isEditing && (
            <section>
              <h3 className="mb-6 text-xl font-bold text-slate-900">Chi tiết sản phẩm</h3>

              <div className="mb-5 space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Tên sản phẩm
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold outline-none focus:border-[#004785] focus:ring-0"
                  value={currentProduct?.name || ''}
                  onChange={(e) => onUpdateProduct?.('name', e.target.value)}
                  placeholder="Nhập tên sản phẩm..."
                />
              </div>

              <div className="mb-5 space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Ảnh chi tiết sản phẩm
                </label>
                <div className="rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/20 p-4">
                  {currentProduct?.detailImages?.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {currentProduct.detailImages.map((img, i) => (
                        <div
                          key={i}
                          className="group relative h-24 w-24 overflow-hidden rounded-xl border border-slate-200"
                        >
                          <img src={img} alt="" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateProduct?.(
                                'detailImages',
                                currentProduct.detailImages.filter((_, idx) => idx !== i)
                              )
                            }
                            className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-md bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <Icon name="close" size={10} />
                          </button>
                        </div>
                      ))}
                      <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-blue-200 bg-white text-blue-400 transition-all hover:border-[#004785] hover:text-[#004785]">
                        <Icon name="add" size={18} />
                        <span className="text-[9px] font-bold uppercase">Thêm</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (ev) =>
                              onUpdateProduct?.('detailImages', [
                                ...(currentProduct?.detailImages || []),
                                ev.target.result,
                              ]);
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer flex-col items-center gap-2 py-4 text-blue-400 transition-colors hover:text-[#004785]">
                      <Icon name="image" size={28} />
                      <span className="text-xs font-bold">Nhấn để tải ảnh chi tiết</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          files.forEach((file) => {
                            const reader = new FileReader();
                            reader.onload = (ev) =>
                              onUpdateProduct?.('detailImages', [
                                ...(currentProduct?.detailImages || []),
                                ev.target.result,
                              ]);
                            reader.readAsDataURL(file);
                          });
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Mô tả chi tiết
                </label>
                <textarea
                  className="min-h-[160px] w-full rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed outline-none focus:border-[#004785] focus:ring-0"
                  value={currentProduct?.description || postDescription}
                  onChange={(e) => onUpdateProduct?.('description', e.target.value)}
                  placeholder="Nhập mô tả chi tiết sản phẩm..."
                />
              </div>
            </section>
          )}

          {tab === 'specs' && isEditing && (
            <div>
              <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-slate-400">
                THÔNG SỐ KỸ THUẬT (CÓ THỂ SỬA)
              </h4>
              {specs.length === 0 && (
                <p className="mb-3 text-sm text-slate-400">Chưa có thông số. Thêm bên dưới.</p>
              )}
              <div className="space-y-2">
                {specs.map((spec, idx) => (
                  <div key={idx} className="grid grid-cols-12 items-center gap-3">
                    <div className="col-span-5">
                      <input
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold outline-none focus:border-[#004785] focus:ring-0"
                        placeholder="Tên thông số"
                        value={spec.name}
                        onChange={(e) => onUpdateSpec?.(productIdx, idx, 'name', e.target.value)}
                      />
                    </div>
                    <div className="col-span-6">
                      <input
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[#004785] focus:ring-0"
                        placeholder="Giá trị"
                        value={spec.value}
                        onChange={(e) => onUpdateSpec?.(productIdx, idx, 'value', e.target.value)}
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button
                        type="button"
                        onClick={() => onRemoveSpec?.(productIdx, idx)}
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                      >
                        <Icon name="delete" size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => onAddSpec?.(productIdx)}
                className="mt-3 flex items-center gap-1.5 rounded-lg border-2 border-dashed border-blue-200 bg-blue-50/30 px-4 py-2 text-sm font-bold text-[#004785] transition-colors hover:border-blue-300 hover:bg-blue-50"
              >
                <Icon name="add" size={16} />
                Thêm thông số
              </button>
            </div>
          )}

          {tab === 'specs' && !isEditing && (
            <PostDetailSpecsTable key={productIdx} specs={specs} type={validType} />
          )}
        </div>
      </div>

      {(validType === 'wholesale' || validType === 'clearance') && currentProduct && !isEditing && (
        <PriceInfoGrid
          type={validType === 'clearance' ? 'clearance' : 'wholesale'}
          product={currentProduct}
        />
      )}
    </div>
  );
};

export default PostDetailTabsSection;
