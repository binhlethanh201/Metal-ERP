import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import PostDetailRightSidebar from '../components/postDetail/PostDetailRightSidebar';
import PostDetailSellerCard from '../components/postDetail/PostDetailSellerCard';
import PostDetailGallery from '../components/postDetail/PostDetailGallery';
import PostDetailActions from '../components/postDetail/PostDetailActions';
import PostDetailComments from '../components/postDetail/PostDetailComments';
import PostDetailInfoBar from '../components/postDetail/PostDetailInfoBar';
import PostDetailTabsSection from '../components/postDetail/PostDetailTabsSection';
import PostDetailProductIndicator from '../components/postDetail/PostDetailProductIndicator';
import postDetailMockData from '../data/postDetailMockData';
import Icon from '../../../shared/components/Icon';

const TYPE_ALIAS = { trend: 'clearance', trusted: 'groupBuy', quote: 'supply' };

const TYPE_LABELS = {
  wholesale: 'Đăng bán sỉ',
  supply: 'Tìm nguồn hàng',
  clearance: 'Thanh lý kho',
  groupBuy: 'Mua chung',
};

const PostDetail = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('description');
  const [productIdx, setProductIdx] = useState(0);

  const rawType = searchParams.get('type') || 'wholesale';
  const type = TYPE_ALIAS[rawType] || rawType;
  const validType = postDetailMockData[type] ? type : 'wholesale';
  const data = postDetailMockData[validType];
  const { post, comments, relatedPosts, trends, tags } = data;

  const { setRightSidebar } = useOutletContext();

  const products = post.products || [];
  const hasProducts = products.length > 0;
  const totalProducts = products.length;
  const currentProduct = hasProducts ? products[productIdx] : null;

  useEffect(() => {
    setProductIdx(0);
  }, [validType]);

  useEffect(() => {
    if (setRightSidebar) {
      setRightSidebar(
        <PostDetailRightSidebar trends={trends} relatedPosts={relatedPosts} tags={tags} />
      );
    }
    return () => setRightSidebar?.(null);
  }, [setRightSidebar, trends, relatedPosts, tags]);

  const goPrev = useCallback(() => {
    setProductIdx((p) => (p === 0 ? totalProducts - 1 : p - 1));
  }, [totalProducts]);

  const goNext = useCallback(() => {
    setProductIdx((p) => (p === totalProducts - 1 ? 0 : p + 1));
  }, [totalProducts]);

  return (
    <div className="space-y-5 pb-8">
      <nav className="flex items-center gap-1 px-1 text-xs text-slate-400">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="transition-colors hover:text-[#004785]"
        >
          Diễn đàn
        </button>
        <Icon name="chevron_right" size={12} />
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">
          {TYPE_LABELS[validType]}
        </span>
        <Icon name="chevron_right" size={12} />
        <span className="font-medium text-[#004785]">Chi tiết bài viết</span>
      </nav>

      <PostDetailSellerCard post={post} type={validType} />

      <div className="space-y-3">
        <h1 className="text-2xl font-bold leading-tight text-slate-900">{post.title}</h1>
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag, idx) => (
            <span
              key={idx}
              className="cursor-pointer rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#004785] transition-colors hover:bg-[#004785] hover:text-white"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <PostDetailGallery key={productIdx} images={post.images || []} type={validType} />

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
          <Icon name="description" size={20} className="text-slate-500" />
          Mô tả sản phẩm
        </h3>
        <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
          {post.description}
        </p>
      </div>

      {validType !== 'wholesale' && (
        <PostDetailInfoBar post={post} product={currentProduct} type={validType} />
      )}

      <PostDetailActions type={validType} />

      <PostDetailTabsSection
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        validType={validType}
        hasProducts={hasProducts}
        totalProducts={totalProducts}
        productIdx={productIdx}
        onPrev={goPrev}
        onNext={goNext}
        detailImages={currentProduct?.detailImages || []}
        productName={currentProduct?.name || ''}
        postDescription={post.description}
        currentProduct={currentProduct}
      />

      {hasProducts && totalProducts > 1 && (
        <PostDetailProductIndicator
          products={products}
          productIdx={productIdx}
          total={totalProducts}
          onPrev={goPrev}
          onNext={goNext}
          onSelect={setProductIdx}
        />
      )}

      {validType === 'groupBuy' && post.priceTiers && (
        <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-purple-700">
            <Icon name="sell" size={16} />
            Bảng giá theo số lượng người tham gia
          </h4>
          <div className="overflow-hidden rounded-xl border border-purple-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-purple-50/50">
                  <th className="px-4 py-2.5 text-left text-xs font-bold uppercase text-purple-600">
                    Số người
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-bold uppercase text-purple-600">
                    Đơn giá
                  </th>
                  <th className="hidden px-4 py-2.5 text-right text-xs font-bold uppercase text-purple-600 md:table-cell">
                    Ghi chú
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50">
                {post.priceTiers.map((tier, idx) => {
                  const isTarget = tier.qty === post.priceTiers[post.priceTiers.length - 1].qty;
                  return (
                    <tr
                      key={idx}
                      className={isTarget ? 'bg-purple-50 font-bold' : 'hover:bg-slate-50'}
                    >
                      <td className="px-4 py-3">
                        <span className={isTarget ? 'text-purple-700' : 'text-slate-700'}>
                          {tier.qty}
                        </span>
                        {isTarget && (
                          <span className="ml-2 rounded bg-purple-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                            MỤC TIÊU
                          </span>
                        )}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-bold ${isTarget ? 'text-lg text-purple-700' : 'text-slate-800'}`}
                      >
                        {tier.price}
                      </td>
                      <td className="hidden px-4 py-3 text-right text-xs text-slate-500 md:table-cell">
                        {tier.note}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-bold text-purple-600">
                {post.participants}/{post.targetParticipants} người đã tham gia
              </span>
              <span className="text-slate-400">{post.deadline}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-purple-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all"
                style={{
                  width: `${Math.min(100, Math.round((post.participants / post.targetParticipants) * 100))}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      <PostDetailComments comments={comments} />
    </div>
  );
};

export default PostDetail;
