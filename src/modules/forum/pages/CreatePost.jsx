/**
 * Trang Đăng bài - Container gọi useCreatePostForm hook.
 * 5 dạng bài: Bán sỉ / Tìm nguồn / Hỏi giá / Thanh lý kho / Mua chung.
 * Mỗi dạng render section riêng: QuoteClearanceSection | SupplyTrustedSection | SpecsForm.
 */
import ForumLayout from '../components/shared/ForumLayout';
import PostTypeSelector from '../components/CreatePost/PostTypeSelector';
import ContentForm from '../components/CreatePost/ContentForm';
import PostHeader from '../components/CreatePost/PostHeader';
import PostSidebar from '../components/CreatePost/PostSidebar';
import MobileFooter from '../components/CreatePost/MobileFooter';
import QuoteClearanceSection from '../components/CreatePost/QuoteClearanceSection';
import SupplyTrustedSection from '../components/CreatePost/SupplyTrustedSection';
import MaterialIconBase from '../components/shared/MaterialIcon';
import SpecsForm from '../components/CreatePost/SpecsForm';
import { useCreatePostForm } from '../hooks/useCreatePostForm';
import {
  createPostTypes as POST_TYPES,
  createPostCategoryOptions as CATEGORY_OPTIONS,
  createPostQuoteProduct as quoteProduct,
} from '../data/forumPageData';

const MaterialIcon = (props) => <MaterialIconBase opsz={24} {...props} />;

export const CreatePost = () => {
  const form = useCreatePostForm();

  return (
    <ForumLayout activeKey="" hideRightSidebar>
      <div className="w-full pb-12 pt-2">
        <PostHeader postType={form.postType} />

        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
          <section className="space-y-6 xl:col-span-8">
            <PostTypeSelector
              postTypes={POST_TYPES}
              selectedType={form.postType}
              onChange={form.handlePostTypeChange}
            />

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

            {form.isQuotePost || form.isClearancePost ? (
              <QuoteClearanceSection form={form} quoteProduct={quoteProduct} />
            ) : form.isSupplyPost || form.isTrustedPost ? (
              <SupplyTrustedSection form={form} quoteProduct={quoteProduct} />
            ) : (
              <>
                <div className="space-y-5 rounded-lg border border-outline-variant bg-white p-4 md:p-6">
                  <div className="mb-1 flex items-center justify-between gap-4">
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
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
              </>
            )}

            {/* Nút hành động */}
            <section className="rounded-lg border border-outline-variant bg-white p-4 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => alert('Xem trước (demo).')}
                    className="rounded-full border border-outline-variant px-5 py-2.5 text-sm font-medium text-on-surface-variant transition-all hover:bg-surface-container-low"
                  >
                    <MaterialIcon name="visibility" className="mr-1 align-middle text-[18px]" />
                    <span>Xem trước</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => alert('Đã lưu nháp (demo).')}
                    className="rounded-full border-2 border-primary px-6 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary-fixed"
                  >
                    Lưu nháp
                  </button>
                </div>
                <button
                  type="button"
                  disabled={form.loading}
                  onClick={form.handlePublish}
                  className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {form.loading
                    ? 'Đang đăng...'
                    : form.isQuotePost
                      ? 'Đăng bài hỏi giá'
                      : form.isClearancePost
                        ? 'Đăng bài thanh lý kho'
                        : form.isSupplyPost
                          ? 'Đăng nguồn hàng'
                          : form.isTrustedPost
                            ? 'Đăng bài mua chung'
                            : 'Đăng bài'}
                </button>
              </div>
            </section>
          </section>

          <PostSidebar
            completionPercent={form.completionPercent}
            progressOffset={form.progressOffset}
          />
        </div>
      </div>

      <MobileFooter />
    </ForumLayout>
  );
};

export default CreatePost;
