import React, { useState, useMemo } from 'react';
import Icon from '../../../shared/components/Icon';
import { MOCK_CATEGORIES } from '../data/mockData';
import CategoryModal from '../components/category/CategoryModal';
import ConfirmActionModal from '../components/ConfirmActionModal';

const CategoryManagement = () => {
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [searchTerm, setSearchTerm] = useState('');

  // States quản lý Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteModalConfig, setDeleteModalConfig] = useState({
    isOpen: false,
    targetId: null,
    targetName: '',
  });

  // Thuật toán: Chuyển đổi dữ liệu phẳng thành Cây phân cấp (Tree)
  const categoryTree = useMemo(() => {
    // Lọc theo search term trước
    const filtered = categories.filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Xây dựng cây. (Giả định các MOCK_CATEGORIES ban đầu đều là 'root')
    // const tree = [];
    const childrenMap = {};

    filtered.forEach((cat) => {
      const parent = cat.parentId || 'root';
      if (!childrenMap[parent]) childrenMap[parent] = [];
      childrenMap[parent].push(cat);
    });

    const buildNode = (node, depth = 0) => ({
      ...node,
      depth,
      children: (childrenMap[node.id] || []).map((child) => buildNode(child, depth + 1)),
    });

    return (childrenMap['root'] || []).map((rootNode) => buildNode(rootNode, 0));
  }, [categories, searchTerm]);

  // Các hàm xử lý Modal giữ nguyên...
  const handleOpenAdd = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };
  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (formData) => {
    if (editingCategory) {
      setCategories(
        categories.map((c) => (c.id === editingCategory.id ? { ...c, ...formData } : c))
      );
    } else {
      const newEntry = {
        id: `CAT-${Math.floor(Math.random() * 1000)}`,
        ...formData,
        items: 0,
        lastUpdate: new Date().toLocaleDateString('vi-VN'),
      };
      setCategories([...categories, newEntry]);
    }
    setIsCategoryModalOpen(false);
  };

  const triggerDelete = (cat) => {
    if (cat.items > 0) {
      alert(`[Exception E1] Lỗi: Không thể xóa "${cat.name}" vì đang chứa ${cat.items} dữ liệu.`);
      return;
    }
    setDeleteModalConfig({ isOpen: true, targetId: cat.id, targetName: cat.name });
  };

  // Hàm Đệ quy để Render từng nhánh của cây
  const renderTreeNodes = (nodes) => {
    return nodes.map((cat) => (
      <div key={cat.id}>
        <div
          className="flex items-center justify-between border-b border-outline-variant/30 p-4 transition-colors last:border-0 hover:bg-surface-container-low"
          style={{ paddingLeft: `${cat.depth * 2 + 1}rem` }} // Thụt lề thụ động theo độ sâu
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
              <h4 className="text-base font-bold text-on-surface">{cat.name}</h4>
              <div className="mt-1 flex gap-3 text-xs font-medium text-on-surface-variant">
                <span>
                  Mã: <span className="font-mono text-outline">{cat.id}</span>
                </span>
                <span>•</span>
                <span>
                  Bao gồm:{' '}
                  <span className={cat.items > 0 ? 'font-bold text-primary' : ''}>
                    {cat.items} dữ liệu
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

        {/* Render đệ quy các con của Node hiện tại */}
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

      {/* SEARCH BAR */}
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

      <div className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest shadow-sm">
        {categoryTree.length > 0 ? (
          renderTreeNodes(categoryTree)
        ) : (
          <div className="p-8 text-center text-sm font-semibold text-on-surface-variant">
            Không tìm thấy danh mục nào.
          </div>
        )}
      </div>

      {/* MODALS */}
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
        onConfirm={() => {
          setCategories(categories.filter((c) => c.id !== deleteModalConfig.targetId));
          setDeleteModalConfig({ isOpen: false });
        }}
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
