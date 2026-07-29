/**
 * GoodsIssueCreate - Container Page: Form Thêm mới / Sửa phiếu xuất kho.
 * Gồm: Header Info + Barcode Toggle + Editable Line Table + Footer + Unsaved Warning.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GoodsIssueHeaderInfo from '../components/goodsissue/GoodsIssueHeaderInfo';
import GoodsIssueLineTable from '../components/goodsissue/GoodsIssueLineTable';
import ConfirmUnsavedModal from '../components/goodsissue/ConfirmUnsavedModal';
import QuickAddCustomerModal from '../components/goodsissue/QuickAddCustomerModal';
import { useGoodsIssueForm } from '../hooks/useGoodsIssueForm';
import { useProductAutocomplete } from '../hooks/useProductAutocomplete';
import { customerList, issueTypes } from '../data/goodsIssueMockData';
import { formatMoney } from '../utils/goodsIssueUtils';
import Icon from '../../../shared/components/Icon';

const GoodsIssueCreate = () => {
  const navigate = useNavigate();
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [showQuickAddCustomer, setShowQuickAddCustomer] = useState(false);

  const form = useGoodsIssueForm();
  const autocomplete = useProductAutocomplete();

  const handleClose = () => {
    if (form.isDirty) {
      setShowUnsavedModal(true);
      return;
    }
    navigate('/inventory/goods-issue');
  };

  const handleCancel = () => {
    if (form.isDirty) {
      setShowUnsavedModal(true);
      return;
    }
    navigate('/inventory/goods-issue');
  };

  const handleUnsavedCancel = () => {
    setShowUnsavedModal(false);
  };

  const handleUnsavedDiscard = () => {
    setShowUnsavedModal(false);
    navigate('/inventory/goods-issue');
  };

  const handleUnsavedSave = async () => {
    setShowUnsavedModal(false);
    const success = await form.handleSubmit();
    if (success) {
      navigate('/inventory/goods-issue');
    }
  };

  const handleSave = async () => {
    const success = await form.handleSubmit();
    if (success) {
      navigate('/inventory/goods-issue');
    }
  };

  const handleQuickAddCustomer = (newCust) => {
    // trong thực tế sẽ gọi API; ở đây thêm tạm vào state form
    form.handleHeaderChange('customerId', newCust.code || `KH_${Date.now()}`);
    form.handleHeaderChange('customerName', newCust.name);
    setShowQuickAddCustomer(false);
  };

  const handleAttachFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        alert(`Đã chọn ${files.length} file`);
      }
    };
    input.click();
  };

  return (
    <div className="w-full space-y-4">
      {/* Header Bar: Title + Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-[#e5e5e5]">Tạo phiếu xuất kho</h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-[#999999]">
            Nhập thông tin phiếu xuất và Chi tiết hàng hóa
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#1a1a1a] px-4 py-2 text-sm font-semibold text-slate-600 dark:text-[#b3b3b3] transition-colors hover:bg-slate-50 dark:hover:bg-[#333333]"
          onClick={handleClose}
        >
          <Icon name="chevron_left" className="text-base" />
          <span>Trở về</span>
        </button>
      </div>

      {/* Header Info */}
      <GoodsIssueHeaderInfo
        header={form.header}
        onChange={form.handleHeaderChange}
        customerList={customerList}
        issueTypes={issueTypes}
        onQuickAddCustomer={() => setShowQuickAddCustomer(true)}
      />

      {/* Barcode Toggle + Chi tiết hàng hóa */}
      <div className="rounded-lg border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#1a1a1a] p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700 dark:text-[#b3b3b3]">
            Chi tiết hàng hóa
          </h3>
          <label className="flex cursor-pointer items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-[#999999]">Quét mã vạch</span>
            <button
              type="button"
              role="switch"
              aria-checked={form.barcodemode}
              onClick={() => form.setBarcodemode(!form.barcodemode)}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                form.barcodemode ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white dark:bg-[#1a1a1a] shadow transition-transform ${
                  form.barcodemode ? 'translate-x-[22px]' : 'translate-x-[2px]'
                }`}
              />
            </button>
          </label>
        </div>

        <GoodsIssueLineTable
          lines={form.lines}
          barcodemode={form.barcodemode}
          autocomplete={autocomplete}
          onLineChange={form.handleLineChange}
          onProductSelect={form.handleProductSelect}
          onQuantityChange={form.handleLineQuantityChange}
          onPriceChange={form.handleLinePriceChange}
          onAddLine={form.addLine}
          onRemoveLine={form.removeLine}
          onQuickAdd={() => alert('Thêm hàng hóa mới (F9)')}
          onAdvancedSearch={() => alert('Tìm nhanh hàng hóa (F3)')}
        />
      </div>

      {/* Footer: Đính kèm + Tổng tiền + Hủy/Lưu */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#1a1a1a] px-6 py-4 shadow-sm">
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 dark:border-[#404040] px-4 py-2.5 text-sm font-semibold text-slate-500 dark:text-[#999999] transition-colors hover:border-blue-400 hover:text-blue-600"
          onClick={handleAttachFile}
        >
          <Icon name="upload_file" className="text-base" />
          <span>Đính kèm file (Chọn tệp)</span>
        </button>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-slate-500 dark:text-[#999999]">Tổng Thành tiền: </span>
            <span className="ml-1 text-lg font-bold text-slate-900 dark:text-[#e5e5e5]">
              {formatMoney(form.totalAmount)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#1a1a1a] px-6 py-2.5 text-sm font-semibold text-slate-600 dark:text-[#b3b3b3] transition-colors hover:bg-slate-50 dark:hover:bg-[#333333]"
              onClick={handleCancel}
            >
              Hủy
            </button>
            <button
              type="button"
              className="rounded-lg bg-[#004785] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#003566] active:scale-95 disabled:opacity-50"
              onClick={handleSave}
              disabled={!form.isValid || form.saving}
            >
              {form.saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>
      </div>

      {/* Unsaved Changes Modal */}
      <ConfirmUnsavedModal
        isOpen={showUnsavedModal}
        onCancel={handleUnsavedCancel}
        onDiscard={handleUnsavedDiscard}
        onSave={handleUnsavedSave}
      />

      {/* Quick Add Customer Modal */}
      <QuickAddCustomerModal
        isOpen={showQuickAddCustomer}
        onClose={() => setShowQuickAddCustomer(false)}
        onSave={handleQuickAddCustomer}
      />
    </div>
  );
};

export default GoodsIssueCreate;
