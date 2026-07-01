import React, { useState, useEffect } from 'react';
import Icon from '../../../../shared/components/Icon';
// Tái sử dụng API getProducts đã có sẵn trong hệ thống
import { getProducts } from '../../services/inventoryService';

const CreateCheckModal = ({ isOpen, onClose, branchId, onSave }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // State của Form
  const [selectedIds, setSelectedIds] = useState([]);
  const [notes, setNotes] = useState('');
  const [search, setSearch] = useState('');

  // Tải danh sách hàng hóa khi mở Modal
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      // Gọi API lấy tối đa 100 sản phẩm đang Active của chi nhánh này
      getProducts({ branchId: branchId || undefined, PageSize: 100, Status: 'active' })
        .then((res) => {
          if (res?.success && res.data) {
            setProducts(res.data.items || []);
          }
        })
        .finally(() => setLoading(false));

      // Reset form
      setSelectedIds([]);
      setNotes('');
      setSearch('');
    }
  }, [isOpen, branchId]);

  if (!isOpen) return null;

  // Lọc sản phẩm theo text search
  const filteredProducts = products.filter(
    (p) =>
      p.productName.toLowerCase().includes(search.toLowerCase()) ||
      p.productCode.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSelectAll = (checked) => {
    if (checked) setSelectedIds(filteredProducts.map((p) => p.productId || p.id));
    else setSelectedIds([]);
  };

  const handleSubmit = () => {
    if (selectedIds.length === 0) {
      alert('Vui lòng chọn ít nhất 1 sản phẩm để kiểm kê!');
      return;
    }
    onSave(selectedIds, notes, branchId);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 p-4">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Tạo Phiếu Kiểm Kê Mới</h2>
            <p className="mt-1 text-xs text-slate-500">
              Chọn các mặt hàng cần kiểm đếm ngoài thực tế
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
          >
            <Icon name="close" size={24} />
          </button>
        </div>

        {/* Nội dung */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6">
          {/* Ô nhập Ghi chú */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Mục đích / Ghi chú đợt kiểm kê
            </label>
            <textarea
              rows="2"
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="VD: Kiểm kê đột xuất kho A, Kiểm kê định kỳ tháng 6..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Danh sách Hàng hóa</h3>
            <div className="flex w-64 items-center rounded-lg border border-slate-300 bg-white px-3 py-1.5">
              <Icon name="search" size={18} className="mr-2 text-slate-400" />
              <input
                type="text"
                className="w-full text-sm outline-none"
                placeholder="Tìm tên, mã SP..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Bảng chọn sản phẩm */}
          <div className="max-h-[400px] overflow-hidden overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="sticky top-0 z-10 bg-slate-100 text-xs uppercase text-slate-500 shadow-sm">
                <tr>
                  <th className="w-12 border-b border-slate-200 px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300"
                      checked={
                        filteredProducts.length > 0 &&
                        selectedIds.length === filteredProducts.length
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 font-bold">Mã SP</th>
                  <th className="border-b border-slate-200 px-4 py-3 font-bold">Tên Sản Phẩm</th>
                  <th className="border-b border-slate-200 px-4 py-3 text-center font-bold">
                    Tồn Hệ Thống
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400">
                      <Icon name="sync" className="animate-spin text-2xl" />
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400">
                      Không tìm thấy hàng hóa nào
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const id = p.productId || p.id;
                    const isSelected = selectedIds.includes(id);
                    return (
                      <tr
                        key={id}
                        className={`cursor-pointer transition-colors hover:bg-blue-50 ${isSelected ? 'bg-blue-50/50' : ''}`}
                        onClick={() => toggleSelect(id)}
                      >
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-slate-300"
                            checked={isSelected}
                            readOnly
                          />
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-700">{p.productCode}</td>
                        <td className="px-4 py-3">{p.productName}</td>
                        <td className="px-4 py-3 text-center font-bold text-blue-700">
                          {p.actualStock ?? p.systemQuantity ?? 0}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-2 flex items-center gap-1 text-sm font-semibold text-blue-700">
            <Icon name="check_circle" size={16} /> Đã chọn: {selectedIds.length} sản phẩm
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Icon name="save" size={20} />
            Tạo Phiếu Nháp
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCheckModal;
