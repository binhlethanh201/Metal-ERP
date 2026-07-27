import React from 'react';
import Table from '../../../../shared/components/Table';
import { Badge } from '../../../../shared/components/Badge';
import Icon from '../../../../shared/components/Icon';

/**
 * StaffTable - 1 component dùng cho cả 3 view: active / hidden / deleted.
 * Props chính:
 *  - variant: 'active' | 'hidden' | 'deleted'
 *  - onHide        (variant='active'): click "Ẩn" → soft-hide
 *  - onActivate    (variant='hidden'): click "Kích hoạt" → restore IsActive=1
 *  - onRestore     (variant='deleted'): click "Khôi phục" → restore Status
 *  - onPermanentDelete (variant='hidden' | 'deleted'): click "Xoá vĩnh viễn"
 *  - onClickRow: mở modal chi tiết
 */
const StaffTable = ({
  staffs,
  loading,
  currentUserId,
  variant = 'active',
  onClickRow,
  onHide,
  onActivate,
  onRestore,
  onPermanentDelete,
}) => {
  const renderStatusBadge = (staff) => {
    if (variant === 'deleted') {
      return (
        <Badge variant="danger" size="sm" className="inline-flex items-center gap-1">
          Đã xóa
        </Badge>
      );
    }
    if (staff.isActive === 1) {
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
          <div className="text-xs text-slate-400 dark:text-[#808080]">
            {staff.phoneNumber || 'Chưa cập nhật SĐT'}
          </div>
        </div>
      ),
    },
    {
      key: 'branch',
      header: 'Chi nhánh',
      render: (_, staff) => (
        <div className="font-medium text-slate-700 dark:text-[#b3b3b3]">
          {staff.branchName || '---'}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (_, staff) => {
        const isSelf = currentUserId && staff.userId === currentUserId;
        return (
          <div>
            {renderStatusBadge(staff)}
            {isSelf && (
              <div className="mt-0.5 text-[10px] italic text-slate-400 dark:text-[#808080]">
                Bạn
              </div>
            )}
          </div>
        );
      },
    },
  ];

  // Cột thao tác — chỉ hiện ở cấp row tương ứng variant
  if (variant === 'active' && onHide) {
    columns.push({
      key: 'actions',
      header: <div className="text-right">Thao tác</div>,
      render: (_, staff) => {
        const isSelf = currentUserId && staff.userId === currentUserId;
        return (
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              disabled={isSelf}
              onClick={(e) => {
                e.stopPropagation();
                onHide(staff.userId);
              }}
              className="flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50"
              title={isSelf ? 'Không thể ẩn chính mình' : 'Ẩn nhân viên (chuyển sang tab Đã ẩn)'}
            >
              <Icon name="eye-off" size={14} />
              Ẩn
            </button>
          </div>
        );
      },
    });
  } else if (variant === 'hidden' && (onActivate || onPermanentDelete)) {
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
                onPermanentDelete(staff.userId, staff);
              }}
              className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/30"
              title="Xoá vĩnh viễn nhân viên"
            >
              <Icon name="trash-2" size={14} />
              Xoá vĩnh viễn
            </button>
          )}
        </div>
      ),
    });
  } else if (variant === 'deleted' && (onRestore || onPermanentDelete)) {
    columns.push({
      key: 'actions',
      header: <div className="text-right">Thao tác</div>,
      render: (_, staff) => {
        const daysUntil = staff.daysUntilPermanentDelete;
        return (
          <div className="flex items-center justify-end gap-2">
            {typeof daysUntil === 'number' && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  daysUntil <= 3
                    ? 'bg-red-100 text-red-700'
                    : daysUntil <= 7
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-slate-100 text-slate-600 dark:bg-[#333333] dark:text-[#999999]'
                }`}
                title="Số ngày còn lại trước khi bị xoá vĩnh viễn tự động"
              >
                Còn {daysUntil} ngày
              </span>
            )}
            {onRestore && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRestore(staff.userId);
                }}
                className="flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
                title="Khôi phục nhân viên"
              >
                <Icon name="history" size={14} />
                Khôi phục
              </button>
            )}
            {onPermanentDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPermanentDelete(staff.userId, staff);
                }}
                className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/30"
                title="Xoá vĩnh viễn ngay"
              >
                <Icon name="trash-2" size={14} />
                Xoá vĩnh viễn
              </button>
            )}
          </div>
        );
      },
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
