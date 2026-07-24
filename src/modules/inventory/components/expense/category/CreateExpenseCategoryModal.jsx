import React, { useEffect } from 'react';
import Icon from '../../../../../shared/components/Icon';
import { Modal } from '../../../../../shared/components/Modal';
import { Input } from '../../../../../shared/components/Input';

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
          <button
            type="button"
            onClick={onClose}
            disabled={creating}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            form="create-expense-category-form"
            disabled={creating || !newName.trim()}
            className="flex items-center gap-2 rounded-lg bg-[#004785] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-black disabled:opacity-50"
          >
            {creating ? (
              'Đang tạo...'
            ) : (
              <>
                <Icon name="save" size={18} />
                Tạo nhóm
              </>
            )}
          </button>
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
