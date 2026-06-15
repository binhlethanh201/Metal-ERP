import React, { useState, useEffect } from 'react';
import Icon from '../../../../shared/components/Icon';

const CategoryModal = ({ isOpen, onClose, onSave, initialData, categories }) => {
  const [formData, setFormData] = useState({ name: '', slug: '', parentId: 'root' });

  // Reset hoặc nạp dữ liệu khi mở modal
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({ name: '', slug: '', parentId: 'root' });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  // Tự động chuẩn hóa chuỗi text thành URL Slug
  const handleNameChange = (e) => {
    const rawName = e.target.value;
    const autoSlug = rawName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu tiếng Việt
      .replace(/[^a-z0-9 ]/g, '') // Bỏ ký tự đặc biệt
      .replace(/\s+/g, '-'); // Thay khoảng trắng bằng dấu gạch ngang

    setFormData({ ...formData, name: rawName, slug: autoSlug });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên danh mục.');
      return;
    }
    onSave(formData);
  };

  const isEditMode = !!initialData;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-outline-variant bg-surface-container-lowest p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
          <h3 className="text-base font-bold text-on-surface">
            {isEditMode ? 'Chỉnh sửa Danh mục' : 'Thêm Danh mục Mới'}
          </h3>
          <button onClick={onClose} className="text-outline hover:text-on-surface">
            <Icon name="x" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-on-surface-variant">
              Tên danh mục hiển thị
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={handleNameChange}
              className="w-full rounded-md border border-outline-variant bg-surface-container-lowest p-2.5 text-sm font-semibold text-on-surface outline-none focus:border-primary"
              placeholder="Ví dụ: Thiết bị Xây dựng"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-on-surface-variant">
              URL Slug (Tạo tự động)
            </label>
            <input
              type="text"
              value={formData.slug}
              readOnly
              className="w-full rounded-md border border-outline-variant bg-surface-container p-2.5 font-mono text-sm text-on-surface-variant outline-none"
            />
            <p className="mt-1 text-[10px] text-on-surface-variant">
              * BR-50: Tự động loại bỏ dấu và ký tự đặc biệt.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-on-surface-variant">
              Phân cấp (Danh mục cha)
            </label>
            <select
              value={formData.parentId}
              onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
              className="w-full rounded-md border border-outline-variant bg-surface-container-lowest p-2.5 text-sm font-semibold text-on-surface outline-none focus:border-primary"
            >
              <option value="root">-- Đây là Danh mục Gốc (Root) --</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 border-t border-surface-container-high pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-on-primary hover:bg-on-primary-fixed-variant"
            >
              {isEditMode ? 'Lưu Thay Đổi' : 'Tạo Danh Mục'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
