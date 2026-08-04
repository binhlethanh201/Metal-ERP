import React, { useState, useEffect } from 'react';
import Icon from '../../../../shared/components/Icon';

const CategoryModal = ({ isOpen, onClose, onSave, initialData, categories }) => {
  const [formData, setFormData] = useState({ categoryName: '', description: '', parentId: '' });

  // Reset hoáº·c náº¡p dá»¯ liá»‡u khi má»Ÿ modal
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
      alert('Vui lÃ²ng nháº­p tÃªn danh má»¥c.');
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#0f0f0f] p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#333333] pb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-[#e5e5e5]">
            {isEditMode ? 'Chá»‰nh sá»­a Danh má»¥c' : 'ThÃªm Danh má»¥c Má»›i'}
          </h3>
          <button onClick={onClose} className="text-slate-400 dark:text-[#666666] hover:text-slate-900 dark:text-[#e5e5e5]">
            <Icon name="x" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-[#999999]">
              TÃªn danh má»¥c hiá»ƒn thá»‹
            </label>
            <input
              type="text"
              value={formData.categoryName}
              onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
              className="w-full rounded-md border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#0f0f0f] p-2.5 text-sm font-semibold text-slate-900 dark:text-[#e5e5e5] outline-none focus:border-primary"
              placeholder="VÃ­ dá»¥: Thiáº¿t bá»‹ XÃ¢y dá»±ng"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-[#999999]">
              MÃ´ táº£ danh má»¥c
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className="w-full rounded-md border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#0f0f0f] p-2.5 text-sm text-slate-900 dark:text-[#e5e5e5] outline-none focus:border-primary"
              placeholder="MÃ´ táº£ ngáº¯n vá» danh má»¥c (tÃ¹y chá»n)"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-[#999999]">
              PhÃ¢n cáº¥p (Danh má»¥c cha)
            </label>
            <select
              value={formData.parentId}
              onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
              className="w-full rounded-md border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#0f0f0f] p-2.5 text-sm font-semibold text-slate-900 dark:text-[#e5e5e5] outline-none focus:border-primary"
            >
              <option value="">-- ÄÃ¢y lÃ  Danh má»¥c Gá»‘c (Root) --</option>
              {categories?.map((cat) => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  {cat.categoryName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-[#333333] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-semibold text-slate-500 dark:text-[#999999] hover:bg-slate-100 dark:bg-[#272727]"
            >
              Há»§y bá»
            </button>
            <button
              type="submit"
              className="rounded-md bg-[#004785] dark:bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-on-primary-fixed-variant"
            >
              {isEditMode ? 'LÆ°u Thay Äá»•i' : 'Táº¡o Danh Má»¥c'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;

