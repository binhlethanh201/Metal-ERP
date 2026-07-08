import { useState, useEffect } from 'react';
import Icon from '../../../../shared/components/Icon';
import Modal from '../../../../shared/components/Modal';
import Table from '../../../../shared/components/Table';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import {
  getCategories,
  renameCategory,
  deleteCategory,
  getBrands,
  renameBrand,
  deleteBrand,
} from '../../services/productService';

export const CategoryBrandManagerModal = ({ open, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('categories');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [newNameInput, setNewNameInput] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = activeTab === 'categories' ? await getCategories() : await getBrands();
      setItems(res?.success && Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error('Lỗi lấy danh sách metadata:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeTab]);

  const handleRename = async (oldName) => {
    const trimmed = (newNameInput || '').trim();
    if (!trimmed || trimmed === oldName) {
      setEditingName('');
      return;
    }
    try {
      const res =
        activeTab === 'categories'
          ? await renameCategory(oldName, trimmed)
          : await renameBrand(oldName, trimmed);
      if (res?.success) {
        alert(res?.message || 'Đổi tên thành công');
        setEditingName('');
        loadData();
        onSuccess?.();
      }
    } catch (err) {
      alert(err?.data?.message || 'Lỗi đổi tên');
    }
  };

  const handleDelete = async (item) => {
    const isCat = activeTab === 'categories';
    const label = isCat ? 'nhóm hàng' : 'thương hiệu';
    if (
      !window.confirm(
        `Thao tác này sẽ gỡ ${label} "${item.name}" khỏi ${item.productCount} sản phẩm.\nBạn có chắc chắn muốn tiếp tục?`
      )
    ) {
      return;
    }
    try {
      const res = isCat ? await deleteCategory(item.name) : await deleteBrand(item.name);
      if (res?.success) {
        alert(res?.message || 'Xóa thành công');
        loadData();
        onSuccess?.();
      }
    } catch (err) {
      alert(err?.data?.message || 'Lỗi khi xóa');
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Tên',
      render: (name, item) =>
        editingName === name ? (
          <div
            className="flex flex-wrap items-center gap-2 py-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Input
              value={newNameInput}
              onChange={(e) => setNewNameInput(e.target.value)}
              className="!w-full max-w-[220px]"
              autoFocus
            />
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleRename(name)}
                className="rounded-md bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-700"
              >
                Lưu
              </button>
              <button
                type="button"
                onClick={() => setEditingName('')}
                className="rounded-md bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200"
              >
                Hủy
              </button>
            </div>
          </div>
        ) : (
          <span className="font-medium text-slate-800">{name}</span>
        ),
    },
    {
      key: 'productCount',
      header: <div className="text-center">Số lượng sản phẩm</div>,
      width: '180px',
      render: (count) => (
        <div className="flex justify-center">
          <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
            {count} Sản phẩm
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: <div className="text-right">Thao tác</div>,
      width: '100px',
      render: (_, item) =>
        editingName !== item.name && (
          <div className="flex justify-end gap-1">
            <button
              type="button"
              onClick={() => {
                setEditingName(item.name);
                setNewNameInput(item.name);
              }}
              className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-600"
              title="Đổi tên"
            >
              <Icon name="edit" size={18} />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(item)}
              className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
              title="Xóa / Gỡ khỏi sản phẩm"
            >
              <Icon name="delete" size={18} />
            </button>
          </div>
        ),
    },
  ];

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Quản lý Nhóm hàng & Thương hiệu"
      size="2xl"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Đóng
        </Button>
      }
    >
      <div className="-mt-2 mb-5 flex gap-6 border-b border-slate-200 px-1">
        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`relative pb-3 text-sm font-semibold transition-colors ${
            activeTab === 'categories' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Nhóm hàng (Categories)
          {activeTab === 'categories' && (
            <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-t-md bg-blue-600" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('brands')}
          className={`relative pb-3 text-sm font-semibold transition-colors ${
            activeTab === 'brands' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Thương hiệu (Brands)
          {activeTab === 'brands' && (
            <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-t-md bg-blue-600" />
          )}
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200">
        <Table
          columns={columns}
          data={items}
          loading={loading}
          emptyMessage="Chưa có dữ liệu nào."
        />
      </div>
    </Modal>
  );
};

export default CategoryBrandManagerModal;
