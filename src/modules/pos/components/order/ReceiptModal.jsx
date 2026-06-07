import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { formatCurrency } from '../../../../shared/utils/formatCurrency';

const handlePrint = (order) => {
  const printWindow = window.open('', '_blank', 'width=400,height=600');
  if (!printWindow) return;

  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding:2px 4px;font-size:11px;">${item.name}</td>
      <td style="padding:2px 4px;text-align:center;font-size:11px;">${item.quantity}</td>
      <td style="padding:2px 4px;text-align:right;font-size:11px;">${formatCurrency(item.price)}</td>
      <td style="padding:2px 4px;text-align:right;font-size:11px;">${formatCurrency(item.price * item.quantity)}</td>
    </tr>
  `
    )
    .join('');

  const payLinesHtml = order.payLines
    .map(
      (pl) => `
    <tr><td style="font-size:11px;">${pl.method}:</td><td style="text-align:right;font-size:11px;">${formatCurrency(pl.amount)}</td></tr>
  `
    )
    .join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Hoa don ${order.id}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; color: #1e293b; }
      .center { text-align: center; }
      .title { font-size: 16px; font-weight: bold; margin-bottom: 2px; }
      .code { font-size: 11px; color: #64748b; margin-bottom: 4px; }
      .divider { border-top: 1px dashed #cbd5e1; margin: 8px 0; }
      table { width: 100%; border-collapse: collapse; }
      th { font-size: 10px; color: #94a3b8; text-transform: uppercase; padding: 2px 4px; }
      .total-line { font-weight: bold; font-size: 13px; }
      .footer { text-align: center; font-size: 10px; color: #94a3b8; margin-top: 12px; }
    </style></head>
    <body>
      <div class="center">
        <p class="title">HÓA ĐƠN BÁN HÀNG</p>
        <p class="code">Mã: ${order.id}</p>
        <p class="code">${new Date(order.date).toLocaleString('vi-VN')}</p>
      </div>
      <div class="divider"></div>
      <table>
        <thead><tr><th style="text-align:left;">Sản phẩm</th><th>SL</th><th style="text-align:right;">Đơn giá</th><th style="text-align:right;">Thành tiền</th></tr></thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <div class="divider"></div>
      <table>
        <tr><td style="font-size:11px;">Tạm tính</td><td style="text-align:right;font-size:11px;">${formatCurrency(order.subtotal)}</td></tr>
        ${order.discount > 0 ? `<tr><td style="font-size:11px;color:#ef4444;">Giảm giá</td><td style="text-align:right;font-size:11px;color:#ef4444;">-${formatCurrency(order.discount)}</td></tr>` : ''}
        <tr><td style="font-size:11px;">VAT</td><td style="text-align:right;font-size:11px;">${formatCurrency(order.vat)}</td></tr>
        <tr class="total-line"><td>TỔNG CỘNG</td><td style="text-align:right;">${formatCurrency(order.total)}</td></tr>
      </table>
      <div class="divider"></div>
      <table>
        <tr><td style="font-size:11px;">Khách hàng:</td><td style="text-align:right;font-size:11px;">${order.customer}</td></tr>
        ${payLinesHtml}
        <tr style="font-weight:bold;color:#16a34a;"><td style="font-size:11px;">Đã thanh toán:</td><td style="text-align:right;font-size:11px;">${formatCurrency(order.totalPaid)}</td></tr>
        ${order.change > 0 ? `<tr><td style="font-size:11px;color:#d97706;">Tiền thừa:</td><td style="text-align:right;font-size:11px;color:#d97706;">${formatCurrency(order.change)}</td></tr>` : ''}
      </table>
      <p class="footer">Cảm ơn quý khách!</p>
      <script>window.onload=function(){window.print();}</script>
    </body>
    </html>
  `);
  printWindow.document.close();
};

const ReceiptModal = ({ isOpen, onClose, lastOrder }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Hóa đơn bán hàng"
    size="md"
    footer={
      <>
        <Button variant="secondary" onClick={onClose}>
          Đóng
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            if (lastOrder) handlePrint(lastOrder);
            onClose();
          }}
        >
          In hóa đơn
        </Button>
      </>
    }
  >
    {lastOrder && (
      <div className="space-y-3 text-sm">
        <div className="text-center">
          <p className="font-bold text-slate-900">HÓA ĐƠN BÁN HÀNG</p>
          <p className="text-xs text-slate-500">Mã: {lastOrder.id}</p>
          <p className="text-xs text-slate-400">
            {new Date(lastOrder.date).toLocaleString('vi-VN')}
          </p>
        </div>
        <div className="border-b border-t border-slate-200 py-2">
          <div className="mb-1 grid grid-cols-4 gap-1 text-xs font-bold text-slate-500">
            <span>Sản phẩm</span>
            <span className="text-center">SL</span>
            <span className="text-right">Đơn giá</span>
            <span className="text-right">Thành tiền</span>
          </div>
          {lastOrder.items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-4 gap-1 py-0.5 text-xs text-slate-700">
              <span className="truncate">{item.name}</span>
              <span className="text-center">{item.quantity}</span>
              <span className="text-right">{formatCurrency(item.price)}</span>
              <span className="text-right font-medium">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Tạm tính</span>
            <span>{formatCurrency(lastOrder.subtotal)}</span>
          </div>
          {lastOrder.discount > 0 && (
            <div className="flex justify-between text-xs text-red-500">
              <span>Giảm giá</span>
              <span>-{formatCurrency(lastOrder.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-xs text-slate-500">
            <span>VAT</span>
            <span>{formatCurrency(lastOrder.vat)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-1 font-bold text-[#004785]">
            <span>TỔNG CỘNG</span>
            <span>{formatCurrency(lastOrder.total)}</span>
          </div>
        </div>
        <div className="space-y-1 rounded-lg bg-slate-50 p-3 text-xs">
          <div className="flex justify-between">
            <span>Khách hàng:</span>
            <span className="font-medium">{lastOrder.customer}</span>
          </div>
          {lastOrder.payLines.map((pl, i) => (
            <div key={i} className="flex justify-between">
              <span>{pl.method}:</span>
              <span className="font-medium">{formatCurrency(pl.amount)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-slate-200 pt-1">
            <span>Đã thanh toán:</span>
            <span className="font-bold text-green-600">{formatCurrency(lastOrder.totalPaid)}</span>
          </div>
          {lastOrder.change > 0 && (
            <div className="flex justify-between">
              <span>Tiền thừa:</span>
              <span className="font-bold text-amber-600">{formatCurrency(lastOrder.change)}</span>
            </div>
          )}
        </div>
        <p className="text-center text-xs text-slate-400">Cảm ơn quý khách!</p>
      </div>
    )}
  </Modal>
);

export default ReceiptModal;
