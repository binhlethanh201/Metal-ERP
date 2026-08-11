import { useState, useMemo } from 'react';
import { Card } from '../../../shared/components/Card';
import Icon from '../../../shared/components/Icon';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import { InventoryLedgerModal } from './InventoryLedgerModal';
import { ReportHelpModal } from './ReportHelpModal';

const calcQty = (items, field) => items.reduce((s, i) => s + (Number(i[field]) || 0), 0);

export const StockMovementReport = ({ data, isLoading, fromDate, toDate }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [ledgerProduct, setLedgerProduct] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  const items = useMemo(() => data?.items || [], [data?.items]);
  const totalPages = Math.ceil(items.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  const totals = useMemo(() => ({
    openQ: calcQty(items, 'openingStock'), inQ: calcQty(items, 'inwardQuantity'),
    outQ: calcQty(items, 'outwardQuantity'), adjQ: calcQty(items, 'adjustmentQuantity'),
    closeQ: calcQty(items, 'closingStock'),
  }), [items]);

  if (!data) return null;

  return (
    <>
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <div className="md:col-span-5 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-[#808080]">Chỉ số tổng quan</span>
          <button
            type="button"
            onClick={() => setShowHelp(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:hover:bg-amber-900/50"
          >
            <Icon name="lightbulb" size={14} /> Cách tính
          </button>
        </div>
        {[
          { l: 'Giá trị Đầu Kỳ', v: data.totalOpeningValue, q: totals.openQ, c: 'blue' },
          { l: 'Giá trị Nhập', v: data.totalInwardValue, q: totals.inQ, c: 'emerald' },
          { l: 'Giá trị Xuất', v: data.totalOutwardValue, q: totals.outQ, c: 'rose' },
          { l: 'Giá trị Đ/Chỉnh', v: data.totalAdjustmentValue || 0, q: totals.adjQ, c: 'amber' },
          { l: 'Giá trị Cuối Kỳ', v: data.totalClosingValue, q: totals.closeQ, c: 'indigo' },
        ].map(c => (
          <Card key={c.l} padding="p-4" className={`border-l-4 border-l-${c.c}-500`}>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#999]">{c.l}</p>
            <p className={`mt-1 text-xl font-extrabold text-${c.c}-700`}>{formatCurrency(c.v)}</p>
            <p className="text-xs text-slate-400">({c.q.toLocaleString('vi-VN')} sp)</p>
          </Card>
        ))}
      </div>

      {/* Data Table */}
      <Card padding="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-[#999]">
                <th className="sticky left-0 z-10 bg-slate-50 px-4 py-3 text-left dark:bg-[#1a1a1a]">Sản phẩm</th>
                <th className="px-3 py-3 text-right">Đầu kỳ</th>
                <th className="px-3 py-3 text-right text-emerald-700 dark:text-emerald-400">Nhập kỳ</th>
                <th className="px-3 py-3 text-right text-rose-700 dark:text-rose-400">Xuất kỳ</th>
                <th className="px-3 py-3 text-right">Đ/chỉnh</th>
                <th className="px-3 py-3 text-right font-bold">Cuối kỳ</th>
                <th className="px-3 py-3 text-right">Giá vốn BQ</th>
                <th className="px-3 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#333]">
              {paginatedItems.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-slate-400">{isLoading ? 'Đang tải...' : 'Không có dữ liệu'}</td></tr>
              ) : paginatedItems.map(item => {
                const neg = (item.closingStock || 0) < 0;
                const noPrice = !item.closingValue && (item.closingStock || 0) > 0;
                const avgPrice = item.closingStock > 0 && item.closingValue > 0 ? Math.round(item.closingValue / item.closingStock) : 0;
                return (
                  <tr key={item.productId || item.productCode} className="hover:bg-slate-50/60 dark:hover:bg-[#272727]/60">
                    <td className="sticky left-0 z-10 bg-white px-4 py-3 dark:bg-[#0f0f0f]">
                      <div className="font-bold text-slate-800 dark:text-[#e5e5e5]">{item.productName}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-xs text-slate-500">{item.productCode}</span>
                        {item.categoryName && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 dark:bg-[#272727] dark:text-[#999]">{item.categoryName}</span>}
                        {neg && <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600 dark:bg-red-950/30 dark:text-red-400">Âm kho</span>}
                        {noPrice && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">Chưa có giá vốn</span>}
                        {item.isDeleted && <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-[#333] dark:text-[#999]">Đã xóa</span>}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right"><div className="font-semibold">{item.openingStock ?? 0}</div><div className="text-xs text-slate-400">{formatCurrency(item.openingValue)}</div></td>
                    <td className="px-3 py-3 text-right">
                      <button className="font-bold text-emerald-600 hover:underline" onClick={() => setLedgerProduct({ id: item.branchProductId || item.productId, code: item.productCode, name: item.productName })}>+{(item.inwardQuantity ?? 0).toLocaleString('vi-VN')}</button>
                      <div className="text-xs text-slate-400">{formatCurrency(item.inwardValue)}</div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button className="font-bold text-rose-600 hover:underline" onClick={() => setLedgerProduct({ id: item.branchProductId || item.productId, code: item.productCode, name: item.productName })}>-{(item.outwardQuantity ?? 0).toLocaleString('vi-VN')}</button>
                      <div className="text-xs text-slate-400">{formatCurrency(item.outwardValue)}</div>
                    </td>
                    <td className="px-3 py-3 text-right"><div className="font-medium">{item.adjustmentQuantity ?? 0}</div><div className="text-xs text-slate-400">{formatCurrency(item.adjustmentValue)}</div></td>
                    <td className="px-3 py-3 text-right">
                      <div className={`text-base font-bold ${neg ? 'text-red-600' : 'text-slate-800 dark:text-[#e5e5e5]'}`}>{item.closingStock ?? 0}</div>
                      <div className="text-xs font-semibold text-slate-600">{formatCurrency(item.closingValue)}</div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="font-semibold text-slate-700 dark:text-[#b3b3b3]">{avgPrice > 0 ? formatCurrency(avgPrice) : '---'}</div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <button onClick={() => setLedgerProduct({ id: item.branchProductId || item.productId, code: item.productCode, name: item.productName })} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#004785] transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30">🔍 Thẻ kho</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {items.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-3 dark:border-[#333]">
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-[#999]">
              <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} className="rounded border border-slate-300 px-2 py-1 text-xs outline-none dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]">
                <option value={20}>20 dòng</option><option value={50}>50 dòng</option><option value={100}>100 dòng</option>
              </select>
              <span>{(currentPage-1)*pageSize+1}-{Math.min(currentPage*pageSize,items.length)} / {items.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage<=1} className="rounded border px-2 py-1 text-slate-600 disabled:opacity-50 dark:border-[#404040] dark:text-[#999]">‹</button>
              <span className="text-sm">Trang {currentPage}/{totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage>=totalPages} className="rounded border px-2 py-1 text-slate-600 disabled:opacity-50 dark:border-[#404040] dark:text-[#999]">›</button>
            </div>
          </div>
        )}
      </Card>

      <InventoryLedgerModal isOpen={!!ledgerProduct} onClose={() => setLedgerProduct(null)} branchProductId={ledgerProduct?.id} productCode={ledgerProduct?.code} productName={ledgerProduct?.name} fromDate={fromDate} toDate={toDate} />
      <ReportHelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </>
  );
};

export default StockMovementReport;
