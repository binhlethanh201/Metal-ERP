import React, { useState } from 'react';
import Icon from '../../../../shared/components/Icon';

const BroadcastForm = ({ onBroadcast }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetScope, setTargetScope] = useState('all');
  const [isUrgent, setIsUrgent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Exception Kiểm tra rỗng và độ dài
    if (!title.trim() || !content.trim()) {
      alert('[MSG37] Lỗi: Tiêu đề hoặc nội dung thông báo không được để trống.');
      return;
    }
    if (content.length > 4000) {
      alert('[MSG37] Lỗi: Vượt quá giới hạn bộ đệm (Max 4000 characters).');
      return;
    }

    onBroadcast({ title, content, targetScope, isUrgent });

    // Reset form sau khi gửi thành công
    setTitle('');
    setContent('');
    setIsUrgent(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase text-on-surface-variant">
          Soạn Thảo Thông Báo Mới
        </h3>
        {isUrgent && (
          <span className="flex items-center gap-1 rounded bg-error-container px-2 py-1 text-[10px] font-bold text-error">
            <Icon name="alert_triangle" size={12} /> CHẾ ĐỘ KHẨN CẤP
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-on-surface">
            Tiêu đề thông báo
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhập chủ đề ngắn gọn..."
            className="w-full rounded-md border border-outline-variant bg-surface-container-lowest p-2.5 text-sm font-medium text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-on-surface">
            Đối tượng nhận tin
          </label>
          <select
            value={targetScope}
            onChange={(e) => setTargetScope(e.target.value)}
            className="w-full rounded-md border border-outline-variant bg-surface-container-low p-2.5 text-sm font-medium text-on-surface outline-none focus:border-primary focus:bg-surface-container-lowest"
          >
            <option value="all">Tất cả người dùng (All Users)</option>
            <option value="owners">Chỉ hiển thị cho Chủ Shop (Partner Owners)</option>
            <option value="staff">Chỉ hiển thị cho Nhân sự Nội bộ (System Staff)</option>
          </select>
        </div>

        <div>
          <div className="mb-1 flex items-end justify-between">
            <label className="block text-sm font-semibold text-on-surface">Nội dung văn bản</label>
            <span
              className={`font-mono text-[10px] font-bold ${content.length > 3900 ? 'text-error' : 'text-on-surface-variant'}`}
            >
              {content.length} / 4000
            </span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nhập nội dung chi tiết. Hỗ trợ ngắt dòng trực tiếp..."
            rows="5"
            className="w-full resize-y rounded-md border border-outline-variant bg-surface-container-lowest p-2.5 text-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="rounded-md border border-outline-variant bg-surface-container-low p-3">
          <div className="flex items-start gap-3">
            <div className="pt-0.5">
              <input
                type="checkbox"
                id="urgentCheck"
                checked={isUrgent}
                onChange={() => setIsUrgent(!isUrgent)}
                className="h-4 w-4 cursor-pointer rounded border-outline-variant accent-error"
              />
            </div>
            <label
              htmlFor="urgentCheck"
              className="cursor-pointer text-xs leading-relaxed text-on-surface-variant"
            >
              <span className="mb-0.5 block text-sm font-bold text-error">
                Phát tin KHẨN CẤP (Override Do-Not-Disturb)
              </span>
              <strong>BR-48:</strong> Hệ thống sẽ ép hiển thị popup ở chính giữa màn hình của tất cả
              Client đang online, ghi đè mọi cài đặt ẩn thông báo.
            </label>
          </div>
        </div>

        <div className="pt-2 text-right">
          <button
            type="submit"
            className={`flex w-full items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-bold text-white shadow-sm transition-all active:scale-95 sm:inline-flex sm:w-auto ${
              isUrgent
                ? 'bg-error hover:bg-on-error-container hover:shadow-error/30'
                : 'bg-primary hover:bg-on-primary-fixed-variant'
            }`}
          >
            <Icon name="send" size={16} /> {isUrgent ? 'PHÁT LỆNH KHẨN CẤP' : 'PHÁT THÔNG BÁO'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default BroadcastForm;
