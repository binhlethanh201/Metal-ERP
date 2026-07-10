import React from 'react';
import Modal from '../../../../shared/components/Modal';
import Button from '../../../../shared/components/Button';
import { Loader2, Package, FileText, Ban } from 'lucide-react';
import formatCurrency from '../../../../shared/utils/formatCurrency';
import { formatDateTime } from '../../../../shared/utils/formatDate';
import { renderReturnStatusBadge } from './ReturnTable'; // Tái sử dụng badge

const TYPE_LABEL = { REFUND: 'Hoàn tiền', EXCHANGE: 'Đổi hàng' };
const METHOD_LABEL = { CASH: 'Tiền mặt', TRANSFER: 'Chuyển khoản', EXCHANGE: 'Đổi hàng' };
const REASON_LABEL = {
  DEFECTIVE: 'Hàng lỗi',
  WRONG_ITEM: 'Sai sản phẩm',
  NOT_SATISFIED: 'Không hài lòng',
  OTHER: 'Khác',
};

// Component helper hiển thị thông tin dạng list row
const InfoRow = ({ label, value, valueClassName = '' }) => (
  <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-2 text-sm last:border-0">
    <span className="shrink-0 text-slate-500">{label}</span>
    <span className={`text-right font-semibold text-slate-800 ${valueClassName}`}>{value}</span>
  </div>
);

export const ReturnDetailModal = ({ open, onClose, detail, loading, onCancel }) => {
  // ==================== CẤU HÌNH HEADER TITLE ====================
  const modalTitle = (
    <div className="flex flex-col gap-1 pr-10">
      <div className="flex flex-wrap items-center gap-2 text-lg font-bold text-slate-800">
        Chi tiết đổi/trả: <span className="text-[#004785]">{detail?.returnCode || '...'}</span>
        {detail && renderReturnStatusBadge(detail.status)}
      </div>
      {detail?.staffName && (
        <div className="text-sm font-normal text-slate-500">
          Nhân viên xử lý: <strong className="text-slate-700">{detail.staffName}</strong>
        </div>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={loading || !detail ? 'Chi tiết phiếu đổi/trả' : modalTitle}
      size="3xl"
      footer={
        <div className="flex w-full items-center justify-end gap-2">
          {detail?.status === 'PENDING' && (
            <Button
              variant="danger"
              onClick={() => onCancel(detail.returnOrderId)}
              className="flex items-center gap-2"
            >
              <Ban size={16} /> Hủy phiếu đổi/trả
            </Button>
          )}
        </div>
      }
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-500">
          <Loader2 className="animate-spin text-[#004785]" size={32} />
          <p>Đang tải chi tiết phiếu đổi/trả...</p>
        </div>
      ) : !detail ? (
        <p className="py-10 text-center text-sm italic text-slate-400">Không có dữ liệu.</p>
      ) : (
        <div className="space-y-6">
          {/* ==================== THÔNG TIN CHUNG ==================== */}
          <div className="grid grid-cols-1 gap-x-8 gap-y-4 rounded-lg border border-slate-200 bg-slate-50/60 p-4 md:grid-cols-2">
            <div className="flex flex-col">
              <InfoRow
                label="Hóa đơn gốc"
                value={detail.invoiceCode || '—'}
                valueClassName="text-[#004785]"
              />
              <InfoRow
                label="Ngày tạo phiếu"
                value={detail.createdAt ? formatDateTime(detail.createdAt) : '—'}
              />
              <InfoRow
                label="Loại giao dịch"
                value={TYPE_LABEL[detail.returnType] || detail.returnType}
              />
            </div>
            <div className="flex flex-col">
              <InfoRow
                label="Phương thức hoàn tiền"
                value={METHOD_LABEL[detail.refundMethod] || detail.refundMethod}
              />
              <InfoRow
                label="Tổng tiền hoàn"
                value={formatCurrency(detail.refundAmount)}
                valueClassName="text-blue-700 text-base"
              />
            </div>

            {detail.note && (
              <div className="col-span-1 mt-2 border-t border-slate-200 pt-2 md:col-span-2">
                <span className="flex items-center gap-1 text-sm font-semibold text-slate-500">
                  <FileText size={14} /> Ghi chú
                </span>
                <p className="mt-1 rounded border border-slate-100 bg-white p-3 text-sm text-slate-700">
                  {detail.note}
                </p>
              </div>
            )}
          </div>

          {/* ==================== SẢN PHẨM ĐỔI/TRẢ ==================== */}
          <div>
            <h4 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
              <Package size={16} /> Chi tiết Sản phẩm
            </h4>
            <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Sản phẩm</th>
                    <th className="px-4 py-3 text-center font-semibold">Lý do</th>
                    <th className="px-4 py-3 text-right font-semibold">SL</th>
                    <th className="px-4 py-3 text-right font-semibold">Tiền hoàn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {(detail.items || []).map((item) => (
                    <tr key={item.returnItemId} className="transition-colors hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-700">{item.productName}</div>
                        <div className="text-xs text-slate-400">{item.productCode}</div>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-600">
                        {REASON_LABEL[item.reason] || item.reason || '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-600">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-800">
                        {formatCurrency(item.refundAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-200 bg-slate-50">
                    <td colSpan={3} className="px-4 py-3 text-right font-bold text-slate-700">
                      Tổng cộng
                    </td>
                    <td className="px-4 py-3 text-right text-base font-bold text-blue-700">
                      {formatCurrency(detail.refundAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ReturnDetailModal;
