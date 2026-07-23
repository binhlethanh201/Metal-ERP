import { useState, useMemo } from 'react';
import Icon from '../../../shared/components/Icon';
import { Card } from '../../../shared/components/Card';
import { Table } from '../../../shared/components/Table';
import { AlertTriangle } from 'lucide-react';
import { LOW_STOCK_COLUMNS } from '../constraints/reportConstants';

export const LowStockReport = ({ data, isLoading }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const items = data?.items || [];
  const totalPages = Math.ceil(items.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  if (!data) return null;

  return (
    <>
      <Card
        padding="p-5"
        className="flex items-center gap-4 border-l-4 border-l-rose-500 bg-rose-50/50"
      >
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-rose-100">
          <AlertTriangle className="h-6 w-6 text-rose-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-rose-800">Sản phẩm chạm ngưỡng tồn tối thiểu</p>
          <p className="text-2xl font-extrabold text-rose-600">
            {data.totalItems || 0} <span className="text-base font-normal">mã hàng hóa</span>
          </p>
        </div>
      </Card>

      <Card padding="p-0">
        <Table
          columns={LOW_STOCK_COLUMNS}
          data={paginatedItems}
          loading={isLoading}
          emptyMessage="Kho đang ở trạng thái an toàn, không có mặt hàng nào sắp hết."
        />
        {items.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-5 py-3">
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <span>Hiển thị</span>
                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} className="rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-primary">
                  <option value={20}>20 dòng</option>
                  <option value={50}>50 dòng</option>
                  <option value={100}>100 dòng</option>
                </select>
              </div>
              <span>{(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, items.length)} trong tổng số {items.length} dòng</span>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1} className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50">
                <Icon name="chevron_left" className="text-[18px]" />
              </button>
              <div className="px-3 text-sm text-slate-700">Trang {currentPage} / {totalPages}</div>
              <button type="button" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50">
                <Icon name="chevron_right" className="text-[18px]" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </>
  );
};

export default LowStockReport;
