import React from 'react';
import { RefreshCw } from 'lucide-react';
import Icon from '../../../../../shared/components/Icon';
import { Button } from '../../../../../shared/components/Button';
import { Badge } from '../../../../../shared/components/Badge';
import { Table } from '../../../../../shared/components/Table';
import { Input } from '../../../../../shared/components/Input';

const ExpenseCategoryTable = ({
  categories,
  loading,
  refetch,
  editingId,
  editingName,
  setEditingName,
  setEditingId,
  onSaveEdit,
  startEdit,
  onDeleteClick,
}) => {
  const tableColumns = [
    {
      key: 'categoryName',
      header: 'Tên nhóm chi phí',
      render: (_, c) =>
        editingId === c.categoryId ? (
          <Input
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            className="w-full"
            autoFocus
          />
        ) : (
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
    {
      key: 'actions',
      header: <div className="text-center">Thao tác</div>,
      render: (_, c) => (
        <div className="flex justify-center gap-2">
          {editingId === c.categoryId ? (
            <div className="flex justify-center gap-1">
              <button
                type="button"
                onClick={() => onSaveEdit(c.categoryId)}
                className="rounded-lg p-2 text-emerald-600 transition-colors hover:bg-emerald-50"
                title="Lưu"
              >
                <Icon name="check" size={18} />
              </button>
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100"
                title="Hủy sửa"
              >
                <Icon name="close" size={18} />
              </button>
            </div>
          ) : (
            <div className="flex justify-center gap-1">
              <button
                type="button"
                onClick={() => startEdit(c)}
                className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50"
                title="Sửa tên"
              >
                <Icon name="edit" size={18} />
              </button>
              <button
                type="button"
                onClick={() => onDeleteClick(c)}
                className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50"
                title="Xóa nhóm chi phí"
              >
                <Icon name="delete" size={18} />
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-600">Danh sách nhóm chi phí</span>
        <Button
          variant="outline"
          size="sm"
          onClick={refetch}
          disabled={loading}
          className="flex items-center gap-1.5"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Làm mới
        </Button>
      </div>
      <Table
        columns={tableColumns}
        data={categories}
        loading={loading}
        emptyMessage="Chưa có nhóm chi phí nào"
      />
    </div>
  );
};

export default ExpenseCategoryTable;
