/**
 * ReturnOrderPage - Trang đổi trả hàng POS
 * Route: /pos/returns
 * Layout: Split panel (danh sách bên trái, chi tiết bên phải)
 */
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from '../../../shared/hooks/useAuth';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Badge } from '../../../shared/components/Badge';
import { Input } from '../../../shared/components/Input';
import { Table } from '../../../shared/components/Table';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import { formatDate } from '../../../shared/utils/formatDate';
import {
  getReturns,
  cancelReturn,
  getReturn,
  finalizeReturn,
  getOrders,
} from '../services/posService';
import Icon from '../../../shared/components/Icon';
import ReturnForm from '../components/return/ReturnForm';

const VN_TZ = 'Asia/Ho_Chi_Minh';
const formatDateTimeVN = (date) => formatDate(date, 'DD/MM/YYYY HH:mm', { timeZone: VN_TZ });

const STATUS_CONFIG = {
  PENDING: { label: 'Chờ duyệt', variant: 'warning' },
  COMPLETED: { label: 'Hoàn tất', variant: 'success' },
  CANCELLED: { label: 'Đã hủy', variant: 'danger' },
};

const normalizeStatus = (s) => {
  if (!s) return 'PENDING';
  const upper = String(s).toUpperCase();
  if (upper === 'PENDING' || upper === 'DRAFT') return 'PENDING';
  if (upper === 'COMPLETED' || upper === 'DONE' || upper === 'FINALIZED') return 'COMPLETED';
  if (upper === 'CANCELLED' || upper === 'CANCELED') return 'CANCELLED';
  return upper;
};

const getStatusLabel = (s) => {
  const normalized = normalizeStatus(s);
  return STATUS_CONFIG[normalized]?.label || s;
};

const getStatusVariant = (s) => {
  const normalized = normalizeStatus(s);
  return STATUS_CONFIG[normalized]?.variant || 'secondary';
};

const REFUND_METHOD_LABELS = {
  CASH: 'Tiền mặt',
  TRANSFER: 'Chuyển khoản',
  CARD: 'Thẻ',
};

const getRefundLabel = (m) => {
  if (!m) return '-';
  const upper = String(m).toUpperCase();
  return REFUND_METHOD_LABELS[upper] || m;
};

const STATUS_FILTERS = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'PENDING', label: 'Chờ duyệt' },
  { id: 'COMPLETED', label: 'Hoàn tất' },
  { id: 'CANCELLED', label: 'Đã hủy' },
];

const getCreatorName = (r) => {
  if (!r) return '-';
  // Các field phổ biến chứa tên người tạo
  if (r.userName) return r.userName;
  if (r.cashier) return r.cashier;
  if (r.cashierName) return r.cashierName;
  if (r.createdByName) return r.createdByName;
  if (r.createdByUserName) return r.createdByUserName;
  if (r.staffName) return r.staffName;
  if (r.creatorName) return r.creatorName;
  // createdBy có thể là string (tên) hoặc object {name, fullName}
  if (typeof r.createdBy === 'string') return r.createdBy;
  if (typeof r.createdBy === 'object') {
    if (r.createdBy?.name) return r.createdBy.name;
    if (r.createdBy?.fullName) return r.createdBy.fullName;
    if (r.createdBy?.userName) return r.createdBy.userName;
  }
  // createdByUser có thể là object {name, fullName}
  if (r.createdByUser) {
    if (r.createdByUser?.name) return r.createdByUser.name;
    if (r.createdByUser?.fullName) return r.createdByUser.fullName;
    if (r.createdByUser?.userName) return r.createdByUser.userName;
  }
  // user object
  if (r.user) {
    if (typeof r.user === 'string') return r.user;
    if (r.user?.name) return r.user.name;
    if (r.user?.fullName) return r.user.fullName;
    if (r.user?.userName) return r.user.userName;
  }
  return '-';
};

const mapReturn = (r) => ({
  id: r.returnOrderId || r.returnId || r.id,
  returnId: r.returnOrderId || r.returnId || r.id,
  returnCode: r.returnCode || r.returnOrderId || r.id,
  invoiceCode: (() => {
    const raw =
      r.invoiceCode ||
      r.invoiceId ||
      r.invoice?.invoiceCode ||
      r.invoice?.invoiceId ||
      r.invoice?.code ||
      '';
    return raw
      .replace(/\s*\d{4}-\d{2}-\d{2}T[\d.:]+Z?/g, '')
      .replace(/T[\d.:]+Z?/g, '')
      .trim();
  })(),
  customerName: r.customerName || 'Khách lẻ',
  userName: getCreatorName(r),
  status: normalizeStatus(r.status),
  returnType: r.returnType || 'RETURN',
  totalRefund: parseFloat(r.totalRefund || r.refundAmount || 0),
  refundMethod: r.refundMethod || r.method || 'CASH',
  reason: r.reason || '',
  notes: r.notes || '',
  createdAt: r.createdAt || r.createdAt,
});

const mapApiDetail = (r) => {
  if (!r) return null;
  const items = (r.returnItems || r.items || []).map((item) => ({
    returnItemId: item.returnItemId || item.id,
    productId: item.productId || item.id,
    productName: item.productName || 'Sản phẩm',
    productCode: item.productCode || '',
    quantity: parseFloat(item.quantity || 1),
    sellPrice: parseFloat(item.sellPrice || item.unitPrice || item.price || 0),
    refundAmount: parseFloat(item.refundAmount || 0),
  }));

  return {
    returnId: r.returnOrderId || r.returnId || r.id,
    returnCode: r.returnCode || r.returnOrderId || r.returnId || r.id,
    invoiceCode: (() => {
      const raw =
        r.invoiceCode ||
        r.invoiceId ||
        r.invoice?.invoiceCode ||
        r.invoice?.invoiceId ||
        r.invoice?.code ||
        '';
      return raw
        .replace(/\s*\d{4}-\d{2}-\d{2}T[\d.:]+Z?/g, '')
        .replace(/T[\d.:]+Z?/g, '')
        .trim();
    })(),
    customerName: r.customerName || 'Khách lẻ',
    userName: getCreatorName(r),
    status: normalizeStatus(r.status),
    returnType: r.returnType || 'RETURN',
    reason: r.reason || '',
    notes: r.notes || '',
    totalRefund: parseFloat(r.totalRefund || r.refundAmount || 0),
    refundMethod: r.refundMethod || r.method || 'CASH',
    createdAt: r.createdAt || r.createdAt,
    returnItems: items.length > 0 ? items : r.returnItems || r.items || [],
  };
};

const ReturnOrderPage = () => {
  const { user } = useAuth();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [cancellingId, setCancellingId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);

  // ---- Pagination ----
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // --- Fetch list ---
  const fetchReturns = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await getReturns({});
      const raw = Array.isArray(data) ? data : (data?.items ?? data?.data ?? []);
      setReturns(Array.isArray(raw) ? raw.map(mapReturn) : []);
    } catch (err) {
      setFetchError(err.message || 'Không thể tải danh sách đổi trả');
      setReturns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns, refreshKey]);

  // --- Stats ---
  const stats = useMemo(() => {
    const pending = returns.filter((r) => r.status === 'PENDING').length;
    const completed = returns.filter((r) => r.status === 'COMPLETED').length;
    return { pending, completed, total: returns.length };
  }, [returns]);

  // --- Filter ---
  const filtered = useMemo(() => {
    let list = returns;
    if (search) {
      const kw = search.toLowerCase().trim();
      list = list.filter(
        (r) =>
          (r.returnCode || '').toLowerCase().includes(kw) ||
          (r.customerName || '').toLowerCase().includes(kw) ||
          (r.invoiceCode || '').toLowerCase().includes(kw)
      );
    }
    if (statusFilter !== 'ALL') {
      list = list.filter((r) => r.status === statusFilter);
    }
    return list;
  }, [returns, search, statusFilter]);

  // ---- Pagination computed ----
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  // --- Select & load detail ---
  const handleSelect = useCallback(async (row) => {
    setSelected(row);
    setDetail(mapApiDetail(row));
    setDetailLoading(true);
    const returnId = row.returnId || row.id;
    if (returnId) {
      try {
        const raw = await getReturn(returnId);
        const data = raw?.data || raw;
        const fresh = mapApiDetail(data);
        if (fresh) {
          // invoiceCode về null, dùng orderId tìm invoiceCode thực từ danh sách hóa đơn
          if (!fresh.invoiceCode && data.orderId) {
            try {
              const ordersData = await getOrders({ pageSize: 500 });
              const orders = Array.isArray(ordersData)
                ? ordersData
                : (ordersData?.items ?? ordersData?.data ?? []);
              const matched = orders.find(
                (o) =>
                  (o.orderId || '').toLowerCase() === data.orderId.toLowerCase() ||
                  (o.id || '').toLowerCase() === data.orderId.toLowerCase() ||
                  (o.invoiceId || '').toLowerCase() === data.orderId.toLowerCase()
              );
              if (matched) {
                const rawCode = matched.invoiceCode || matched.invoiceId || matched.id || '';
                // Xóa timestamp nếu bị dính vào invoiceCode (cả dạng có space và không space)
                fresh.invoiceCode = rawCode
                  .replace(/\s*\d{4}-\d{2}-\d{2}T[\d.:]+Z?/g, '')
                  .replace(/T[\d.:]+Z?/g, '')
                  .trim();
              }
            } catch (_) {}
          }
          setDetail(fresh);
        }
      } catch (_) {
        // keep the list data as fallback
      }
    }
    setDetailLoading(false);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelected(null);
    setDetail(null);
  }, []);

  // --- Cancel ---
  const handleCancel = async (ret) => {
    if (!window.confirm(`Hủy phiếu đổi trả ${ret.returnCode}?`)) return;
    setCancellingId(ret.returnId);
    try {
      await cancelReturn(ret.returnId);
      setReturns((prev) =>
        prev.map((r) => (r.returnId === ret.returnId ? { ...r, status: 'CANCELLED' } : r))
      );
      if (selected?.returnId === ret.returnId) {
        setDetail((prev) => (prev ? { ...prev, status: 'CANCELLED' } : prev));
        setSelected((prev) => (prev ? { ...prev, status: 'CANCELLED' } : prev));
      }
    } catch (err) {
      alert('Không thể hủy: ' + (err.message || 'Lỗi'));
    } finally {
      setCancellingId(null);
    }
  };

  // --- Finalize ---
  const handleFinalize = async () => {
    if (!detail) return;
    if (!window.confirm('Xác nhận hoàn tiền cho phiếu đổi trả này?')) return;
    setFinalizing(true);
    try {
      const result = await finalizeReturn(detail.returnId);
      // Backend có thể trả về dữ liệu đã cập nhật
      const updated = result?.data || result;
      if (updated && updated.status) {
        const fresh = mapApiDetail(updated);
        setDetail(fresh);
        setSelected((prev) => (prev ? { ...prev, ...fresh } : prev));
        setReturns((prev) =>
          prev.map((r) =>
            r.returnId === detail.returnId ? { ...r, ...fresh, userName: r.userName } : r
          )
        );
      } else {
        // Fallback: re-fetch detail từ API
        const raw = await getReturn(detail.returnId);
        const data = raw?.data || raw;
        const fresh = mapApiDetail(data);
        if (fresh) {
          setDetail(fresh);
          setSelected((prev) => (prev ? { ...prev, ...fresh } : prev));
          setReturns((prev) =>
            prev.map((r) =>
              r.returnId === detail.returnId
                ? { ...r, ...fresh, status: fresh.status, userName: r.userName }
                : r
            )
          );
        }
      }
    } catch (err) {
      alert('Không thể hoàn tiền: ' + (err.message || 'Lỗi'));
    } finally {
      setFinalizing(false);
    }
  };

  const handleCreateSuccess = useCallback(
    (createdData) => {
      setShowCreateModal(false);
      if (createdData) {
        const creatorName = user?.name || user?.fullName || user?.email || 'Người dùng';
        const newReturn = mapReturn({ ...createdData, userName: creatorName });
        setReturns((prev) => [newReturn, ...prev]);
      }
      setRefreshKey((k) => k + 1);
    },
    [user]
  );

  // --- Column defs ---
  const columns = [
    {
      key: 'returnCode',
      header: 'Mã đơn',
      width: '160px',
      render: (v) => <span className="font-mono text-xs font-bold text-[#004785] dark:text-blue-300">{v}</span>,
    },
    {
      key: 'createdAt',
      header: 'Ngày tạo',
      width: '140px',
      render: (v) => (
        <span className="text-xs text-slate-500">{v ? formatDateTimeVN(v) : '-'}</span>
      ),
    },
    {
      key: 'customerName',
      header: 'Khách hàng',
      render: (v) => <span className="text-sm font-medium">{v || 'Khách lẻ'}</span>,
    },
    {
      key: 'userName',
      header: 'Người tạo',
      render: (v) => <span className="text-xs text-slate-500">{v || '-'}</span>,
    },
    {
      key: 'totalRefund',
      header: 'Số tiền',
      render: (v, row) =>
        row?.returnType === 'EXCHANGE' ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
            Đổi hàng
          </span>
        ) : (
          <span className="text-sm font-semibold text-green-600">{formatCurrency(v || 0)}</span>
        ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (v) => <Badge variant={getStatusVariant(v)}>{getStatusLabel(v)}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      width: '70px',
      render: (_, row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleSelect(row);
          }}
          className="whitespace-nowrap text-xs font-medium text-[#004785] hover:underline"
        >
          Chi tiết
        </button>
      ),
    },
  ];

  const hasItems = detail && Array.isArray(detail.returnItems) && detail.returnItems.length > 0;
  const isSelectedInList = selected && filtered.some((r) => r.returnId === selected.returnId);

  return (
    <div className="flex h-full gap-6">
      {/* ===== LEFT: Danh sách ===== */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto pr-3">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-[#e5e5e5]">Đổi trả hàng</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-[#999999]">
            Quản lý yêu cầu đổi/trả hàng cho khách đã mua
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <Card padding="p-4">
            <div className="text-center">
              <div className="text-xl font-extrabold text-[#004785]">{stats.total}</div>
              <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500 dark:text-[#999999]">
                Tổng phiếu
              </p>
            </div>
          </Card>
          <Card padding="p-4">
            <div className="text-center">
              <div className="text-xl font-extrabold text-amber-500">{stats.pending}</div>
              <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500 dark:text-[#999999]">
                Chờ duyệt
              </p>
            </div>
          </Card>
          <Card padding="p-4">
            <div className="text-center">
              <div className="text-xl font-extrabold text-green-600">{stats.completed}</div>
              <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500 dark:text-[#999999]">
                Đã hoàn tất
              </p>
            </div>
          </Card>
        </div>

        {/* Error banner */}
        {fetchError && (
          <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            <strong>Lưu ý:</strong> {fetchError}.
            <button
              type="button"
              onClick={fetchReturns}
              className="ml-3 font-medium underline hover:text-amber-800"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Search + Filter + Action */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <div className="w-60">
              <Input
                placeholder="Tìm mã đơn, khách hàng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex rounded-lg border border-slate-200 p-0.5 dark:border-[#333333]">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setStatusFilter(f.id)}
                  className={`rounded-md px-4 py-1.5 text-xs font-bold transition-colors ${statusFilter === f.id ? 'bg-[#004785] text-white' : 'text-slate-500 hover:text-slate-900 dark:text-[#999999] dark:hover:text-[#e5e5e5]'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            + Tạo đơn đổi trả
          </Button>
        </div>

        {/* Table */}
        <Card padding="p-0">
          <Table
            columns={columns}
            data={paginatedData}
            loading={loading}
            emptyMessage="Chưa có phiếu đổi trả nào"
          />
          {filtered.length > 0 && (
            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-6 py-3 dark:border-[#333333] dark:bg-[#0f0f0f]">
              <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-[#999999]">
                <div className="flex items-center gap-2">
                  <span>Hiển thị</span>
                  <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                    className="rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-primary dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#d4d4d4]"
                  >
                    <option value={20}>20 dòng</option>
                    <option value={50}>50 dòng</option>
                    <option value={100}>100 dòng</option>
                  </select>
                </div>
                <span>
                  {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{' '}
                  {Math.min(currentPage * pageSize, filtered.length)} trong tổng số{' '}
                  {filtered.length} phiếu
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#999999] dark:hover:bg-[#272727]"
                >
                  <Icon name="chevron_left" className="text-[18px]" />
                </button>
                <div className="px-3 text-sm text-slate-700 dark:text-[#b3b3b3]">
                  Trang {currentPage} / {totalPages || 1}
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages || 1, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#999999] dark:hover:bg-[#272727]"
                >
                  <Icon name="chevron_right" className="text-[18px]" />
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* ===== RIGHT: Chi tiết ===== */}
      {selected && detail && isSelectedInList && (
        <div className="w-96 shrink-0 space-y-4 overflow-y-auto">
          {/* Header card */}
          <Card>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-mono text-sm font-bold text-[#004785]">
                    {detail.returnCode}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {detail.createdAt ? formatDateTimeVN(detail.createdAt) : '-'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {detail.returnType === 'EXCHANGE' && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                        />
                      </svg>
                      Đổi hàng
                    </span>
                  )}
                  <Badge variant={getStatusVariant(detail.status)}>
                    {getStatusLabel(detail.status)}
                  </Badge>
                  <button
                    type="button"
                    onClick={handleCloseDetail}
                    className="rounded p-1 text-slate-400 hover:bg-slate-100"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3 dark:border-[#333333]">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-[#999999]">Khách hàng</span>
                  <span className="font-semibold">{detail.customerName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-[#999999]">Hóa đơn gốc</span>
                  <span className="font-mono font-semibold">{detail.invoiceCode || '-'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-[#999999]">Người tạo</span>
                  <span>{detail.userName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-[#999999]">Loại</span>
                  <span
                    className={`font-semibold ${detail.returnType === 'EXCHANGE' ? 'text-blue-700' : ''}`}
                  >
                    {detail.returnType === 'EXCHANGE' ? 'Đổi hàng' : 'Trả hàng'}
                  </span>
                </div>
                {detail.returnType !== 'EXCHANGE' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-[#999999]">Phương thức hoàn</span>
                    <span className="font-semibold">{getRefundLabel(detail.refundMethod)}</span>
                  </div>
                )}
              </div>

              {detail.reason && (
                <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-900/30">
                  <p className="text-xs font-bold uppercase tracking-wide text-amber-600">
                    Lý do đổi trả
                  </p>
                  <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">{detail.reason}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Items card */}
          <Card header={`Sản phẩm đổi trả (${detail.returnItems?.length || 0})`}>
            {hasItems ? (
              <div className="space-y-3">
                {detail.returnItems.map((item, i) => (
                  <div
                    key={item.returnItemId || i}
                    className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-0 last:pb-0 dark:border-[#333333]"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-[#e5e5e5]">
                        {item.productName}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-[#808080]">Số lượng: {item.quantity}</p>
                    </div>
                    {detail.returnType !== 'EXCHANGE' && (
                      <span className="ml-2 shrink-0 text-sm font-bold text-green-600">
                        {formatCurrency(item.refundAmount || item.quantity * item.sellPrice)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-slate-400">
                {detailLoading ? 'Đang tải...' : 'Không có sản phẩm'}
              </p>
            )}

            {detail.returnType !== 'EXCHANGE' ? (
              <div className="mt-3 border-t border-slate-200 pt-3">
                <div className="flex justify-between font-bold text-[#004785]">
                  <span>Tổng tiền hoàn</span>
                  <span className="text-lg">{formatCurrency(detail.totalRefund)}</span>
                </div>
              </div>
            ) : (
              <div className="mt-3 border-t border-slate-200 pt-3">
                <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3">
                  <svg
                    className="h-5 w-5 shrink-0 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                  <p className="text-sm font-medium text-blue-800">Đổi hàng — không hoàn tiền</p>
                </div>
              </div>
            )}
          </Card>

          {/* Notes */}
          {detail.notes && (
            <Card header="Ghi chú">
              <p className="text-sm text-slate-600">{detail.notes}</p>
            </Card>
          )}

          {/* Actions */}
          {detail.status === 'PENDING' && detail.returnType === 'EXCHANGE' && (
            <Button
              variant="success"
              className="w-full"
              onClick={handleFinalize}
              loading={finalizing}
            >
              Xác nhận đổi hàng
            </Button>
          )}
          {detail.status === 'PENDING' && detail.returnType !== 'EXCHANGE' && (
            <Button
              variant="success"
              className="w-full"
              onClick={handleFinalize}
              loading={finalizing}
            >
              Xác nhận hoàn tiền
            </Button>
          )}
          {detail.status === 'PENDING' && (
            <Button
              variant="outline"
              className="w-full text-red-500 hover:bg-red-50"
              onClick={() => handleCancel(selected)}
              loading={cancellingId === detail.returnId}
            >
              Hủy phiếu đổi trả
            </Button>
          )}
        </div>
      )}

      {/* Placeholder */}
      {(!selected || !detail || !isSelectedInList) && (
        <div className="hidden w-96 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 xl:flex">
          <div className="px-4 text-center">
            <p className="text-4xl text-slate-300">↩️</p>
            <p className="mt-3 text-sm font-medium text-slate-400">Chọn một phiếu đổi trả</p>
            <p className="text-xs text-slate-300">để xem chi tiết</p>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <ReturnForm
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default ReturnOrderPage;
