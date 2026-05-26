/**
 * ContentForm -  Form nội dung bài đăng.
 */
import React from 'react';
import { Bold, Italic, List, Link2, X } from 'lucide-react'; // Import trực tiếp từ thư viện lucide-react
import ImageUploader from './ImageUploader';

const ContentForm = ({ form, categoryOptions, onFilesSelected }) => (
  <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
    <h3 className="text-xs font-black uppercase tracking-widest text-[#004785]">
      2. Nội dung chi tiết
    </h3>

    {/* Trường nhập Tiêu đề */}
    <div className="space-y-1.5">
      <label className="text-sm font-bold text-slate-700">
        {form.isQuotePost ? 'Tiêu đề yêu cầu báo giá' : 'Tiêu đề bài đăng'}
      </label>
      <input
        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold outline-none transition-all focus:border-[#004785] focus:bg-white focus:ring-0"
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

    {/* Lưới Danh mục và Khu vực */}
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-1.5">
        <label className="text-sm font-bold text-slate-700">
          {form.isQuotePost ? 'Tin tức ngành' : 'Danh mục'}
        </label>
        <select
          className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-[#004785] focus:bg-white"
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

      <div className="space-y-1.5">
        <label className="text-sm font-bold text-slate-700">Khu vực</label>
        <input
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold outline-none transition-all focus:border-[#004785] focus:bg-white focus:ring-0"
          placeholder="Toàn quốc, Hà Nội, TP.HCM..."
          type="text"
          value={form.formData.area}
          onChange={(e) => form.handleFormField('area', e.target.value)}
        />
      </div>
    </div>

    {/* Khung Soạn thảo Nội dung bài viết + Toolbar */}
    <div className="space-y-1.5">
      <label className="text-sm font-bold text-slate-700">
        {form.isQuotePost ? 'Nội dung yêu cầu báo giá' : 'Nội dung bài viết'}
      </label>
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="flex gap-1 border-b border-slate-200 bg-slate-50 p-2">
          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white hover:text-slate-900"
          >
            <Bold size={16} />
          </button>
          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white hover:text-slate-900"
          >
            <Italic size={16} />
          </button>
          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white hover:text-slate-900"
          >
            <List size={16} />
          </button>
          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white hover:text-slate-900"
          >
            <Link2 size={16} />
          </button>
        </div>
        <textarea
          className="w-full resize-none bg-white p-4 text-sm font-medium text-slate-600 outline-none placeholder:text-slate-400"
          placeholder={
            form.isQuotePost
              ? 'Mô tả nhu cầu, số lượng, khu vực giao hàng, yêu cầu chứng từ...'
              : 'Mô tả chi tiết về nguồn hàng, năng lực cung ứng...'
          }
          rows="5"
          value={form.formData.content}
          onChange={(e) => form.handleFormField('content', e.target.value)}
        />
      </div>
    </div>

    {/* Khối quản lý Hashtags (Tags) */}
    <div className="space-y-1.5">
      <label className="text-sm font-bold text-slate-700">Gắn thẻ bài viết (Tags)</label>
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/40 p-3">
        {form.formData.tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600"
          >
            #{tag}
            <button
              type="button"
              onClick={() => form.handleRemoveTag(tag)}
              className="text-blue-400 transition-colors hover:text-blue-800"
              aria-label={`Xóa thẻ ${tag}`}
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          className="min-w-[120px] flex-1 border-none bg-transparent p-0 text-sm font-semibold outline-none focus:ring-0"
          placeholder="Thêm thẻ mới..."
          type="text"
          value={form.newTag}
          onChange={(e) => form.setNewTag(e.target.value)}
          onKeyDown={form.handleAddTag}
        />
      </div>
      <p className="text-[11px] font-medium text-slate-400">
        Nhập thẻ và nhấn Enter để thêm (Tối đa 5 thẻ)
      </p>
    </div>

    {/* Phân hệ Tải ảnh đính kèm */}
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
