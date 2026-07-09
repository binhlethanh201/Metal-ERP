import React from 'react';
import { Button } from '../../../../../shared/components/Button';
import { Badge } from '../../../../../shared/components/Badge';
import { Table } from '../../../../../shared/components/Table';
import { Input } from '../../../../../shared/components/Input';
import { Check, X, Edit, Trash2, RefreshCw } from 'lucide-react';

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
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSaveEdit(c.categoryId)}
                className="flex items-center gap-1 !border-none !bg-emerald-50 text-emerald-600 hover:!bg-emerald-100"
                title="Lưu"
              >
                <Check size={14} /> Lưu
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingId(null)}
                className="flex items-center gap-1 !border-none !bg-slate-100 text-slate-600 hover:!bg-slate-200"
                title="Hủy sửa"
              >
                <X size={14} /> Hủy
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => startEdit(c)}
                className="flex items-center gap-1 !border-none !bg-blue-50 text-blue-600 hover:!bg-blue-100"
                title="Sửa tên"
              >
                <Edit size={14} /> Sửa
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDeleteClick(c)}
                className="flex items-center gap-1 !border-none !bg-red-50 text-red-600 hover:!bg-red-100"
                title="Xóa nhóm chi phí"
              >
                <Trash2 size={14} /> Xóa
              </Button>
            </>
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
