import React from 'react';
import Icon from '../../../../shared/components/Icon';
import { useBranchHistory } from '../../hooks/useBranchHistory';

const BranchHistoryPanel = ({ branchId }) => {
  const {
    historyItems,
    loading,
    error,
    page,
    setPage,
    type,
    setType,
    status,
    setStatus,
    paginationMeta,
  } = useBranchHistory(branchId);

  // Định dạng hiển thị ngày giờ thân thiện (Ví dụ: 15:30:00 23/06/2026)
  const formatDateTime = (isoString) => {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return d.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Từ điển việt hóa và tạo màu cho Loại phiếu
  const formatTicketType = (t) => {
    const typeStr = String(t).toUpperCase();
    switch (typeStr) {
      case 'IMPORT':
        return { text: 'Nhập kho', css: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'EXPORT':
        return { text: 'Xuất kho', css: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'CHECK':
      case 'STOCK_CHECK':
        return { text: 'Kiểm kê kho', css: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'RETURN_SUPPLIER':
        return { text: 'Trả NCC', css: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'WRITE_OFF':
        return { text: 'Hủy/Hao hụt', css: 'bg-red-50 text-red-700 border-red-200' };
      case 'TRANSFER':
        return { text: 'Điều chuyển', css: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      default:
        return { text: typeStr, css: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  // Từ điển việt hóa và tạo màu cho Trạng thái
  const formatTicketStatus = (s) => {
    const statusStr = String(s).toUpperCase();
    switch (statusStr) {
      case 'APPROVED':
      case 'COMPLETED':
        return { text: 'Hoàn thành', css: 'bg-green-100 text-green-800' };
      case 'PENDING':
        return { text: 'Chờ xử lý', css: 'bg-amber-100 text-amber-800' };
      case 'CANCELLED':
        return { text: 'Đã hủy', css: 'bg-red-100 text-red-800' };
      default:
        return { text: statusStr, css: 'bg-slate-100 text-slate-800' };
    }
  };

  return (
    <div className="space-y-4 border-l-4 border-blue-600 bg-slate-50 p-5 shadow-inner">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <Icon name="history" size={18} className="text-blue-600" />
          <span>Lịch sử biến động kho hàng</span>
        </div>

        {/* Khối Bộ Lọc Nâng Cao */}
        <div className="flex items-center gap-3">
          <select
            className="rounded-lg border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-blue-500 focus:ring-blue-500"
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả loại phiếu</option>
            <option value="import">Nhập kho</option>
            <option value="export">Xuất kho</option>
            <option value="check">Kiểm kê</option>
            <option value="return_supplier">Trả nhà cung cấp</option>
            <option value="write_off">Hủy / Hao hụt</option>
            <option value="transfer">Điều chuyển</option>
          </select>

          <select
            className="rounded-lg border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-blue-500 focus:ring-blue-500"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="completed">Hoàn thành / Đã duyệt</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-2 text-xs font-semibold text-red-600">{error}</div>
      )}

      {/* Bảng dữ liệu phiếu kho */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-100 font-bold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Mã chứng từ</th>
              <th className="px-4 py-3">Phân loại</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Nội dung / Ghi chú</th>
              <th className="px-4 py-3">Người thực hiện</th>
              <th className="px-4 py-3">Số lượng</th>
              <th className="px-4 py-3">Thời gian tạo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-400">
                  <Icon name="sync" className="mr-2 inline animate-spin text-xl" /> Đang tải lịch sử
                  phiếu kho...
                </td>
              </tr>
            ) : historyItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center font-medium text-slate-400">
                  Không tìm thấy dữ liệu phiếu kho phù hợp.
                </td>
              </tr>
            ) : (
              historyItems.map((ticket) => {
                const ticketTypeInfo = formatTicketType(ticket.ticketType);
                const ticketStatusInfo = formatTicketStatus(ticket.status);

                return (
                  <tr key={ticket.stockTicketId} className="transition-colors hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-bold tracking-tight text-slate-800">
                      {ticket.ticketCode}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded border px-2 py-0.5 text-[11px] font-semibold ${ticketTypeInfo.css}`}
                      >
                        {ticketTypeInfo.text}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${ticketStatusInfo.css}`}
                      >
                        {ticketStatusInfo.text}
                      </span>
                    </td>

                    <td
                      className="max-w-xs truncate px-4 py-3 font-medium text-slate-700"
                      title={ticket.notes}
                    >
                      {ticket.notes || 'Không có ghi chú'}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800">{ticket.userFullName}</div>
                      <div className="text-[10px] text-slate-400">{ticket.userEmail}</div>
                    </td>

                    <td className="px-4 py-3 font-bold text-blue-900">
                      {ticket.itemCount} mặt hàng
                    </td>

                    <td className="px-4 py-3 font-medium text-slate-500">
                      {formatDateTime(ticket.createdAt)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Thanh Điều Hướng Phân Trang Con */}
        {paginationMeta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-2 text-slate-500">
            <span className="text-[11px]">
              Tổng số: <strong className="text-slate-700">{paginationMeta.totalCount}</strong> chứng
              từ
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded border border-slate-300 bg-white p-1 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Icon name="chevron_left" size={14} />
              </button>
              <span className="text-[11px] font-semibold">
                Trang {page} / {paginationMeta.totalPages}
              </span>
              <button
                type="button"
                disabled={page >= paginationMeta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded border border-slate-300 bg-white p-1 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Icon name="chevron_right" size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchHistoryPanel;
