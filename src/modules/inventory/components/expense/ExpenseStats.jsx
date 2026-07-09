import React from 'react';
import { Card } from '../../../../shared/components/Card';

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const ExpenseStats = ({ summary }) => {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <Card>
        <div className="py-3 text-center">
          <div className="text-2xl font-bold text-[#004785]">{summary.totalCount}</div>
          <p className="mt-0.5 text-xs text-gray-600">Tổng phiếu chi</p>
        </div>
      </Card>
      <Card>
        <div className="py-3 text-center">
          <div className="text-2xl font-bold text-emerald-600">
            {formatCurrency(summary.totalAmount)}
          </div>
          <p className="mt-0.5 text-xs text-gray-600">Tổng tiền (trang hiện tại)</p>
        </div>
      </Card>
      <Card>
        <div className="py-3 text-center">
          <div className="text-2xl font-bold text-amber-500">{summary.pending}</div>
          <p className="mt-0.5 text-xs text-gray-600">Chờ xác nhận</p>
        </div>
      </Card>
      <Card>
        <div className="py-3 text-center">
          <div className="text-2xl font-bold text-slate-500">{summary.completed}</div>
          <p className="mt-0.5 text-xs text-gray-600">Đã xác nhận</p>
        </div>
      </Card>
    </div>
  );
};

export default ExpenseStats;
