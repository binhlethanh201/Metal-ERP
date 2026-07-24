import React from 'react';
import Table from '../../../../shared/components/Table';
import Badge from '../../../../shared/components/Badge';
import {Unlock, Lock } from 'lucide-react';
import formatCurrency from '../../../../shared/utils/formatCurrency';
import { formatDateTime } from '../../../../shared/utils/formatDate';

// ==================== LỌC STATUS BADGE BẰNG SHARED COMPONENT ====================
export const renderStatusBadge = (status) => {
  // Chuẩn hóa chuỗi để tránh lỗi chữ hoa/chữ thường từ API
  const normalizedStatus = status?.toUpperCase();

  switch (normalizedStatus) {
    case 'OPEN':
      return (
        <Badge
          variant="success"
          size="sm"
          className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700"
        >
          <Unlock size={12} /> Đang mở
        </Badge>
      );
    case 'CLOSED':
      return (
        <Badge
          variant="secondary"
          size="sm"
          className="inline-flex items-center gap-1 bg-slate-100 text-slate-700"
        >
          <Lock size={12} /> Đã đóng
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" size="sm" className="inline-flex items-center gap-1">
          {status || 'Không xác định'}
        </Badge>
      );
  }
};

const VarianceCell = ({ variance }) => {
  if (variance === null || variance === undefined) return <span className="text-slate-400">—</span>;
  const isNeg = variance < 0;
  const isZero = variance === 0;
  return (
    <span
      className={`font-semibold ${
        isZero ? 'text-slate-500' : isNeg ? 'text-red-600' : 'text-emerald-600'
      }`}
    >
      {isNeg ? '' : '+'}
      {formatCurrency(variance)}
    </span>
  );
};

const ShiftTable = ({ shifts, loading, onViewSummary, onClickRow }) => {
  const columns = [
    {
      key: 'shift',
      header: 'Ca bán',
      render: (_, s) => (
        <div>
          <div className="font-bold text-[#004785]">
            {s.shiftCode}
          </div>
          <div className="text-xs font-medium text-slate-500">NV: {s.userName}</div>
        </div>
      ),
    },
    {
      key: 'time',
      header: 'Thời gian',
      render: (_, s) => (
        <div className="text-sm text-slate-700">
          <div>Bắt đầu: {formatDateTime(s.startedAt)}</div>
          <div className="text-slate-500">
            Kết thúc: {s.endedAt ? formatDateTime(s.endedAt) : '—'}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: <div className="text-center">Trạng thái</div>,
      render: (_, s) => <div className="flex justify-center">{renderStatusBadge(s.status)}</div>,
    },
    {
      key: 'revenue',
      header: <div className="text-right">Doanh thu</div>,
      render: (_, s) => (
        <div className="text-right">
          <div className="font-semibold text-slate-800">{formatCurrency(s.totalRevenue)}</div>
          <div className="text-xs text-slate-500">{s.totalOrders} đơn</div>
        </div>
      ),
    },
    {
      key: 'variance',
      header: <div className="text-right">Chênh lệch quỹ</div>,
      render: (_, s) => (
        <div className="text-right">
          <VarianceCell variance={s.variance} />
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={shifts}
      loading={loading}
      emptyMessage="Không tìm thấy ca bán nào."
      className="bg-white shadow-sm"
      onClickRow={onClickRow ? (row) => onClickRow(row) : undefined}
    />
  );
};

export default ShiftTable;
