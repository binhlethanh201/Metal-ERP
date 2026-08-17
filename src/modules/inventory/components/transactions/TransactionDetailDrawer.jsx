import { useEffect, useRef, useState } from 'react';
import { X, Package, User, FileText, Printer } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { TransactionTypeBadge } from './TransactionTypeBadge';
import { getStockTemplate } from '../../../owner/services/printTemplateService';

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(Number(value || 0));

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const ds = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
  const date = new Date(ds);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const TransactionDetailDrawer = ({ isOpen, onClose, transaction, loading = false }) => {
  const drawerRef = useRef(null);
  // eslint-disable-next-line no-unused-vars
  const [printLoading, setPrintLoading] = useState(false);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Khi Drawer mở, làm mờ/khóa nút thu gọn sidebar để không che UI chính
  useEffect(() => {
    try {
      const toggleBtn = document.querySelector('.inventory-sidebar-toggle');
      if (!toggleBtn) return;
      if (isOpen) {
        toggleBtn.classList.add('opacity-30', 'pointer-events-none');
      } else {
        toggleBtn.classList.remove('opacity-30', 'pointer-events-none');
      }
      return () => {
        toggleBtn.classList.remove('opacity-30', 'pointer-events-none');
      };
    } catch (e) {
      // ignore
    }
  }, [isOpen]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const totalQuantity =
    transaction?.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0;
  const totalAmount =
    transaction?.items?.reduce((sum, item) => {
      const qty = Number(item.quantity || 0);
      const price = Number(item.costPrice || item.unitPrice || 0);
      return sum + qty * price;
    }, 0) || 0;
  const isReturn = transaction?.ticketType === 'CUSTOMER_RETURN' || transaction?.ticketType === 'RETURN_SUPPLIER';
  const isExchange = (transaction?.reason || transaction?.note || '').toLowerCase().includes('doi hang');
  const actualPaidAmount = transaction?.totalAmount !== undefined ? transaction.totalAmount : totalAmount;

  const handlePrint = async () => {
    if (!transaction) return;
    setPrintLoading(true);

    // Xác định loại phiếu để lấy template tương ứng
    const ticketType = transaction.type === 'INWARD' ? 'PURCHASE' : 'SALE';

    let tpl = {};
    try {
      const res = await getStockTemplate(ticketType);
      tpl = res?.data || res || {};
      console.log(`[Print] Template for ${ticketType}:`, JSON.stringify(tpl, null, 2));
    } catch (err) {
      console.warn(`[Print] Failed to fetch template for ${ticketType}:`, err);
    }

    // Dùng nullish coalescing để giữ giá trị rỗng nếu user cố tình để trống
    const shopName = tpl.branchName ?? tpl.BranchName ?? 'MEP SYSTEM';
    const shopAddress = tpl.branchAddress ?? tpl.BranchAddress ?? '12 Nguyễn Văn Bảo, P.4, Gò Vấp, TP.HCM';
    const shopPhone = tpl.phone ?? tpl.Phone ?? '028.3999.8888';
    const shopTaxCode = tpl.taxCode ?? tpl.TaxCode ?? '0312345678';
    const headerExtra = tpl.headerText || '';
    const footerExtra = tpl.footerText || '';
    const fontFamily = tpl.fontFamily || 'Times New Roman, Times, serif';
    const fontSize = tpl.fontSize || 14;
    const paperSize = tpl.paperSize || 'A4';
    const showSignature = tpl.showSignature !== false;
    const showBranchInfo = tpl.showBranchInfo !== false;
    const showSupplier = tpl.showSupplier !== false;
    const showLogo = tpl.showLogo && tpl.logoUrl;
    const logoUrl = tpl.logoUrl || '';

    const printWindow = window.open('', '_blank', 'width=800,height=800');
    if (!printWindow) { setPrintLoading(false); return; }

    const typeLabel = transaction.type === 'INWARD' ? 'PHIẾU NHẬP KHO' : 'PHIẾU XUẤT KHO';

    const itemsHtml = transaction.items
      ?.map(
        (item, idx) => `
      <tr>
        <td class="c">${idx + 1}</td>
        <td>${item.productCode || '-'}</td>
        <td class="name">${item.productName || '-'}</td>
        <td class="c">${item.unit || item.unitName || '-'}</td>
        <td class="r">${Number(item.quantity || 0).toLocaleString('vi-VN')}</td>
        ${!isReturn ? `
        <td class="r">${formatCurrency(item.costPrice || item.unitPrice || 0)}</td>
        <td class="r">${formatCurrency(Number(item.quantity || 0) * Number(item.costPrice || item.unitPrice || 0))}</td>
        ` : ''}
      </tr>`
      )
      .join('');

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>In ${typeLabel.toLowerCase()} ${transaction.ticketCode}</title>
<style>
  @page { size: ${paperSize}; margin: 20mm; }
  *{margin:0;padding:0;box-sizing:border-box}
  body{
    font-family:${fontFamily};
    font-size:${fontSize}px;
    color:#000;
    background:#fff;
    max-width:800px;
    margin:0 auto;
    padding:20px;
    line-height:1.5;
  }
  .c{text-align:center}
  .r{text-align:right}
  .l{text-align:left}
  .bold{font-weight:bold}
  .header{display:flex;justify-content:space-between;margin-bottom:20px}
  .header-left h1{font-size:18px;margin-bottom:4px}
  .header-right{text-align:right}
  .title{text-align:center;margin:30px 0 20px}
  .title h2{font-size:24px;margin-bottom:5px;text-transform:uppercase}
  .title p{font-style:italic}
  .info{margin-bottom:20px;display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .info-full{grid-column:1/-1}
  table{width:100%;border-collapse:collapse;margin-bottom:30px}
  th,td{border:1px solid #000;padding:8px;vertical-align:middle}
  th{background:#f0f0f0;font-weight:bold}
  .footer{display:flex;justify-content:space-between;margin-top:50px;text-align:center}
  .signature{min-height:100px}
  @media print{
    body{max-width:100%;padding:0}
  }
</style></head>
<body>
  <div class="header">
    <div class="header-left">
      ${showLogo ? `<img src="${logoUrl}" alt="logo" style="max-height:60px;margin-bottom:4px" />` : ''}
      ${showBranchInfo ? `<h1>${shopName}</h1>
      <p>${shopAddress}</p>
      <p>ĐT: ${shopPhone} • MST: ${shopTaxCode}</p>` : `<h1>${shopName}</h1>`}
    </div>
    <div class="header-right">
      <p class="bold">Mã phiếu: ${transaction.ticketCode || '-'}</p>
      <p>Ngày in: ${new Date().toLocaleDateString('vi-VN')}</p>
    </div>
  </div>

  <div class="title">
    <h2>${typeLabel}</h2>
    ${headerExtra ? `<p>${headerExtra}</p>` : ''}
    <p>Ngày tạo: ${formatDate(transaction.createdAt)}</p>
  </div>

  <div class="info">
      ${showSupplier ? `<div class="info-full"><span class="bold">Đối tượng:</span> ${(transaction.partyName || '-').replace(/^.*?:\s*/g, '')}</div>` : ''}
    <div class="info-full"><span class="bold">Lý do / Ghi chú:</span> ${transaction.reason || transaction.note || '-'}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th width="5%">STT</th>
        <th width="15%">Mã SP</th>
        <th width="35%">Tên sản phẩm</th>
        <th width="10%">ĐVT</th>
        <th width="10%">SL</th>
        ${!isReturn ? `<th width="10%">Đơn giá</th>
        <th width="15%">Thành tiền</th>` : ''}
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="4" class="r bold">Tổng cộng:</td>
        <td class="r bold">${totalQuantity.toLocaleString('vi-VN')}</td>
        ${!isReturn ? `<td></td>
        <td class="r bold">${formatCurrency(totalAmount)}</td>` : ''}
      </tr>
    </tfoot>
  </table>

  ${footerExtra ? `<div style="text-align:center;margin-top:10px;font-style:italic">${footerExtra}</div>` : ''}
  ${showSignature ? `
  <div class="footer">
    <div class="signature">
      <p class="bold">Người lập phiếu</p>
      <p><i>(Ký, ghi rõ họ tên)</i></p>
      <br><br><br>
      <p>${transaction.createdByName || ''}</p>
    </div>
    <div class="signature">
      <p class="bold">Người giao hàng</p>
      <p><i>(Ký, ghi rõ họ tên)</i></p>
    </div>
    <div class="signature">
      <p class="bold">Thủ kho</p>
      <p><i>(Ký, ghi rõ họ tên)</i></p>
    </div>
  </div>` : ''}
  <script>window.onload=function(){window.print();}</script>
</body>
</html>`);
    printWindow.document.close();
    setPrintLoading(false);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity"
          onClick={handleBackdropClick}
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-2xl bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-[#0f0f0f] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-b-[#333333] dark:bg-[#0f0f0f]">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-[#e5e5e5]">Chi tiết phiếu</h2>
            {transaction?.ticketCode && (
              <p className="mt-0.5 font-mono text-sm text-slate-500 dark:text-[#999999]">{transaction.ticketCode}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={printLoading}
              className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#b3b3b3] dark:hover:bg-[#333333]"
            >
              <Printer className="h-4 w-4" />
              {printLoading ? 'Đang tải...' : 'In phiếu'}
            </button>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#999999] dark:hover:bg-[#333333] dark:hover:text-[#d4d4d4]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-73px)] overflow-y-auto p-6">
          {loading ? (
            <div className="space-y-6">
              <div className="h-24 animate-pulse rounded-xl bg-slate-200 dark:bg-[#272727]" />
              <div className="h-64 animate-pulse rounded-xl bg-slate-200 dark:bg-[#272727]" />
            </div>
          ) : transaction ? (
            <div className="space-y-6">
              {/* Info Cards */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-[#333333] dark:bg-[#1a1a1a]">
                  <div className="mb-2 flex items-center gap-2 text-slate-500 dark:text-[#999999]">
                    <Package className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">Loại phiếu</span>
                  </div>
                  <TransactionTypeBadge type={transaction.ticketType || transaction.type} />
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-[#333333] dark:bg-[#1a1a1a]">
                  <div className="mb-2 flex items-center gap-2 text-slate-500 dark:text-[#999999]">
                    <FileText className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">Trạng thái</span>
                  </div>
                  <StatusBadge status={transaction.status} />
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-[#333333] dark:bg-[#1a1a1a]">
                  <div className="mb-2 flex items-center gap-2 text-slate-500 dark:text-[#999999]">
                    <User className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">Người tạo</span>
                  </div>
                  <p className="font-medium text-slate-900 dark:text-[#e5e5e5]">{transaction.createdByName || '-'}</p>
                </div>
              </div>

              {/* General Info */}
              <div className="rounded-xl border border-slate-200 p-4 dark:border-[#333333]">
                <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-[#b3b3b3]">Thông tin chung</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-[#999999]">Mã phiếu</p>
                    <p className="font-mono font-medium text-slate-900 dark:text-[#e5e5e5]">
                      {transaction.ticketCode || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-[#999999]">Ngày tạo</p>
                    <p className="font-medium text-slate-900 dark:text-[#e5e5e5]">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-[#999999]">Đối tượng</p>
                    <p className="font-medium text-slate-900 dark:text-[#e5e5e5]">{transaction.partyName || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-slate-500 dark:text-[#999999]">Lý do / Ghi chú</p>
                    <p className="font-medium text-slate-900 dark:text-[#e5e5e5]">
                      {(() => {
                        const raw = transaction.reason || transaction.note || '';
                        if (isReturn && (!raw || raw === 'Nhập kho')) return 'Khách hàng trả';
                        return raw || '-';
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="rounded-xl border border-slate-200 dark:border-[#333333]">
                <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-b-[#333333] dark:bg-[#1a1a1a]">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-[#b3b3b3]">Danh sách sản phẩm</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-white text-left text-xs text-slate-500 dark:border-b-[#333333] dark:bg-[#0f0f0f] dark:text-[#999999]">
                        <th className="px-4 py-3 font-medium">STT</th>
                        <th className="px-4 py-3 font-medium">Ảnh</th>
                        <th className="px-4 py-3 font-medium">Mã SP</th>
                        <th className="px-4 py-3 font-medium">Tên sản phẩm</th>
                        <th className="px-4 py-3 text-right font-medium">ĐVT</th>
                        <th className="px-4 py-3 text-right font-medium">SL</th>
                        {!isReturn && <th className="px-4 py-3 text-right font-medium">Đơn giá</th>}
                        {!isReturn && <th className="px-4 py-3 text-right font-medium">Thành tiền</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {transaction.items?.map((item, index) => (
                        <tr key={item.id || index} className="border-b border-slate-100 dark:border-b-[#333333]">
                          <td className="px-4 py-3 text-slate-500 dark:text-[#999999]">{index + 1}</td>
                          <td className="px-4 py-3">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.productName}
                                className="h-10 w-10 rounded-lg object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-[#1a1a1a]">
                                <Package className="h-5 w-5 text-slate-400 dark:text-[#808080]" />
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-700 dark:text-[#b3b3b3]">
                            {item.productCode || '-'}
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-900 dark:text-[#e5e5e5]">
                            {item.productName || '-'}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-600 dark:text-[#999999]">
                            {item.unit || item.Unit || item.unitName || item.UnitName || '-'}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-[#e5e5e5]">
                            {Number(item.quantity || 0).toLocaleString('vi-VN')}
                          </td>
                          {!isReturn && (
                            <td className="px-4 py-3 text-right text-slate-600 dark:text-[#999999]">
                              {formatCurrency(item.costPrice || item.unitPrice || 0)}
                            </td>
                          )}
                          {!isReturn && (
                            <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-[#e5e5e5]">
                              {formatCurrency(
                                Number(item.quantity || 0) *
                                  Number(item.costPrice || item.unitPrice || 0)
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary */}
                <div className="border-t border-slate-200 bg-slate-50 px-4 py-4 dark:border-t-[#333333] dark:bg-[#1a1a1a]">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-8">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-[#999999]">Số mặt hàng</p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-[#e5e5e5]">
                          {transaction.items?.length || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-[#999999]">Tổng số lượng</p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-[#e5e5e5]">
                          {totalQuantity.toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    {!isReturn && (
                    <div className="flex gap-8 text-right">
                      {isExchange ? (
                        <>
                          <div>
                            <p className="text-xs text-slate-500 dark:text-[#999999]">Tổng thành tiền</p>
                            <p className="text-lg font-semibold text-slate-700 line-through dark:text-[#b3b3b3]">
                              {formatCurrency(totalAmount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 dark:text-[#999999]">Thu thêm (Đổi chênh)</p>
                            <p className="text-2xl font-bold text-[#004785] dark:text-blue-400">
                              {formatCurrency(actualPaidAmount)}
                            </p>
                          </div>
                        </>
                      ) : (
                        <div>
                          <p className="text-xs text-slate-500 dark:text-[#999999]">Tổng tiền</p>
                          <p className="text-2xl font-bold text-emerald-600">
                            {formatCurrency(totalAmount)}
                          </p>
                        </div>
                      )}
                    </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center">
              <p className="text-slate-500 dark:text-[#999999]">Không có dữ liệu</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TransactionDetailDrawer;
