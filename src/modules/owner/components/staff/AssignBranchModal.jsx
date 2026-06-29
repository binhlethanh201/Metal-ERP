import React, { useState, useEffect } from 'react';
import Icon from '../../../../shared/components/Icon';

const AssignBranchModal = ({ isOpen, onClose, staff, branches, onSave }) => {
  const [selectedBranchId, setSelectedBranchId] = useState('');

  // Reset dropdown mỗi khi mở lại modal
  useEffect(() => {
    if (isOpen && staff) {
      setSelectedBranchId(''); // Luôn bắt người dùng chọn mới
    }
  }, [isOpen, staff]);

  if (!isOpen || !staff) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedBranchId) {
      alert('Vui lòng chọn chi nhánh muốn điều chuyển tới!');
      return;
    }
    if (selectedBranchId === staff.branchId) {
      alert('Nhân viên ĐANG làm việc tại chi nhánh này. Vui lòng chọn một chi nhánh khác!');
      return;
    }

    onSave(staff.userId, selectedBranchId);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-800">Điều chuyển chi nhánh</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
          >
            <Icon name="close" size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <p className="mb-4 text-sm text-slate-600">
              Nhân sự: <strong className="text-slate-800">{staff.fullName}</strong>
              <br />
              Đang làm việc tại:{' '}
              <span className="font-semibold text-blue-700">{staff.branchName || 'Chưa gán'}</span>
            </p>

            <label className="mb-1.5 block text-sm font-bold text-slate-700">
              Chọn chi nhánh mới đến <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
            >
              <option value="">-- Vui lòng chọn chi nhánh --</option>
              {branches.map((b) => (
                <option
                  key={b.branchId}
                  value={b.branchId}
                  disabled={b.branchId === staff.branchId}
                >
                  {b.branchCode} - {b.branchName}{' '}
                  {b.branchId === staff.branchId ? '(Hiện tại)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-orange-600"
            >
              <Icon name="swap_horiz" size={18} /> Gán chi nhánh
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignBranchModal;
