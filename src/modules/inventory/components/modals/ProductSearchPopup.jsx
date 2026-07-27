/**
 * ProductSearchPopup - Popup tìm kiếm và chọn hàng hóa.
 * Hiển thị bảng danh sách sản phẩm có filter, cho phép chọn 1 hoặc nhiều.
 */
import { useState, useMemo } from 'react';
import Icon from '../../../../shared/components/Icon';

const ProductSearchPopup = ({ isOpen, onClose, onSelect, productList }) => {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return productList;
    const kw = search.trim().toLowerCase();
    return productList.filter(
      (p) => p.code.toLowerCase().includes(kw) || p.name.toLowerCase().includes(kw)
    );
  }, [search, productList]);

  if (!isOpen) return null;

  const handleSelect = () => {
    if (selectedId) {
      const prod = productList.find((p) => p.id === selectedId);
      if (prod) {
        onSelect(prod);
        onClose();
      }
    }
  };

  const handleDoubleClick = (prod) => {
    onSelect(prod);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl rounded-xl bg-white shadow-2xl dark:bg-[#0f0f0f]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-[#333333]">
          <h2 className="text-lg font-bold text-slate-900 dark:text-[#e5e5e5]">Chọn hàng hóa</h2>
          <button
            type="button"
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-[#808080] dark:hover:bg-[#333333] dark:hover:text-[#b3b3b3]"
            onClick={onClose}
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-slate-200 px-6 py-3 dark:border-[#333333]">
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-[#404040] dark:bg-[#1a1a1a]">
            <Icon name="search" className="mr-2 text-slate-400 dark:text-[#808080]" size={16} />
            <input
              className="w-full border-none bg-transparent text-sm outline-none dark:text-[#e5e5e5]"
              placeholder="Tìm theo mã, tên hàng hóa..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedId(null);
              }}
              autoFocus
            />
          </div>
        </div>

        {/* Table */}
        <div className="max-h-[400px] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 border-b border-slate-200 bg-slate-50 dark:border-[#333333] dark:bg-[#1a1a1a]">
              <tr>
                <th className="w-[50px] px-4 py-2.5" />
                <th className="px-4 py-2.5 text-left text-xs font-bold uppercase text-slate-500 dark:text-[#999999]">
                  Mã HH
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-bold uppercase text-slate-500 dark:text-[#999999]">
                  Tên hàng hóa
                </th>
                <th className="px-4 py-2.5 text-center text-xs font-bold uppercase text-slate-500 dark:text-[#999999]">
                  ĐVT
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-bold uppercase text-slate-500 dark:text-[#999999]">
                  Giá nhập
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-bold uppercase text-slate-500 dark:text-[#999999]">
                  Tồn kho
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#333333]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400 dark:text-[#808080]">
                    Không tìm thấy hàng hóa
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => (
                  <tr
                    key={prod.id}
                    className={`cursor-pointer transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20 ${selectedId === prod.id ? 'bg-blue-50 ring-1 ring-blue-400 dark:bg-blue-900/30' : ''}`}
                    onClick={() => setSelectedId(prod.id)}
                    onDoubleClick={() => handleDoubleClick(prod)}
                  >
                    <td className="px-4 py-2.5">
                      <input
                        type="radio"
                        name="productSelect"
                        className="h-4 w-4 text-blue-600"
                        checked={selectedId === prod.id}
                        onChange={() => setSelectedId(prod.id)}
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="font-mono text-xs font-semibold text-blue-700">
                        {prod.code}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-sm font-medium text-slate-800 dark:text-[#e5e5e5]">{prod.name}</span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="text-sm text-slate-600 dark:text-[#999999]">{prod.unit}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="text-sm tabular-nums text-slate-700 dark:text-[#b3b3b3]">
                        {prod.price?.toLocaleString('vi-VN')}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="text-sm tabular-nums text-slate-600 dark:text-[#999999]">
                        {prod.stock?.toLocaleString('vi-VN')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 dark:border-[#333333]">
          <span className="text-xs text-slate-400 dark:text-[#808080]">
            Double-click hoặc chọn dòng và bấm "Đồng ý"
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#999999] dark:hover:bg-[#333333]"
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              type="button"
              className="rounded-lg bg-[#004785] px-4 py-2 text-sm font-bold text-white hover:bg-[#003566] disabled:opacity-50"
              onClick={handleSelect}
              disabled={!selectedId}
            >
              Đồng ý
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSearchPopup;
