import React from 'react';

const LogTable = ({ logs }) => {
  return (
    <div className="overflow-hidden rounded-lg border border-outline-variant bg-inverse-surface shadow-sm">
      <div className="min-h-[400px] overflow-x-auto">
        <table className="w-full text-left font-mono text-xs text-inverse-on-surface">
          <thead>
            <tr className="border-b border-outline/30 bg-on-surface text-[10px] uppercase tracking-wider text-outline-variant">
              <th className="px-4 py-3 font-semibold">Timestamp</th>
              <th className="px-4 py-3 font-semibold">Level</th>
              <th className="px-4 py-3 font-semibold">Source</th>
              <th className="px-4 py-3 font-semibold">Message Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline/20">
            {logs.map((log) => (
              <tr key={log.id} className="transition-colors hover:bg-on-surface/50">
                <td className="whitespace-nowrap px-4 py-3 text-secondary-fixed-dim opacity-80">
                  {log.time}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-sm px-1.5 py-0.5 font-bold ${
                      log.level === 'ERROR'
                        ? 'bg-error text-on-error'
                        : log.level === 'WARN'
                          ? 'bg-secondary-container text-on-secondary-container'
                          : 'bg-tertiary-container text-on-tertiary-container'
                    }`}
                  >
                    {log.level}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-bold text-primary-fixed-dim">
                  {log.source}
                </td>
                <td className="px-4 py-3 leading-relaxed opacity-90">{log.message}</td>
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
