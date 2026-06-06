/**
 * CreatePostModal - Modal đăng bài nhanh (phiên bản popup của CreatePost page).
 */
import React from 'react';
import { Modal } from '../../../../shared/components/Modal';
import ProgressCircle from '../../../../shared/components/ProgressCircle';
import TagInput from './TagInput';
import PostingTips from './PostingTips';
import ModalAttachmentSection from './ModalAttachmentSection';
import ModalSpecsSection from './ModalSpecsSection';
import PostPreviewModal from './PostPreviewModal';
import useCreatePostModal, { CATEGORY_OPTIONS } from '../../hooks/useCreatePostModal';
import {
  Store,
  SearchCode,
  FileText,
  TrendingUp,
  CheckCircle,
  Bold,
  Italic,
  List,
  Link2,
  X,
  Camera,
  Eye,
} from 'lucide-react';

const POST_TYPES = [
  { key: 'wholesale', icon: Store, label: 'Đăng bán sỉ' },
  { key: 'supply', icon: SearchCode, label: 'Tìm nguồn hàng' },
  { key: 'quote', icon: FileText, label: 'Hỏi giá' },
  { key: 'trend', icon: TrendingUp, label: 'Thanh lý kho' },
  { key: 'trusted', icon: CheckCircle, label: 'Mua chung' },
];

export const CreatePostModal = ({ isOpen = false, onClose = () => {} }) => {
  const ctx = useCreatePostModal({ onClose });

  const postTypeLabel = POST_TYPES.find((t) => t.key === ctx.postType)?.label || '';
  const modalTitleMap = {
    wholesale: 'Đăng bán sỉ',
    supply: 'Tìm nguồn hàng',
    quote: 'Hỏi giá',
    trend: 'Thanh lý kho',
    trusted: 'Đăng Mua chung',
  };
  const modalTitle = modalTitleMap[ctx.postType] || postTypeLabel || 'Đăng bài';
  const publishLabel = postTypeLabel.replace(/^Đăng\s*/i, '') || 'bài';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="7xl">
      <div className="no-scrollbar max-h-[85vh] overflow-y-auto px-1 pb-2 pt-1 md:px-2">
        <div className="space-y-6 px-2 md:px-4">
          <header className="space-y-1">
            <h2 className="text-xl font-bold leading-tight text-slate-900 md:text-2xl">
              {modalTitle}
            </h2>
            <p className="text-sm font-medium text-slate-500">
              Điền đầy đủ thông tin để thu hút đối tác và khách hàng B2B tiềm năng.
            </p>
          </header>

          <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
            <section className="space-y-5 xl:col-span-8">
              {/* 1. Chọn loại bài đăng */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
                <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-[#004785]">
                  1. Chọn loại bài đăng
                </h3>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                  {POST_TYPES.map((item) => {
                    const active = ctx.postType === item.key;
                    const TypeIcon = item.icon;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => ctx.handlePostTypeChange(item.key)}
                        className={`group flex min-h-24 flex-col items-center justify-center rounded-xl border p-3 text-center transition-all duration-150 active:scale-95 ${active ? 'shadow-sm/5 border-2 border-blue-200 bg-blue-50/50 font-bold text-[#004785]' : 'border-slate-200 text-slate-500 hover:border-blue-200 hover:text-[#004785]'}`}
                      >
                        <TypeIcon className="mb-2" size={22} />
                        <span className="text-xs font-semibold md:text-sm">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Nội dung chi tiết */}
              <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#004785]">
                  2. Nội dung chi tiết
                </h3>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Tiêu đề bài đăng</label>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold outline-none transition-all focus:border-[#004785] focus:bg-white focus:ring-0"
                    placeholder="Ví dụ: Cung cấp thép xây dựng Hòa Phát số lượng lớn tại TP.HCM"
                    type="text"
                    value={ctx.formData.title}
                    onChange={(e) => ctx.handleFormField('title', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Danh mục</label>
                    <select
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-[#004785] focus:bg-white"
                      value={ctx.formData.category}
                      onChange={(e) => ctx.handleFormField('category', e.target.value)}
                    >
                      {CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Khu vực</label>
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold outline-none transition-all focus:border-[#004785] focus:bg-white focus:ring-0"
                      placeholder="Toàn quốc, Hà Nội, TP.HCM..."
                      type="text"
                      value={ctx.formData.area}
                      onChange={(e) => ctx.handleFormField('area', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Nội dung bài viết</label>
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <div className="flex gap-1 border-b border-slate-200 bg-slate-50 p-2">
                      {[Bold, Italic, List, Link2].map((IconEl, i) => (
                        <button
                          key={i}
                          type="button"
                          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white hover:text-slate-900"
                        >
                          <IconEl size={16} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      className="w-full resize-none bg-white p-4 text-sm font-medium text-slate-600 outline-none placeholder:text-slate-400"
                      placeholder="Mô tả chi tiết về nhu cầu mua chung, số lượng, khu vực giao hàng, yêu cầu chứng từ..."
                      rows="5"
                      value={ctx.formData.content}
                      onChange={(e) => ctx.handleFormField('content', e.target.value)}
                    />
                  </div>
                </div>

                <TagInput
                  tags={ctx.formData.tags}
                  onAdd={ctx.handleAddTag}
                  onRemove={ctx.handleRemoveTag}
                />

                {!ctx.isSupplyPost && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Ảnh sản phẩm</label>
                    <div className="flex gap-4">
                      <label className="flex h-28 w-28 flex-shrink-0 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-slate-400 transition-all hover:border-[#004785] hover:bg-blue-50/30 hover:text-[#004785]">
                        <Camera size={22} />
                        <span className="text-center text-[10px] font-black uppercase tracking-wider">
                          Tải ảnh
                        </span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={ctx.handleImageChange}
                        />
                      </label>
                      {ctx.images.length > 0 && (
                        <div className="no-scrollbar flex flex-1 gap-3 overflow-x-auto pb-1">
                          {ctx.images.map((img, idx) => (
                            <div
                              key={img.id}
                              className="group relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl border border-slate-100"
                            >
                              <img
                                src={img.url}
                                alt={`Ảnh ${idx + 1}`}
                                className="h-full w-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => ctx.handleRemoveImage(idx)}
                                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-lg bg-black/60 text-white shadow-md backdrop-blur-sm transition-all group-hover:bg-red-600"
                                aria-label={`Xóa ảnh ${idx + 1}`}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 3 + 4: Sub-components */}
              {ctx.postType !== 'wholesale' && <ModalAttachmentSection p={ctx.p} h={ctx.h} />}
              {!ctx.isQuotePost && !ctx.isClearancePost && (
                <ModalSpecsSection p={ctx.p} h={ctx.h} />
              )}

              {/* Actions */}
              <div className="border-slate-150 flex flex-wrap items-center justify-end gap-3 border-t pt-3">
                <button
                  type="button"
                  onClick={() => ctx.setPreviewOpen(true)}
                  className="group flex items-center gap-1.5 rounded-xl border-2 border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-95"
                >
                  <Eye size={16} />
                  <span>Xem trước</span>
                </button>
                <button
                  type="button"
                  onClick={() => alert('Đã lưu nháp (demo).')}
                  className="rounded-xl border-2 border-[#004785] px-5 py-2.5 text-xs font-bold text-[#004785] transition-all hover:bg-blue-50/5 active:scale-95"
                >
                  Lưu nháp
                </button>
                <button
                  type="button"
                  disabled={ctx.loading}
                  onClick={ctx.handlePublish}
                  className="rounded-xl bg-[#004785] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-900/10 transition-all hover:bg-black active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {ctx.loading ? 'Đang đăng tải...' : `Đăng bài ${publishLabel}`}
                </button>
              </div>
            </section>

            {/* Aside */}
            <aside className="space-y-4 xl:col-span-4">
              <div className="space-y-4 xl:sticky xl:top-2">
                <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
                  <h3 className="mb-4 w-full text-left text-xs font-black uppercase tracking-widest text-slate-400">
                    Tiến độ bài đăng
                  </h3>
                  <ProgressCircle percent={ctx.completionPercent} />
                  <p className="text-xs font-medium leading-relaxed text-slate-400">
                    Điền thêm các điều kiện sỉ và thông số để tăng 65% độ uy tín B2B.
                  </p>
                </div>
                <PostingTips />
              </div>
            </aside>
          </div>
        </div>
      </div>
      <PostPreviewModal
        isOpen={ctx.previewOpen}
        onClose={() => ctx.setPreviewOpen(false)}
        p={ctx.p}
      />
    </Modal>
  );
};

export default CreatePostModal;
