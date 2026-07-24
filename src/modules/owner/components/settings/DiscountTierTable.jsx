import React from 'react';
import Table from '../../../../shared/components/Table';
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

const DiscountTierTable = ({ tiers, loading, onClickRow }) => {
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
  ];

  return (
    <Table
      columns={columns}
      data={tiers}
      loading={loading}
      emptyMessage="Chưa có mức chiết khấu nào. Nhấn 'Thêm mức chiết khấu' để tạo mới."
      onClickRow={onClickRow ? (row) => onClickRow(row) : undefined}
    />
  );
};

export default DiscountTierTable;
