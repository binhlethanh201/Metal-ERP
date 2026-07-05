import React from 'react';
import Icon from '../../../../shared/components/Icon';
import { Ban, CheckCheck, CheckCircle2, Clock, XCircle, FileEdit } from 'lucide-react';

const renderStatusBadge = (status) => {
  switch (status) {
    case 'Draft':
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
          <FileEdit size={12} /> Phiếu Nháp
        </span>
      );
    case 'WaitingForApproval':
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
          <Clock size={12} /> Chờ duyệt
        </span>
      );
    case 'Completed':
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
          <CheckCircle2 size={12} /> Hoàn tất
        </span>
      );
    case 'Cancelled':
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">
          <XCircle size={12} /> Đã Hủy
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700">
          {status}
        </span>
      );
  }
};

const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${date.toLocaleDateString('vi-VN')}`;
};

const InventoryCheckTable = ({ rows, loading, onRowClick, isOwner, onApprove, onCancel }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-slate-600">
            <th className="px-3 py-3 font-semibold">Mã phiếu</th>
            <th className="px-3 py-3 font-semibold">Ngày tạo</th>
            <th className="px-3 py-3 font-semibold">Sản phẩm / Ghi chú</th>
            <th className="px-3 py-3 text-right font-semibold">Số lượng</th>
            <th className="px-3 py-3 text-center font-semibold">Trạng thái</th>
            <th className="px-3 py-3 text-right font-semibold">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-slate-400">
                <Icon name="sync" className="mb-2 animate-spin text-3xl" />
                <p>Đang tải dữ liệu...</p>
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-slate-400">
                Không tìm thấy phiếu kiểm kê nào.
              </td>
            </tr>
          ) : (
            rows.map((row) => {
              const ticketId =
                row.ticketId || row.id || row.stockTicketId || row.inventoryCheckId || row.checkId;
              return (
                <tr
                  key={ticketId || row.ticketCode}
                  className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50"
                >
                  <td className="px-3 py-3">
                    <div className="flex flex-col items-start gap-1">
                      <button
                        onClick={() => onRowClick(row, ticketId)}
                        className="text-left font-bold text-sky-600 hover:text-sky-800 hover:underline"
                      >
                        {row.ticketCode}
                      </button>
                      {row.recountNumber > 0 && (
                        <span className="w-fit rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-700">
                          Đếm lại (Lần {row.recountNumber})
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-500">
                    {row.createdAt
                      ? new Date(
                          row.createdAt.endsWith('Z') ? row.createdAt : `${row.createdAt}Z`
                        ).toLocaleDateString('vi-VN')
                      : '---'}
                  </td>
                  <td className="px-3 py-3 text-slate-700">
                    <div className="font-medium">Phiếu kiểm kê kho</div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      Phụ trách:{' '}
                      <span
                        className={
                          !row.assigneeUserName
                            ? 'italic text-slate-400'
                            : 'font-semibold text-slate-600'
                        }
                      >
                        {row.assigneeUserName || 'Chưa gán'}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right font-semibold text-slate-900">
                    {row.detailCount ?? '---'}
                  </td>
                  <td className="px-3 py-3 text-center">{renderStatusBadge(row.status)}</td>
                  <td className="px-3 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Nút Duyệt phiếu inline */}
                      {row.status === 'WaitingForApproval' && isOwner && onApprove && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onApprove(ticketId);
                          }}
                          title="Duyệt phiếu kiểm kê này"
                          className="inline-flex items-center gap-1 rounded-xl border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-bold text-sky-700 hover:bg-sky-100"
                        >
                          <CheckCheck size={14} /> Duyệt phiếu
                        </button>
                      )}

                      {/* Nút Hủy inline */}
                      {(row.status === 'Draft' || row.status === 'WaitingForApproval') &&
                        isOwner &&
                        onCancel && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onCancel(ticketId);
                            }}
                            title="Hủy phiếu này"
                            className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                          >
                            <Ban size={14} /> Hủy
                          </button>
                        )}

                      {/* Nút Xem chi tiết mặc định */}
                      <button
                        onClick={() => onRowClick(row, ticketId)}
                        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-600"
                        title="Xem chi tiết"
                      >
                        <Icon name="visibility" size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryCheckTable;
