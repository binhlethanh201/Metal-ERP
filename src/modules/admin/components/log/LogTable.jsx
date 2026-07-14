import React from 'react';

const LogTable = ({ logs, onRowClick }) => {
  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
      <div className="min-h-[400px] overflow-x-auto">
        <table className="w-full text-left text-xs text-on-surface">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-low text-[10px] uppercase tracking-wider text-on-surface-variant">
              <th className="px-4 py-3 font-bold">Thời gian (Timestamp)</th>
              <th className="px-4 py-3 font-bold">Mức độ (Level)</th>
              <th className="px-4 py-3 font-bold">Nguồn (Source)</th>
              <th className="px-4 py-3 font-bold">Hành động (Action)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {logs.map((log) => (
              <tr
                key={log.logId}
                onClick={() => onRowClick?.(log)}
                className="cursor-pointer transition-colors hover:bg-surface-container-low"
              >
                <td className="whitespace-nowrap px-4 py-3 text-[11px] font-medium text-on-surface-variant">
                  {log.timestamp
                    ? new Date(log.timestamp).toLocaleString('vi-VN', { hour12: false })
                    : '—'}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-sm px-2 py-1 text-[10px] font-bold ${
                      (log.level || 'INFO').toUpperCase() === 'ERROR'
                        ? 'bg-error-container text-error'
                        : (log.level || 'INFO').toUpperCase() === 'WARN'
                          ? 'bg-secondary-container text-on-secondary-container'
                          : 'bg-surface-container-high text-on-surface'
                    }`}
                  >
                    {(log.level || 'INFO').toUpperCase()}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-bold text-primary">
                  {log.source || '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="font-bold">{log.action}</div>
                  <div
                    className="mt-0.5 max-w-xl truncate text-[11px] text-on-surface-variant"
                    title={log.description}
                  >
                    {log.description}
                  </div>
                </td>
              </tr>
            ))}

            {logs.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="px-4 py-12 text-center font-sans text-sm font-semibold text-outline-variant"
                >
                  Không tìm thấy nhật ký hoạt động nào khớp với bộ lọc.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LogTable;
