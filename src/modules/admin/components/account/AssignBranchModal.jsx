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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-[#333333] dark:bg-[#0f0f0f]">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-[#333333]">
          <h3 className="text-base font-bold text-slate-900 dark:text-[#e5e5e5]">Gán cửa hàng</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:text-[#666666] dark:hover:text-[#e5e5e5]">
            <Icon name="close" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <p className="text-xs text-slate-500 dark:text-[#999999]">
            Chọn cửa hàng cho người dùng{' '}
            <strong className="text-slate-900 dark:text-[#e5e5e5]">{user?.fullName || user?.email}</strong>
          </p>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-[#999999]">
              Danh sách cửa hàng
            </label>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-transparent p-2.5 text-xs text-slate-900 outline-none transition-colors focus:border-[#004785] dark:border-[#333333] dark:text-[#e5e5e5] dark:focus:border-blue-500 [&>option]:bg-white dark:[&>option]:bg-[#0f0f0f]"
            >
              <option value="">-- Chọn cửa hàng --</option>
              {branches.map((b) => (
                <option key={b.branchId} value={b.branchId}>
                  {b.branchName} - {b.managerFullName || b.managerEmail || 'Chưa gắn chủ'}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-[#333333]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-[#272727] dark:text-[#e5e5e5] dark:hover:bg-[#333333]"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#004785] px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
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