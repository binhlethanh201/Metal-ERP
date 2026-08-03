/**
 * HeldOrdersDrawer - Drawer hiển thị các đơn đang treo.
 * TODO (FE): Kết nối API GET /pos/invoices?status=OnHold khi BE sẵn sàng.
 * Hiện nhận heldOrders từ prop (local state ở POSScreen).
 */
import { useState } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import Icon from '../../../../shared/components/Icon';
import { Badge } from '../../../../shared/components/Badge';
import { formatCurrency } from '../../../../shared/utils/formatCurrency';

import { resumeInvoice } from '../../services/posService';

const HeldOrdersDrawer = ({ isOpen, onClose, onResume, heldOrders = [] }) => {
  const [resuming, setResuming] = useState(null);

  const handleResume = async (invoice) => {
    const invoiceId = invoice.invoiceId || invoice.id;
    setResuming(invoiceId);
    try {
      if (
        invoiceId &&
        typeof invoiceId === 'string' &&
        invoiceId.includes('-') &&
        !invoiceId.startsWith('draft-')
      ) {
        await resumeInvoice(invoiceId);
      }
      onResume && onResume(invoice);
    } catch (err) {
      alert(err.message || 'Hóa đơn treo đã quá 24 giờ và tự động hủy.');
    } finally {
      setResuming(null);
    }
  };

  const getHeldDuration = (heldAt) => {
    if (!heldAt) return '';
    const diff = Date.now() - new Date(heldAt).getTime();
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${mins}p trước`;
    return `${mins} phút trước`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Đơn đang treo"
      size="lg"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Đóng
        </Button>
      }
    >
      <div className="space-y-3">
        {heldOrders.length === 0 && (
          <div className="text-center py-10 text-gray-400 dark:text-[#808080]">
            <Icon name="pause_circle" size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium text-gray-500 dark:text-[#999999]">Không có đơn treo nào</p>
            <p className="text-sm mt-1">Các hóa đơn được treo sẽ hiển thị tại đây</p>
          </div>
        )}

        {heldOrders.map((inv) => {
          const id = inv.id || inv.invoiceId;
          const held = inv.createdAt || inv.heldAt;
          const duration = getHeldDuration(held);
          const totalAmt = inv.cartItems
            ? inv.cartItems.reduce((s, i) => s + (i.price ?? 0) * i.quantity, 0)
            : inv.totalAmount || 0;
          return (
            <div
              key={id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors dark:border-[#333333] dark:hover:bg-[#272727]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 dark:text-[#e5e5e5]">{id}</span>
                    <Badge variant="warning">Treo</Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-[#999999]">
                    {inv.customerName && (
                      <span className="flex items-center gap-1">
                        <Icon name="person" size={12} />
                        {inv.customerName}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Icon name="access_time" size={12} />
                      {duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="receipt" size={12} />
                      {formatCurrency(totalAmt)}
                    </span>
                  </div>
                  {inv.holdNote && (
                    <p className="mt-2 text-sm text-gray-600 italic bg-gray-50 px-2 py-1 rounded dark:text-[#999999] dark:bg-[#1a1a1a]">
                      <Icon name="note" size={12} className="inline mr-1" />
                      {inv.holdNote}
                    </p>
                  )}
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  loading={resuming === id}
                  onClick={() => handleResume(inv)}
                >
                  <Icon name="play_arrow" size={14} />
                  Khôi phục
                </Button>
              </div>
            </div>
          );
        })}

        {heldOrders.length > 0 && (
          <p className="text-xs text-gray-400 text-center dark:text-[#808080]">
            Đơn treo sẽ tự động hủy sau <strong>24 giờ</strong>
          </p>
        )}
      </div>
    </Modal>
  );
};

export default HeldOrdersDrawer;
