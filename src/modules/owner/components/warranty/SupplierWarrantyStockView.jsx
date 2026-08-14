import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../../../../shared/components/Card';
import { Badge } from '../../../../shared/components/Badge';
import Icon from '../../../../shared/components/Icon';
import { getSupplierWarrantyBatches } from '../../services/ownerWarrantyService';
import { formatDate } from '../../../../shared/utils/formatDate';
import { Package, ChevronRight, ChevronDown, Truck } from 'lucide-react';

// Quy đổi tổng số ngày -> chuỗi "X năm Y tháng Z ngày" cho dễ đọc (vd: 720 ngày -> 1 năm 11 tháng)
const formatDays = (days) => {
  if (!days || days <= 0) return '0 ngày';
  const years = Math.floor(days / 365);
  let rem = days % 365;
  const months = Math.floor(rem / 30);
  const d = rem % 30;
  const parts = [];
  if (years) parts.push(`${years} năm`);
  if (months) parts.push(`${months} tháng`);
  if (d) parts.push(`${d} ngày`);
  return parts.join(' ') || '0 ngày';
};

// Quy đổi (period, unit) -> dạng dễ đọc. Theo đơn vị gốc cho hợp lý:
//  - YEAR: "2 năm"
//  - MONTH: 24 -> "2 năm", 18 -> "1 năm 6 tháng", 6 -> "6 tháng"
//  - DAY: 720 -> "1 năm 11 tháng"
const formatWarrantyPeriod = (period, unit) => {
  if (!period || period <= 0) return null;
  if (unit === 'YEAR') return `${period} năm`;
  if (unit === 'MONTH') {
    const y = Math.floor(period / 12);
    const m = period % 12;
    const parts = [];
    if (y) parts.push(`${y} năm`);
    if (m) parts.push(`${m} tháng`);
    return parts.join(' ');
  }
  return formatDays(period);
};

const SupplierWarrantyStockView = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedProductIds, setExpandedProductIds] = useState({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    setLoading(true);
    getSupplierWarrantyBatches({})
      .then((res) => { setBatches(Array.isArray(res) ? res : res?.data || []); setPage(1); })
      .catch(() => setBatches([]))
      .finally(() => setLoading(false));
  }, []);

  // Chỉ giữ lại các lô có ĐỦ 3 số liệu bảo hành: thời hạn BH + ngày hết hạn + SL còn được BH
  const warrantyBatches = useMemo(
    () => batches.filter((b) => (b.warrantyPeriod || 0) > 0 && b.warrantyExpiryDate && (b.remainingWarranty || 0) > 0),
    [batches]
  );

  // Gom nhóm theo productCode
  const groupedProducts = useMemo(() => {
    const map = new Map();
    warrantyBatches.forEach((b) => {
      const key = b.productCode || b.productId;
      if (!map.has(key)) {
        map.set(key, {
          productCode: b.productCode,
          productId: b.productId,
          productName: b.productName,
          supplierSet: new Set(),
          totalImportQty: 0,
          totalWarrantyQty: 0,
          expiredCount: 0,
          expiringCount: 0,
          activeCount: 0,
          lots: [],
        });
      }
      const g = map.get(key);
      if (b.supplierName) g.supplierSet.add(b.supplierName);
      g.totalImportQty += b.suppliedQuantity || 0;
      g.totalWarrantyQty += b.remainingWarranty || 0;
      if (b.batchStatus === 'EXPIRED') g.expiredCount++;
      else if (b.batchStatus === 'EXPIRING') g.expiringCount++;
      else g.activeCount++;
      g.lots.push(b);
    });
    return Array.from(map.values()).map((g) => ({
      ...g,
      suppliers: Array.from(g.supplierSet),
    }));
  }, [warrantyBatches]);

  const totalPages = Math.ceil(groupedProducts.length / pageSize) || 1;
  const paginatedProducts = groupedProducts.slice((page - 1) * pageSize, page * pageSize);

  const stats = useMemo(() => {
    const totalBatches = warrantyBatches.length;
    const totalSupplied = warrantyBatches.reduce((s, b) => s + (b.suppliedQuantity || 0), 0);
    const totalRemaining = warrantyBatches.reduce((s, b) => s + (b.remainingWarranty || 0), 0);
    // Đã hết hạn hoặc đã dùng = Tổng nhập - Còn lại = (hết hạn + đã gửi BH)
    const totalUnavailable = totalSupplied - totalRemaining;
    return { totalBatches, totalSupplied, totalRemaining, totalUnavailable };
  }, [warrantyBatches]);

  const toggleExpand = (productCode) => {
    setExpandedProductIds((prev) => ({ ...prev, [productCode]: !prev[productCode] }));
  };

  const renderBatchStatus = (batch) => {
    const days = batch.daysUntilExpiry;
    const remain = formatDays(days);
    if (batch.batchStatus === 'EXPIRED') return <Badge variant="danger" className="text-xs">Đã hết hạn</Badge>;
    if (batch.batchStatus === 'EXPIRING') return <Badge variant="warning" className="text-xs">Sắp hết hạn (còn {remain})</Badge>;
    return <Badge variant="success" className="text-xs">Còn hạn ({remain})</Badge>;
  };

  const renderSummaryStatus = (g) => {
    const parts = [];
    if (g.activeCount > 0) parts.push(`${g.activeCount} lô còn hạn`);
    if (g.expiringCount > 0) parts.push(`${g.expiringCount} lô sắp hết hạn`);
    if (g.expiredCount > 0) parts.push(`${g.expiredCount} lô đã hết hạn`);
    if (parts.length === 0) return <Badge variant="default" className="text-xs">Không có lô</Badge>;
    if (g.expiredCount === g.lots.length) return <Badge variant="danger" className="text-xs">{parts.join(', ')}</Badge>;
    if (g.expiringCount > 0 || g.expiredCount > 0) return <Badge variant="warning" className="text-xs">{parts.join(', ')}</Badge>;
    return <Badge variant="success" className="text-xs">{parts.join(', ')}</Badge>;
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:max-w-[320px]">
        <Card padding="p-4" className="border-l-4 border-l-blue-500">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30"><Package size={18} /></div>
            <div>
              <p className="text-xs font-semibold text-slate-500">TỔNG LÔ NHẬP</p>
              <h3 className="text-xl font-bold">{stats.totalBatches}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Table grouped by product - dùng grid-cols-12 chung cho header/mẹ/con để cột thẳng hàng tuyệt đối */}
      <Card padding="p-0" className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 overflow-y-auto pb-16">
          {/* Header row */}
          <div className="grid grid-cols-12 gap-2 border-b border-slate-200 bg-slate-200/70 px-3 py-2.5 text-xs font-semibold uppercase text-slate-600 dark:border-[#333333] dark:bg-[#262626] dark:text-[#b3b3b3]">
            <div className="col-span-4">Sản phẩm</div>
            <div className="col-span-2">Nhà cung cấp</div>
            <div className="col-span-2" />
            <div className="col-span-1 text-right">Tổng SL Nhập</div>
            <div className="col-span-1 text-right">Tổng SL Còn BH</div>
            <div className="col-span-2 text-center">Trạng thái</div>
          </div>

          {loading ? (
            <div className="px-3 py-8 text-center text-sm text-slate-400">Đang tải...</div>
          ) : paginatedProducts.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-slate-400">Không có dữ liệu</div>
          ) : (
            paginatedProducts.map((g) => {
              const isExpanded = !!expandedProductIds[g.productCode];
              return (
                <div
                  key={g.productCode}
                  className={`border-l-4 transition-colors ${isExpanded ? 'border-blue-500 bg-blue-50/20 dark:bg-[#14213d]/20' : 'border-transparent'}`}
                >
                  {/* Parent row */}
                  <div
                    onClick={() => toggleExpand(g.productCode)}
                    className="grid grid-cols-12 cursor-pointer items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2.5 transition-colors hover:bg-slate-100 dark:border-[#333333] dark:bg-[#1a1a1a] dark:hover:bg-[#272727]"
                  >
                    {/* Col1: Tên SP */}
                    <div className="col-span-4 flex min-w-0 items-center gap-2">
                      <span className="shrink-0 text-slate-400 transition-transform duration-200">
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-800 dark:text-[#e5e5e5]">{g.productName}</p>
                        <p className="truncate font-mono text-xs text-slate-400">{g.productCode}</p>
                      </div>
                    </div>
                    {/* Col2: NCC */}
                    <div className="col-span-2 flex flex-wrap items-center gap-1">
                      {g.suppliers.slice(0, 2).map((s, i) => (
                        <span key={i} className="flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
                          <Truck size={10} /> {s}
                        </span>
                      ))}
                      {g.suppliers.length > 2 && (
                        <Badge variant="default" className="text-xs">+{g.suppliers.length - 2} NCC</Badge>
                      )}
                    </div>
                    {/* Col3: spacer (chỉ bảng con có nội dung) */}
                    <div className="col-span-2" />
                    {/* Col4: Tổng SL Nhập */}
                    <div className="col-span-1 text-right font-semibold">{g.totalImportQty}</div>
                    {/* Col5: Tổng SL Còn BH */}
                    <div className="col-span-1 text-right">
                      <span className={`font-bold text-base ${g.totalWarrantyQty > 0 ? 'text-green-600' : 'text-slate-300'}`}>
                        {g.totalWarrantyQty}
                      </span>
                    </div>
                    {/* Col6: Trạng thái */}
                    <div className="col-span-2 flex justify-center px-1 text-center">{renderSummaryStatus(g)}</div>
                  </div>

                  {/* Expanded sub-rows (bảng con) - cùng grid-cols-12 để cột thẳng hàng mẹ */}
                  {isExpanded && (
                    <div className="animate-fade-in border-y border-slate-300/80 bg-slate-50 px-3 py-3 dark:border-[#444444] dark:bg-[#1a1a1a]">
                      <div className="pl-8 pr-4">
                        {/* Sub-header bảng con */}
                        <div className="grid grid-cols-12 gap-2 border-b border-slate-200 py-1.5 text-[11px] font-semibold uppercase text-slate-500 dark:border-[#333333] dark:text-[#999999]">
                          <div className="col-span-4">Mã phiếu nhập</div>
                          <div className="col-span-2">Nhà cung cấp</div>
                          <div className="col-span-2">Ngày nhập / Hạn BH</div>
                          <div className="col-span-1 text-right">SL nhập</div>
                          <div className="col-span-1 text-right">SL còn BH</div>
                          <div className="col-span-2 text-center">Trạng thái</div>
                        </div>
                        {/* Hàng lô con */}
                        {g.lots.map((b) => (
                          <div
                            key={b.ticketItemId}
                            className="grid grid-cols-12 items-center gap-2 border-b border-dashed border-slate-400/60 py-2 text-[13px] dark:border-[#555555]"
                          >
                            {/* Col1: Mã phiếu nhập */}
                            <div className="col-span-4 overflow-hidden truncate font-mono font-bold text-[#004785] dark:text-blue-400">{b.ticketCode}</div>
                            {/* Col2: NCC */}
                            <div className="col-span-2 overflow-hidden truncate text-slate-600 dark:text-[#cccccc]">{b.supplierName}</div>
                            {/* Col3: Ngày nhập + Thời hạn BH + Hết hạn (stack dọc) */}
                            <div className="col-span-2 flex flex-col gap-0.5">
                              <span className="whitespace-nowrap text-slate-600 dark:text-[#cccccc]">
                                Nhập: <span className="font-medium">{formatDate(b.importDate)}</span>
                              </span>
                              <span className="whitespace-nowrap text-slate-600 dark:text-[#cccccc]">
                                Hết hạn: <span className="font-medium">{b.warrantyExpiryDate ? formatDate(b.warrantyExpiryDate) : '—'}</span>
                              </span>
                              <span>
                                {(() => {
                                  const fmt = formatWarrantyPeriod(b.warrantyPeriod, b.warrantyUnit);
                                  return fmt
                                    ? <Badge variant="info" className="text-[11px]">{fmt}</Badge>
                                    : <span className="text-slate-400">Không BH</span>;
                                })()}
                              </span>
                            </div>
                            {/* Col4: SL nhập */}
                            <div className="col-span-1 text-right font-semibold">{b.suppliedQuantity}</div>
                            {/* Col5: SL còn BH */}
                            <div className="col-span-1 text-right">
                              <span className={`font-bold ${b.remainingWarranty > 0 ? 'text-green-600' : 'text-slate-300'}`}>
                                {b.remainingWarranty}
                              </span>
                            </div>
                            {/* Col6: Trạng thái */}
                            <div className="col-span-2 flex justify-center px-1 text-center">{renderBatchStatus(b)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
        {/* Pagination */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-6 py-3 dark:border-t-[#333333] dark:bg-[#0f0f0f]">
          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-[#999999]">
            <div className="flex items-center gap-2">
              <span>Hiển thị</span>
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-primary dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#d4d4d4]">
                <option value={20}>20 dòng</option><option value={50}>50 dòng</option><option value={100}>100 dòng</option>
              </select>
            </div>
            <span>
              {groupedProducts.length === 0 ? 0 : (page - 1) * pageSize + 1} -{' '}
              {Math.min(page * pageSize, groupedProducts.length)} trong tổng số {groupedProducts.length} sản phẩm
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}
              className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-[#404040] dark:text-[#999999] dark:hover:bg-[#272727]">
              <Icon name="chevron_left" className="text-[18px]" />
            </button>
            <div className="px-3 text-sm text-slate-700 dark:text-[#b3b3b3]">Trang {page} / {totalPages}</div>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}
              className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-[#404040] dark:text-[#999999] dark:hover:bg-[#272727]">
              <Icon name="chevron_right" className="text-[18px]" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SupplierWarrantyStockView;