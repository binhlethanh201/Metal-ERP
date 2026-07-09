import React, { useState } from 'react';
import Icon from '../../../shared/components/Icon';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Badge } from '../../../shared/components/Badge';
import { Table } from '../../../shared/components/Table';
import { Input } from '../../../shared/components/Input';
import { useExpenseCategory } from '../hooks/useExpenseCategory';

const ExpenseCategoryManagement = () => {
  const { categories, loading, error, handleCreate, handleUpdate, handleDelete, refetch } =
    useExpenseCategory();

  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [actionError, setActionError] = useState('');

  const onCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setActionError('');
    try {
      await handleCreate(newName.trim());
      setNewName('');
    } catch (err) {
      setActionError(err?.data?.message || err?.message || 'Tạo nhóm chi phí thất bại.');
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (category) => {
    setEditingId(category.categoryId);
    setEditingName(category.categoryName);
    setActionError('');
  };

  const onSaveEdit = async (id) => {
    if (!editingName.trim()) return;
    try {
      await handleUpdate(id, editingName.trim());
      setEditingId(null);
    } catch (err) {
      setActionError(err?.data?.message || err?.message || 'Cập nhật nhóm chi phí thất bại.');
    }
  };

  const onDeleteClick = async (category) => {
    if (
      !window.confirm(
        `Bạn có chắc muốn xóa nhóm chi phí "${category.categoryName}"? (Chỉ xóa được khi không còn phiếu PENDING nào dùng nhóm này)`
      )
    ) {
      return;
    }
    try {
      await handleDelete(category.categoryId);
    } catch (err) {
      const msg = err?.data?.message || err?.message || 'Xóa nhóm chi phí thất bại.';
      const extra = Array.isArray(err?.data?.errors) ? err.data.errors.join(' ') : '';
      alert(`${msg} ${extra}`.trim());
    }
  };

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
      header: 'Số phiếu',
      render: (val) => <div className="text-center">{val}</div>,
    },
    {
      key: 'pendingCount',
      header: 'Đang chờ',
      render: (val) => (
        <div className="text-center">{val > 0 ? <Badge variant="warning">{val}</Badge> : '0'}</div>
      ),
    },
    {
      key: 'isActive',
      header: 'Trạng thái',
      render: (val) => (
        <div className="text-center">
          {val ? (
            <Badge variant="success">HOẠT ĐỘNG</Badge>
          ) : (
            <Badge variant="secondary">ĐÃ ẨN</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (_, c) => (
        <div className="flex justify-end gap-2">
          {editingId === c.categoryId ? (
            <>
              <button
                onClick={() => onSaveEdit(c.categoryId)}
                className="rounded p-1.5 text-emerald-600 hover:bg-emerald-100"
                title="Lưu"
              >
                <Icon name="check" size={18} />
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="rounded p-1.5 text-slate-500 hover:bg-slate-100"
                title="Hủy sửa"
              >
                <Icon name="X" size={18} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => startEdit(c)}
                className="rounded p-1.5 text-blue-600 hover:bg-blue-100"
                title="Sửa tên"
              >
                <Icon name="edit" size={18} />
              </button>
              <button
                onClick={() => onDeleteClick(c)}
                className="rounded p-1.5 text-red-600 hover:bg-red-100"
                title="Xóa nhóm chi phí"
              >
                <Icon name="trash" size={18} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fade-in mt-2 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Nhóm Chi Phí</h1>
        <p className="mt-1 text-sm text-slate-600">
          Quản lý danh mục nhóm chi phí dùng để phân loại phiếu chi tiền.
        </p>
      </div>

      {(error || actionError) && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error || actionError}
        </div>
      )}

      <Card className="max-w-xl">
        <form onSubmit={onCreate} className="flex items-start gap-3">
          <div className="flex-1">
            <Input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Tên nhóm chi phí mới..."
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            disabled={creating}
            loading={creating}
            className="flex h-[42px] shrink-0 items-center gap-2"
          >
            {!creating && <Icon name="plus" size={18} />}
            Thêm
          </Button>
        </form>
      </Card>

      <Card padding="p-0" className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4">
          <span className="text-sm font-semibold text-slate-600">
            Tổng {categories.length} nhóm chi phí
          </span>
          <Button variant="outline" size="sm" onClick={refetch}>
            <span className="flex items-center gap-2">
              <Icon name="RefreshCw" size={16} /> Làm mới
            </span>
          </Button>
        </div>

        <Table
          columns={tableColumns}
          data={categories}
          loading={loading}
          emptyMessage="Chưa có nhóm chi phí nào"
          className="rounded-none border-none"
        />
      </Card>
    </div>
  );
};

export default ExpenseCategoryManagement;
