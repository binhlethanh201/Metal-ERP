import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { formatCurrency } from '../../../../shared/utils/formatCurrency';
import { formatDateTime } from '../../../../shared/utils/formatDate';
import { getInvoiceTemplate } from '../../../owner/services/printTemplateService';

const handlePrint = async (order) => {
  let tpl = {};
  try {
    const res = await getInvoiceTemplate();
    tpl = res?.data || res || {};
  } catch {
    // fallback
  }

  const shopName = tpl.branchName || 'MEP SYSTEM';
  const shopAddress = tpl.branchAddress || '12 Nguyễn Văn Bảo, P.4, Gò Vấp, TP.HCM';
  const shopPhone = tpl.phone || '028.3999.8888';
  const shopTaxCode = tpl.taxCode || '0312345678';
  const thankYou = tpl.thankYouMessage || 'Cảm ơn quý khách!';
  const paperSize = tpl.paperSize === 'K58' ? '58mm' : '80mm';
  const fontSize = tpl.fontSize || 13;
  const fontFamily = tpl.fontFamily === 'sans-serif' ? 'Arial, sans-serif' : tpl.fontFamily === 'serif' ? 'Georgia, serif' : "'Courier New', Courier, monospace";
  const showLogo = tpl.showLogo && tpl.logoUrl;
  const logoUrl = tpl.logoUrl || '';
  const showCustomerInfo = tpl.showCustomerInfo !== false;
  const showCashierName = tpl.showCashierName !== false;
  const showBranchInfo = tpl.showBranchInfo !== false;
  const showPaymentMethod = tpl.showPaymentMethod !== false;

  const printWindow = window.open('', '_blank', 'width=420,height=800');
  if (!printWindow) return;

  const itemsHtml = (order.items || [])
    .map(
      (item) => `
      <tr>
        <td class="text-left">${item.name}</td>
        <td class="text-center">${item.quantity} ${item.displayUnit || item.selectedUnit || item.unit || ''} x ${formatCurrency(item.price)}</td>
        <td class="text-right">${formatCurrency(item.price * item.quantity)}</td>
      </tr>`
    )
    .join('');

  const payLines = order.payLines || [];
  const payLinesHtml = payLines
    .map((pl) => `<div class="flex-between"><span>${pl.method}</span><span>${formatCurrency(pl.amount)}</span></div>`)
    .join('');

  printWindow.document.write(`<!DOCTYPE html>
<html lang="vi">
<head><meta charset="utf-8"><title>In hóa đơn ${order.id}</title>
<style>
  @page { size: ${paperSize} ${paperSize === '58mm' ? 'auto' : '297mm'}; margin: 0; }
  *{margin:0;padding:0;box-sizing:border-box}
  body{
    width:${paperSize};
    max-width:320px;
    margin:0 auto;
    padding:8px 6px;
    font-family:${fontFamily};
    font-size:${fontSize}px;
    line-height:1.35;
    color:#000;
    background:#fff;
  }
  .text-center{text-align:center}
  .text-left{text-align:left}
  .text-right{text-align:right;white-space:nowrap}
  .bold{font-weight:700}
  .fs-sm{font-size:11px}
  .fs-lg{font-size:15px}
  hr{border:none;border-bottom:1px dashed #000;margin:6px 0}
  .flex-between{display:flex;justify-content:space-between;align-items:center;margin:2px 0}
  table{width:100%;border-collapse:collapse;margin:4px 0}
  th,td{padding:3px 0;vertical-align:top}
  th{font-size:11px;font-weight:700;text-transform:uppercase;border-bottom:1px dashed #000}
  th.w40{width:42%}
  th.w30{width:30%}
  th.w28{width:28%}
  @media print{
    body{max-width:100%;width:100%;padding:8px 10px;font-size:12px}
    td{font-size:12px}
    .fs-lg{font-size:14px}
    .fs-sm{font-size:10px}
    th{font-size:10px}
  }
</style></head>
<body>
<div class="text-center">
  ${showLogo ? `<img src="${logoUrl}" alt="logo" style="max-height:44px;margin-bottom:3px" />` : ''}
  ${showBranchInfo ? `<div class="bold fs-lg">${shopName}</div>
  <div>${shopAddress}</div>
  <div class="fs-sm">ĐT: ${shopPhone} &bull; MST: ${shopTaxCode}</div>` : `<div class="bold fs-lg">${shopName}</div>`}
</div>
<hr>
<div class="text-center">
  <div class="bold fs-lg">HÓA ĐƠN BÁN HÀNG</div>
  ${tpl.headerText ? `<div>${tpl.headerText}</div>` : ''}
  <div>Mã: ${order.id}</div>
  <div class="fs-sm">${formatDateTime(order.date)}</div>
</div>
<hr>
${showCashierName && (order.cashier || order.userName) ? `<div class="flex-between"><span>Thu ngân:</span><span class="bold">${order.cashier || order.userName}</span></div><hr>` : ''}
<table>
  <thead><tr><th class="text-left w40">MẶT HÀNG</th><th class="text-center w30">SL x GIÁ</th><th class="text-right w28">T.TIỀN</th></tr></thead>
  <tbody>${itemsHtml}</tbody>
</table>
<hr>
<div class="flex-between"><span>Tạm tính</span><span>${formatCurrency(order.subtotal)}</span></div>
${order.discount > 0 ? `<div class="flex-between"><span style="color:#c62828;">Giảm giá</span><span style="color:#c62828;">-${formatCurrency(order.discount)}</span></div>` : ''}
<div class="flex-between bold fs-lg"><span>TỔNG CỘNG</span><span>${formatCurrency(order.total)}</span></div>
<hr>
${showCustomerInfo ? `<div class="flex-between"><span>Khách hàng</span><span>${order.customer || 'Khách lẻ'}</span></div>` : ''}
${showPaymentMethod ? payLinesHtml : ''}
<div class="flex-between bold"><span>Đã thanh toán</span><span>${formatCurrency(order.totalPaid)}</span></div>
${order.change > 0 ? `<div class="flex-between"><span style="color:#e65100;">Tiền thừa</span><span style="color:#e65100;">${formatCurrency(order.change)}</span></div>` : ''}
<hr>
<div class="text-center" style="margin-top:8px">
  <div class="bold">${thankYou}</div>
  ${tpl.footerText ? `<div class="fs-sm" style="margin-top:2px">${tpl.footerText}</div>` : '<div class="fs-sm" style="margin-top:2px">Hẹn gặp lại &#9728;</div>'}
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
          <p className="font-bold text-slate-900 dark:text-[#e5e5e5]">HÓA ĐƠN BÁN HÀNG</p>
          <p className="text-xs text-slate-500 dark:text-[#999999]">Mã: {lastOrder.id}</p>
          <p className="text-xs text-slate-400 dark:text-[#808080]">{formatDateTime(lastOrder.date)}</p>
        </div>
        <div className="border-b border-t border-slate-200 py-2 dark:border-[#333333]">
          <div className="mb-1 grid grid-cols-4 gap-1 text-xs font-bold text-slate-500 dark:text-[#999999]">
            <span>Sản phẩm</span>
            <span className="text-center">SL</span>
            <span className="text-right">Đơn giá</span>
            <span className="text-right">Thành tiền</span>
          </div>
          {lastOrder.items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-4 gap-1 py-0.5 text-xs text-slate-700 dark:text-[#b3b3b3]">
              <span className="truncate">{item.name}</span>
              <span className="text-center">
                {item.quantity} {item.displayUnit || item.selectedUnit || item.unit || ''}
              </span>
              <span className="text-right">{formatCurrency(item.price)}</span>
              <span className="text-right font-medium">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-500 dark:text-[#999999]">
            <span>Tạm tính</span>
            <span>{formatCurrency(lastOrder.subtotal)}</span>
          </div>
          {lastOrder.discount > 0 && (
            <div className="flex justify-between text-xs text-emerald-600">
              <span>Giảm giá {lastOrder.discountPercent || ''}%</span>
              <span>-{formatCurrency(lastOrder.discount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-slate-200 pt-1 font-bold text-[#004785] dark:border-[#333333]">
            <span>TỔNG CỘNG</span>
            <span>{formatCurrency(lastOrder.total)}</span>
          </div>
        </div>
        <div className="space-y-1 rounded-lg bg-slate-50 p-3 text-xs dark:bg-[#1a1a1a]/50">
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
          <div className="flex justify-between border-t border-slate-200 pt-1 dark:border-[#333333]">
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
        <p className="text-center text-xs text-slate-400 dark:text-[#808080]">Cảm ơn quý khách!</p>
      </div>
    )}
  </Modal>
);

export default ReceiptModal;
