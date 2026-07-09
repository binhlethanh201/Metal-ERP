import React, { useEffect } from 'react';
import { Modal } from '../../../../../shared/components/Modal';
import { Button } from '../../../../../shared/components/Button';
import { Input } from '../../../../../shared/components/Input';
import { Save } from 'lucide-react';

const CreateExpenseCategoryModal = ({
  isOpen,
  onClose,
  newName,
  setNewName,
  onCreate,
  creating,
  actionError,
}) => {
  // Reset tên nhóm khi mở modal
  useEffect(() => {
    if (isOpen) {
      setNewName('');
    }
  }, [isOpen, setNewName]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo nhóm chi phí mới"
      size="md"
      footer={
        <div className="flex w-full items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={creating}>
            Hủy
          </Button>
          <Button
            type="submit"
            form="create-expense-category-form"
            variant="primary"
            disabled={creating || !newName.trim()}
            loading={creating}
            className="flex items-center gap-2"
          >
            {!creating && <Save size={18} />}
            {creating ? 'Đang tạo...' : 'Tạo nhóm'}
          </Button>
        </div>
      }
    >
      <form id="create-expense-category-form" onSubmit={onCreate} className="space-y-4">
        {actionError && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {actionError}
          </div>
        )}

        <Input
          label="Tên nhóm chi phí"
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="VD: Chi phí điện nước..."
          autoFocus
          required
        />
      </form>
    </Modal>
  );
};

export default CreateExpenseCategoryModal;
