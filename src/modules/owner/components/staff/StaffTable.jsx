import React from 'react';
import Icon from '../../../../shared/components/Icon';
import Table from '../../../../shared/components/Table';
import Toggle from '../../../../shared/components/Toggle';
import IconButton from '../../../../shared/components/IconButton';

const StaffTable = ({ staffs, loading, currentUserId, onViewDetail, onToggleStatus, onDelete }) => {
  const columns = [
    {
      key: 'staff',
      header: 'Nhân viên',
      render: (_, staff) => (
        <div>
          <div className="font-bold text-blue-900">{staff.fullName}</div>
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
          <div className="flex items-center gap-3" title={isSelf ? 'Không thể tự vô hiệu hóa' : ''}>
            <Toggle
              checked={staff.isActive === 1}
              disabled={isSelf}
              onChange={() => !isSelf && onToggleStatus(staff.userId)}
            />
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: <div className="text-right">Thao tác</div>,
      render: (_, staff) => {
        return (
          <div className="flex items-center justify-end gap-2">
            <IconButton
              icon={(props) => <Icon name="visibility" {...props} />}
              variant="outline"
              space="admin"
              onClick={() => onViewDetail(staff)}
              title="Xem chi tiết & Cập nhật"
            />
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
    />
  );
};

export default StaffTable;
