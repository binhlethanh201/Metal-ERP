import { Plus, FileSpreadsheet, Download, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { ProductSearchInput } from './ProductSearchInput';
import { Button } from '../../../../shared/components/Button';
import IconButton from '../../../../shared/components/IconButton';
import { Table } from '../../../../shared/components/Table';
import { downloadExcelTemplate, parseImportExcelFile } from '../../utils/excelTemplate';

export const ImportItemsTable = ({
  items = [],
  products = [],
  onAddProduct,
  onUpdateItem,
  onRemoveItem,
  onAddNewProduct,
  onImportRows,
  formatCurrency,
}) => {
  const fileInputRef = useRef(null);
  const [importError, setImportError] = useState('');
  const [importWarning, setImportWarning] = useState('');
  const [importSuccess, setImportSuccess] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError('');
    setImportWarning('');
    setImportSuccess('');

    const result = await parseImportExcelFile(file);

    if (!result.success) {
      setImportError(result.error);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const importRows = [];
    const notFoundList = [];

    for (const row of result.data) {
      const matchedProduct = products.find(
        (p) =>
          p.productCode?.toLowerCase() === row.productCode.toLowerCase()
      );

      importRows.push({
        productCode: row.productCode,
        productName: row.productName,
        unitName: row.unitName || row.unit,
        quantity: row.quantity,
        costPrice: row.costPrice,
        matchedProduct: matchedProduct || null,
      });

      if (!matchedProduct) {
        notFoundList.push(row.productCode || row.productName);
      }
    }

    onImportRows?.(importRows);

    setImportSuccess(`Đã import ${importRows.length} dòng từ file Excel.`);

    if (notFoundList.length > 0) {
      setImportWarning(
        `${notFoundList.length} mã chưa có trong hệ thống: ${notFoundList.join(', ')}. Đã thêm từ file Excel.`
      );
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };
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
      render: (val) => <span className="font-bold text-slate-800 dark:text-[#d4d4d4]">{val}</span>,
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
        <span className="text-slate-500 dark:text-[#999999]">{row.unitName || row.unit || '---'}</span>
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
          <span className={`font-semibold ${stock <= 0 ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
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
            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-right text-sm font-semibold outline-none focus:border-[#004785] dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#d4d4d4]"
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
            className="block truncate text-right font-bold tabular-nums text-slate-900 dark:text-[#e5e5e5]"
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
    <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#333333] dark:bg-[#0f0f0f]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-[#e5e5e5]">Danh sách sản phẩm nhập</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-[#999999]">
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

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <ProductSearchInput
          products={products}
          onSelectProduct={onAddProduct}
          formatCurrency={formatCurrency}
        />
        <div className="flex shrink-0 items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept=".xlsx, .xls, .csv"
            className="hidden"
            id="excel-upload"
            onChange={handleFileChange}
          />
          <label
            htmlFor="excel-upload"
            className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#b3b3b3] dark:hover:bg-[#333333]"
          >
            <FileSpreadsheet size={16} />
            Import Excel
          </label>
          <button
            type="button"
            onClick={downloadExcelTemplate}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
          >
            <Download size={16} />
            Tải file Excel mẫu
          </button>
        </div>
        </div>

        {importError && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <span className="mt-0.5 shrink-0 text-red-500 text-sm font-bold">!</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Lỗi import</p>
              <p className="text-sm text-red-700">{importError}</p>
            </div>
            <button
              onClick={() => setImportError('')}
              className="shrink-0 text-red-400 hover:text-red-600 text-sm"
            >
              x
            </button>
          </div>
        )}
        {importWarning && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <span className="mt-0.5 shrink-0 text-amber-500 text-sm font-bold">!</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">Cảnh báo</p>
              <p className="text-sm text-amber-700">{importWarning}</p>
            </div>
            <button
              onClick={() => setImportWarning('')}
              className="shrink-0 text-amber-400 hover:text-amber-600 text-sm"
            >
              x
            </button>
          </div>
        )}
        {importSuccess && (
          <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <span className="mt-0.5 shrink-0 text-emerald-500 text-sm">!</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-emerald-800">{importSuccess}</p>
            </div>
            <button
              onClick={() => setImportSuccess('')}
              className="shrink-0 text-emerald-400 hover:text-emerald-600 text-sm"
            >
              x
            </button>
          </div>
        )}

      <Table
        columns={columns}
        data={items}
        emptyMessage='Chưa có sản phẩm nào. Hãy tìm kiếm ở ô trên hoặc bấm "Thêm sản phẩm".'
      />
    </section>
  );
};
