import React from 'react';
import PostDetailSpecsTable from './PostDetailSpecsTable';
import ProductImageCarousel from './ProductImageCarousel';
import PriceInfoGrid from './PriceInfoGrid';
import Icon from '../../../../shared/components/Icon';

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
}) => (
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

    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <nav className="flex border-b border-slate-100">
        {['Mô tả sản phẩm', 'Thông số kỹ thuật'].map((tab, i) => {
          const key = i === 0 ? 'description' : 'specs';
          const active = activeTab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`px-8 py-4 text-sm font-bold transition-colors ${active ? 'border-b-2 border-[#004785] text-[#004785]' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {tab}
            </button>
          );
        })}
      </nav>

      <div className="p-8">
        {activeTab === 'description' && (
          <section>
            <h3 className="mb-6 text-xl font-bold text-slate-900">Chi tiết sản phẩm</h3>
            <div className="mb-8">
              <ProductImageCarousel
                key={productIdx}
                images={detailImages}
                productName={productName}
              />
            </div>
            <div className="space-y-4 text-center text-sm leading-relaxed text-slate-600">
              <p>{postDescription}</p>
              <p>
                <span className="font-bold text-slate-900">Ưu điểm nổi bật:</span> Chống thấm tuyệt
                đối, ngăn chặn nấm mốc, bền màu với thời gian và đặc biệt an toàn cho người sử dụng
                với hàm lượng VOC cực thấp.
              </p>
            </div>
          </section>
        )}

        {activeTab === 'specs' && (
          <PostDetailSpecsTable
            key={productIdx}
            specs={currentProduct?.specs || []}
            type={validType}
          />
        )}
      </div>
    </div>

    {(validType === 'wholesale' || validType === 'clearance') && currentProduct && (
      <PriceInfoGrid type={validType} product={currentProduct} />
    )}
  </div>
);

export default PostDetailTabsSection;
