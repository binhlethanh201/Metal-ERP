/**
 * Table Component - Table tái sử dụng
 * Hỗ trợ columns, data, loading, empty state
 */

export const Table = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'Không có dữ liệu',
  className = '',
  ...props
}) => {
  return (
    <div className={`w-full overflow-x-auto rounded-lg border border-gray-200 ${className}`}>
      <table className="w-full" {...props}>
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-6 py-3 text-left text-sm font-semibold text-gray-900"
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center">
                <div className="flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr key={rowIdx} className="transition-colors hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={`${rowIdx}-${col.key}`} className="px-6 py-4 text-sm text-gray-700">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
