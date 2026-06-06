/**
 * ReportModal - Popup báo cáo bài viết / bình luận.
 */
import React, { useState } from 'react';
import Icon from '../../../../shared/components/Icon';

const REASONS = [
  'Spam hoặc quảng cáo',
  'Nội dung không phù hợp',
  'Thông tin sai lệch / lừa đảo',
  'Quấy rối hoặc công kích',
  'Vi phạm bản quyền',
  'Lý do khác',
];

const ReportModal = ({ isOpen, onClose, target = 'bài viết' }) => {
  const [reason, setReason] = useState('');
  const [detail, setDetail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!reason) return;
    setSubmitted(true);
  };

  const handleClose = () => {
    setReason('');
    setDetail('');
    setSubmitted(false);
    onClose();
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50">
            <Icon name="check_circle" size={32} className="text-green-500" />
          </div>
          <h3 className="mb-2 text-lg font-bold text-slate-900">Đã gửi báo cáo</h3>
          <p className="mb-5 text-sm leading-relaxed text-slate-500">
            Cảm ơn bạn đã giúp chúng tôi duy trì môi trường diễn đàn lành mạnh. Chúng tôi sẽ xem xét{' '}
            {target} này trong thời gian sớm nhất.
          </p>
          <button
            type="button"
            onClick={handleClose}
            className="w-full rounded-xl bg-[#004785] py-2.5 text-sm font-bold text-white transition-colors hover:bg-black"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-900">Báo cáo {target}</h3>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <p className="text-sm text-slate-500">Vui lòng chọn lý do báo cáo:</p>

          <div className="space-y-2">
            {REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-all ${
                  reason === r
                    ? 'border-[#004785] bg-blue-50 text-[#004785]'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500">Mô tả thêm (không bắt buộc)</label>
            <textarea
              className="min-h-[80px] w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-[#004785] focus:ring-0"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Nhập thêm chi tiết nếu cần..."
            />
          </div>
        </div>

        <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!reason}
            className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Gửi báo cáo
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
