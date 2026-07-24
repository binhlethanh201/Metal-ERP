import React from 'react';
import { Badge } from '../../../../../shared/components/Badge';
import { Table } from '../../../../../shared/components/Table';

const ExpenseCategoryTable = ({
  categories,
  loading,
  refetch,
  onClickRow,
}) => {
  const tableColumns = [
    {
      key: 'categoryName',
      header: 'Tên nhóm chi phí',
      render: (_, c) => (
        <span className="font-semibold text-slate-800">{c.categoryName}</span>
      ),
    },
    {
      key: 'voucherCount',
      header: <div className="text-center">Số phiếu</div>,
      render: (val) => <div className="text-center font-medium text-slate-700">{val}</div>,
    },
    {
      key: 'pendingCount',
      header: <div className="text-center">Đang chờ</div>,
      render: (val) => (
        <div className="flex justify-center">
          {val > 0 ? (
            <Badge variant="warning">{val}</Badge>
          ) : (
            <span className="text-slate-400">0</span>
          )}
        </div>
      ),
    },
    {
      key: 'isActive',
      header: <div className="text-center">Trạng thái</div>,
      render: (val) => (
        <div className="flex justify-center">
          {val ? (
            <Badge variant="success" size="sm">
              HOẠT ĐỘNG
            </Badge>
          ) : (
            <Badge variant="secondary" size="sm">
              ĐÃ ẨN
            </Badge>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <Table
        columns={tableColumns}
        data={categories}
        loading={loading}
        emptyMessage="Chưa có nhóm chi phí nào"
        onClickRow={onClickRow ? (row) => onClickRow(row) : undefined}
      />
    </div>
  );
};

export default ExpenseCategoryTable;
