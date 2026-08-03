import React, { useState, useEffect } from 'react';
import Icon from '../../../../shared/components/Icon';

const AssignBranchModal = ({ isOpen, onClose, onSave, branches, user }) => {
  const [selectedBranchId, setSelectedBranchId] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      setSelectedBranchId(user.defaultBranchId || '');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedBranchId) {
      alert('Vui lòng chọn cửa hàng!');
      return;
    }
    onSave(user.userId, selectedBranchId);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#0f0f0f] p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#333333] pb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-[#e5e5e5]">
            Gán Cửa Hàng
          </h3>
          <button onClick={onClose} className="text-slate-400 dark:text-[#666666] hover:text-slate-900 dark:text-[#e5e5e5]">
            <Icon name="x" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <p className="text-xs text-slate-500 dark:text-[#999999]">
            Chọn một cửa hàng để gán cho người dùng <strong className="text-slate-900 dark:text-[#e5e5e5]">{user?.fullName || user?.email}</strong>.
          </p>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-[#999999]">
              Danh sách Cửa Hàng
            </label>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="w-full rounded border border-slate-200 dark:border-[#333333] p-2 text-xs outline-none focus:border-[#004785] bg-transparent text-slate-900 dark:text-[#e5e5e5] [&>option]:bg-white dark:[&>option]:bg-[#0f0f0f]"
            >
              <option value="">-- Chọn cửa hàng --</option>
              {branches.map((b) => (
                <option key={b.branchId} value={b.branchId}>
                  {b.branchName}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-[#333333] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded px-4 py-2 text-xs font-bold text-slate-500 dark:text-[#999999] hover:bg-slate-100 dark:hover:bg-[#272727]"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="rounded bg-[#004785] px-4 py-2 text-xs font-bold text-white hover:bg-blue-800"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignBranchModal;
