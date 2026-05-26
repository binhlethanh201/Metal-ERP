/**
 * Trang Đăng bài viết lớn
 */
import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Eye } from 'lucide-react'; // Import trực tiếp icon Lucide cần thiết
import PostTypeSelector from '../components/CreatePost/PostTypeSelector';
import ContentForm from '../components/CreatePost/ContentForm';
import PostHeader from '../components/CreatePost/PostHeader';
import PostSidebar from '../components/CreatePost/PostSidebar';
import MobileFooter from '../components/CreatePost/MobileFooter';
import QuoteClearanceSection from '../components/CreatePost/QuoteClearanceSection';
import SupplyTrustedSection from '../components/CreatePost/SupplyTrustedSection';
import SpecsForm from '../components/CreatePost/SpecsForm';
import { useCreatePostForm } from '../hooks/useCreatePostForm';
import {
  createPostTypes as POST_TYPES,
  createPostCategoryOptions as CATEGORY_OPTIONS,
  createPostQuoteProduct as quoteProduct,
} from '../data/forumPageData';

const CreatePost = () => {
  const form = useCreatePostForm();

  // Hứng hàm cập nhật sidebar từ rễ ForumLayout thông qua Outlet Context
  const { setRightSidebar } = useOutletContext();

  // Khóa chặt việc ẩn cột phải (Right Sidebar) cho trang Đăng bài lớn bằng cách dọn sạch về null
  useEffect(() => {
    if (setRightSidebar) {
      setRightSidebar(null);
    }
  }, [setRightSidebar]);

  return (
    <div className="w-full pb-12 pt-2">
      <PostHeader postType={form.postType} />

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
        <section className="space-y-5 xl:col-span-8">
          {/* Bộ chọn loại bài đăng */}
          <PostTypeSelector
            postTypes={POST_TYPES}
            selectedType={form.postType}
            onChange={form.handlePostTypeChange}
          />

          {/* Form nội dung cốt lõi bài đăng */}
          <ContentForm
            form={form}
            categoryOptions={CATEGORY_OPTIONS}
            onFilesSelected={(files) => {
              files.forEach((file) => {
                const reader = new FileReader();
                reader.onload = (e) => form.setImages((prev) => [...prev, e.target.result]);
                reader.readAsDataURL(file);
              });
            }}
          />

          {/* Render phân hệ form động tùy biến theo điều kiện tab loại bài đăng */}
          {form.isQuotePost || form.isClearancePost ? (
            <QuoteClearanceSection form={form} quoteProduct={quoteProduct} />
          ) : form.isSupplyPost || form.isTrustedPost ? (
            <SupplyTrustedSection form={form} quoteProduct={quoteProduct} />
          ) : (
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
              <div className="mb-1 border-b border-slate-50 pb-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#004785]">
                  3. Thông số kỹ thuật
                </h3>
              </div>
              <SpecsForm
                specRows={form.specRows}
                onAdd={form.handleAddSpec}
                onRemove={form.handleRemoveSpec}
                onChange={form.handleSpecChange}
              />
            </div>
          )}

          {/* 🌟 HỆ THỐNG ACTION BUTTON CHÂN TRANG ĐÃ QUY CHUẨN SANG ROUNDED-XL ĐỒNG BỘ */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => alert('Xem trước (demo).')}
                  className="shadow-sm/5 flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-95"
                >
                  <Eye size={14} />
                  <span>Xem trước</span>
                </button>
                <button
                  type="button"
                  onClick={() => alert('Đã lưu nháp (demo).')}
                  className="rounded-xl border-2 border-[#004785] px-5 py-2.5 text-xs font-bold text-[#004785] transition-all hover:bg-blue-50/5 active:scale-95"
                >
                  Lưu nháp
                </button>
              </div>

              <button
                type="button"
                disabled={form.loading}
                onClick={form.handlePublish}
                className="rounded-xl bg-[#004785] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-900/10 transition-all hover:bg-black active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {form.loading
                  ? 'Đang đăng tải...'
                  : form.isQuotePost
                    ? 'Đăng bài hỏi giá'
                    : form.isClearancePost
                      ? 'Đăng bài thanh lý kho'
                      : form.isSupplyPost
                        ? 'Đăng nguồn hàng'
                        : form.isTrustedPost
                          ? 'Đăng bài mua chung'
                          : 'Đăng bài viết'}
              </button>
            </div>
          </section>
        </section>

        {/* Cột tiến độ hoàn thành bên phải */}
        <PostSidebar
          completionPercent={form.completionPercent}
          progressOffset={form.progressOffset}
        />
      </div>

      <MobileFooter />
    </div>
  );
};

export default CreatePost;
