/**
 * PreviewTabsSection - Tabs Mô tả / Thông số kỹ thuật cho PostPreviewModal.
 */
import React, { useState } from 'react';
import Icon from '../../../../shared/components/Icon';

const PriceCard = ({ label, value, note, tone, bg }) => (
  <div className={`flex flex-col justify-between ${bg} p-6`}>
    <div>
      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
      <p className={`text-2xl font-bold ${tone}`}>{value}</p>
    </div>
    <p className="mt-1 text-xs italic text-slate-400">{note}</p>
  </div>
);

const PreviewTabsSection = ({ p }) => {
  const [tab, setTab] = useState('description');
  const [productIdx, setProductIdx] = useState(0);
  const products = p.supplyProducts || [];
  const total = products.length;
  const activeProduct = products[productIdx];
  const specs = activeProduct?.specs?.filter((s) => s.name) || [];

  const goPrev = () => setProductIdx((prev) => (prev === 0 ? total - 1 : prev - 1));
  const goNext = () => setProductIdx((prev) => (prev === total - 1 ? 0 : prev + 1));

  return (
    <div className="relative md:px-14">
      {/* Desktop prev/next */}
      {total > 1 && (
        <>
          <div className="absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 md:flex">
            <button
              type="button"
              onClick={goPrev}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-md transition-all hover:border-[#004785] hover:text-[#004785] hover:shadow-lg"
            >
              <Icon name="chevron_left" size={20} />
            </button>
          </div>
          <div className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 md:flex">
            <button
              type="button"
              onClick={goNext}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-md transition-all hover:border-[#004785] hover:text-[#004785] hover:shadow-lg"
            >
              <Icon name="chevron_right" size={20} />
            </button>
          </div>
        </>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <nav className="flex border-b border-slate-100">
          {['Mô tả sản phẩm', 'Thông số kỹ thuật'].map((label, i) => {
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
          {tab === 'description' && (
            <section>
              <h3 className="mb-6 text-xl font-bold text-slate-900">Chi tiết sản phẩm</h3>
              {activeProduct?.image && (
                <div className="mb-8 overflow-hidden rounded-xl">
                  <img
                    src={activeProduct.image}
                    alt={activeProduct.title || 'Sản phẩm'}
                    className="h-[300px] w-full object-cover"
                  />
                </div>
              )}
              {activeProduct?.title && (
                <h4 className="mb-4 text-lg font-bold text-slate-800">{activeProduct.title}</h4>
              )}
              {activeProduct?.specDetail ? (
                <div className="space-y-4 text-sm leading-relaxed text-slate-600">
                  <p className="whitespace-pre-line">{activeProduct.specDetail}</p>
                </div>
              ) : (
                <div className="text-sm text-slate-400">
                  Chưa có chi tiết kỹ thuật cho sản phẩm này.
                </div>
              )}
            </section>
          )}

          {tab === 'specs' && (
            <div>
              <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-slate-400">
                THÔNG SỐ KỸ THUẬT
              </h4>
              {specs.length > 0 ? (
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  {specs.map((spec, idx) => (
                    <div
                      key={idx}
                      className={`grid grid-cols-1 md:grid-cols-2 ${idx < specs.length - 1 ? 'border-b border-slate-100' : ''}`}
                    >
                      <div className="bg-slate-50/50 p-4">
                        <p className="text-xs font-bold text-slate-500">{spec.name}</p>
                      </div>
                      <div className="border-slate-100 p-4 md:border-l">
                        <p className="text-sm font-medium text-slate-800">{spec.value || '-'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">Chưa có thông số kỹ thuật</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Price grid cho wholesale/trusted */}
      {(p.postType === 'wholesale' || p.postType === 'trusted') && specs.length > 0 && (
        <div className="mt-0 overflow-hidden rounded-b-2xl border border-t-0 border-slate-200 bg-white">
          <div className="grid grid-cols-1 divide-x divide-slate-100 md:grid-cols-3">
            <PriceCard
              label="Giá sỉ"
              value={p.productWholesalePrice ? `${p.productWholesalePrice}đ` : 'Liên hệ'}
              note="/ Đơn vị"
              tone="text-[#004785]"
              bg="bg-slate-50/50"
            />
            <PriceCard
              label="Giá lẻ"
              value={p.productRetailPrice !== 'Liên hệ' ? `${p.productRetailPrice}đ` : 'Liên hệ'}
              note="/ Đơn vị"
              tone="text-slate-900"
              bg="bg-white"
            />
            <PriceCard
              label="Tối thiểu (MOQ)"
              value={p.formData?.moq || '-'}
              note="Đóng gói: Tiêu chuẩn"
              tone="text-slate-900"
              bg="bg-slate-50/50"
            />
          </div>
        </div>
      )}

      {/* Mobile product nav dots */}
      {total > 1 && (
        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={goPrev}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:border-[#004785] hover:text-[#004785] md:hidden"
          >
            <Icon name="chevron_left" size={18} />
          </button>
          <div className="flex items-center gap-2">
            {products.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setProductIdx(idx)}
                className={`h-2 rounded-full transition-all ${productIdx === idx ? 'w-6 bg-[#004785]' : 'w-2 bg-slate-300 hover:bg-slate-400'}`}
              />
            ))}
          </div>
          <span className="text-sm font-bold text-slate-600">
            {productIdx + 1}/{total}
          </span>
          <button
            type="button"
            onClick={goNext}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:border-[#004785] hover:text-[#004785] md:hidden"
          >
            <Icon name="chevron_right" size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default PreviewTabsSection;
