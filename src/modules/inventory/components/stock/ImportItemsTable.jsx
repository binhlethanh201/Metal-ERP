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
      width: 48,
      align: 'center',
      render: (_, row) => items.findIndex((i) => i.id === row.id) + 1,
    },
    {
      key: 'productCode',
      header: 'Mã hàng',
      width: 120,
      render: (val) => <span className="font-bold text-slate-800">{val}</span>,
    },
    {
      key: 'productName',
      header: 'Tên hàng',
      width: 160,
      render: (val) => <span className="block truncate">{val || '---'}</span>,
    },
    {
      key: 'unitName',
      header: 'ĐVT',
      width: 70,
      align: 'center',
      render: (_, row) => (
        <span className="text-slate-500">{row.unitName || row.unit || '---'}</span>
      ),
    },
    {
      key: 'stock',
      header: 'Tồn kho',
      width: 90,
      align: 'right',
      render: (_, row) => {
        const stock = row.actualStock ?? row.stock ?? row.availableStock ?? 0;
        return (
          <span className={`font-semibold ${stock <= 0 ? 'text-red-500' : 'text-emerald-600'}`}>
            {stock.toLocaleString('vi-VN')}
          </span>
        );
      },
    },
    {
      key: 'quantity',
      header: 'Số lượng',
      width: 110,
      align: 'right',
      render: (val, row) => {
        const fmtVal = val ? Number(val).toLocaleString('vi-VN') : '';
        return (
          <input
            type="text"
            inputMode="numeric"
            value={fmtVal}
            onChange={(e) => {
              const raw = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '');
              if (raw === '' || (/^\d+$/.test(raw) && Number(raw) <= 999999))
                onUpdateItem(row.id, 'quantity', raw);
            }}
            onKeyDown={(e) => {
              if (
                [
                  'Backspace',
                  'Delete',
                  'Tab',
                  'Escape',
                  'Enter',
                  'ArrowLeft',
                  'ArrowRight',
                  'ArrowUp',
                  'ArrowDown',
                  'Home',
                  'End',
                ].includes(e.key)
              )
                return;
              if (!/^\d$/.test(e.key)) e.preventDefault();
            }}
            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-right text-sm font-semibold outline-none focus:border-[#004785]"
          />
        );
      },
    },
    {
      key: 'costPrice',
      header: 'Đơn giá nhập',
      width: 140,
      align: 'right',
      render: (val, row) => {
        const fmtVal = val ? Number(val).toLocaleString('vi-VN') : '';
        return (
          <input
            type="text"
            inputMode="numeric"
            value={fmtVal}
            onChange={(e) => {
              const raw = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '');
              if (raw === '' || (/^\d+$/.test(raw) && Number(raw) <= 999999999))
                onUpdateItem(row.id, 'costPrice', raw);
            }}
            onKeyDown={(e) => {
              if (
                [
                  'Backspace',
                  'Delete',
                  'Tab',
                  'Escape',
                  'Enter',
                  'ArrowLeft',
                  'ArrowRight',
                  'ArrowUp',
                  'ArrowDown',
                  'Home',
                  'End',
                ].includes(e.key)
              )
                return;
              if (!/^\d$/.test(e.key)) e.preventDefault();
            }}
            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-right text-sm outline-none focus:border-[#004785]"
          />
        );
      },
    },
    {
      key: 'total',
      header: 'Thành tiền',
      width: 150,
      render: (_, row) => {
        const qty = Number(row.quantity || 0);
        const price = Number(row.costPrice || 0);
        const total = qty > 0 && price > 0 && qty <= 999999 && price <= 999999999 ? qty * price : 0;
        const display =
          total > 0 && total <= 1e15
            ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)
            : '---';
        return (
          <span
            className="block truncate text-right font-bold tabular-nums text-slate-900"
            title={display}
          >
            {display}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      width: 56,
      align: 'center',
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
