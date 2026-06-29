import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Icon from '../../../shared/components/Icon';
import {
  getCategoryList,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/adminService';
import CategoryModal from '../components/category/CategoryModal';
import ConfirmActionModal from '../components/ConfirmActionModal';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteModalConfig, setDeleteModalConfig] = useState({
    isOpen: false,
    targetId: null,
    targetName: '',
  });

  const fetchCategories = useCallback(() => {
    setLoading(true);
    setError(null);
    getCategoryList()
      .then((data) => {
        setCategories(Array.isArray(data) ? data : data?.items || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Category API error:', err);
        setError(err.message || 'Không tải được danh mục');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const categoryTree = useMemo(() => {
    const filtered = categories.filter(
      (c) =>
        (c.categoryName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.categoryId || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    const childrenMap = {};
    filtered.forEach((cat) => {
      const parent = cat.parentId || 'root';
      if (!childrenMap[parent]) childrenMap[parent] = [];
      childrenMap[parent].push(cat);
    });
    const buildNode = (node, depth = 0) => ({
      ...node,
      depth,
      children: (childrenMap[node.categoryId] || []).map((child) => buildNode(child, depth + 1)),
    });
    return (childrenMap['root'] || []).map((rootNode) => buildNode(rootNode, 0));
  }, [categories, searchTerm]);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };
  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (formData) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.categoryId, formData);
      } else {
        await createCategory(formData);
      }
      setIsCategoryModalOpen(false);
      fetchCategories();
    } catch (err) {
      console.error('Save category error:', err);
      alert(err.message || 'Lưu danh mục thất bại');
    }
  };

  const triggerDelete = (cat) => {
    if ((cat.postCount || 0) > 0) {
      alert(
        `[Exception E1] Lỗi: Không thể xóa "${cat.categoryName}" vì đang chứa ${cat.postCount} bài viết.`
      );
      return;
    }
    setDeleteModalConfig({ isOpen: true, targetId: cat.categoryId, targetName: cat.categoryName });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteCategory(deleteModalConfig.targetId);
      setDeleteModalConfig({ isOpen: false, targetId: null, targetName: '' });
      fetchCategories();
    } catch (err) {
      console.error('Delete category error:', err);
      alert(err.message || 'Xóa danh mục thất bại');
    }
  };

  const renderTreeNodes = (nodes) => {
    return nodes.map((cat) => (
      <div key={cat.categoryId}>
        <div
          className="flex items-center justify-between border-b border-outline-variant/30 p-4 transition-colors last:border-0 hover:bg-surface-container-low"
          style={{ paddingLeft: `${cat.depth * 2 + 1}rem` }}
        >
          <div className="flex items-center gap-4">
            {cat.depth > 0 ? (
              <span className="text-outline-variant">
                <Icon name="corner_down_right" size={20} />
              </span>
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-container text-on-primary-container">
                <Icon name="folder" size={20} />
              </div>
            )}
            <div>
              <p className="text-base font-bold text-on-surface">{cat.categoryName}</p>
              <div className="mt-1 flex gap-3 text-xs font-medium text-on-surface-variant">
                <span>
                  Mã: <span className="font-mono text-outline">{cat.categoryId}</span>
                </span>
                <span>•</span>
                <span>
                  Bao gồm:{' '}
                  <span className={cat.postCount > 0 ? 'font-bold text-primary' : ''}>
                    {cat.postCount || 0} bài viết
                  </span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleOpenEdit(cat)}
              className="rounded-md p-2 text-outline hover:bg-surface-container-highest hover:text-on-surface"
            >
              <Icon name="edit" size={16} />
            </button>
            <button
              onClick={() => triggerDelete(cat)}
              className="rounded-md p-2 text-outline hover:bg-error-container hover:text-error"
            >
              <Icon name="trash_2" size={16} />
            </button>
          </div>
        </div>
        {cat.children && cat.children.length > 0 && (
          <div className="bg-surface-container-lowest/50">{renderTreeNodes(cat.children)}</div>
        )}
      </div>
    ));
  };

  return (
    <div className="space-y-6 text-on-surface">
      <div className="flex items-center justify-between border-b border-outline-variant pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-on-surface">
            Cây Danh Mục Hệ Thống
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Tổ chức không gian lưu trữ và từ điển dữ liệu đa tầng
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-on-primary shadow-sm hover:bg-on-primary-fixed-variant"
        >
          <Icon name="plus" size={16} /> Thêm Danh Mục
        </button>
      </div>

      <div className="flex items-center justify-between rounded-md border border-outline-variant bg-surface-container-lowest p-2 shadow-sm">
        <div className="relative w-full max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline">
            <Icon name="search" size={14} />
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm danh mục theo Tên, Mã ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-outline-variant bg-surface-container-low px-3 py-2 pl-9 text-xs font-semibold outline-none focus:border-primary focus:bg-surface-container-lowest"
          />
        </div>
      </div>

      {loading && (
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-8 text-center text-xs text-on-surface-variant">
          Đang tải...
        </div>
      )}
      {error && (
        <div className="rounded-md bg-error-container p-3 text-xs font-semibold text-error">
          {error}
        </div>
      )}
      {!loading && !error && (
        <div className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest shadow-sm">
          {categoryTree.length > 0 ? (
            renderTreeNodes(categoryTree)
          ) : (
            <div className="p-8 text-center text-sm font-semibold text-on-surface-variant">
              Không tìm thấy danh mục nào.
            </div>
          )}
        </div>
      )}

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        initialData={editingCategory}
        categories={categories}
        onSave={handleSaveCategory}
      />
      <ConfirmActionModal
        isOpen={deleteModalConfig.isOpen}
        onClose={() => setDeleteModalConfig({ isOpen: false, targetId: null, targetName: '' })}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa danh mục"
        message={`Bạn có chắc chắn muốn xóa "${deleteModalConfig.targetName}"?`}
        warningNote="Hành động này không thể hoàn tác."
        confirmText="Xóa danh mục"
        type="danger"
      />
    </div>
  );
};

export default CategoryManagement;
