/**
 * ReturnList - Danh sách phiếu đổi trả
 * API: /pos/returns - GET list
 */
import { useState, useMemo, useEffect, useCallback } from 'react';
import { Table } from '../../../../shared/components/Table';
import { Badge } from '../../../../shared/components/Badge';
import { Button } from '../../../../shared/components/Button';
import { Input } from '../../../../shared/components/Input';
import { formatCurrency } from '../../../../shared/utils/formatCurrency';
import { getReturns, cancelReturn } from '../../services/posService';

const STATUS_CONFIG = {
  PENDING: { label: 'Chờ duyệt', variant: 'warning' },
  COMPLETED: { label: 'Hoàn tất', variant: 'success' },
  CANCELLED: { label: 'Đã hủy', variant: 'danger' },
};

// Map API return
const mapReturn = (r) => ({
  id: r.returnId || r.id,
  returnId: r.returnId || r.id,
  returnCode: r.returnCode || r.id,
  invoiceId: r.invoiceId || '',
  customerName: r.customerName || 'Khách lẻ',
  status: r.status || 'PENDING',
  totalRefund: parseFloat(r.totalRefund || r.refundAmount || 0),
  refundMethod: r.refundMethod || r.method || 'CASH',
  reason: r.reason || '',
  createdAt: r.createdAt || r.createdAt,
  ...r,
});

const mockReturns = [
  {
    returnId: 'ret-001',
    returnCode: 'RET-20240629-0001',
    invoiceId: 'inv-001',
    customerName: 'Nguyễn Văn A',
    status: 'COMPLETED',
    totalRefund: 150000,
    refundMethod: 'CASH',
    reason: 'Sản phẩm bị lỗi',
    createdAt: '2026-06-29T10:00:00Z',
  },
  {
    returnId: 'ret-002',
    returnCode: 'RET-20240629-0002',
    invoiceId: 'inv-002',
    customerName: 'Trần Thị B',
    status: 'PENDING',
    totalRefund: 50000,
    refundMethod: 'TRANSFER',
    reason: 'Khách không hài lòng',
    createdAt: '2026-06-29T14:30:00Z',
  },
  {
    returnId: 'ret-003',
    returnCode: 'RET-20240628-0003',
    invoiceId: 'inv-003',
    customerName: 'Lê Văn C',
    status: 'CANCELLED',
    totalRefund: 80000,
    refundMethod: 'CASH',
    reason: 'Sản phẩm không đúng mẫu',
    createdAt: '2026-06-28T09:15:00Z',
  },
];

const ReturnList = ({ onSelect, refreshKey = 0 }) => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [cancellingId, setCancellingId] = useState(null);

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await getReturns({});
      console.log('[ReturnList] API response:', data);
      const raw = Array.isArray(data) ? data : (data?.items ?? data?.data ?? []);
      const items = Array.isArray(raw) ? raw.map(mapReturn) : [];
      setReturns(items);
    } catch (err) {
      console.error('Lỗi lấy danh sách đổi trả:', err);
      setFetchError(err.message);
      setReturns(mockReturns.map(mapReturn));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns, refreshKey]);

  const filtered = useMemo(() => {
    let list = returns;
    if (search) {
      const kw = search.toLowerCase();
      list = list.filter(
        (r) =>
          (r.returnCode || '').toLowerCase().includes(kw) ||
          (r.customerName || '').toLowerCase().includes(kw)
      );
    }
    if (statusFilter !== 'ALL') {
      list = list.filter((r) => r.status === statusFilter);
    }
    return list;
  }, [returns, search, statusFilter]);

  const handleCancel = async (ret) => {
    if (!window.confirm(`Hủy phiếu đổi trả ${ret.returnCode}?`)) return;
    setCancellingId(ret.returnId);
    try {
      await cancelReturn(ret.returnId);
      setReturns((prev) =>
        prev.map((r) => (r.returnId === ret.returnId ? { ...r, status: 'CANCELLED' } : r))
      );
    } catch (err) {
      alert('Không thể hủy: ' + (err.message || 'Lỗi'));
    } finally {
      setCancellingId(null);
    }
  };

  const columns = [
    {
      key: 'returnCode',
      header: 'Mã đơn',
      width: '160px',
      render: (v) => <span className="font-mono text-xs font-bold text-[#004785]">{v}</span>,
    },
    {
      key: 'customerName',
      header: 'Khách hàng',
      render: (v) => <span className="text-sm font-medium">{v || 'Khách lẻ'}</span>,
    },
    {
      key: 'totalRefund',
      header: 'Tiền hoàn',
      render: (v) => (
        <span className="text-sm font-semibold text-green-600">{formatCurrency(v)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (v) => {
        const cfg = STATUS_CONFIG[v] || { label: v, variant: 'secondary' };
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
      },
    },
    {
      key: 'createdAt',
      header: 'Ngày tạo',
      render: (v) => (
        <span className="text-xs text-slate-500">
          {v ? new Date(v).toLocaleString('vi-VN') : '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '140px',
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onSelect(row)}
            className="text-xs font-medium text-[#004785] hover:underline"
          >
            Chi tiết
          </button>
          {row.status === 'PENDING' && (
            <button
              type="button"
              onClick={() => handleCancel(row)}
              disabled={cancellingId === row.returnId}
              className="text-xs font-medium text-red-500 hover:underline disabled:opacity-50"
            >
              {cancellingId === row.returnId ? '...' : 'Hủy'}
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-64">
          <Input
            placeholder="Tìm mã đơn, khách hàng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#004785] focus:outline-none"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="PENDING">Chờ duyệt</option>
          <option value="COMPLETED">Hoàn tất</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>
        <Button variant="secondary" size="sm" onClick={fetchReturns}>
          Tìm
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={filtered}
        loading={loading}
        emptyMessage={fetchError ? `Lỗi: ${fetchError}` : 'Chưa có phiếu đổi trả nào'}
      />
    </div>
  );
};

export default ReturnList;
