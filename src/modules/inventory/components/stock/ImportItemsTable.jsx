import { Plus, FileSpreadsheet, Trash2 } from 'lucide-react';
import { ProductSearchInput } from './ProductSearchInput';

export const ImportItemsTable = ({
  items = [],
  products = [],
  onAddProduct,
  onUpdateItem,
  onRemoveItem,
  onAddSample,
  formatCurrency,
}) => {
  return (
    <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Danh sách sản phẩm nhập</h2>
          <p className="mt-1 text-sm text-slate-500">
            Tìm nhanh bằng phím F3, chỉnh trực tiếp số lượng và đơn giá nhập.
          </p>
        </div>
        <button
          type="button"
          onClick={onAddSample}
          className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          <Plus size={16} />
          Thêm sản phẩm
        </button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <ProductSearchInput
          products={products}
          onSelectProduct={onAddProduct}
          formatCurrency={formatCurrency}
        />
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          <FileSpreadsheet size={16} />
          Import Excel
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600">
              <th className="px-3 py-3 font-semibold">STT</th>
              <th className="px-3 py-3 font-semibold">Mã hàng</th>
              <th className="px-3 py-3 font-semibold">Tên hàng</th>
              <th className="px-3 py-3 font-semibold">ĐVT</th>
              <th className="px-3 py-3 font-semibold">Số lượng</th>
              <th className="px-3 py-3 font-semibold">Đơn giá nhập</th>
              <th className="px-3 py-3 font-semibold">Thành tiền</th>
              <th className="px-3 py-3 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  Chưa có sản phẩm nào. Hãy tìm kiếm ở ô trên hoặc bấm "Thêm sản phẩm".
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50"
                >
                  <td className="px-3 py-3 text-slate-600">{index + 1}</td>
                  <td className="px-3 py-3 font-bold text-slate-800">{item.productCode}</td>
                  <td className="px-3 py-3 font-medium text-slate-800">{item.productName}</td>
                  <td className="px-3 py-3 text-slate-600">{item.unitName}</td>
                  <td className="px-3 py-3">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => onUpdateItem(item.id, 'quantity', e.target.value)}
                      className="w-24 rounded-xl border border-slate-200 px-2.5 py-1.5 text-sm font-semibold outline-none focus:border-sky-500"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="number"
                      min="0"
                      value={item.costPrice}
                      onChange={(e) => onUpdateItem(item.id, 'costPrice', e.target.value)}
                      className="w-28 rounded-xl border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-sky-500"
                    />
                  </td>
                  <td className="px-3 py-3 font-bold text-slate-900">
                    {formatCurrency(Number(item.quantity || 0) * Number(item.costPrice || 0))}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="rounded-xl p-2 text-rose-600 hover:bg-rose-50"
                      title="Xóa dòng này"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
