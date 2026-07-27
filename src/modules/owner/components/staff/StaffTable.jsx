import React from 'react';
import Table from '../../../../shared/components/Table';
import { Badge } from '../../../../shared/components/Badge';
import Icon from '../../../../shared/components/Icon';

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

const StaffTable = ({
  staffs,
  loading,
  currentUserId,
  onClickRow,
  showRowActions = false,
  onActivate,
  onPermanentDelete,
}) => {
  const columns = [
    {
      key: 'staff',
      header: 'Nhân viên',
      render: (_, staff) => (
        <div>
          <div className="font-bold text-slate-800 dark:text-[#e5e5e5]">{staff.fullName}</div>
          <div className="text-xs font-medium text-slate-400 dark:text-[#808080]">
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
          <div className="font-medium text-slate-700 dark:text-[#b3b3b3]">{staff.email}</div>
          <div className="text-xs text-slate-400 dark:text-[#808080]">{staff.phoneNumber || 'Chưa cập nhật SĐT'}</div>
        </div>
      ),
    },
    {
      key: 'branch',
      header: 'Chi nhánh',
      render: (_, staff) => (
        <div className="font-medium text-slate-700 dark:text-[#b3b3b3]">{staff.branchName || '---'}</div>
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
            {isSelf && <div className="mt-0.5 text-[10px] italic text-slate-400 dark:text-[#808080]">Bạn</div>}
          </div>
        );
      },
    },
  ];

  // Khi đang ở tab "Đã ẩn" (showRowActions), thêm cột Thao tác với 2 nút
  if (showRowActions) {
    columns.push({
      key: 'actions',
      header: <div className="text-right">Thao tác</div>,
      render: (_, staff) => (
        <div className="flex items-center justify-end gap-1.5">
          {onActivate && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onActivate(staff.userId);
              }}
              className="flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
              title="Kích hoạt lại nhân viên"
            >
              <Icon name="user-check" size={14} />
              Kích hoạt
            </button>
          )}
          {onPermanentDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPermanentDelete(staff.userId);
              }}
              className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
              title="Xoá vĩnh viễn nhân viên"
            >
              <Icon name="trash-2" size={14} />
              Xoá vĩnh viễn
            </button>
          )}
        </div>
      ),
    });
  }

  return (
    <Table
      columns={columns}
      data={staffs}
      loading={loading}
      emptyMessage="Không tìm thấy nhân viên nào."
      className="bg-white shadow-sm dark:bg-[#0f0f0f]"
      onClickRow={onClickRow}
    />
  );
};

export default StaffTable;
