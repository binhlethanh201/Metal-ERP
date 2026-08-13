import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Modal } from '../../../shared/components/Modal';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Badge } from '../../../shared/components/Badge';
import { Table } from '../../../shared/components/Table';
import Icon from '../../../shared/components/Icon';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import { formatDate } from '../../../shared/utils/formatDate';
import { getOrders, getInvoice } from '../../pos/services/posService';
import { Filter, RotateCcw, Receipt, Package } from 'lucide-react';

const VN_TZ = 'Asia/Ho_Chi_Minh';
const formatDateTimeVN = (date) => formatDate(date, 'DD/MM/YYYY HH:mm', { timeZone: VN_TZ });

const PAYMENT_LABELS = {
  CASH: 'Tiền mặt', TRANSFER: 'Chuyển khoản', CARD: 'Thẻ',
  COMBINED: 'Kết hợp', DEBT: 'Công nợ',
  Cash: 'Tiền mặt', Transfer: 'Chuyển khoản', Card: 'Thẻ',
  Combined: 'Kết hợp', Debt: 'Công nợ',
};
const PAYMENT_VARIANTS = {
  'Tiền mặt': 'warning', Thẻ: 'info', 'Chuyển khoản': 'primary',
  'Kết hợp': 'secondary', 'Công nợ': 'danger',
  Cash: 'warning', Card: 'info', Transfer: 'primary', CASH: 'warning', CARD: 'info', TRANSFER: 'primary',
};
const translatePayment = (method) => {
  if (method && method.startsWith('[')) {
    try {
      const arr = JSON.parse(method);
      if (Array.isArray(arr)) {
        return arr.map(p => translatePayment(p.method)).join(', ');
      }
    } catch {}
    return 'Kết hợp';
  }
  return PAYMENT_LABELS[method] || method || '-';
};

const getVNDateStr = (dateStr) => {
  if (!dateStr) return '';
  let normalized = typeof dateStr === 'string' ? dateStr.replace(/(\.\d{3})\d+/, '$1') : dateStr;
  if (typeof normalized === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(normalized)) {
    normalized += 'Z';
  }
  const d = new Date(normalized);
  if (isNaN(d.getTime())) return '';
  const fmt = new Intl.DateTimeFormat('vi-VN', { timeZone: VN_TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
  return fmt.format(d);
};

const mapOrder = (o) => ({
  id: o.invoiceCode || o.invoiceId || o.id || '',
  invoiceCode: o.invoiceCode || o.id || '',
  invoiceId: o.invoiceId || o.id || '',
  date: o.createdAt || o.date || '',
  createdAt: o.createdAt || o.date || '',
  customerName: o.customerName || o.customer || 'Khách lẻ',
  items: (o.items || o.lineItems || []).map((item) => ({
    productId: item.productId || item.id || '',
    productCode: item.productCode || '',
    productName: item.productName || item.name || '',
    quantity: item.quantity || 0,
    unitPrice: parseFloat(item.unitPrice || item.price || 0),
    price: parseFloat(item.unitPrice || item.price || 0),
  })),
  itemCount: (o.items || o.lineItems || []).length || o.itemCount || 0,
  subtotal: parseFloat(o.subtotal || 0),
  discount: parseFloat(o.discount || 0),
  totalAmount: parseFloat(o.totalAmount || o.total || 0),
  paymentMethod: o.paymentMethod || o.paymentType || '',
  userName: o.userName || o.cashier || o.createdBy || '-',
});

const TIME_FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'today', label: 'Hôm nay' },
  { id: 'yesterday', label: 'Hôm qua' },
  { id: 'week', label: 'Tuần này' },
];

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await getOrders({ status: 'Completed', pageSize: 1000 });
      const raw = Array.isArray(data) ? data : (data?.Items ?? data?.items ?? data?.data ?? []);
      const items = Array.isArray(raw) ? raw.map(mapOrder) : [];
      setOrders(items);
    } catch (err) {
      setFetchError(err.message || 'Không thể tải danh sách đơn hàng');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => { setCurrentPage(1); }, [search, timeFilter]);

  const todayStr = useMemo(() => getVNDateStr(new Date()), []);

  const filteredOrders = useMemo(() => {
    let list = orders;
    if (search) {
      const kw = search.toLowerCase();
      list = list.filter(
        (o) =>
          (o.invoiceCode || '').toLowerCase().includes(kw) ||
          (o.customerName || '').toLowerCase().includes(kw)
      );
    }
    if (timeFilter === 'today') {
      list = list.filter((o) => getVNDateStr(o.createdAt) === todayStr);
    } else if (timeFilter === 'yesterday') {
      const d = new Date(); d.setDate(d.getDate() - 1);
      const yesterdayStr = getVNDateStr(d);
      list = list.filter((o) => getVNDateStr(o.createdAt) === yesterdayStr);
    } else if (timeFilter === 'week') {
      const w = new Date(); w.setDate(w.getDate() - 7);
      list = list.filter((o) => new Date(o.createdAt || 0) >= w);
    }
    return [...list].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [orders, search, timeFilter, todayStr]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  const stats = useMemo(() => ({
    totalOrders: filteredOrders.length,
    totalAmount: filteredOrders.reduce((s, o) => s + (o.totalAmount || 0), 0),
  }), [filteredOrders]);

  const handleViewDetail = async (row) => {
    setSelectedOrder(row);
    setDetailLoading(true);
    const id = row.invoiceId || row.id;
    if (id) {
      try {
        const detail = await getInvoice(id);
        if (detail) {
          const mapped = mapOrder(detail);
          if ((!mapped.items || mapped.items.length === 0) && row.items?.length > 0) {
            mapped.items = row.items;
          }
          setSelectedOrder((prev) => (prev?.id === row.id ? { ...prev, ...mapped } : prev));
        }
      } catch {}
    }
    setDetailLoading(false);
  };

  const columns = [
    { key: 'invoiceCode', header: 'Mã đơn', width: '160px',
      render: (v) => <span className="font-mono text-xs font-bold text-[#004785] dark:text-blue-300">{v || '-'}</span> },
    { key: 'customerName', header: 'Khách hàng',
      render: (v) => <span className="text-sm font-medium text-slate-800 dark:text-[#e5e5e5]">{v || 'Khách lẻ'}</span> },
    { key: 'itemCount', header: 'Số món', width: '80px',
      render: (v) => <span className="text-slate-600 dark:text-[#b3b3b3]">{v || 0}</span> },
    { key: 'totalAmount', header: 'Tổng tiền',
      render: (v) => <span className="text-sm font-bold text-green-600">{formatCurrency(v || 0)}</span> },
    { key: 'paymentMethod', header: 'Thanh toán', width: '150px',
      render: (v) => <Badge variant={PAYMENT_VARIANTS[v] || 'secondary'} size="sm" className="whitespace-nowrap">{translatePayment(v)}</Badge> },
    { key: 'userName', header: 'Thu ngân',
      render: (v) => <span className="text-slate-500 dark:text-[#999999]">{v || '-'}</span> },
    { key: 'createdAt', header: 'Thời gian', width: '140px',
      render: (v) => <span className="text-xs text-slate-500 dark:text-[#999999]">{v ? formatDateTimeVN(v) : '-'}</span> },
  ];

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e5e5e5]">Đơn hàng</h1>
        <p className="mt-1 text-gray-600 dark:text-[#999999]">Quản lý và theo dõi tất cả đơn hàng trong hệ thống</p>
      </div>

      {/* Error banner */}
      {fetchError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          <strong>Lỗi:</strong> {fetchError}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <div className="py-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{loading ? '...' : stats.totalOrders}</div>
            <p className="mt-1 text-sm text-gray-600 dark:text-[#999999]">Tổng đơn hàng</p>
          </div>
        </Card>
        <Card>
          <div className="py-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">{loading ? '...' : formatCurrency(stats.totalAmount)}</div>
            <p className="mt-1 text-sm text-gray-600 dark:text-[#999999]">Tổng doanh thu</p>
          </div>
        </Card>
        <Card>
          <div className="py-4 text-center">
            <div className="text-2xl font-bold text-amber-600">{loading || filteredOrders.length === 0 ? '...' : formatCurrency(stats.totalAmount / filteredOrders.length)}</div>
            <p className="mt-1 text-sm text-gray-600 dark:text-[#999999]">Bình quân/đơn</p>
          </div>
        </Card>
      </div>

      {/* Filter area */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-[#333333] dark:bg-[#1a1a1a]/60">
        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="flex min-w-[240px] flex-1 items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 focus-within:border-blue-400 focus-within:ring-1 dark:border-[#333] dark:bg-[#1a1a1a]">
            <Icon name="search" className="mr-2 text-slate-400 dark:text-[#808080]" size={18} />
            <input
              type="text"
              placeholder="Tìm mã đơn hoặc khách hàng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border-none bg-transparent text-sm outline-none focus:ring-0 dark:text-[#e5e5e5]"
            />
          </div>
        </div>

        {/* Time filter + Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#999999]">
              <Filter size={14} /> Lọc thời gian:
            </span>
            {TIME_FILTERS.map((item) => {
              const isActive = timeFilter === item.id;
              return (
                <Button
                  key={item.id}
                  type="button"
                  variant={isActive ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setTimeFilter(item.id)}
                >
                  {item.label}
                </Button>
              );
            })}
          </div>

          <Button
            onClick={() => { setSearch(''); setTimeFilter('all'); }}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <RotateCcw size={13} /> Đặt lại
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card padding="p-0">
        <Table
          columns={columns}
          data={paginatedData}
          loading={loading}
          emptyMessage={fetchError ? `Lỗi: ${fetchError}` : 'Không có đơn hàng nào'}
          onClickRow={(row) => handleViewDetail(row)}
        />
        {filteredOrders.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-6 py-3 dark:border-[#333333] dark:bg-[#0f0f0f]">
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-[#999999]">
              <div className="flex items-center gap-2">
                <span>Hiển thị</span>
                <select value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                  className="rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-primary dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#d4d4d4]">
                  <option value={20}>20 dòng</option>
                  <option value={50}>50 dòng</option>
                  <option value={100}>100 dòng</option>
                </select>
              </div>
              <span>
                {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredOrders.length)} trong tổng số {filteredOrders.length} đơn hàng
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-[#404040] dark:text-[#999999] dark:hover:bg-[#272727]">
                <Icon name="chevron_left" className="text-[18px]" />
              </button>
              <div className="px-3 text-sm text-slate-700 dark:text-[#b3b3b3]">
                Trang {currentPage} / {totalPages || 1}
              </div>
              <button type="button" onClick={() => setCurrentPage((p) => Math.min(totalPages || 1, p + 1))}
                disabled={currentPage >= totalPages}
                className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-[#404040] dark:text-[#999999] dark:hover:bg-[#272727]">
                <Icon name="chevron_right" className="text-[18px]" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={
          selectedOrder ? (
            <div className="flex flex-col gap-1 pr-10">
              <div className="flex flex-wrap items-center gap-2 text-lg font-bold text-slate-800 dark:text-[#e5e5e5]">
                Chi tiết đơn hàng: <span className="text-[#004785] dark:text-blue-300">{selectedOrder.invoiceCode}</span>
              </div>
              {selectedOrder.customerName && (
                <div className="text-sm font-normal text-slate-500 dark:text-[#999999]">
                  Khách hàng: <strong className="text-slate-700 dark:text-[#b3b3b3]">{selectedOrder.customerName}</strong>
                  <span className="ml-3">Thu ngân: <strong className="text-slate-700 dark:text-[#b3b3b3]">{selectedOrder.userName || '-'}</strong></span>
                </div>
              )}
            </div>
          ) : 'Chi tiết đơn hàng'
        }
        size="3xl"
      >
        {detailLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-500 dark:text-[#999999]">
            <Icon name="sync" className="animate-spin text-3xl text-[#004785]" />
            <p>Đang tải chi tiết đơn hàng...</p>
          </div>
        ) : !selectedOrder ? (
          <p className="py-10 text-center text-sm italic text-slate-400 dark:text-[#808080]">Không có dữ liệu.</p>
        ) : (
          <div className="space-y-6">
            {/* Thông tin chung */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-4 rounded-lg border border-slate-200 bg-slate-50/60 p-4 md:grid-cols-2 dark:border-[#333333] dark:bg-[#1a1a1a]/60">
              <div className="flex flex-col">
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-2 text-sm last:border-0 dark:border-[#333333]">
                  <span className="shrink-0 text-slate-500 dark:text-[#999999]">Mã đơn</span>
                  <span className="text-right font-semibold font-mono text-slate-800 dark:text-[#e5e5e5]">{selectedOrder.invoiceCode}</span>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-2 text-sm last:border-0 dark:border-[#333333]">
                  <span className="shrink-0 text-slate-500 dark:text-[#999999]">Thời gian</span>
                  <span className="text-right font-semibold text-slate-800 dark:text-[#e5e5e5]">{selectedOrder.createdAt ? formatDateTimeVN(selectedOrder.createdAt) : '-'}</span>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-2 text-sm last:border-0 dark:border-[#333333]">
                  <span className="shrink-0 text-slate-500 dark:text-[#999999]">Khách hàng</span>
                  <span className="text-right font-semibold text-slate-800 dark:text-[#e5e5e5]">{selectedOrder.customerName}</span>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-2 text-sm last:border-0 dark:border-[#333333]">
                  <span className="shrink-0 text-slate-500 dark:text-[#999999]">Thu ngân</span>
                  <span className="text-right font-semibold text-slate-800 dark:text-[#e5e5e5]">{selectedOrder.userName || '-'}</span>
                </div>
              </div>
            </div>

            {/* Danh sách sản phẩm */}
            <div>
              <h4 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-[#999999]">
                <Package size={16} /> Sản phẩm đã mua
              </h4>
              <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm dark:border-[#333333]">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500 dark:bg-[#1a1a1a] dark:text-[#999999]">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Sản phẩm</th>
                      <th className="px-4 py-3 text-center font-semibold">SL</th>
                      <th className="px-4 py-3 text-right font-semibold">Đơn giá</th>
                      <th className="px-4 py-3 text-right font-semibold">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white dark:divide-[#333333] dark:bg-[#0f0f0f]">
                    {(selectedOrder.items || []).map((item, i) => (
                      <tr key={i} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-[#272727]/50">
                        <td className="px-4 py-3 font-medium text-slate-700 dark:text-[#b3b3b3]">{item.productName || 'SP'}</td>
                        <td className="px-4 py-3 text-center text-slate-600 dark:text-[#999999]">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-slate-600 dark:text-[#999999]">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-800 dark:text-[#e5e5e5]">{formatCurrency(item.unitPrice * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Chi tiết thanh toán */}
            <div>
              <h4 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-[#999999]">
                <Receipt size={16} /> Chi tiết thanh toán
              </h4>
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-[#333333] dark:bg-[#0f0f0f]">
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-2 text-sm last:border-0 dark:border-[#333333]">
                  <span className="shrink-0 text-slate-500 dark:text-[#999999]">Tạm tính</span>
                  <span className="text-right font-semibold text-slate-800 dark:text-[#e5e5e5]">{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-2 text-sm last:border-0 dark:border-[#333333]">
                    <span className="shrink-0 text-slate-500 dark:text-[#999999]">Giảm giá</span>
                    <span className="text-right font-semibold text-red-500">-{formatCurrency(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-2 text-sm last:border-0 dark:border-[#333333]">
                  <span className="shrink-0 font-bold text-slate-700 dark:text-[#b3b3b3]">Tổng cộng</span>
                  <span className="text-right font-bold text-green-600">{formatCurrency(selectedOrder.totalAmount)}</span>
                </div>
                <div className="flex items-center justify-between gap-4 py-2 text-sm">
                  <span className="shrink-0 text-slate-500 dark:text-[#999999]">Phương thức TT</span>
                  <span className="text-right font-semibold text-slate-800 dark:text-[#e5e5e5]">{translatePayment(selectedOrder.paymentMethod)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderList;
