import React, { useState, useEffect } from 'react';
import Icon from '../../../../shared/components/Icon';

const CategoryModal = ({ isOpen, onClose, onSave, initialData, categories }) => {
  const [formData, setFormData] = useState({ categoryName: '', description: '', parentId: '' });

  // Reset hoặc nạp dữ liệu khi mở modal
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          categoryName: initialData.categoryName || '',
          description: initialData.description || '',
          parentId: initialData.parentId || '',
        });
      } else {
        setFormData({ categoryName: '', description: '', parentId: '' });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.categoryName.trim()) {
      alert('Vui lòng nhập tên danh mục.');
      return;
    }
    const payload = {
      categoryName: formData.categoryName.trim(),
      description: formData.description?.trim() || null,
      parentId: formData.parentId || null,
    };
    if (!initialData) {
      payload.sortOrder = 0;
    }
    onSave(payload);
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
              value={formData.categoryName}
              onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
              className="w-full rounded-md border border-outline-variant bg-surface-container-lowest p-2.5 text-sm font-semibold text-on-surface outline-none focus:border-primary"
              placeholder="Ví dụ: Thiết bị Xây dựng"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-on-surface-variant">
              Mô tả danh mục
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className="w-full rounded-md border border-outline-variant bg-surface-container-lowest p-2.5 text-sm text-on-surface outline-none focus:border-primary"
              placeholder="Mô tả ngắn về danh mục (tùy chọn)"
            />
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
              <option value="">-- Đây là Danh mục Gốc (Root) --</option>
              {categories?.map((cat) => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  {cat.categoryName}
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
