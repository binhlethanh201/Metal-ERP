import React from 'react';

const levelClass = (level) => {
  switch ((level || 'INFO').toUpperCase()) {
    case 'ERROR':
      return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    case 'WARN':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    default:
      return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  }
};

const LogTable = ({ logs, onRowClick }) => {
  return (
    <table className="w-full text-left text-xs text-slate-900 dark:text-[#e5e5e5]">
      <thead>
        <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:border-[#333333] dark:text-[#999999]">
          <th className="px-4 py-3">Thời gian</th>
          <th className="px-4 py-3">Mức độ</th>
          <th className="px-4 py-3">Họ Tên</th>
          <th className="px-4 py-3">Cửa Hàng</th>
          <th className="px-4 py-3">Vai trò & Hành động</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-100 dark:divide-[#333333]">
        {logs.map((log) => (
          <tr
            key={log.logId}
            onClick={() => onRowClick?.(log)}
            className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-[#272727]"
          >
            <td className="whitespace-nowrap px-4 py-3 text-[11px] text-slate-500 dark:text-[#999999]">
              {log.timestamp
                ? new Date(log.timestamp).toLocaleString('vi-VN', { hour12: false })
                : '—'}
            </td>

            <td className="px-4 py-3">
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${levelClass(log.level)}`}>
                {(log.level || 'INFO').toUpperCase()}
              </span>
            </td>

            <td className="whitespace-nowrap px-4 py-3 font-bold text-slate-900 dark:text-[#e5e5e5]">
              {log.userName || 'Hệ thống'}
              {log.roleName && <span className="ml-1 text-[11px] font-semibold text-slate-400 dark:text-[#808080]">({log.roleName})</span>}
            </td>

            <td className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold text-[#004785] dark:text-blue-400">
              {log.branchName || '—'}
            </td>

            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                {log.roleName && (
                  <span className="rounded bg-[#004785] px-2 py-0.5 text-[10px] font-bold text-white dark:bg-blue-600">
                    {log.roleName}
                  </span>
                )}
                <span className="font-bold">{log.action || '—'}</span>
              </div>
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
            <td colSpan="5" className="px-4 py-12 text-center text-sm text-slate-400 dark:text-[#808080]">
              Không tìm thấy nhật ký hoạt động nào.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default LogTable;