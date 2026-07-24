import React from 'react';
import Table from '../../../../shared/components/Table';
import { Badge } from '../../../../shared/components/Badge';

const renderStatusBadge = (isActive) => {
  if (isActive === 1) {
    return (
      <Badge variant="success" size="sm" className="inline-flex items-center gap-1">
        Hoạt động
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" size="sm" className="inline-flex items-center gap-1">
      Đã ẩn
    </Badge>
  );
};

const StaffTable = ({ staffs, loading, currentUserId, onClickRow }) => {
  const columns = [
    {
      key: 'staff',
      header: 'Nhân viên',
      render: (_, staff) => (
        <div>
          <div className="font-bold text-slate-800">{staff.fullName}</div>
          <div className="text-xs font-medium text-slate-400">
            Vai trò: {staff.roles?.join(', ') || 'Chưa gán'}
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Liên hệ',
      render: (_, staff) => (
        <div>
          <div className="font-medium text-slate-700">{staff.email}</div>
          <div className="text-xs text-slate-400">{staff.phoneNumber || 'Chưa cập nhật SĐT'}</div>
        </div>
      ),
    },
    {
      key: 'branch',
      header: 'Chi nhánh',
      render: (_, staff) => (
        <div className="font-medium text-slate-700">{staff.branchName || '---'}</div>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (_, staff) => {
        const isSelf = currentUserId && staff.userId === currentUserId;
        return (
          <div>
            {renderStatusBadge(staff.isActive)}
            {isSelf && <div className="mt-0.5 text-[10px] italic text-slate-400">Bạn</div>}
          </div>
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      data={staffs}
      loading={loading}
      emptyMessage="Không tìm thấy nhân viên nào."
      className="bg-white shadow-sm"
      onClickRow={onClickRow}
    />
  );
};

export default StaffTable;
