import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../../../shared/components/Card';
import { Badge } from '../../../shared/components/Badge';
import Icon from '../../../shared/components/Icon';
import Button from '../../../shared/components/Button';
import Drawer from '../../../shared/components/Drawer';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import { formatDate } from '../../../shared/utils/formatDate';
import { useOwnerWarrantyHistory } from '../hooks/useOwnerWarrantyHistory';
import SupplierWarrantyStockView from '../components/warranty/SupplierWarrantyStockView';
import { Layers, RotateCcw, Send, PackageCheck, AlertTriangle, Clock, CheckCircle2, Truck, ChevronDown, ChevronRight } from 'lucide-react';

const OwnerWarrantyHistory = () => {
  const {
    items, totalCount, filters, fetchItems, setPage, setPageSize, setSearch, setDateRange, resetFilters,
    supplierMap, selectedSupplier, setSelectedSupplier, acceptingId, supplierLoadingMap,
    fetchSuggestedSuppliers, handleAssignSupplier, handleAcceptWarranty,
  } = useOwnerWarrantyHistory();

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [viewMode, setViewMode] = useState('list');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState({ fromDate: '', toDate: '' });
  const [expandedCard, setExpandedCard] = useState(null);
  const [showAllPending, setShowAllPending] = useState(false);

  useEffect(() => { setSearch(debouncedSearch); }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { fetchItems(); }, [filters.page, filters.pageSize, filters.search, filters.fromDate, filters.toDate]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tách items: pending ở trên, awaiting+completed ở bảng dưới
  const pendingItems = useMemo(() => items.filter((i) => i.status === 'PENDING_ASSIGN'), [items]);
  const historyItems = useMemo(() => {
    const raw = items.filter((i) => i.status === 'AWAITING_SUPPLIER' || i.status === 'COMPLETED');
    // Gộp cùng productId trong cùng returnCode
    const map = new Map();
    raw.forEach((item) => {
      const key = `${item.returnCode || ''}_${item.productId || item.id}_${item.assignedSupplierId || item.supplierId || 'none'}`;
      if (map.has(key)) {
        const existing = map.get(key);
        existing.baseQuantity = (existing.baseQuantity || existing.quantity || 0) + (item.baseQuantity || item.quantity || 0);
        existing.quantity = (existing.quantity || 0) + (item.quantity || 0);
      } else {
        map.set(key, { ...item, baseQuantity: item.baseQuantity || item.quantity || 0 });
      }
    });
    return Array.from(map.values()).sort((a, b) => {
      const ca = a.returnCode || '';
      const cb = b.returnCode || '';
      if (ca === cb) return (a.productName || '').localeCompare(b.productName || '');
      return ca.localeCompare(cb);
    });
  }, [items]);

  const pendingCount = pendingItems.length;
  const awaitingCount = items.filter((i) => i.status === 'AWAITING_SUPPLIER').length;
  const completedCount = items.filter((i) => i.status === 'COMPLETED').length;

  const openFilterDrawer = () => { setDraftFilters({ fromDate: filters.fromDate, toDate: filters.toDate }); setIsFilterDrawerOpen(true); };
  const applyFilters = () => { setDateRange(draftFilters.fromDate, draftFilters.toDate); setIsFilterDrawerOpen(false); };
  const resetDraftFilters = () => setDraftFilters({ fromDate: '', toDate: '' });
  let activeFilterCount = (filters.fromDate ? 1 : 0) + (filters.toDate ? 1 : 0);

  // Gom pending items theo returnCode, rồi gom theo productId trong mỗi group
  const pendingGroups = useMemo(() => {
    const map = new Map();
    pendingItems.forEach((item) => {
      const code = item.returnCode || 'unknown';
      if (!map.has(code)) map.set(code, { returnCode: code, exchangeDate: item.exchangeDate, customerName: item.customerName, items: [] });
      const group = map.get(code);
      // Gộp cùng productId -> cộng dồn baseQuantity
      const existing = group.items.find((i) => i.productId === item.productId);
      if (existing) {
        existing.baseQuantity = (existing.baseQuantity || existing.quantity || 0) + (item.baseQuantity || item.quantity || 0);
        existing.quantity = (existing.quantity || 0) + (item.quantity || 0);
      } else {
        group.items.push({ ...item, baseQuantity: item.baseQuantity || item.quantity || 0 });
      }
    });
    return Array.from(map.values());
  }, [pendingItems]);

  const renderSupplierDropdown = (row) => {
    const lookupKey = (row.warrantyId || row.warrantyTicketId || '') || (row.returnItemId || '');
    const suppliers = supplierMap[lookupKey] || [];
    const isLoading = supplierLoadingMap[lookupKey];
    if (!suppliers.length && !isLoading) {
      return <Button variant="outline" size="xs" onClick={() => fetchSuggestedSuppliers(row.warrantyId || row.warrantyTicketId || '', row.productId || row.id, row.returnItemId)} className="text-xs">Tra cứu NCC</Button>;
    }
    if (isLoading) return <span className="text-xs text-slate-400">Đang tìm...</span>;
    return (
      <select value={selectedSupplier[lookupKey] || ''} onChange={(e) => setSelectedSupplier((prev) => ({ ...prev, [lookupKey]: e.target.value }))}
        className="w-full rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-[#004785] dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]">
        <option value="">-- Chọn NCC --</option>
        {suppliers.map((s) => {
          const remaining = s.remainingWarrantyQuantity ?? 0;
          const expiry = s.nearestExpiryDate ? new Date(s.nearestExpiryDate).toLocaleDateString('vi-VN') : '—';
          const disabled = remaining < (row.baseQuantity || row.quantity || 0);
          return <option key={s.id || s.supplierId} value={s.id || s.supplierId} disabled={disabled}>{s.name || s.supplierName} — Còn: {remaining} | Hạn BH: {expiry}{disabled ? ' [KO ĐỦ]' : ''}</option>;
        })}
      </select>
    );
  };

  const totalPages = Math.ceil(totalCount / filters.pageSize) || 1;

  return (
    <div className="flex h-full flex-col gap-4 text-slate-800 dark:text-[#e5e5e5]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-[#e5e5e5]">Bảo hành</h1>
          <p className="mt-1 text-slate-600 dark:text-[#999999]">Quản lý sản phẩm lỗi và phân công NCC xử lý bảo hành</p>
        </div>
        <button onClick={() => setViewMode(viewMode === 'list' ? 'bySupplier' : 'list')}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-all ${viewMode === 'bySupplier' ? 'border-[#004785] bg-[#004785] text-white' : 'border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-[#404040] dark:text-[#999999]'}`}>
          <Truck size={16} /> {viewMode === 'bySupplier' ? 'Về danh sách' : 'Bảo hành theo NCC'}
        </button>
      </div>

      {viewMode === 'bySupplier' ? (
        <SupplierWarrantyStockView />
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { count: pendingCount, label: 'Chờ phân NCC', icon: AlertTriangle, color: 'border-amber-500 bg-amber-50 text-amber-600' },
              { count: awaitingCount, label: 'Chờ hàng về', icon: Clock, color: 'border-blue-500 bg-blue-50 text-blue-600' },
              { count: completedCount, label: 'Hoàn tất', icon: CheckCircle2, color: 'border-green-500 bg-green-50 text-green-600' },
            ].map((s) => (
              <Card key={s.label} padding="p-3" className={`border-l-4 ${s.color} shadow-sm dark:bg-[#0f0f0f]`}>
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full ${s.color} dark:bg-opacity-20`}><s.icon size={18} /></div>
                  <div><p className="text-xs font-semibold uppercase text-slate-500 dark:text-[#999999]">{s.label}</p><h3 className="text-xl font-bold text-slate-900 dark:text-[#e5e5e5]">{s.count}</h3></div>
                </div>
              </Card>
            ))}
          </div>

          {/* ===== KHU VỰC 1: ĐƠN CHỜ PHÂN CÔNG ===== */}
          {pendingGroups.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-500" />
                <h2 className="text-lg font-bold text-slate-800 dark:text-[#e5e5e5]">Đơn chờ phân NCC</h2>
                <Badge variant="warning" className="text-xs">{pendingGroups.length} phiếu</Badge>
              </div>
              <Card padding="p-0" className="overflow-hidden border-2 border-amber-200 dark:border-amber-800">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-amber-200 bg-amber-50/50 text-xs font-semibold uppercase text-amber-800 dark:border-amber-800 dark:bg-amber-900/10 dark:text-amber-400">
                      <th className="w-8 px-3 py-2.5"></th>
                      <th className="px-3 py-2.5">Mã phiếu</th>
                      <th className="px-3 py-2.5">Khách hàng</th>
                      <th className="px-3 py-2.5">Ngày đổi</th>
                      <th className="px-3 py-2.5 text-center">SL</th>
                      <th className="px-3 py-2.5">NCC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#333333]">
                    {(showAllPending ? pendingGroups : pendingGroups.slice(0, 6)).map((group) => {
                      const isExpanded = expandedCard === group.returnCode;
                      const totalQty = group.items.reduce((s, i) => s + (i.baseQuantity || i.quantity || 0), 0);
                      return (
                        <React.Fragment key={group.returnCode}>
                          <tr
                            onClick={() => setExpandedCard(isExpanded ? null : group.returnCode)}
                            className="cursor-pointer"
                          >
                            <td className="px-3 py-2.5">
                              {isExpanded ? <ChevronDown size={16} className="text-amber-600" /> : <ChevronRight size={16} className="text-amber-600" />}
                            </td>
                            <td className="px-3 py-2.5 text-sm font-bold text-[#004785] dark:text-blue-400">{group.returnCode}</td>
                            <td className="px-3 py-2.5 whitespace-nowrap text-slate-800 dark:text-[#e5e5e5]">{group.customerName || 'Khách lẻ'}</td>
                            <td className="px-3 py-2.5 whitespace-nowrap text-xs text-slate-500">{formatDate(group.exchangeDate)}</td>
                            <td className="px-3 py-2.5 text-center font-bold text-red-600">{totalQty} sp</td>
                            <td className="px-3 py-2.5"></td>
                          </tr>
                          {isExpanded && group.items.map((item) => {
                                const baseQty = item.baseQuantity || item.quantity || 0;
                                const convRate = item.conversionRate || 1;
                                const lookupKey = (item.warrantyId || item.warrantyTicketId || '') || (item.returnItemId || '');
                                return (
                                  <tr key={item.warrantyTicketId || item.returnItemId} className="">
                                    <td className="px-3 py-2"></td>
                                    <td className="px-3 py-2 text-xs" colSpan={3}>
                                      <span className="font-semibold text-slate-700 dark:text-[#b3b3b3]">{item.productName}</span>
                                      <span className="ml-2 text-slate-400">{item.skuCode}</span>
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                      <span className="font-bold text-red-600">{baseQty}</span>
                                      {convRate !== 1 && <span className="ml-1 text-xs text-slate-400">({item.quantity || 0}×{convRate})</span>}
                                    </td>
                                    <td className="px-3 py-2">
                                      <div className="flex items-center gap-1">
                                        <div className="min-w-0 flex-1">{renderSupplierDropdown(item)}</div>
                                        <button onClick={() => handleAssignSupplier(lookupKey, selectedSupplier[lookupKey])}
                                          disabled={!selectedSupplier[lookupKey]}
                                          className="shrink-0 rounded p-1 text-slate-400 hover:bg-amber-100 hover:text-amber-600 disabled:opacity-30 dark:hover:bg-amber-900/20">
                                          <Send size={14} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </Card>
              {pendingGroups.length > 6 && !showAllPending && (
                <button onClick={() => setShowAllPending(true)}
                  className="w-full rounded-lg border border-dashed border-amber-300 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20">
                  Xem thêm {pendingGroups.length - 6} đơn chờ
                </button>
              )}
            </div>
          )}

          {/* ===== TOOLBAR ===== */}
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm dark:border-[#333333] dark:bg-[#0f0f0f]">
            <div className="relative w-[260px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Icon name="search" size={18} /></span>
              <input type="text" placeholder="Tìm mã SP, tên KH, mã phiếu..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-4 text-sm focus:border-[#004785] focus:outline-none dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]" />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={openFilterDrawer} className="flex items-center gap-1.5"><Layers size={14} /> Bộ lọc{activeFilterCount > 0 && <span className="ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#004785] px-1 text-[11px] font-bold text-white">{activeFilterCount}</span>}</Button>
              {activeFilterCount > 0 && <Button variant="danger" size="sm" onClick={resetFilters} className="flex items-center gap-1"><RotateCcw size={13} /> Đặt lại</Button>}
            </div>
          </div>

          {/* ===== KHU VỰC 2: BẢNG LỊCH SỬ ===== */}
          <Card padding="p-0" className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500 dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#999999]">
                    <th className="w-8 px-2 py-3"></th>
                    <th className="px-3 py-3">Ngày đổi</th>
                    <th className="px-3 py-3">Mã phiếu</th>
                    <th className="px-3 py-3">Khách hàng</th>
                    <th className="px-3 py-3">Sản phẩm lỗi</th>
                    <th className="px-3 py-3 text-center">SL</th>
                    <th className="px-3 py-3">Lý do</th>
                    <th className="px-3 py-3">Trạng thái</th>
                    <th className="px-3 py-3">Nhà cung cấp</th>
                    <th className="px-3 py-3 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {historyItems.length === 0 ? (
                    <tr><td colSpan={10} className="px-3 py-8 text-center text-sm text-slate-400">Không có dữ liệu</td></tr>
                  ) : historyItems.map((row, idx) => {
                    const baseQty = row.baseQuantity || row.quantity || 0;
                    const prevSameCode = idx > 0 && historyItems[idx - 1]?.returnCode === row.returnCode;
                    const sameGroup = historyItems.filter((d, i) => i >= idx && d.returnCode === row.returnCode);
                    const rowSpan = !prevSameCode ? sameGroup.length : 0;
                    const isLastOfGroup = idx === historyItems.length - 1 || historyItems[idx + 1]?.returnCode !== row.returnCode;
                    const lookupKey = (row.warrantyId || row.warrantyTicketId || '') || (row.returnItemId || '');
                    return (
                      <tr key={row.warrantyTicketId || row.returnItemId || idx} className={`${row.status === 'AWAITING_SUPPLIER' ? 'border-l-2 border-l-blue-400 ' : 'border-l-2 border-l-green-400 '} ${isLastOfGroup ? 'border-b border-slate-200 dark:border-[#333333]' : ''}`}>
                        <td className="px-2 py-3 text-center align-top">
                          {row.status === 'AWAITING_SUPPLIER' ? <Clock size={14} className="text-blue-500" /> : <CheckCircle2 size={14} className="text-green-500" />}
                        </td>
                        {rowSpan > 0 ? <td className="px-3 py-3 whitespace-nowrap align-top text-slate-600 dark:text-[#cccccc]" rowSpan={rowSpan}>{formatDate(row.exchangeDate)}</td> : null}
                        {rowSpan > 0 ? <td className="px-3 py-3 align-top font-bold text-[#004785] dark:text-blue-400" rowSpan={rowSpan}>{row.returnCode}</td> : null}
                        {rowSpan > 0 ? <td className="px-3 py-3 whitespace-nowrap align-top font-medium text-slate-800 dark:text-[#e5e5e5]" rowSpan={rowSpan}>{row.customerName || 'Khách lẻ'}</td> : null}
                        <td className="px-3 py-3 align-top">
                          <div className="flex max-w-[220px] flex-col justify-center">
                            <p className="truncate font-semibold text-slate-800 dark:text-[#e5e5e5]" title={row.productName}>{row.productName}</p>
                            <p className="truncate text-xs text-slate-500 dark:text-[#999999]" title={row.skuCode}>{row.skuCode}</p>
                          </div>
                        </td>
                        <td className="px-3 py-3.5 text-center align-top"><span className="font-bold text-red-600 dark:text-red-400">{baseQty}</span></td>
                        <td className="px-3 py-3.5 align-top"><Badge variant="warning" className="text-xs">{row.reason === 'DEFECTIVE' ? 'Sản phẩm lỗi' : (row.reason || 'Sản phẩm lỗi')}</Badge></td>
                        <td className="px-3 py-3.5 align-top">
                          <Badge variant={row.status === 'AWAITING_SUPPLIER' ? 'info' : 'success'} className="text-xs">
                            {row.status === 'AWAITING_SUPPLIER' ? 'Chờ hàng về' : 'Hoàn tất'}
                          </Badge>
                        </td>
                        <td className="px-3 py-3.5 align-top">
                          <span className="text-sm text-slate-700 dark:text-[#b3b3b3]">{row.assignedSupplierName || row.supplierName || '—'}</span>
                        </td>
                        <td className="px-3 py-3.5 text-center align-top">
                          {row.status === 'AWAITING_SUPPLIER' ? (
                            <button onClick={() => handleAcceptWarranty(lookupKey)}
                              disabled={acceptingId === lookupKey}
                              className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-600 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700">
                              <PackageCheck size={14} className="inline mr-1" />Nhận hàng
                            </button>
                          ) : (
                            <span className="inline-flex items-center justify-center rounded-full bg-green-100 p-1 dark:bg-green-900/30">
                              <CheckCircle2 size={18} className="text-green-600 dark:text-green-400" />
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-6 py-3 dark:border-t-[#333333] dark:bg-[#0f0f0f]">
              <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-[#999999]">
                <div className="flex items-center gap-2">
                  <span>Hiển thị</span>
                  <select value={filters.pageSize} onChange={(e) => setPageSize(Number(e.target.value))}
                    className="rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-primary dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#d4d4d4]">
                    <option value={20}>20 dòng</option><option value={50}>50 dòng</option><option value={100}>100 dòng</option>
                  </select>
                </div>
                <span>{totalCount === 0 ? 0 : (filters.page - 1) * filters.pageSize + 1} - {Math.min(filters.page * filters.pageSize, totalCount)} trong tổng số {totalCount} sản phẩm</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(Math.max(1, filters.page - 1))} disabled={filters.page <= 1}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-[#404040] dark:text-[#999999] dark:hover:bg-[#272727]"><Icon name="chevron_left" className="text-[18px]" /></button>
                <div className="px-3 text-sm text-slate-700 dark:text-[#b3b3b3]">Trang {filters.page} / {totalPages || 1}</div>
                <button onClick={() => setPage(Math.min(totalPages || 1, filters.page + 1))} disabled={filters.page >= (totalPages || 1)}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-[#404040] dark:text-[#999999] dark:hover:bg-[#272727]"><Icon name="chevron_right" className="text-[18px]" /></button>
              </div>
            </div>
          </Card>
        </>
      )}

      <Drawer isOpen={isFilterDrawerOpen} onClose={() => setIsFilterDrawerOpen(false)} title="Bộ lọc" widthClass="max-w-sm"
        footer={<><Button variant="secondary" size="sm" onClick={resetDraftFilters}>Đặt lại</Button><Button variant="primary" size="sm" onClick={applyFilters}>Áp dụng</Button></>}>
        <div className="space-y-5">
          <div><label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-[#b3b3b3]">Từ ngày</label>
            <input type="date" value={draftFilters.fromDate ? draftFilters.fromDate.slice(0, 10) : ''}
              onChange={(e) => setDraftFilters((f) => ({ ...f, fromDate: e.target.value ? `${e.target.value}T00:00:00Z` : '' }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-[#004785] focus:outline-none dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]" /></div>
          <div><label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-[#b3b3b3]">Đến ngày</label>
            <input type="date" value={draftFilters.toDate ? draftFilters.toDate.slice(0, 10) : ''}
              onChange={(e) => setDraftFilters((f) => ({ ...f, toDate: e.target.value ? `${e.target.value}T23:59:59Z` : '' }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-[#004785] focus:outline-none dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]" /></div>
        </div>
      </Drawer>
    </div>
  );
};

export default OwnerWarrantyHistory;