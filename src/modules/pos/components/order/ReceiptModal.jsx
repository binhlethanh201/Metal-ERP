import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { formatCurrency } from '../../../../shared/utils/formatCurrency';

const handlePrint = (order) => {
  const printWindow = window.open('', '_blank', 'width=420,height=800');
  if (!printWindow) return;

  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td class="name">${item.name}</td>
      <td class="r">${item.quantity}${item.displayUnit || item.selectedUnit || ''} x ${formatCurrency(item.price)}</td>
      <td class="r">${formatCurrency(item.price * item.quantity)}</td>
    </tr>`
    )
    .join('');

  const payLinesHtml = order.payLines
    .map((pl) => `<tr><td>${pl.method}</td><td class="r">${formatCurrency(pl.amount)}</td></tr>`)
    .join('');

  printWindow.document.write(`<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>In hóa đơn ${order.id}</title>
<style>
  @page { size: 80mm auto; margin: 0; }
  *{margin:0;padding:0;box-sizing:border-box}
  body{
    font-family:'Consolas','Courier New',monospace;
    font-size:14px;
    color:#000;
    background:#fff;
    max-width:320px;
    margin:0 auto;
    padding:14px 10px;
    line-height:1.35;
  }
  .c{text-align:center}
  .r{text-align:right;white-space:nowrap}
  .name{word-wrap:break-word}
  h2{font-size:18px;font-weight:700;margin-bottom:2px}
  .sub{font-size:12px;color:#333;margin-bottom:1px}
  hr{border:none;border-top:1px dashed #000;margin:8px 0}
  hr.d{border-top:1px dotted #888}
  table{width:100%;border-collapse:collapse}
  td{padding:2px 0;font-size:14px;vertical-align:top}
  th{font-size:11px;color:#666;text-transform:uppercase;padding:1px 0 4px;font-weight:600}
  .bold{font-weight:700}
  .lg{font-size:17px}
  .thanks{font-size:14px;font-weight:700;margin-top:6px}
  @media print{
    body{max-width:100%;width:100%;padding:12px 16px;font-size:12px}
    td{font-size:12px}
    h2{font-size:16px}
    .lg{font-size:15px}
    .sub{font-size:11px}
    .thanks{font-size:12px}
    th{font-size:10px}
  }
</style></head>
<body>
<div class="c">
  <h2>MEP SYSTEM</h2>
  <p class="sub">12 Nguyễn Văn Bảo, P.4, Gò Vấp, TP.HCM</p>
  <p class="sub">ĐT: 028.3999.8888 &bull; MST: 0312345678</p>
</div>
<hr>
<div class="c">
  <p class="bold lg">HÓA ĐƠN BÁN HÀNG</p>
  <p style="font-size:13px;color:#555">Mã: ${order.id}</p>
  <p style="font-size:13px;color:#555">${new Date(order.date).toLocaleString('vi-VN')}</p>
</div>
<hr>
<table>
  <thead><tr><th style="text-align:left">Mặt hàng</th><th style="text-align:right">SL x Giá</th><th style="text-align:right">T.Tiền</th></tr></thead>
  ${itemsHtml}
</table>
<hr>
<table>
  <tr><td>Tạm tính</td><td class="r">${formatCurrency(order.subtotal)}</td></tr>
  ${order.discount > 0 ? `<tr><td style="color:#c62828;">Giảm giá</td><td class="r" style="color:#c62828;">-${formatCurrency(order.discount)}</td></tr>` : ''}
  <tr><td>VAT (8%)</td><td class="r">${formatCurrency(order.vat)}</td></tr>
  <tr class="bold lg"><td>TỔNG CỘNG</td><td class="r">${formatCurrency(order.total)}</td></tr>
</table>
<hr>
<table>
  <tr><td>Khách hàng</td><td class="r">${order.customer}</td></tr>
  ${payLinesHtml}
  <tr class="bold"><td>Đã thanh toán</td><td class="r">${formatCurrency(order.totalPaid)}</td></tr>
  ${order.change > 0 ? `<tr><td style="color:#e65100;">Tiền thừa</td><td class="r" style="color:#e65100;">${formatCurrency(order.change)}</td></tr>` : ''}
</table>
<hr class="d">
<div class="c">
  <p class="thanks">Cảm ơn quý khách!</p>
  <p style="font-size:13px;color:#666">Hẹn gặp lại &#9728;</p>
</div>
<script>window.onload=function(){window.print()}</script>
</body></html>`);
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
              <span className="text-center">
                {item.quantity}
                {item.displayUnit || item.selectedUnit || ''}
              </span>
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
