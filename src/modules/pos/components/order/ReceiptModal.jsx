import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { formatCurrency } from '../../../../shared/utils/formatCurrency';
import { formatDateTime } from '../../../../shared/utils/formatDate';
import { getInvoiceTemplate } from '../../../owner/services/printTemplateService';

const cleanUnit = (name) => name ? name.replace(/^[\d]+\s+/g, '').trim() : '';

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

  const itemsHtml = (order.items || [])
    .map(
      (item) => {
        const qty = Number(item.quantity) || 0;
        const unitPrice = Number(item.price) || 0; // giá gốc
        const discountPercent = Number(item.discountPercent || item.DiscountPercent) || 0;
        const totalOriginal = unitPrice * qty;
        const paidAmount = totalOriginal * (1 - discountPercent / 100);
        return `
      <tr>
        <td class="text-left">${item.name}</td>
        <td class="text-center">${qty}</td>
        <td class="text-center">${cleanUnit(item.displayUnit || item.selectedUnit || item.unit || '')}</td>
        <td class="text-right">
          ${formatCurrency(paidAmount)}${discountPercent > 0 ? `<br><s style="color:#c62828;font-size:11px">${formatCurrency(totalOriginal)}</s>` : ''}
        </td>
      </tr>`;
      }
    )
    .join('');

  const payLines = order.payLines || [];
  const payLinesHtml = payLines
    .map((pl) => `<div class="flex-between"><span>${pl.method}</span><span>${formatCurrency(pl.amount)}</span></div>`)
    .join('');

  const printWindow = window.open('', '_blank', 'width=420,height=800');
  if (!printWindow) return;

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
  th.w10{width:10%}
  th.w15{width:15%}
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
   <div class="fs-sm">ĐT: ${shopPhone}</div>` : `<div class="bold fs-lg">${shopName}</div>`}
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
  <thead><tr><th class="text-left w40">MẶT HÀNG</th><th class="text-center w10">SL</th><th class="text-center w15">ĐVT</th><th class="text-right w28">T.TIỀN</th></tr></thead>
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
    size="xl"
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
      <div className="space-y-4 text-base">
        <div className="text-center border-b pb-3 dark:border-slate-700">
          <p className="font-extrabold text-lg text-slate-900 dark:text-[#e5e5e5] tracking-wide uppercase">HÓA ĐƠN BÁN HÀNG</p>
          <p className="text-sm mt-1 font-semibold text-slate-600 dark:text-[#999999]">Mã: {lastOrder.id}</p>
          <p className="text-sm text-slate-500 dark:text-[#808080]">{formatDateTime(lastOrder.date)}</p>
        </div>
        <div className="border-t border-b py-3 dark:border-slate-700">
          <div className="mb-2 grid grid-cols-4 gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#999999]">
            <span>Sản phẩm</span>
            <span className="text-center">SL</span>
            <span className="text-center">ĐVT</span>
            <span className="text-right">Thành tiền</span>
          </div>
          {lastOrder.items.map((item, idx) => {
            const qty = Number(item.quantity) || 0;
            const unitPrice = Number(item.price) || 0; // giá gốc
            const discountPercent = Number(item.discountPercent || item.DiscountPercent) || 0;
            const totalOriginal = unitPrice * qty; // tổng giá gốc
            const paidAmount = totalOriginal * (1 - discountPercent / 100); // số tiền thực trả
            return (
              <div key={idx} className="grid grid-cols-4 gap-2 py-1.5 text-sm text-slate-700 dark:text-[#b3b3b3] border-b border-slate-100 dark:border-slate-800 last:border-0">
                <span className="font-medium">{item.name}</span>
                <span className="text-center font-semibold">{qty}</span>
                <span className="text-center">{cleanUnit(item.displayUnit || item.selectedUnit || item.unit || '')}</span>
                <span className="text-right leading-tight">
                  <span className="block font-bold text-slate-900 dark:text-[#e5e5e5]">{formatCurrency(paidAmount)}</span>
                  {discountPercent > 0 && (
                    <span className="block text-xs text-red-500 line-through">{formatCurrency(totalOriginal)}</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
        <div className="space-y-2 bg-slate-50 p-4 rounded-lg dark:bg-[#1a1a1a]/50">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-[#999999]">Tạm tính</span>
            <span className="font-semibold">{formatCurrency(lastOrder.subtotal)}</span>
          </div>
          {lastOrder.discount > 0 && (
            <div className="flex justify-between text-sm text-emerald-600 font-medium">
              <span>Giảm giá</span>
              <span>-{formatCurrency(lastOrder.discount)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
            <span className="font-bold text-base text-slate-900 dark:text-[#e5e5e5]">TỔNG CỘNG</span>
            <span className="font-extrabold text-lg text-[#004785]">{formatCurrency(lastOrder.total)}</span>
          </div>
        </div>
        <div className="space-y-2 rounded-lg bg-slate-50 p-4 text-sm dark:bg-[#1a1a1a]/50">
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-[#999999]">Khách hàng:</span>
            <span className="font-semibold">{lastOrder.customer}</span>
          </div>
          {lastOrder.payLines.map((pl, i) => (
            <div key={i} className="flex justify-between">
              <span>{pl.method}:</span>
              <span className="font-semibold">{formatCurrency(pl.amount)}</span>
            </div>
          ))}
          <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
            <span>Đã thanh toán:</span>
            <span className="font-bold text-green-600 text-base">{formatCurrency(lastOrder.totalPaid)}</span>
          </div>
          {lastOrder.change > 0 && (
            <div className="flex justify-between">
              <span>Tiền thừa:</span>
              <span className="font-bold text-amber-600">{formatCurrency(lastOrder.change)}</span>
            </div>
          )}
        </div>
        <p className="text-center text-sm text-slate-400 dark:text-[#808080] italic">Cảm ơn quý khách!</p>
      </div>
    )}
  </Modal>
);

export default ReceiptModal;
