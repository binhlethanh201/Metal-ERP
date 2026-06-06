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
import PostDetailEditBar from '../components/postDetail/PostDetailEditBar';
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
  const [saving, setSaving] = useState(false);

  const rawType = searchParams.get('type') || 'wholesale';
  const isEditing = searchParams.get('edit') === 'true';
  const type = TYPE_ALIAS[rawType] || rawType;
  const validType = postDetailMockData[type] ? type : 'wholesale';
  const data = postDetailMockData[validType];
  const { post: initialPost, comments, relatedPosts, trends, tags } = data;

  const [post, setPost] = useState(initialPost);

  const { setRightSidebar } = useOutletContext();

  const products = post.products || [];
  const hasProducts = products.length > 0;
  const totalProducts = products.length;
  const currentProduct = hasProducts ? products[productIdx] : null;

  useEffect(() => {
    setProductIdx(0);
  }, [validType]);

  useEffect(() => {
    if (setRightSidebar && !isEditing) {
      setRightSidebar(
        <PostDetailRightSidebar trends={trends} relatedPosts={relatedPosts} tags={tags} />
      );
    }
    if (isEditing) setRightSidebar?.(null);
    return () => setRightSidebar?.(null);
  }, [setRightSidebar, trends, relatedPosts, tags, isEditing]);

  const goPrev = useCallback(
    () => setProductIdx((p) => (p === 0 ? totalProducts - 1 : p - 1)),
    [totalProducts]
  );
  const goNext = useCallback(
    () => setProductIdx((p) => (p === totalProducts - 1 ? 0 : p + 1)),
    [totalProducts]
  );

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Đã lưu thay đổi (demo).');
    }, 800);
  };

  const handleCancel = () => {
    if (window.confirm('Hủy chỉnh sửa? Các thay đổi sẽ không được lưu.')) {
      window.history.replaceState(null, '', window.location.pathname + `?type=${rawType}`);
      setPost(initialPost);
    }
  };

  const updatePost = (field, value) => setPost((prev) => ({ ...prev, [field]: value }));

  const updateProduct = (field, value) => {
    setPost((prev) => {
      const products = [...(prev.products || [])];
      if (products[productIdx]) products[productIdx] = { ...products[productIdx], [field]: value };
      return { ...prev, products };
    });
  };

  const handleUpdateSpec = (pIdx, sIdx, field, value) => {
    setPost((prev) => {
      const products = [...(prev.products || [])];
      if (products[pIdx]) {
        const specs = [...(products[pIdx].specs || [])];
        if (specs[sIdx]) specs[sIdx] = { ...specs[sIdx], [field]: value };
        products[pIdx] = { ...products[pIdx], specs };
      }
      return { ...prev, products };
    });
  };

  const handleAddSpec = (pIdx) => {
    setPost((prev) => {
      const products = [...(prev.products || [])];
      if (products[pIdx]) {
        products[pIdx] = {
          ...products[pIdx],
          specs: [...(products[pIdx].specs || []), { name: '', value: '' }],
        };
      }
      return { ...prev, products };
    });
  };

  const handleRemoveSpec = (pIdx, sIdx) => {
    setPost((prev) => {
      const products = [...(prev.products || [])];
      if (products[pIdx]?.specs?.length > 1) {
        products[pIdx] = {
          ...products[pIdx],
          specs: products[pIdx].specs.filter((_, i) => i !== sIdx),
        };
      }
      return { ...prev, products };
    });
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Edit bar */}
      {isEditing && (
        <PostDetailEditBar onSave={handleSave} onCancel={handleCancel} saving={saving} />
      )}

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
        <span className="font-medium text-[#004785]">
          {isEditing ? 'Chỉnh sửa' : 'Chi tiết bài viết'}
        </span>
      </nav>

      <PostDetailSellerCard post={post} type={validType} />

      {/* Title + Tags (editable in edit mode) */}
      <div className="space-y-3">
        {isEditing ? (
          <input
            className="w-full rounded-xl border-2 border-[#004785] bg-blue-50/30 px-4 py-3 text-2xl font-bold text-slate-900 outline-none focus:ring-0"
            value={post.title}
            onChange={(e) => updatePost('title', e.target.value)}
          />
        ) : (
          <h1 className="text-2xl font-bold leading-tight text-slate-900">{post.title}</h1>
        )}

        {isEditing ? (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/20 p-3">
            {post.tags.map((tag, idx) => (
              <span
                key={idx}
                className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-[#004785]"
              >
                {tag}
                <button
                  type="button"
                  onClick={() =>
                    updatePost(
                      'tags',
                      post.tags.filter((_, i) => i !== idx)
                    )
                  }
                  className="text-blue-400 hover:text-red-500"
                >
                  <Icon name="close" size={12} />
                </button>
              </span>
            ))}
            <input
              className="min-w-[140px] flex-1 border-none bg-transparent p-0 text-sm font-semibold outline-none placeholder:text-slate-400"
              placeholder="+ Thêm tag..."
              type="text"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  updatePost('tags', [...post.tags, e.target.value.trim()]);
                  e.target.value = '';
                }
              }}
            />
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, idx) => (
              <span
                key={idx}
                className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#004785]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Gallery */}
      {isEditing ? (
        <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/20 p-6 text-center">
          <Icon name="image" size={32} className="mx-auto mb-2 text-blue-300" />
          <p className="text-sm font-bold text-slate-600">Kéo thả hoặc nhấn để thay đổi ảnh</p>
          <p className="mt-1 text-xs text-slate-400">Hỗ trợ tối đa 6 ảnh, định dạng JPG/PNG</p>
          {post.images?.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {post.images.map((img, i) => (
                <div
                  key={i}
                  className="group relative h-24 w-24 overflow-hidden rounded-xl border border-slate-200"
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                  <button className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-md bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <Icon name="close" size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <PostDetailGallery key={productIdx} images={post.images || []} type={validType} />
      )}

      {/* Description */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
        {isEditing ? (
          <textarea
            className="min-h-[200px] w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 outline-none focus:border-[#004785] focus:ring-0"
            value={post.description}
            onChange={(e) => updatePost('description', e.target.value)}
          />
        ) : (
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
            {post.description}
          </p>
        )}
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
        isEditing={isEditing}
        onUpdateProduct={updateProduct}
        onUpdateSpec={handleUpdateSpec}
        onAddSpec={handleAddSpec}
        onRemoveSpec={handleRemoveSpec}
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
        </div>
      )}

      <PostDetailComments comments={comments} />
    </div>
  );
};

export default PostDetail;
