import React from 'react';
import Icon from '../../../../shared/components/Icon';

const getStatusInfo = (status) => {
  switch (status) {
    case 'Draft':
      return { label: 'Phiếu Nháp', css: 'bg-slate-100 text-slate-700 border-slate-200' };
    case 'WaitingForApproval':
      return { label: 'Chờ Duyệt', css: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'Completed':
      return { label: 'Đã Hoàn Thành', css: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'Cancelled':
      return { label: 'Đã Hủy', css: 'bg-red-50 text-red-700 border-red-200' };
    default:
      return { label: status, css: 'bg-gray-100 text-gray-700' };
  }
};

const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${date.toLocaleDateString('vi-VN')}`;
};

const InventoryCheckTable = ({ rows, loading, onRowClick }) => {
  return (
    <table className="w-full text-left text-sm text-slate-600">
      <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
        <tr>
          <th className="px-6 py-4 font-bold">Mã Phiếu</th>
          <th className="px-6 py-4 font-bold">Thời Gian Tạo / Phụ trách</th>
          <th className="px-6 py-4 text-center font-bold">Số Lượng Hàng</th>
          <th className="px-6 py-4 text-center font-bold">Trạng Thái</th>
          <th className="px-6 py-4 text-right font-bold">Thao Tác</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {loading ? (
          <tr>
            <td colSpan={5} className="p-8 text-center text-slate-400">
              <Icon name="sync" className="mb-2 animate-spin text-3xl" />
              <p>Đang tải danh sách phiếu kiểm kê...</p>
            </td>
          </tr>
        ) : rows.length === 0 ? (
          <tr>
            <td colSpan={5} className="p-8 text-center text-slate-400">
              Không tìm thấy phiếu kiểm kê nào.
            </td>
          </tr>
        ) : (
          rows.map((row) => {
            const statusInfo = getStatusInfo(row.status);
            const ticketId =
              row.ticketId || row.id || row.stockTicketId || row.inventoryCheckId || row.checkId;
            return (
              <tr
                key={ticketId || row.ticketCode}
                className="transition-colors hover:bg-blue-50/40"
              >
                <td className="px-6 py-4">
                  <div className="flex flex-col items-start gap-1">
                    <button
                      onClick={() => onRowClick(row, ticketId)}
                      className="w-fit font-bold text-blue-700 hover:text-blue-900 hover:underline"
                    >
                      {row.ticketCode}
                    </button>
                    {/* Badge hiển thị nếu phiếu bị Reject bắt đếm lại */}
                    {row.recountNumber > 0 && (
                      <span className="w-fit rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-700">
                        Đếm lại (Lần {row.recountNumber})
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-800">{formatDateTime(row.createdAt)}</div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    Phụ trách:{' '}
                    <span
                      className={`font-semibold ${!row.assigneeUserName ? 'italic text-slate-400' : 'text-slate-600'}`}
                    >
                      {row.assigneeUserName || 'Chưa gán'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center font-bold text-slate-700">
                  {row.detailCount}{' '}
                  <span className="text-xs font-normal text-slate-500">sản phẩm</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`inline-block rounded-full border px-2.5 py-1 text-xs font-bold ${statusInfo.css}`}
                  >
                    {statusInfo.label}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onRowClick(row, ticketId)}
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-600"
                    title="Xem chi tiết"
                  >
                    <Icon name="visibility" size={20} />
                  </button>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
};

export default InventoryCheckTable;
