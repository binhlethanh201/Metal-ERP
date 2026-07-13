import React from 'react';
import Table from '../../../../shared/components/Table';
import Icon from '../../../../shared/components/Icon';
import Badge from '../../../../shared/components/Badge';

/**
 * Format số tiền VND
 */
const formatCurrency = (value) => {
  if (value == null) return '0';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Format phần trăm
 */
const formatPercent = (value) => {
  if (value == null) return '0';
  return `${parseFloat(value).toFixed(1)}%`;
};

const DiscountTierTable = ({ tiers, loading, onEdit, onDelete }) => {
  const columns = [
    {
      key: 'minOrderValue',
      header: 'Tổng giá trị tối thiểu',
      width: '30%',
      render: (value) => <span className="font-medium">{formatCurrency(value)}</span>,
    },
    {
      key: 'discountPercent',
      header: 'Chiết khấu',
      width: '25%',
      align: 'center',
      render: (value) => (
        <span className="font-semibold text-green-600">{formatPercent(value)}</span>
      ),
    },
    {
      key: 'isActive',
      header: 'Trạng thái',
      width: '20%',
      align: 'center',
      render: (value) => (
        <Badge variant={value ? 'success' : 'secondary'}>
          {value ? 'Đang áp dụng' : 'Tạm ngưng'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      width: '25%',
      align: 'center',
      render: (_, row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onEdit(row)}
            className="rounded-lg p-1.5 text-blue-600 transition-colors hover:bg-blue-50"
            title="Sửa"
          >
            <Icon name="edit" size={18} />
          </button>
          <button
            onClick={() => onDelete(row)}
            className="rounded-lg p-1.5 text-red-600 transition-colors hover:bg-red-50"
            title="Xóa"
          >
            <Icon name="delete" size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={tiers}
      loading={loading}
      emptyMessage="Chưa có mức chiết khấu nào. Nhấn 'Thêm mức chiết khấu' để tạo mới."
    />
  );
};

export default DiscountTierTable;
