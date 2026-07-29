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
      alert('ÄÃ£ copy toÃ n bá»™ thÃ´ng tin log vÃ o clipboard.');
    });
  };

  const formatTimestamp = (ts) =>
    ts ? new Date(ts).toLocaleString('vi-VN', { hour12: false }) : 'â€”';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="w-full max-w-3xl rounded-lg border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#0f0f0f] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#333333] px-6 py-4">
          <div className="flex items-center gap-2 text-slate-900 dark:text-[#e5e5e5]">
            <Icon name="terminal" size={20} />
            <h3 className="text-base font-bold">Chi tiáº¿t Nháº­t kÃ½: {log.logId}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 dark:text-[#666666] hover:text-slate-900 dark:text-[#e5e5e5]">
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">
          {/* Section 1: Metadata */}
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#999999]">
              Thông tin
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md bg-slate-50 dark:bg-[#1a1a1a] p-3">
                <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-[#999999]">
                  Thời gian
                </p>
                <p className="mt-1 font-mono text-sm font-bold text-slate-900 dark:text-[#e5e5e5]">
                  {formatTimestamp(log.timestamp)}
                </p>
              </div>
              <div className="rounded-md bg-slate-50 dark:bg-[#1a1a1a] p-3">
                <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-[#999999]">Mức độ</p>
                <span
                  className={`mt-1 inline-block rounded-sm px-1.5 py-0.5 text-xs font-bold ${
                    log.level === 'ERROR'
                      ? 'bg-error text-on-error'
                      : log.level === 'WARN'
                        ? 'bg-secondary-container text-on-secondary-container'
                        : 'bg-tertiary-container text-on-tertiary-container'
                  }`}
                >
                  {log.level || 'INFO'}
                </span>
              </div>
              <div className="rounded-md bg-slate-50 dark:bg-[#1a1a1a] p-3">
                <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-[#999999]">
                  Nguồn
                </p>
                <p className="mt-1 font-mono text-sm font-bold text-[#004785] dark:text-blue-400">{log.source || 'â€”'}</p>
              </div>
              <div className="rounded-md bg-slate-50 dark:bg-[#1a1a1a] p-3">
                <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-[#999999]">
                  Hành động
                </p>
                <p className="mt-1 font-mono text-sm font-bold text-slate-900 dark:text-[#e5e5e5]">{log.action}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Description (Message) */}
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#999999]">
              Mô tả
            </h4>
            <div className="rounded-md border border-slate-200 dark:border-[#333333] bg-slate-900 dark:bg-black p-4">
              <p className="break-words font-mono text-sm leading-relaxed text-slate-100 dark:text-white">
                {log.description || 'â€”'}
              </p>
            </div>
          </div>

          {/* Section 3: Environment */}
          {(log.userName || log.ipAddress || log.userAgent) && (
            <div>
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#999999]">
                Môi trường
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md bg-slate-50 dark:bg-[#1a1a1a] p-3">
                  <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-[#999999]">
                    Người dùng
                  </p>
                  <p className="mt-1 font-mono text-sm font-bold text-slate-900 dark:text-[#e5e5e5]">
                    {log.userName || 'hệ thống'}
                  </p>
                </div>
                <div className="rounded-md bg-slate-50 dark:bg-[#1a1a1a] p-3">
                  <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-[#999999]">
                    Địa chỉ IP
                  </p>
                  <p className="mt-1 font-mono text-sm font-bold text-slate-900 dark:text-[#e5e5e5]">
                    {log.ipAddress || 'N/A'}
                  </p>
                </div>
                {log.userAgent && (
                  <div className="col-span-2 rounded-md bg-slate-50 dark:bg-[#1a1a1a] p-3">
                    <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-[#999999]">
                      Trình duyệt
                    </p>
                    <p className="mt-1 truncate font-mono text-[11px] text-slate-900 dark:text-[#e5e5e5]">
                      {log.userAgent}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-[#333333] px-6 py-4">
          <button
            onClick={handleCopyAll}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-[#333333] px-4 py-2 text-xs font-bold text-slate-500 dark:text-[#999999] hover:bg-slate-100 dark:bg-[#272727]"
          >
            <Icon name="copy" size={14} /> Sao chép
          </button>
          <button
            onClick={onClose}
            className="rounded-md border border-slate-200 dark:border-[#333333] px-5 py-2 text-xs font-bold text-slate-500 dark:text-[#999999] hover:bg-slate-100 dark:bg-[#272727]"
          >
            ÄÃ³ng
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogDetailModal;

