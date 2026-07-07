import { Plus, FileSpreadsheet, Trash2 } from 'lucide-react';
import { ProductSearchInput } from './ProductSearchInput';
import { Button } from '../../../../shared/components/Button';
import IconButton from '../../../../shared/components/IconButton';
import { Table } from '../../../../shared/components/Table';

export const ImportItemsTable = ({
  items = [],
  products = [],
  onAddProduct,
  onUpdateItem,
  onRemoveItem,
  onAddNewProduct,
  formatCurrency,
}) => {
  const columns = [
    {
      key: 'index',
      header: 'STT',
      width: 56,
      render: (_, row) => items.findIndex((i) => i.id === row.id) + 1,
    },
    {
      key: 'productCode',
      header: 'Mã hàng',
      render: (val) => <span className="font-bold text-slate-800">{val}</span>,
    },
    { key: 'productName', header: 'Tên hàng' },
    { key: 'unitName', header: 'ĐVT' },
    {
      key: 'quantity',
      header: 'Số lượng',
      render: (val, row) => (
        <input
          type="number"
          min="1"
          value={val}
          onChange={(e) => onUpdateItem(row.id, 'quantity', e.target.value)}
          className="w-24 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm font-semibold outline-none focus:border-[#004785]"
        />
      ),
    },
    {
      key: 'costPrice',
      header: 'Đơn giá nhập',
      render: (val, row) => (
        <input
          type="number"
          min="0"
          value={val}
          onChange={(e) => onUpdateItem(row.id, 'costPrice', e.target.value)}
          className="w-28 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-[#004785]"
        />
      ),
    },
    {
      key: 'total',
      header: 'Thành tiền',
      render: (_, row) => (
        <span className="font-bold text-slate-900">
          {formatCurrency(Number(row.quantity || 0) * Number(row.costPrice || 0))}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (_, row) => (
        <IconButton
          icon={Trash2}
          variant="ghost"
          space="customer"
          size="sm"
          onClick={() => onRemoveItem(row.id)}
          title="Xóa dòng này"
        />
      ),
    },
  ];

  return (
    <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Danh sách sản phẩm nhập</h2>
          <p className="mt-1 text-sm text-slate-500">
            Tìm nhanh bằng phím F3, chỉnh trực tiếp số lượng và đơn giá nhập.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onAddNewProduct}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Thêm sản phẩm
        </Button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <ProductSearchInput
          products={products}
          onSelectProduct={onAddProduct}
          formatCurrency={formatCurrency}
        />
        <div className="relative">
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            className="hidden"
            id="excel-upload"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setTimeout(() => {
                  alert(
                    `Đã đọc file ${e.target.files[0].name} thành công. Tạm thời mở form thêm mới để bạn tự nhập liệu.`
                  );
                  onAddNewProduct();
                }, 500);
                e.target.value = null;
              }
            }}
          />
          <label
            htmlFor="excel-upload"
            className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            <FileSpreadsheet size={16} />
            Import Excel
          </label>
        </div>
      </div>

      <Table
        columns={columns}
        data={items}
        emptyMessage='Chưa có sản phẩm nào. Hãy tìm kiếm ở ô trên hoặc bấm "Thêm sản phẩm".'
      />
    </section>
  );
};
