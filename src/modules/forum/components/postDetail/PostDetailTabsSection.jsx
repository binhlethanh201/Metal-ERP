import React from 'react';
import PostDetailSpecsTable from './PostDetailSpecsTable';
import ProductImageCarousel from './ProductImageCarousel';
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
        <button
          type="button"
          onClick={() => setActiveTab('description')}
          className={`px-8 py-4 text-sm font-bold transition-colors ${activeTab === 'description' ? 'border-b-2 border-[#004785] text-[#004785]' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Mô tả sản phẩm
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('specs')}
          className={`px-8 py-4 text-sm font-bold transition-colors ${activeTab === 'specs' ? 'border-b-2 border-[#004785] text-[#004785]' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Thông số kỹ thuật
        </button>
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

    {validType === 'wholesale' && currentProduct && (
      <div className="mt-0 overflow-hidden rounded-b-2xl border border-t-0 border-slate-200 bg-white">
        <div className="grid grid-cols-1 divide-x divide-slate-100 md:grid-cols-3">
          <div className="flex flex-col justify-between bg-slate-50/50 p-6">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Giá sỉ
              </p>
              <p className="text-2xl font-bold text-[#004785]">
                {currentProduct.priceRange?.split(' - ')[1] ||
                  currentProduct.priceRange ||
                  'Liên hệ'}
              </p>
            </div>
            <p className="mt-1 text-xs italic text-slate-400">/ Thùng</p>
          </div>
          <div className="flex flex-col justify-between bg-white p-6">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Giá lẻ
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {currentProduct.priceRange
                  ? `${(parseInt(currentProduct.priceRange.replace(/[^0-9]/g, '').slice(0, 7)) + 150000).toLocaleString('vi-VN')}đ`
                  : 'Liên hệ'}
              </p>
            </div>
            <p className="mt-1 text-xs italic text-slate-400">/ Thùng</p>
          </div>
          <div className="flex flex-col justify-between bg-slate-50/50 p-6">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Tối thiểu (MOQ)
              </p>
              <p className="text-2xl font-bold text-slate-900">{currentProduct.moq || '-'}</p>
            </div>
            <p className="mt-1 text-xs italic text-slate-400">Đóng gói: 20kg</p>
          </div>
        </div>
      </div>
    )}

    {validType === 'clearance' && currentProduct && (
      <div className="mt-0 overflow-hidden rounded-b-2xl border border-t-0 border-slate-200 bg-white">
        <div className="grid grid-cols-1 divide-x divide-slate-100 md:grid-cols-3">
          <div className="flex flex-col justify-between bg-red-50/30 p-6">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-red-500">
                Giá thanh lý
              </p>
              <p className="text-2xl font-bold text-red-600">{currentProduct.clearancePrice}</p>
            </div>
            <p className="mt-1 text-xs italic text-red-400">{currentProduct.discount} giảm</p>
          </div>
          <div className="flex flex-col justify-between bg-white p-6">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Giá gốc
              </p>
              <p className="text-2xl font-bold text-slate-400 line-through">
                {currentProduct.originalPrice}
              </p>
            </div>
            <p className="mt-1 text-xs italic text-slate-400">/ kg</p>
          </div>
          <div className="flex flex-col justify-between bg-slate-50/50 p-6">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Tồn kho còn lại
              </p>
              <p className="text-2xl font-bold text-slate-900">{currentProduct.remaining}</p>
            </div>
            <p className="mt-1 text-xs italic text-slate-400">KV: {currentProduct.area}</p>
          </div>
        </div>
      </div>
    )}
  </div>
);

export default PostDetailTabsSection;
