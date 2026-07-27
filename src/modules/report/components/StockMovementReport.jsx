import { useState, useMemo } from 'react';
import Icon from '../../../shared/components/Icon';
import { Card } from '../../../shared/components/Card';
import { Table } from '../../../shared/components/Table';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import { STOCK_COLUMNS } from '../constraints/reportConstants';

export const StockMovementReport = ({ data, isLoading }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const items = useMemo(() => data?.items || [], [data?.items]);
  const totalPages = Math.ceil(items.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  if (!data) return null;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-4">
        <Card padding="p-5" className="border-l-4 border-l-blue-500">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#999999]">
            Giá trị Tồn Đầu Kỳ
          </p>
          <p className="mt-1 text-2xl font-extrabold text-blue-700">
            {formatCurrency(data.totalOpeningValue)}
          </p>
        </Card>

        <Card padding="p-5" className="border-l-4 border-l-emerald-500">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#999999]">
            Giá trị Nhập Trong Kỳ
          </p>
          <p className="mt-1 text-2xl font-extrabold text-emerald-600">
            {formatCurrency(data.totalInwardValue)}
          </p>
        </Card>

        <Card padding="p-5" className="border-l-4 border-l-rose-500">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#999999]">
            Giá trị Xuất Trong Kỳ
          </p>
          <p className="mt-1 text-2xl font-extrabold text-rose-600">
            {formatCurrency(data.totalOutwardValue)}
          </p>
        </Card>

        <Card padding="p-5" className="border-l-4 border-l-indigo-500">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#999999]">
            Giá trị Tồn Cuối Kỳ
          </p>
          <p className="mt-1 text-2xl font-extrabold text-indigo-700">
            {formatCurrency(data.totalClosingValue)}
          </p>
        </Card>
      </div>

      <Card padding="p-0">
        <Table
          columns={STOCK_COLUMNS}
          data={paginatedItems}
          loading={isLoading}
          emptyMessage="Không có dữ liệu xuất nhập tồn trong khoảng thời gian này"
        />
        {items.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-5 py-3 dark:border-[#333333] dark:bg-[#0f0f0f]">
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-[#999999]">
              <div className="flex items-center gap-2">
                <span>Hiển thị</span>
                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} className="rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-primary dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]">
                  <option value={20}>20 dòng</option>
                  <option value={50}>50 dòng</option>
                  <option value={100}>100 dòng</option>
                </select>
              </div>
              <span>{(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, items.length)} trong tổng số {items.length} dòng</span>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1} className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-[#404040] dark:text-[#999999] dark:hover:bg-[#333333]">
                <Icon name="chevron_left" className="text-[18px]" />
              </button>
              <div className="px-3 text-sm text-slate-700 dark:text-[#b3b3b3]">Trang {currentPage} / {totalPages}</div>
              <button type="button" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-[#404040] dark:text-[#999999] dark:hover:bg-[#333333]">
                <Icon name="chevron_right" className="text-[18px]" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </>
  );
};

export default StockMovementReport;
