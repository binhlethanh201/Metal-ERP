/**
 * InventoryCountTable - Bảng danh sách phiếu kiểm kê.
 */
import Icon from '../../../../shared/components/Icon';

const statusBadge = (status) => {
  if (status === 'Đã cân bằng') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (status === 'Đang kiểm kê') return 'border-blue-200 bg-blue-50 text-blue-700';
  return 'border-slate-200 bg-slate-50 text-slate-600';
};

const InventoryCountTable = ({ rows, selectedIds, onSelectAll, onSelectOne, onRowClick }) => (
  <table className="w-full min-w-[1100px] table-fixed">
    <thead className="border-b border-slate-200 bg-slate-50">
      <tr>
        <th className="w-[48px] px-3 py-3">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-blue-600"
            checked={rows.length > 0 && selectedIds.length === rows.length}
            onChange={(e) => onSelectAll(e.target.checked)}
          />
        </th>
        <th className="w-[130px] px-3 py-3 text-left text-xs font-bold uppercase text-slate-500">
          Số phiếu
        </th>
        <th className="w-[150px] px-3 py-3 text-left text-xs font-bold uppercase text-slate-500">
          Thời gian
        </th>
        <th className="w-[140px] px-3 py-3 text-left text-xs font-bold uppercase text-slate-500">
          Kho kiểm kê
        </th>
        <th className="w-[140px] px-3 py-3 text-left text-xs font-bold uppercase text-slate-500">
          Người kiểm kê
        </th>
        <th className="w-[180px] px-3 py-3 text-left text-xs font-bold uppercase text-slate-500">
          Mục đích
        </th>
        <th className="w-[130px] px-3 py-3 text-center text-xs font-bold uppercase text-slate-500">
          Trạng thái
        </th>
        <th className="w-[150px] px-3 py-3 text-left text-xs font-bold uppercase text-slate-500">
          Ghi chú
        </th>
        <th className="w-[130px] px-3 py-3 text-center text-xs font-bold uppercase text-slate-500">
          Trạng thái ĐB
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100">
      {rows.length === 0 ? (
        <tr>
          <td colSpan={9} className="px-6 py-16 text-center text-sm text-slate-400">
            Không có dữ liệu phiếu kiểm kê
          </td>
        </tr>
      ) : (
        rows.map((row) => (
          <tr
            key={row.id}
            className={`transition-colors hover:bg-blue-50/30 ${selectedIds.includes(row.id) ? 'bg-blue-50/50' : ''}`}
          >
            <td className="px-3 py-2.5">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-blue-600"
                checked={selectedIds.includes(row.id)}
                onChange={(e) => onSelectOne(row.id, e.target.checked)}
              />
            </td>
            <td className="px-3 py-2.5">
              <button
                type="button"
                className="text-sm font-semibold text-blue-700 hover:underline"
                onClick={() => onRowClick(row)}
              >
                {row.countNumber}
              </button>
            </td>
            <td className="px-3 py-2.5 text-sm text-slate-600">
              {new Date(row.date).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </td>
            <td className="px-3 py-2.5 text-sm text-slate-700">{row.warehouse}</td>
            <td className="px-3 py-2.5 text-sm text-slate-700">{row.counter}</td>
            <td className="px-3 py-2.5 text-sm text-slate-600">{row.purpose}</td>
            <td className="px-3 py-2.5 text-center">
              <span
                className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusBadge(row.status)}`}
              >
                {row.status}
              </span>
            </td>
            <td className="px-3 py-2.5 text-sm text-slate-500">{row.notes || '-'}</td>
            <td className="px-3 py-2.5 text-center">
              {row.syncStatus === 'Đã đồng bộ' ? (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                  <Icon name="check_circle" size={14} /> Đã ĐB
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                  <Icon name="cached" size={14} /> Chưa ĐB
                </span>
              )}
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
);

export default InventoryCountTable;
