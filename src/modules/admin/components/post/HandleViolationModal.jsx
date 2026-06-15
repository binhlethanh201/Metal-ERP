import React, { useState } from 'react';
import Icon from '../../../../shared/components/Icon';

const HandleViolationModal = ({ isOpen, onClose, reportData, onConfirm }) => {
  const [penaltyType, setPenaltyType] = useState('hide_post');
  const [note, setNote] = useState('');

  if (!isOpen || !reportData) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({ targetId: reportData.targetId, penaltyType, note });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-outline-variant bg-surface-container-lowest p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-error-container pb-3">
          <div className="flex items-center gap-2 text-error">
            <Icon name="gavel" size={20} />
            <h3 className="text-base font-bold">Xử lý Vi phạm</h3>
          </div>
          <button onClick={onClose} className="text-outline hover:text-on-surface">
            <Icon name="x" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="rounded-md bg-error-container/20 p-3 text-sm">
            <p className="font-semibold text-on-surface">
              Đối tượng phạt: <span className="text-error">{reportData.targetName}</span>
            </p>
            <p className="mt-1 text-xs text-on-surface-variant">Log ID: {reportData.id}</p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-on-surface-variant">
              Hình thức xử lý
            </label>
            <select
              value={penaltyType}
              onChange={(e) => setPenaltyType(e.target.value)}
              className="w-full rounded-md border border-outline-variant bg-surface-container-lowest p-2.5 text-sm font-semibold text-on-surface outline-none focus:border-error"
            >
              <option value="hide_post">Chỉ ẩn bài viết vi phạm (Soft-Delete)</option>
              <option value="suspend_3_days">Ẩn bài & Đình chỉ tài khoản 3 ngày</option>
              <option value="ban_permanent">Khóa tài khoản vĩnh viễn (Ban)</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-on-surface-variant">
              Ghi chú kiểm duyệt (Audit Log)
            </label>
            <textarea
              required
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-md border border-outline-variant p-2.5 text-sm outline-none focus:border-error"
              placeholder="Nhập lý do xử phạt..."
              rows="3"
            />
          </div>

          <div className="flex items-start gap-2 rounded-md bg-surface-container-low p-3 text-xs leading-relaxed text-on-surface-variant">
            <Icon name="info" size={14} className="mt-0.5 shrink-0 text-secondary" />
            <span>
              <strong>BR-54:</strong> Hệ thống sẽ áp dụng Soft-delete đối với bài đăng để phục vụ
              công tác thanh tra khi có khiếu nại.
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="rounded-md bg-error px-4 py-2 text-sm font-bold text-on-error hover:bg-on-error-container"
            >
              Thực thi Lệnh Phạt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HandleViolationModal;
