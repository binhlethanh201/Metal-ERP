/**
 * GoodsIssueTable - Bảng danh sách phiếu xuất kho.
 * Các cột: Checkbox | Số phiếu | Trạng thái ĐB | Thời gian | Tham chiếu | Đối tượng |
 *          Tổng tiền hàng | Tổng thanh toán | Hình thức TT | Loại phiếu | Người lập | Chức năng
 * Footer: Sticky total row.
 */
import Icon from '../../../../shared/components/Icon';
import { formatMoney } from '../../utils/goodsIssueUtils';

const GoodsIssueTable = ({
  issues,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onEdit,
  onDelete,
  totalsByField,
}) => {
  const allSelected = issues.length > 0 && selectedIds.length === issues.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < issues.length;

  const syncStatusBadge = (status) => {
    const isSynced = status === 'Đã đồng bộ';
    return (
      <span
        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
          isSynced
            ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
            : 'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
        }`}
      >
        {status}
      </span>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-[#333333] dark:bg-[#1a1a1a]">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[1400px] table-fixed">
          {/* Header */}
          <thead className="border-b border-slate-200 bg-slate-50 dark:border-[#333333] dark:bg-[#1a1a1a]">
            <tr>
              <th className="w-[48px] px-3 py-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-[#404040]"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={(e) => onSelectAll(e.target.checked)}
                />
              </th>
              <th className="w-[110px] px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-[#999999]">
                Số phiếu
              </th>
              <th className="w-[120px] px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-[#999999]">
                Trạng thái ĐB
              </th>
              <th className="w-[140px] px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-[#999999]">
                Thời gian
              </th>
              <th className="w-[110px] px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-[#999999]">
                Tham chiếu
              </th>
              <th className="w-[180px] px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-[#999999]">
                Đối tượng
              </th>
              <th className="w-[140px] px-3 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-[#999999]">
                Tổng tiền hàng
              </th>
              <th className="w-[140px] px-3 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-[#999999]">
                Tổng thanh toán
              </th>
              <th className="w-[110px] px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-[#999999]">
                Hình thức TT
              </th>
              <th className="w-[150px] px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-[#999999]">
                Loại phiếu
              </th>
              <th className="w-[130px] px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-[#999999]">
                Người lập
              </th>
              <th className="w-[80px] px-3 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-[#999999]">
                Chức năng
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-slate-100 dark:divide-[#333333]">
            {issues.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-6 py-12 text-center text-sm text-slate-400 dark:text-[#808080]">
                  Không có dữ liệu phiếu xuất
                </td>
              </tr>
            ) : (
              issues.map((row) => (
                <tr
                  key={row.id}
                  className={`transition-colors hover:bg-blue-50/40 dark:hover:bg-[#333333] ${
                    selectedIds.includes(row.id) ? 'bg-blue-50/70 dark:bg-[#272727]' : ''
                  }`}
                >
                  <td className="px-3 py-2.5">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-[#404040]"
                      checked={selectedIds.includes(row.id)}
                      onChange={(e) => onSelectOne(row.id, e.target.checked)}
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">{row.issueNumber}</span>
                  </td>
                  <td className="px-3 py-2.5">{syncStatusBadge(row.syncStatus)}</td>
                  <td className="px-3 py-2.5">
                    <span className="text-xs text-slate-600 dark:text-[#b3b3b3]">{formatDate(row.date)}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-sm text-slate-600 dark:text-[#b3b3b3]">{row.reference || '-'}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-sm font-medium text-slate-800 dark:text-[#e5e5e5]">{row.customer}</span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="text-sm tabular-nums text-slate-700 dark:text-[#b3b3b3]">
                      {formatMoney(row.totalAmount)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="text-sm tabular-nums text-slate-700 dark:text-[#b3b3b3]">
                      {formatMoney(row.totalPayment)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-sm text-slate-600 dark:text-[#b3b3b3]">{row.paymentMethod || '-'}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-sm text-slate-600 dark:text-[#b3b3b3]">{row.issueType}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-sm text-slate-600 dark:text-[#b3b3b3]">{row.createdBy}</span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        className="rounded p-1 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-[#808080] dark:hover:bg-[#333333] dark:hover:text-blue-400"
                        onClick={() => onEdit(row)}
                        title="Sửa"
                      >
                        <Icon name="edit" size={16} />
                      </button>
                      <button
                        type="button"
                        className="rounded p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-[#808080] dark:hover:bg-red-900/30 dark:hover:text-red-400"
                        onClick={() => onDelete(row.id)}
                        title="Xóa"
                      >
                        <Icon name="delete" size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Sticky Total Row */}
      <div className="sticky bottom-0 border-t-2 border-slate-300 bg-slate-50 px-6 py-3 dark:border-[#404040] dark:bg-[#1a1a1a]">
        <div className="flex items-center justify-between text-sm">
          <span className="font-bold text-slate-700 dark:text-[#b3b3b3]">Tổng cộng:</span>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-xs text-slate-500 dark:text-[#999999]">Tổng tiền hàng: </span>
              <span className="ml-2 text-sm font-bold tabular-nums text-slate-800 dark:text-[#e5e5e5]">
                {formatMoney(totalsByField.totalAmount)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 dark:text-[#999999]">Tổng thanh toán: </span>
              <span className="ml-2 text-sm font-bold tabular-nums text-slate-800 dark:text-[#e5e5e5]">
                {formatMoney(totalsByField.totalPayment)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoodsIssueTable;
