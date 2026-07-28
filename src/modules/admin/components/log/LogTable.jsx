import React from 'react';

const LogTable = ({ logs, onRowClick }) => {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-[#333333] dark:bg-[#0f0f0f]">
      <div className="min-h-[400px] overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-900 dark:text-[#e5e5e5]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#999999]">
              <th className="px-4 py-3 font-bold">Thời gian </th>
              <th className="px-4 py-3 font-bold">Mức độ </th>
              <th className="px-4 py-3 font-bold">Người thực hiện </th>
              <th className="px-4 py-3 font-bold">Hành động </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 dark:divide-[#333333]">
            {logs.map((log) => (
              <tr
                key={log.logId}
                onClick={() => onRowClick?.(log)}
                className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-[#1a1a1a]"
              >
                <td className="whitespace-nowrap px-4 py-3 text-[11px] font-medium text-slate-500 dark:text-[#999999]">
                  {log.timestamp
                    ? new Date(log.timestamp).toLocaleString('vi-VN', {
                      hour12: false,
                    })
                    : '—'}
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`rounded-sm px-2 py-1 text-[10px] font-bold ${(log.level || 'INFO').toUpperCase() === 'ERROR'
                      ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-500'
                      : (log.level || 'INFO').toUpperCase() === 'WARN'
                        ? 'bg-secondary-container text-on-secondary-container'
                        : 'bg-slate-100 text-slate-900 dark:bg-[#272727] dark:text-[#e5e5e5]'
                      }`}
                  >
                    {(log.level || 'INFO').toUpperCase()}
                  </span>
                </td>

                <td className="whitespace-nowrap px-4 py-3 font-bold text-[#004785] dark:text-blue-400">
                  {log.source || '—'}
                </td>

                <td className="px-4 py-3">
                  <div className="font-bold">{log.action || '—'}</div>

                  <div
                    className="mt-0.5 max-w-xl truncate text-[11px] text-slate-500 dark:text-[#999999]"
                    title={log.description || ''}
                  >
                    {log.description || 'Không có mô tả'}
                  </div>
                </td>
              </tr>
            ))}

            {logs.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="px-4 py-12 text-center font-sans text-sm font-semibold text-slate-400 dark:text-[#666666]"
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