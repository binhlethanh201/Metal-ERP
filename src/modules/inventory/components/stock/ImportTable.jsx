import { Trash2 } from 'lucide-react';

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value || 0));

export const ImportTable = ({ items, onUpdateItem, onRemoveItem }) => {
  return (
    <div className="mt-5 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600">
            <th className="px-3 py-3 font-semibold">STT</th>
            <th className="px-3 py-3 font-semibold">Mã hàng</th>
            <th className="px-3 py-3 font-semibold">Tên hàng</th>
            <th className="px-3 py-3 font-semibold">ĐVT</th>
            <th className="w-28 px-3 py-3 font-semibold">Số lượng</th>
            <th className="w-36 px-3 py-3 font-semibold">Đơn giá nhập</th>
            <th className="px-3 py-3 font-semibold">Thành tiền</th>
            <th className="px-3 py-3 font-semibold"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr
              key={item.id}
              className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50"
            >
              <td className="px-3 py-3 text-slate-600">{index + 1}</td>
              <td className="px-3 py-3 font-medium text-slate-800">{item.productCode}</td>
              <td className="px-3 py-3 text-slate-800">{item.productName}</td>
              <td className="px-3 py-3 text-slate-600">{item.unitName}</td>
              <td className="px-3 py-3">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => onUpdateItem(item.id, 'quantity', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-2.5 py-2 text-sm outline-none focus:border-sky-500"
                />
              </td>
              <td className="px-3 py-3">
                <input
                  type="number"
                  min="0"
                  value={item.costPrice}
                  onChange={(e) => onUpdateItem(item.id, 'costPrice', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-2.5 py-2 text-sm outline-none focus:border-sky-500"
                />
              </td>
              <td className="px-3 py-3 font-semibold text-slate-900">
                {formatCurrency(Number(item.quantity || 0) * Number(item.costPrice || 0))}
              </td>
              <td className="px-3 py-3 text-center">
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.id)}
                  className="rounded-xl p-2 text-rose-600 transition hover:bg-rose-50"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan="8" className="py-8 text-center font-medium text-slate-400">
                Chưa có sản phẩm nào được chọn. Hãy tìm kiếm phía trên để thêm hàng.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
