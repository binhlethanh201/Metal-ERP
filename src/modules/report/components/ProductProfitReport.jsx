import { useState, useMemo } from 'react';
import Icon from '../../../shared/components/Icon';
import { Card } from '../../../shared/components/Card';
import { Table } from '../../../shared/components/Table';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import { PRODUCT_PROFIT_COLUMNS } from '../constraints/reportConstants';

export const ProductProfitReport = ({ data, items, totals, isLoading }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const allItems = items || [];
  const totalPages = Math.ceil(allItems.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return allItems.slice(start, start + pageSize);
  }, [allItems, currentPage, pageSize]);

  if (!data) return null;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card padding="p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Tổng doanh thu</p>
          <p className="mt-1 text-2xl font-extrabold text-blue-600">{formatCurrency(totals.totalRevenue)}</p>
        </Card>
        <Card padding="p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Tổng chi phí vốn</p>
          <p className="mt-1 text-2xl font-extrabold text-rose-600">{formatCurrency(totals.totalCost)}</p>
        </Card>
        <Card padding="p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Lợi nhuận gộp</p>
          <p className="mt-1 text-2xl font-extrabold text-emerald-600">{formatCurrency(totals.totalProfit)}</p>
        </Card>
        <Card padding="p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Biên LN trung bình</p>
          <p className="mt-1 text-2xl font-extrabold text-purple-600">{(totals.averageProfitMargin || 0).toFixed(1)}%</p>
        </Card>
        <Card padding="p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Tổng SL bán</p>
          <p className="mt-1 text-2xl font-extrabold text-slate-900">{totals.totalQuantitySold || 0}</p>
        </Card>
      </div>

      <Card padding="p-0">
        <Table
          columns={PRODUCT_PROFIT_COLUMNS}
          data={paginatedItems}
          loading={isLoading}
          emptyMessage="Không có dữ liệu kinh doanh"
        />
        {allItems.length > 0 && (
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
              <span>{(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, allItems.length)} trong tổng số {allItems.length} dòng</span>
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

export default ProductProfitReport;
