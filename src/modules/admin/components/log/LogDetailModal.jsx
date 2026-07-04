import React from 'react';
import Icon from '../../../../shared/components/Icon';

const LogDetailModal = ({ log, onClose }) => {
  if (!log) return null;

  const handleCopyAll = () => {
    const text = [
      `ID: ${log.logId}`,
      `Time: ${log.timestamp}`,
      `Level: ${log.level}`,
      `Source: ${log.source}`,
      `Action: ${log.action}`,
      `Message: ${log.description}`,
      log.ipAddress ? `IP: ${log.ipAddress}` : '',
      log.userAgent ? `UserAgent: ${log.userAgent}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(text).then(() => {
      alert('Đã copy toàn bộ thông tin log vào clipboard.');
    });
  };

  const formatTimestamp = (ts) =>
    ts ? new Date(ts).toLocaleString('vi-VN', { hour12: false }) : '—';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm">
      <div
        className="w-full max-w-3xl rounded-lg border border-outline-variant bg-surface-container-lowest shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4">
          <div className="flex items-center gap-2 text-on-surface">
            <Icon name="terminal" size={20} />
            <h3 className="text-base font-bold">Chi tiết Nhật ký: {log.logId}</h3>
          </div>
          <button onClick={onClose} className="text-outline hover:text-on-surface">
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">
          {/* Section 1: Metadata */}
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Metadata
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md bg-surface-container-low p-3">
                <p className="text-[10px] font-semibold uppercase text-on-surface-variant">
                  Timestamp
                </p>
                <p className="mt-1 font-mono text-sm font-bold text-on-surface">
                  {formatTimestamp(log.timestamp)}
                </p>
              </div>
              <div className="rounded-md bg-surface-container-low p-3">
                <p className="text-[10px] font-semibold uppercase text-on-surface-variant">Level</p>
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
              <div className="rounded-md bg-surface-container-low p-3">
                <p className="text-[10px] font-semibold uppercase text-on-surface-variant">
                  Source
                </p>
                <p className="mt-1 font-mono text-sm font-bold text-primary">{log.source || '—'}</p>
              </div>
              <div className="rounded-md bg-surface-container-low p-3">
                <p className="text-[10px] font-semibold uppercase text-on-surface-variant">
                  Action
                </p>
                <p className="mt-1 font-mono text-sm font-bold text-on-surface">{log.action}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Description (Message) */}
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Description
            </h4>
            <div className="rounded-md border border-outline-variant bg-inverse-surface p-4">
              <p className="break-words font-mono text-sm leading-relaxed text-inverse-on-surface">
                {log.description || '—'}
              </p>
            </div>
          </div>

          {/* Section 3: Environment */}
          {(log.userName || log.ipAddress || log.userAgent) && (
            <div>
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Environment
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md bg-surface-container-low p-3">
                  <p className="text-[10px] font-semibold uppercase text-on-surface-variant">
                    User
                  </p>
                  <p className="mt-1 font-mono text-sm font-bold text-on-surface">
                    {log.userName || 'system'}
                  </p>
                </div>
                <div className="rounded-md bg-surface-container-low p-3">
                  <p className="text-[10px] font-semibold uppercase text-on-surface-variant">
                    IP Address
                  </p>
                  <p className="mt-1 font-mono text-sm font-bold text-on-surface">
                    {log.ipAddress || 'N/A'}
                  </p>
                </div>
                {log.userAgent && (
                  <div className="col-span-2 rounded-md bg-surface-container-low p-3">
                    <p className="text-[10px] font-semibold uppercase text-on-surface-variant">
                      User Agent
                    </p>
                    <p className="mt-1 truncate font-mono text-[11px] text-on-surface">
                      {log.userAgent}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-outline-variant px-6 py-4">
          <button
            onClick={handleCopyAll}
            className="flex items-center gap-1.5 rounded-md border border-outline-variant px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high"
          >
            <Icon name="copy" size={14} /> Copy to clipboard
          </button>
          <button
            onClick={onClose}
            className="rounded-md border border-outline-variant px-5 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogDetailModal;
