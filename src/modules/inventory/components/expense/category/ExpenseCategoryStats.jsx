import React from 'react';
import { Card } from '../../../../../shared/components/Card';

const ExpenseCategoryStats = ({ summary }) => {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <Card>
        <div className="py-3 text-center">
          <div className="text-2xl font-bold text-[#004785]">{summary.total}</div>
          <p className="mt-0.5 text-xs text-gray-600 dark:text-[#999999]">Tổng nhóm chi phí</p>
        </div>
      </Card>
      <Card>
        <div className="py-3 text-center">
          <div className="text-2xl font-bold text-emerald-600">{summary.active}</div>
          <p className="mt-0.5 text-xs text-gray-600 dark:text-[#999999]">Đang hoạt động</p>
        </div>
      </Card>
      <Card>
        <div className="py-3 text-center">
          <div className="text-2xl font-bold text-slate-600">{summary.vouchers}</div>
          <p className="mt-0.5 text-xs text-gray-600 dark:text-[#999999]">Tổng phiếu chi</p>
        </div>
      </Card>
      <Card>
        <div className="py-3 text-center">
          <div className="text-2xl font-bold text-amber-500">{summary.pending}</div>
          <p className="mt-0.5 text-xs text-gray-600 dark:text-[#999999]">Phiếu đang chờ</p>
        </div>
      </Card>
    </div>
  );
};

export default ExpenseCategoryStats;
