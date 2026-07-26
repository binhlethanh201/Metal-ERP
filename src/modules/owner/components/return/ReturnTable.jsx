import React from 'react';
import Table from '../../../../shared/components/Table';
import Badge from '../../../../shared/components/Badge';
import {Clock, CheckCircle, XCircle } from 'lucide-react';
import formatCurrency from '../../../../shared/utils/formatCurrency';
import { formatDateTime } from '../../../../shared/utils/formatDate';

const TYPE_LABEL = { REFUND: 'Hoàn tiền', EXCHANGE: 'Đổi hàng' };
const METHOD_LABEL = { CASH: 'Tiền mặt', TRANSFER: 'Chuyển khoản', EXCHANGE: 'Đổi hàng' };

// ==================== LỌC STATUS BADGE ====================
export const renderReturnStatusBadge = (status) => {
  // Chuẩn hóa chuỗi để tránh lỗi chữ hoa/chữ thường dẫn đến việc hiển thị tiếng Anh (rơi vào default)
  const normalizedStatus = status?.toUpperCase();

  switch (normalizedStatus) {
    case 'PENDING':
      return (
        <Badge
          variant="warning"
          size="sm"
          className="inline-flex items-center gap-1 bg-amber-100 text-amber-700"
        >
          <Clock size={12} /> Đang chờ
        </Badge>
      );
    case 'COMPLETED':
      return (
        <Badge
          variant="success"
          size="sm"
          className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700"
        >
          <CheckCircle size={12} /> Hoàn tất
        </Badge>
      );
    case 'CANCELLED':
      return (
        <Badge
          variant="danger"
          size="sm"
          className="inline-flex items-center gap-1 bg-red-100 text-red-700"
        >
          <XCircle size={12} /> Đã hủy
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

const ReturnTable = ({ returns, loading, onViewDetail }) => {
  const columns = [
    {
      key: 'return',
      header: 'Phiếu đổi/trả',
      render: (_, r) => (
        <div>
          <div className="font-bold text-[#004785]">
            {r.returnCode}
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-[#999999]">HĐ gốc: {r.invoiceCode || '—'}</div>
        </div>
      ),
    },
    {
      key: 'staff',
      header: 'Nhân viên tạo',
      render: (_, r) => <span className="text-slate-700 dark:text-[#b3b3b3]">{r.staffName || '—'}</span>,
    },
    {
      key: 'type',
      header: 'Loại / Phương thức',
      render: (_, r) => (
        <div className="text-sm">
          <div className="font-medium text-slate-700 dark:text-[#b3b3b3]">
            {TYPE_LABEL[r.returnType] || r.returnType}
          </div>
          <div className="text-xs text-slate-800 dark:text-[#e5e5e5]">
            {METHOD_LABEL[r.refundMethod] || r.refundMethod}
          </div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: <div className="text-right">Tiền hoàn</div>,
      render: (_, r) => (
        <div className="text-right font-semibold text-slate-800 dark:text-[#e5e5e5]">
          {formatCurrency(r.refundAmount)}
        </div>
      ),
    },
    {
      key: 'status',
      header: <div className="text-center">Trạng thái</div>,
      render: (_, r) => (
        <div className="flex justify-center">{renderReturnStatusBadge(r.status)}</div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Ngày tạo',
      render: (_, r) => (
        <span className="text-sm text-slate-800 dark:text-[#e5e5e5]">
          {r.createdAt ? formatDateTime(r.createdAt) : '—'}
        </span>
      ),
    },
   
  ];

  return (
    <Table
      columns={columns}
      data={returns}
      loading={loading}
      emptyMessage="Không tìm thấy phiếu đổi/trả nào."
      className="bg-white shadow-sm dark:bg-[#0f0f0f]"
      onClickRow={(row) => onViewDetail(row.returnOrderId)}
    />
  );
};

export default ReturnTable;
