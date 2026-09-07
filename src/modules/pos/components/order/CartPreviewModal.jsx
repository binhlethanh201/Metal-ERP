import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { formatCurrency } from '../../../../shared/utils/formatCurrency';
import { getInvoiceTemplate } from '../../../owner/services/printTemplateService';

const cleanUnit = (name) => name ? name.replace(/^[\d]+\s+/g, '').trim() : '';

let cachedTemplate = null;
let templateCacheTime = 0;

/** Load template from API with 5min cache */
async function getShopInfo() {
  if (cachedTemplate && Date.now() - templateCacheTime < 300000) return cachedTemplate;
  try {
    const res = await getInvoiceTemplate();
    cachedTemplate = res?.data || res || {};
    templateCacheTime = Date.now();
    return cachedTemplate;
  } catch {
    return {};
  }
}

/** Open print window with cart items — same style as ReceiptModal */
const printCartAsInvoice = async (cartItems, customerName, subtotal) => {
  if (!cartItems || cartItems.length === 0) return;

  const tpl = await getShopInfo();
  const shopName = tpl.branchName || 'MEP SYSTEM';
  const shopAddress = tpl.branchAddress || '12 Nguyễn Văn Bảo, P.4, Gò Vấp, TP.HCM';
  const shopPhone = tpl.phone || '0968136886';
  const paperSize = tpl.paperSize === 'K58' ? '58mm' : '80mm';
  const fontSize = tpl.fontSize || 14;
  const fontFamily = tpl.fontFamily === 'sans-serif' ? 'Arial, sans-serif' : tpl.fontFamily === 'serif' ? 'Georgia, serif' : "'Courier New', Courier, monospace";

  const itemsHtml = cartItems
    .map(
      (item) => `
      <tr>
        <td class="text-left">${item.name || 'Sản phẩm'}</td>
        <td class="text-center">${item.quantity || 0}</td>
        <td class="text-center">${cleanUnit(item.displayUnit || item.selectedUnit || item.unit || '')}</td>
        <td class="text-right">${formatCurrency((item.price || 0) * (item.quantity || 0))}</td>
      </tr>`
    )
    .join('');

  const total = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);

  const printWindow = window.open('', '_blank', 'width=420,height=800');
  if (!printWindow) return;

  printWindow.document.write(`<!DOCTYPE html>
<html lang="vi">
<head><meta charset="utf-8"><title>Xem trước hóa đơn</title>
<style>
  @page { size: ${paperSize} ${paperSize === '58mm' ? 'auto' : '297mm'}; margin: 0; }
  *{margin:0;padding:0;box-sizing:border-box}
  body{
    width:${paperSize};
    max-width:600px;
    margin:0 auto;
    padding:20px 15px;
    font-family:${fontFamily};
    font-size:${fontSize}px;
    line-height:1.4;
    color:#000;
    background:#fff;
  }
  .text-center{text-align:center}
  .text-left{text-align:left}
  .text-right{text-align:right;white-space:nowrap}
  .bold{font-weight:700}
  .fs-sm{font-size:12px}
  .fs-lg{font-size:16px}
  hr{border:none;border-bottom:1px dashed #000;margin:8px 0}
  .flex-between{display:flex;justify-content:space-between;align-items:center;margin:2px 0}
  table{width:100%;border-collapse:collapse;margin:4px 0}
  th,td{padding:4px 0;vertical-align:top}
  th{font-size:12px;font-weight:700;text-transform:uppercase;border-bottom:1px dashed #000}
  th.w40{width:42%}
  th.w10{width:10%}
  th.w15{width:15%}
  th.w28{width:28%}
</style></head>
<body>
<div class="text-center">
  <div class="bold fs-lg">${shopName}</div>
  <div>${shopAddress}</div>
  <div class="fs-sm">ĐT: ${shopPhone}</div>
</div>
<hr>
<div class="text-center">
  <div class="bold fs-lg">HÓA ĐƠN BÁN HÀNG</div>
  <div class="fs-sm">(Xem trước)</div>
  <div>Mã: PV${Date.now().toString().slice(-8)}</div>
  <div class="fs-sm">${new Date().toLocaleString('vi-VN')}</div>
</div>
<hr>
<div class="flex-between"><span>Khách hàng:</span><span>${customerName || 'Khách lẻ'}</span></div>
<hr>
<table>
  <thead><tr><th class="text-left w40">MẶT HÀNG</th><th class="text-center w10">SL</th><th class="text-center w15">ĐVT</th><th class="text-right w28">T.TIỀN</th></tr></thead>
  <tbody>${itemsHtml}</tbody>
</table>
<hr>
<div class="flex-between bold fs-lg"><span>TỔNG CỘNG</span><span>${formatCurrency(total)}</span></div>
<hr>
<script>window.onload=function(){window.print()}</script>
</body></html>`);
  printWindow.document.close();
};

const CartPreviewModal = ({ isOpen, onClose, cart, subtotal, customer }) => {
  if (!cart || cart.length === 0) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xem trước hóa đơn"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Đóng
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              printCartAsInvoice(cart, customer?.name || customer || 'Khách lẻ', subtotal);
              onClose();
            }}
          >
            In xem trước
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-base">
        <div className="text-center border-b pb-3 dark:border-slate-700">
          <p className="font-extrabold text-lg text-slate-900 dark:text-[#e5e5e5] tracking-wide uppercase">HÓA ĐƠN BÁN HÀNG</p>
          <p className="text-sm mt-1 font-semibold text-blue-600 dark:text-blue-400">(Xem trước)</p>
          <p className="text-sm font-semibold text-slate-600 dark:text-[#999999]">Mã: PV{Date.now().toString().slice(-8)}</p>
          <p className="text-sm text-slate-500 dark:text-[#808080]">{new Date().toLocaleString('vi-VN')}</p>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600 dark:text-[#999999]">Khách hàng:</span>
          <span className="font-semibold">{customer?.name || customer || 'Khách lẻ'}</span>
        </div>
        <div className="border-t border-b py-3 dark:border-slate-700">
          <div className="mb-2 grid grid-cols-4 gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#999999]">
            <span>Sản phẩm</span>
            <span className="text-center">SL</span>
            <span className="text-center">ĐVT</span>
            <span className="text-right">Thành tiền</span>
          </div>
          {cart.map((item, idx) => (
            <div key={idx} className="grid grid-cols-4 gap-2 py-1.5 text-sm text-slate-700 dark:text-[#b3b3b3] border-b border-slate-100 dark:border-slate-800 last:border-0">
              <span className="break-words">{item.name || 'Sản phẩm'}</span>
              <span className="text-center font-semibold">{item.quantity || 0}</span>
              <span className="text-center">{cleanUnit(item.displayUnit || item.selectedUnit || item.unit || '')}</span>
              <span className="text-right font-bold text-slate-900 dark:text-[#e5e5e5]">
                {formatCurrency((item.price || 0) * (item.quantity || 0))}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
          <span className="font-bold text-lg text-slate-900 dark:text-[#e5e5e5]">TỔNG CỘNG</span>
          <span className="font-extrabold text-xl text-[#004785]">{formatCurrency(subtotal)}</span>
        </div>
      </div>
    </Modal>
  );
};

export default CartPreviewModal;
