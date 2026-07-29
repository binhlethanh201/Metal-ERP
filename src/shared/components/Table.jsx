/**
 * Table Component - Table tái sử dụng
 * Hỗ trợ columns, data, loading, empty state
 * Column hỗ trợ: width, align ('left'|'center'|'right')
 */

export const Table = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'Không có dữ liệu',
  className = '',
  onClickRow,
  ...props
}) => {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full table-fixed" {...props}>
        <thead>
          <tr>
            {columns.map((col) => {
              const alignClass =
                col.align === 'right'
                  ? 'text-right'
                  : col.align === 'center'
                    ? 'text-center'
                    : 'text-left';
              return (
                <th
                  key={col.key}
                  className={`border-b-2 border-slate-200 bg-slate-50/80 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-[#333333] dark:bg-[#1a1a1a]/80 dark:text-[#999999] ${alignClass}`}
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-[#333333]">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-5 py-12 text-center">
                <div className="flex items-center justify-center gap-2.5 text-slate-400 dark:text-[#808080]">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#004785] border-t-transparent" />
                  <span className="text-sm font-medium">Đang tải...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-5 py-12 text-center text-sm text-slate-400 dark:text-[#808080]"
              >
                <div className="mx-auto flex max-w-xs flex-col items-center gap-1">
                  <svg
                    className="h-10 w-10 text-slate-300 dark:text-[#666666]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <span>{emptyMessage}</span>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                onClick={onClickRow ? () => onClickRow(row) : undefined}
                className={`
                  transition-all duration-150
                  even:bg-slate-50/50 dark:even:bg-[#1a1a1a]/50
                  ${onClickRow
                    ? 'cursor-pointer hover:bg-blue-100/70 hover:shadow-[inset_3px_0_0_0_#2563eb] dark:hover:bg-blue-900/30'
                    : 'hover:bg-blue-50/40 dark:hover:bg-blue-900/20'
                  }
                `}
              >
                {columns.map((col) => {
                  const alignClass =
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                        ? 'text-center'
                        : 'text-left';
                  return (
                    <td
                      key={`${rowIdx}-${col.key}`}
                      className={`px-4 py-2.5 text-sm text-slate-600 dark:text-[#b3b3b3] overflow-hidden break-all ${alignClass}`}
                    >
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
