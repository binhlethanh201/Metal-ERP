import { useState, useEffect } from 'react';
import Icon from '../../../../shared/components/Icon';
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
      if (res?.success && Array.isArray(res?.data)) {
        setItems(res.data);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error('Lỗi lấy danh sách metadata:', err);
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[350] flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-bold text-gray-800">Quản lý Nhóm hàng & Thương hiệu</h3>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <Icon name="X" size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="flex border-b border-gray-200 bg-gray-50 px-6">
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`py-3 font-semibold ${activeTab === 'categories' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          >
            Nhóm hàng (Categories)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('brands')}
            className={`ml-8 py-3 font-semibold ${activeTab === 'brands' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          >
            Thương hiệu (Brands)
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="py-8 text-center text-gray-400">Đang tải dữ liệu...</div>
          ) : items.length === 0 ? (
            <div className="py-8 text-center text-gray-400">Chưa có dữ liệu nào.</div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-bold uppercase text-gray-500">
                  <th className="pb-3">Tên</th>
                  <th className="pb-3 text-center">Số lượng sản phẩm</th>
                  <th className="pb-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {items.map((item) => (
                  <tr key={item.name} className="hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-800">
                      {editingName === item.name ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={newNameInput}
                            onChange={(e) => setNewNameInput(e.target.value)}
                            className="rounded border border-blue-500 px-2 py-1 text-sm focus:outline-none"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleRename(item.name)}
                            className="font-bold text-blue-600 hover:underline"
                          >
                            Lưu
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingName('')}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        item.name
                      )}
                    </td>
                    <td className="py-3 text-center">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                        {item.productCount} Sản phẩm
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {editingName !== item.name && (
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingName(item.name);
                              setNewNameInput(item.name);
                            }}
                            className="text-gray-500 hover:text-blue-600"
                            title="Đổi tên"
                          >
                            <Icon name="edit" size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            className="text-gray-500 hover:text-red-600"
                            title="Xóa / Gỡ khỏi sản phẩm"
                          >
                            <Icon name="delete" size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="flex justify-end border-t border-gray-200 bg-gray-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-200 px-5 py-2 font-semibold text-gray-700 hover:bg-gray-300"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryBrandManagerModal;
