import React, { useState } from 'react';
import { Modal } from '../../../../../shared/components/Modal';
import { Button } from '../../../../../shared/components/Button';
import { Badge } from '../../../../../shared/components/Badge';
import { Input } from '../../../../../shared/components/Input';
import { Edit3, Trash2 } from 'lucide-react';

const ExpenseCategoryDetailModal = ({
  isOpen,
  onClose,
  category,
  onSaveEdit,
  onDelete,
}) => {
  const [editingName, setEditingName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (isOpen && category) {
      setEditingName(category.categoryName || '');
      setIsEditing(false);
    }
  }, [isOpen, category]);

  const handleSave = async () => {
    if (!editingName.trim() || !category) return;
    setSaving(true);
    try {
      await onSaveEdit(category.categoryId, editingName.trim());
      setIsEditing(false);
      onClose();
    } catch (err) {
      // error handled by parent
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!category) return;
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa nhóm chi phí "${category.categoryName}"?\n(Chỉ xóa được khi không còn phiếu PENDING nào dùng nhóm này)`
    );
    if (!confirmed) return;
    try {
      await onDelete(category.categoryId);
      onClose();
    } catch (err) {
      // error handled by parent
    }
  };

  const detailTitle = category ? (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-lg font-bold text-slate-800">
        Chi tiết nhóm chi phí
      </div>
    </div>
  ) : (
    'Chi tiết nhóm chi phí'
  );

  const modalFooter = (
    <div className="flex w-full items-center justify-between gap-3">
      <Button variant="secondary" onClick={onClose} disabled={saving}>
        Đóng
      </Button>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="flex items-center gap-1 border-red-200 text-red-600 hover:bg-red-50"
          onClick={handleDelete}
          disabled={saving}
        >
          <Trash2 size={16} /> Xóa
        </Button>
        {isEditing ? (
          <>
            <Button variant="secondary" onClick={() => setIsEditing(false)} disabled={saving}>
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              loading={saving}
              disabled={saving || !editingName.trim()}
            >
              Lưu
            </Button>
          </>
        ) : (
          <Button
            variant="primary"
            className="flex items-center gap-1"
            onClick={() => setIsEditing(true)}
          >
            <Edit3 size={16} /> Sửa tên
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={detailTitle} size="md" footer={modalFooter}>
      {category ? (
        <div className="space-y-5">
          {isEditing ? (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Tên nhóm chi phí
              </label>
              <Input
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                className="w-full"
                autoFocus
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 rounded-lg border border-slate-200 p-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <div className="text-xs font-medium uppercase text-slate-400">Tên nhóm chi phí</div>
                <div className="mt-0.5 text-base font-bold text-slate-800">
                  {category.categoryName}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium uppercase text-slate-400">Số phiếu</div>
                <div className="mt-0.5 text-sm font-semibold text-slate-800">
                  {category.voucherCount ?? 0}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium uppercase text-slate-400">Đang chờ</div>
                <div className="mt-0.5">
                  {category.pendingCount > 0 ? (
                    <Badge variant="warning">{category.pendingCount}</Badge>
                  ) : (
                    <span className="text-sm text-slate-500">0</span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium uppercase text-slate-400">Trạng thái</div>
                <div className="mt-0.5">
                  {category.isActive ? (
                    <Badge variant="success" size="sm">HOẠT ĐỘNG</Badge>
                  ) : (
                    <Badge variant="secondary" size="sm">ĐÃ ẨN</Badge>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="py-6 text-center text-sm text-slate-400">Không có dữ liệu</div>
      )}
    </Modal>
  );
};

export default ExpenseCategoryDetailModal;
