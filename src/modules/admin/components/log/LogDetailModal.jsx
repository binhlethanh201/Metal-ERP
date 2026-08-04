import React from 'react';
import Icon from '../../../../shared/components/Icon';

const LogDetailModal = ({ log, onClose }) => {
  if (!log) return null;

  const handleCopyAll = () => {
    const text = [
      `ID: ${log.logId}`,
      `Thời gian: ${log.timestamp}`,
      `Mức độ: ${log.level}`,
      `Nguồn: ${log.source}`,
      `Hành động: ${log.action}`,
      `Mô tả: ${log.description}`,
      log.ipAddress ? `IP: ${log.ipAddress}` : '',
      log.userAgent ? `Trình duyệt: ${log.userAgent}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(text).then(() => {
      alert('Đã copy toàn bộ thông tin log vào clipboard.');
    });
  };

  const formatTimestamp = (ts) =>
    ts ? new Date(ts).toLocaleString('vi-VN', { hour12: false }) : '—';

  const levelBadgeClass = (level) => {
    switch ((level || 'INFO').toUpperCase()) {
      case 'ERROR':
        return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'WARN':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      default:
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div
        className="w-full max-w-3xl rounded-xl border border-slate-200 bg-white shadow-xl dark:border-[#333333] dark:bg-[#0f0f0f]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-[#333333]">
          <div className="flex items-center gap-2 text-slate-900 dark:text-[#e5e5e5]">
            <Icon name="terminal" size={20} className="text-[#004785] dark:text-blue-400" />
            <h3 className="text-base font-bold">Chi tiết Nhật ký</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:text-[#666666] dark:hover:text-[#e5e5e5]">
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto px-5 py-5">
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#999999]">
              Thông tin
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-[#1a1a1a]">
                <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-[#999999]">Thời gian</p>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-[#e5e5e5]">
                  {formatTimestamp(log.timestamp)}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-[#1a1a1a]">
                <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-[#999999]">Mức độ</p>
                <span className={`mt-1 inline-block rounded-full px-2.5 py-1 text-[10px] font-bold ${levelBadgeClass(log.level)}`}>
                  {log.level || 'INFO'}
                </span>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-[#1a1a1a]">
                <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-[#999999]">Nguồn</p>
                <p className="mt-1 text-sm font-bold text-[#004785] dark:text-blue-400">{log.source || '—'}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-[#1a1a1a]">
                <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-[#999999]">Hành động</p>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-[#e5e5e5]">{log.action || '—'}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#999999]">
              Mô tả
            </h4>
            <div className="rounded-lg border border-slate-200 bg-slate-900 p-4 dark:border-[#333333] dark:bg-black">
              <p className="break-words text-sm leading-relaxed text-slate-100 dark:text-white">
                {log.description || '—'}
              </p>
            </div>
          </div>

          {(log.userName || log.ipAddress || log.userAgent) && (
            <div>
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#999999]">
                Môi trường
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-[#1a1a1a]">
                  <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-[#999999]">Người dùng</p>
                  <p className="mt-1 text-sm font-bold text-slate-900 dark:text-[#e5e5e5]">
                    {log.userName || 'Hệ thống'}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-[#1a1a1a]">
                  <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-[#999999]">Địa chỉ IP</p>
                  <p className="mt-1 text-sm font-bold text-slate-900 dark:text-[#e5e5e5]">
                    {log.ipAddress || 'N/A'}
                  </p>
                </div>
                {log.userAgent && (
                  <div className="col-span-2 rounded-lg bg-slate-50 p-3 dark:bg-[#1a1a1a]">
                    <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-[#999999]">Trình duyệt</p>
                    <p className="mt-1 truncate text-[11px] text-slate-900 dark:text-[#e5e5e5]">
                      {log.userAgent}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4 dark:border-[#333333]">
          <button
            onClick={handleCopyAll}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 dark:border-[#333333] dark:text-[#b3b3b3] dark:hover:bg-[#272727]"
          >
            <Icon name="copy" size={14} /> Sao chép
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-100 px-5 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-[#272727] dark:text-[#e5e5e5] dark:hover:bg-[#333333]"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogDetailModal;