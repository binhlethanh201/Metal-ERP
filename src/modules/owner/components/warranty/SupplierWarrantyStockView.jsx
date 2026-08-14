import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../../../../shared/components/Card';
import { Badge } from '../../../../shared/components/Badge';
import Icon from '../../../../shared/components/Icon';
import { getSupplierWarrantyBatches } from '../../services/ownerWarrantyService';
import { formatDate } from '../../../../shared/utils/formatDate';
import { Package, Search, ChevronRight, ChevronDown, Truck } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'ACTIVE', label: 'Còn hạn BH' },
  { value: 'EXPIRING', label: 'Sắp hết hạn (<30 ngày)' },
  { value: 'EXPIRED', label: 'Đã hết hạn' },
];

const WARRANTY_UNIT_LABEL = { DAY: 'Ngày', MONTH: 'Tháng', YEAR: 'Năm' };

const SupplierWarrantyStockView = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [filterSupplierId, setFilterSupplierId] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedProductIds, setExpandedProductIds] = useState({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    const API_BASE = process.env.REACT_APP_API_URL || '';
    fetch(`${API_BASE}/api/suppliers?pageNumber=1&pageSize=200`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((res) => {
        const list = res?.data?.items || res?.data || res?.items || [];
        setSuppliers(Array.isArray(list) ? list : []);
      }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filterSupplierId) params.supplierId = filterSupplierId;
    if (search.trim()) params.search = search.trim();
    if (statusFilter !== 'all') params.status = statusFilter;
    getSupplierWarrantyBatches(params)
      .then((res) => { setBatches(Array.isArray(res) ? res : res?.data || []); setPage(1); })
      .catch(() => setBatches([]))
      .finally(() => setLoading(false));
  }, [filterSupplierId, search, statusFilter]);

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
    if (batch.batchStatus === 'EXPIRED') return <Badge variant="danger" className="text-xs">Đã hết hạn</Badge>;
    if (batch.batchStatus === 'EXPIRING') return <Badge variant="warning" className="text-xs">Sắp hết hạn (còn {days} ngày)</Badge>;
    return <Badge variant="success" className="text-xs">Còn hạn ({days} ngày)</Badge>;
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
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-[#333333] dark:bg-[#0f0f0f]">
        <select value={filterSupplierId} onChange={(e) => setFilterSupplierId(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#004785] dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
        >
          <option value="">Tất cả NCC</option>
          {suppliers.map((s) => (
            <option key={s.id || s.supplierId} value={s.id || s.supplierId}>{s.name || s.supplierName}</option>
          ))}
        </select>
        <div className="relative w-[260px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Search size={14} /></span>
          <input type="text" placeholder="Tìm SP, mã SP, mã phiếu..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-4 text-sm outline-none focus:border-[#004785] dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
          />
        </div>
        <div className="flex gap-1">
          {STATUS_OPTIONS.map((opt) => (
            <button key={opt.value} onClick={() => setStatusFilter(opt.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${statusFilter === opt.value ? 'bg-[#004785] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-[#1a1a1a] dark:text-[#999999]'}`}
            >{opt.label}</button>
          ))}
        </div>
      </div>

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

      {/* Table grouped by product */}
      <Card padding="p-0" className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 overflow-y-auto pb-16">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500 dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#999999]">
                <th className="px-3 py-2.5">Sản phẩm</th>
                <th className="px-3 py-2.5">Nhà cung cấp</th>
                <th className="px-3 py-2.5 text-right">Tổng SL Nhập</th>
                <th className="px-3 py-2.5 text-right">Tổng SL Còn BH NCC</th>
                <th className="px-3 py-2.5">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-3 py-8 text-center text-sm text-slate-400">Đang tải...</td></tr>
              ) : paginatedProducts.length === 0 ? (
                <tr><td colSpan={5} className="px-3 py-8 text-center text-sm text-slate-400">Không có dữ liệu</td></tr>
              ) : (
                paginatedProducts.map((g) => {
                  const isExpanded = !!expandedProductIds[g.productCode];
                  return (
                    <React.Fragment key={g.productCode}>
                      {/* Parent row */}
                      <tr
                        onClick={() => toggleExpand(g.productCode)}
                        className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-blue-50/50 dark:border-[#333333] dark:hover:bg-[#1a1a1a]"
                      >
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 transition-transform duration-200">
                              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </span>
                            <div>
                              <p className="font-semibold text-slate-800 dark:text-[#e5e5e5]">{g.productName}</p>
                              <p className="font-mono text-xs text-slate-400">{g.productCode}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex flex-wrap items-center gap-1">
                            {g.suppliers.slice(0, 2).map((s, i) => (
                              <span key={i} className="flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
                                <Truck size={10} /> {s}
                              </span>
                            ))}
                            {g.suppliers.length > 2 && (
                              <Badge variant="default" className="text-xs">+{g.suppliers.length - 2} NCC</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-right font-semibold">{g.totalImportQty}</td>
                        <td className="px-3 py-2.5 text-right">
                          <span className={`font-bold text-base ${g.totalWarrantyQty > 0 ? 'text-green-600' : 'text-slate-300'}`}>
                            {g.totalWarrantyQty}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">{renderSummaryStatus(g)}</td>
                      </tr>
                      {/* Expanded sub-table */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={5} className="border-b border-blue-200 bg-slate-50/80 p-0 dark:bg-[#0f0f0f]">
                            <div className="animate-fade-in border-l-4 border-blue-500 px-4 py-3">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase text-slate-500 dark:border-[#333333] dark:text-[#999999]">
                                    <th className="px-2 py-1.5">Mã phiếu nhập</th>
                                    <th className="px-2 py-1.5">Nhà cung cấp</th>
                                    <th className="px-2 py-1.5">Ngày nhập</th>
                                    <th className="px-2 py-1.5">Thời hạn BH</th>
                                    <th className="px-2 py-1.5">Ngày hết hạn NCC</th>
                                    <th className="px-2 py-1.5 text-right">SL nhập</th>
                                    <th className="px-2 py-1.5 text-right">SL còn BH NCC</th>
                                    <th className="px-2 py-1.5">Trạng thái</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-[#333333]">
                                  {g.lots.map((b) => (
                                    <tr key={b.ticketItemId} className="hover:bg-white/50 dark:hover:bg-[#1a1a1a]">
                                      <td className="px-2 py-1.5 font-mono font-bold text-[#004785] dark:text-blue-400">{b.ticketCode}</td>
                                      <td className="px-2 py-1.5 text-slate-600 dark:text-[#cccccc]">{b.supplierName}</td>
                                      <td className="px-2 py-1.5 whitespace-nowrap text-slate-600 dark:text-[#cccccc]">{formatDate(b.importDate)}</td>
                                      <td className="px-2 py-1.5">
                                        {b.warrantyPeriod > 0 ? (
                                          <Badge variant="info" className="text-[11px]">{b.warrantyPeriod} {WARRANTY_UNIT_LABEL[b.warrantyUnit] || 'Tháng'}</Badge>
                                        ) : <span className="text-slate-400">—</span>}
                                      </td>
                                      <td className="px-2 py-1.5 whitespace-nowrap text-slate-600 dark:text-[#cccccc]">
                                        {b.warrantyExpiryDate ? formatDate(b.warrantyExpiryDate) : '—'}
                                      </td>
                                      <td className="px-2 py-1.5 text-right font-semibold">{b.suppliedQuantity}</td>
                                      <td className="px-2 py-1.5 text-right">
                                        <span className={`font-bold ${b.remainingWarranty > 0 ? 'text-green-600' : 'text-slate-300'}`}>
                                          {b.remainingWarranty}
                                        </span>
                                      </td>
                                      <td className="px-2 py-1.5">{renderBatchStatus(b)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
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