/**
 * Trang Nhập kho - Danh sách phiếu nhập + Popup Thêm mới.
 */
import { useEffect, useMemo, useState } from 'react';
import { Table } from '../../../shared/components/Table';
import GoodsReceiptPopup from '../components/modals/GoodsReceiptPopup';
import { getImports } from '../services/inventoryService';

const mockImports = [
  {
    id: 'IMP-001',
    productName: 'Thép tấm 10mm',
    quantity: 500,
    date: '2026-05-30',
    notes: 'Nhập từ NCC Hòa Phát',
  },
  {
    id: 'IMP-002',
    productName: 'Inox 304 tấm 1.5mm',
    quantity: 200,
    date: '2026-05-28',
    notes: 'Nhập bổ sung',
  },
  { id: 'IMP-003', productName: 'Que hàn 3.2mm', quantity: 2000, date: '2026-05-25', notes: '' },
  {
    id: 'IMP-004',
    productName: 'Bu lông M16x60',
    quantity: 5000,
    date: '2026-05-20',
    notes: 'Đơn hàng lớn',
  },
  {
    id: 'IMP-005',
    productName: 'Ống thép D60',
    quantity: 150,
    date: '2026-05-15',
    notes: 'Nhập kho chính',
  },
];

const extractList = (r) => {
  if (Array.isArray(r)) return r;
  if (Array.isArray(r?.items)) return r.items;
  if (Array.isArray(r?.data)) return r.data;
  if (Array.isArray(r?.data?.items)) return r.data.items;
  return [];
};

const normalizeImportRow = (item, i) => ({
  id: item?.id || item?.Id || `IMP-${i + 1}`,
  productName: item?.productName || item?.ProductName || '',
  quantity: item?.quantity ?? item?.Quantity ?? 0,
  date: item?.date || item?.Date || '',
  notes: item?.notes || item?.Notes || '',
});

export const StockImport = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [imports, setImports] = useState(mockImports);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  const importColumns = [
    { key: 'id', header: 'ID', width: '10%' },
    { key: 'productName', header: 'Sản phẩm', width: '30%' },
    { key: 'quantity', header: 'Số lượng', width: '15%' },
    { key: 'date', header: 'Ngày', width: '20%' },
    { key: 'notes', header: 'Ghi chú', width: '25%' },
  ];

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await getImports({ Page: 1, PageSize: 50 });
        if (!active) return;
        const items = extractList(res).map(normalizeImportRow).filter(Boolean);
        if (items.length > 0) setImports(items);
        setStatusMessage('Đã đồng bộ dữ liệu nhập kho từ API');
      } catch {
        if (!active) return;
        setImports(mockImports);
        setStatusMessage('Đang dùng dữ liệu mẫu');
      } finally {
        if (active) setIsLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const summary = useMemo(
    () => ({
      totalImports: imports.length,
      totalQuantity: imports.reduce((s, i) => s + Number(i.quantity || 0), 0),
      monthlyCount: imports.length,
    }),
    [imports]
  );

  return (
    <div className="mt-12 w-full space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Nhập kho</h1>
        <p className="mt-1 text-gray-600">Ghi nhận hàng nhập từ nhà cung cấp</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusMessage === 'Đã đồng bộ dữ liệu nhập kho từ API' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}
        >
          {isLoading ? 'Đang tải dữ liệu...' : statusMessage || 'Sẵn sàng tạo phiếu nhập mới'}
        </div>
        <button
          type="button"
          className="flex items-center gap-1 rounded-lg bg-[#004785] px-4 py-2 text-sm font-bold text-white hover:bg-black"
          onClick={() => setShowPopup(true)}
        >
          <span className="text-base font-bold">+</span> Nhập hàng
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
          <div className="text-3xl font-bold text-blue-600">{summary.totalImports}</div>
          <p className="mt-1 text-sm text-gray-600">Tổng lần nhập</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
          <div className="text-3xl font-bold text-green-600">{summary.totalQuantity}</div>
          <p className="mt-1 text-sm text-gray-600">Tổng số lượng</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
          <div className="text-3xl font-bold text-yellow-600">{summary.monthlyCount}</div>
          <p className="mt-1 text-sm text-gray-600">Trong tháng</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-3">
          <h3 className="text-sm font-bold uppercase text-slate-700">Lịch sử nhập kho</h3>
        </div>
        <Table columns={importColumns} data={imports} emptyMessage="Chưa có lần nhập nào" />
        <div className="border-t border-slate-200 px-6 py-3 text-sm text-slate-500">
          Hiển thị <strong>{imports.length}</strong> bản ghi
        </div>
      </div>

      <GoodsReceiptPopup isOpen={showPopup} onClose={() => setShowPopup(false)} />
    </div>
  );
};

export default StockImport;
