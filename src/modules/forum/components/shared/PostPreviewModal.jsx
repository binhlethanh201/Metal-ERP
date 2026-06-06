/**
 * PostPreviewModal - Xem trước bài đăng, layout giống hệt PostDetail page.
 */
import React from 'react';
import { Modal } from '../../../../shared/components/Modal';
import Icon from '../../../../shared/components/Icon';
import PreviewSellerCard from './PreviewSellerCard';
import PreviewGallery from './PreviewGallery';
import PreviewInfoBar from './PreviewInfoBar';
import PreviewActions from './PreviewActions';
import PreviewTabsSection from './PreviewTabsSection';

const TYPE_LABELS = {
  wholesale: 'Đăng bán sỉ',
  supply: 'Tìm nguồn hàng',
  quote: 'Hỏi giá',
  trend: 'Thanh lý kho',
  trusted: 'Mua chung',
};

const PostPreviewModal = ({ isOpen, onClose, p }) => {
  if (!p) return null;

  const { postType, formData, images, supplyProducts } = p;
  const postTypeLabel = TYPE_LABELS[postType] || 'Đăng bài';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Xem trước - ${postTypeLabel}`} size="7xl">
      <div className="no-scrollbar max-h-[85vh] overflow-y-auto px-1 pb-8 pt-1 md:px-2">
        <div className="space-y-5 px-2 md:px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-xs text-slate-400">
            <span>Diễn đàn</span>
            <Icon name="chevron_right" size={12} />
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">
              {postTypeLabel}
            </span>
            <Icon name="chevron_right" size={12} />
            <span className="font-medium text-[#004785]">Xem trước</span>
          </nav>

          <PreviewSellerCard />

          {/* Title + Tags */}
          <div className="space-y-3">
            <h1 className="text-2xl font-bold leading-tight text-slate-900">
              {formData?.title || '(Chưa có tiêu đề)'}
            </h1>
            {formData?.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#004785]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <PreviewGallery postType={postType} images={images} />

          {/* Mô tả bài viết */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
              <Icon name="description" size={20} className="text-slate-500" />
              Mô tả sản phẩm
            </h3>
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
              {formData?.content || 'Chưa có nội dung mô tả.'}
            </p>
          </div>

          {postType !== 'wholesale' && postType !== 'trusted' && <PreviewInfoBar p={p} />}

          <PreviewActions postType={postType} />

          {p.showTrustedSpecs && supplyProducts?.length > 0 && <PreviewTabsSection p={p} />}

          <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 text-center">
            <p className="text-xs font-medium text-amber-700">
              Đây là bản xem trước. Bài viết thực tế sẽ hiển thị đầy đủ và có thể tương tác.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PostPreviewModal;
