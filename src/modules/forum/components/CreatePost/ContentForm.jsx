/**
 * ContentForm - Bước 2: Form nội dung bài đăng.
 * Tiêu đề + Danh mục + Khu vực + Nội dung (textarea + toolbar) + Tags + Upload ảnh.
 * Props: form (từ useCreatePostForm), categoryOptions[], onFilesSelected.
 */
import MaterialIconBase from '../shared/MaterialIcon';
import ImageUploader from './ImageUploader';

const MaterialIcon = (props) => <MaterialIconBase opsz={24} {...props} />;

const ContentForm = ({ form, categoryOptions, onFilesSelected }) => (
  <div className="space-y-5 rounded-lg border border-outline-variant bg-white p-4 md:p-6">
    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
      2. Nội dung chi tiết
    </h3>

    <div className="space-y-2">
      <label className="text-sm font-medium text-on-surface">
        {form.isQuotePost ? 'Tiêu đề yêu cầu báo giá' : 'Tiêu đề bài đăng'}
      </label>
      <input
        className="w-full rounded-lg border border-outline-variant bg-surface-bright px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-container"
        placeholder={
          form.isQuotePost
            ? 'Ví dụ: Cần báo giá thép xây dựng Hòa Phát số lượng lớn tại TP.HCM'
            : 'Ví dụ: Cung cấp thép xây dựng Hòa Phát số lượng lớn tại TP.HCM'
        }
        type="text"
        value={form.formData.title}
        onChange={(e) => form.handleFormField('title', e.target.value)}
      />
    </div>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <label className="text-sm font-medium text-on-surface">
          {form.isQuotePost ? 'Tin tức ngành' : 'Danh mục'}
        </label>
        <select
          className="w-full appearance-none rounded-lg border border-outline-variant bg-surface-bright px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-container"
          value={form.formData.category}
          onChange={(e) => form.handleFormField('category', e.target.value)}
        >
          {categoryOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-on-surface">Khu vực</label>
        <input
          className="w-full rounded-lg border border-outline-variant bg-surface-bright px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-container"
          placeholder="Toàn quốc, Hà Nội, TP.HCM..."
          type="text"
          value={form.formData.area}
          onChange={(e) => form.handleFormField('area', e.target.value)}
        />
      </div>
    </div>

    <div className="space-y-2">
      <label className="text-sm font-medium text-on-surface">
        {form.isQuotePost ? 'Nội dung yêu cầu báo giá' : 'Nội dung bài viết'}
      </label>
      <div className="overflow-hidden rounded-lg border border-outline-variant">
        <div className="flex gap-2 border-b border-outline-variant bg-slate-100 p-2">
          {['format_bold', 'format_italic', 'format_list_bulleted', 'link'].map((icon) => (
            <button
              key={icon}
              type="button"
              className="rounded p-1 text-on-surface-variant hover:bg-white"
            >
              <MaterialIcon name={icon} className="text-[18px]" />
            </button>
          ))}
        </div>
        <textarea
          className="w-full resize-none bg-surface-bright p-4 text-sm outline-none"
          placeholder={
            form.isQuotePost
              ? 'Mô tả nhu cầu, số lượng, khu vực giao hàng, yêu cầu chứng từ...'
              : 'Mô tả chi tiết về nguồn hàng, năng lực cung ứng...'
          }
          rows="6"
          value={form.formData.content}
          onChange={(e) => form.handleFormField('content', e.target.value)}
        />
      </div>
    </div>

    <div className="space-y-2">
      <label className="text-sm font-medium text-on-surface">Gắn thẻ bài viết (Tags)</label>
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-outline-variant bg-surface-bright p-3">
        {form.formData.tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full bg-primary-container/10 px-3 py-1 text-xs font-medium text-primary md:text-sm"
          >
            #{tag}
            <button
              type="button"
              onClick={() => form.handleRemoveTag(tag)}
              className="leading-none text-primary/80 hover:text-primary"
              aria-label={`Xóa thẻ ${tag}`}
            >
              <MaterialIcon name="close" className="text-[14px]" />
            </button>
          </span>
        ))}
        <input
          className="min-w-[120px] flex-1 border-none bg-transparent p-0 text-sm outline-none focus:ring-0"
          placeholder="Thêm thẻ mới..."
          type="text"
          value={form.newTag}
          onChange={(e) => form.setNewTag(e.target.value)}
          onKeyDown={form.handleAddTag}
        />
      </div>
      <p className="text-xs text-on-surface-variant">
        Nhập thẻ và nhấn Enter để thêm (Tối đa 5 thẻ)
      </p>
    </div>

    {!form.isSupplyPost && (
      <ImageUploader
        images={form.images}
        onRemove={form.handleRemoveImage}
        onFilesSelected={onFilesSelected}
      />
    )}
  </div>
);

export default ContentForm;
