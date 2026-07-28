import React, { useState } from 'react';
import Icon from '../../../../shared/components/Icon';

const HandleViolationModal = ({ isOpen, onClose, reportData, onConfirm }) => {
  const [penaltyType, setPenaltyType] = useState('hide_post');
  const [note, setNote] = useState('');

  if (!isOpen || !reportData) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    onConfirm({
      targetId: reportData.targetId,
      penaltyType,
      note,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl dark:border-[#333333] dark:bg-[#0f0f0f]">
        <div className="flex items-center justify-between border-b border-error-container pb-3">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-500">
            <Icon name="gavel" size={20} />
            <h3 className="text-base font-bold">Xử lý vi phạm</h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 dark:text-[#666666] dark:hover:text-[#e5e5e5]"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="rounded-md bg-red-50 p-3 text-sm dark:bg-red-900/20">
            <p className="font-semibold text-slate-900 dark:text-[#e5e5e5]">
              Đối tượng xử phạt:{' '}
              <span className="text-red-600 dark:text-red-500">
                {reportData.targetName}
              </span>
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-[#999999]">
              Log ID: {reportData.id}
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-[#999999]">
              Hình thức xử lý
            </label>

            <select
              value={penaltyType}
              onChange={(e) => setPenaltyType(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white p-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-error dark:border-[#333333] dark:bg-[#0f0f0f] dark:text-[#e5e5e5]"
            >
              <option value="hide_post">
                Chỉ ẩn bài viết vi phạm 
              </option>
              <option value="suspend_3_days">
                Ẩn bài viết và đình chỉ tài khoản 3 ngày
              </option>
              <option value="ban_permanent">
                Khóa tài khoản vĩnh viễn 
              </option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-[#999999]">
              Ghi chú kiểm duyệt 
            </label>

            <textarea
              required
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white p-2.5 text-sm text-slate-900 outline-none focus:border-error dark:border-[#333333] dark:bg-[#0f0f0f] dark:text-[#e5e5e5]"
              placeholder="Nhập lý do xử phạt..."
              rows={3}
            />
          </div>

          <div className="flex items-start gap-2 rounded-md bg-slate-50 p-3 text-xs leading-relaxed text-slate-500 dark:bg-[#1a1a1a] dark:text-[#999999]">
            <Icon
              name="info"
              size={14}
              className="mt-0.5 shrink-0 text-secondary"
            />

            <span>
              <strong>BR-54:</strong> Hệ thống sẽ áp dụng đối với
              bài đăng để phục vụ công tác thanh tra khi có khiếu nại.
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:text-[#999999] dark:hover:bg-[#272727]"
            >
              Hủy
            </button>

            <button
              type="submit"
              className="rounded-md bg-error px-4 py-2 text-sm font-bold text-on-error hover:bg-on-error-container"
            >
              Thực thi xử phạt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HandleViolationModal;