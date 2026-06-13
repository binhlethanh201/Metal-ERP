import React from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { formatCurrency } from '../../../../shared/utils/formatCurrency';
import ReconciliationDetailTable from './ReconciliationDetailTable';

const STEP_LABELS = ['Chọn đơn đối soát', 'Thông tin đối soát', 'Xác nhận & hoàn tất'];

const PAYMENT_METHODS = ['Chuyển khoản', 'Tiền mặt', 'COD', 'Ví điện tử'];

const OrderReconciliationModal = ({
  isOpen,
  step,
  onClose,
  onStepChange,
  unreconciledOrders,
  searchedOrders,
  reconSearch,
  onSearchChange,
  reconciliationOrderIds,
  reconciliationOrders,
  reconciliationData,
  setReconciliationData,
  summary,
  canProceed,
  onToggleOrder,
  onToggleAll,
  onSubmit,
}) => {
  const stepIndicator = (
    <div className="mb-6 flex items-center justify-center gap-2">
      {STEP_LABELS.map((label, i) => (
        <React.Fragment key={label}>
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                i + 1 <= step ? 'bg-[#004785] text-white' : 'bg-slate-100 text-slate-400'
              }`}
            >
              {i + 1 < step ? '✓' : i + 1}
            </div>
            <span
              className={`text-xs font-medium ${
                i + 1 === step ? 'text-[#004785]' : 'text-slate-400'
              }`}
            >
              {label}
            </span>
          </div>
          {i < 2 && <div className="mx-1 h-px w-8 bg-slate-200" />}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <p className="text-sm text-slate-600">
          Chọn các đơn hàng <strong>chưa đối soát</strong> để tạo phiếu đối soát.
        </p>
        <span className="text-xs text-slate-400">
          ({unreconciledOrders.length} đơn chưa đối soát)
        </span>
      </div>
      <div className="mb-3">
        <input
          type="text"
          value={reconSearch}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm mã đơn, khách hàng, SĐT, mã vận đơn..."
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#004785] focus:outline-none"
        />
        {reconSearch.trim() && (
          <p className="mt-1 text-[11px] text-slate-400">Tìm thấy {searchedOrders.length} đơn</p>
        )}
      </div>
      <ReconciliationDetailTable
        orders={searchedOrders}
        selectedIds={reconciliationOrderIds}
        onToggle={onToggleOrder}
        onToggleAll={onToggleAll}
      />
      {reconciliationOrderIds.size > 0 && (
        <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50/50 px-4 py-3">
          <span className="text-sm font-medium text-[#004785]">
            Đã chọn {reconciliationOrderIds.size} đơn — Tổng tiền hàng:{' '}
            <strong>{formatCurrency(summary.totalPayment)}</strong>
          </span>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div>
      <p className="mb-4 text-sm text-slate-600">
        Nhập thông tin phiếu đối soát cho <strong>{reconciliationOrderIds.size} đơn</strong> đã
        chọn.
      </p>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
              Mã phiếu đối soát
            </label>
            <input
              type="text"
              value={reconciliationData.voucherNo}
              onChange={(e) => setReconciliationData((p) => ({ ...p, voucherNo: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm focus:border-[#004785] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
              Ngày đối soát
            </label>
            <input
              type="date"
              value={reconciliationData.date}
              onChange={(e) => setReconciliationData((p) => ({ ...p, date: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#004785] focus:outline-none"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
              Phương thức thanh toán
            </label>
            <select
              value={reconciliationData.paymentMethod}
              onChange={(e) =>
                setReconciliationData((p) => ({ ...p, paymentMethod: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#004785] focus:outline-none"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
              Tổng tiền thực thu
            </label>
            <input
              type="number"
              value={reconciliationData.actualCollected}
              onChange={(e) =>
                setReconciliationData((p) => ({ ...p, actualCollected: e.target.value }))
              }
              placeholder={formatCurrency(summary.totalDeposit + summary.totalCod)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#004785] focus:outline-none"
            />
            <p className="mt-0.5 text-[10px] text-slate-400">
              Đã thu dự kiến: {formatCurrency(summary.totalDeposit + summary.totalCod)} (cọc + COD)
            </p>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Ghi chú</label>
          <textarea
            value={reconciliationData.note}
            onChange={(e) => setReconciliationData((p) => ({ ...p, note: e.target.value }))}
            rows={3}
            placeholder="Nhập ghi chú cho phiếu đối soát..."
            className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#004785] focus:outline-none"
          />
        </div>
      </div>
    </div>
  );

  const cashSummary = [
    { label: 'Tổng tiền hàng', value: summary.totalPayment, color: 'text-slate-700' },
    {
      label: 'Đã thu (cọc + COD)',
      value: summary.totalDeposit + summary.totalCod,
      color: 'text-green-600',
    },
    { label: 'Còn phải thu', value: summary.totalRemaining, color: 'text-amber-600' },
    { label: 'Khách nợ', value: summary.totalCustomerDebt, color: 'text-red-500' },
    { label: 'Phí GH thu khách', value: summary.totalShippingCustomer, color: 'text-slate-600' },
    { label: 'Phí GH trả ĐVVC', value: summary.totalShippingPartner, color: 'text-slate-600' },
  ];

  const renderStep3 = () => (
    <div>
      <p className="mb-4 text-sm text-slate-600">
        Xác nhận hoàn tất đối soát cho <strong>{summary.count} đơn hàng</strong>.
      </p>

      <div className="mb-4 grid grid-cols-3 gap-3">
        {cashSummary.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5"
          >
            <p className="text-[10px] font-bold uppercase text-slate-400">{item.label}</p>
            <p className={`mt-0.5 text-sm font-bold ${item.color}`}>{formatCurrency(item.value)}</p>
          </div>
        ))}
      </div>

      <div className="mb-2 rounded-lg border border-slate-200 bg-white px-4 py-3">
        <p className="text-xs text-slate-500">
          <strong>Mã phiếu:</strong> {reconciliationData.voucherNo} &nbsp;|&nbsp;
          <strong>Ngày:</strong> {reconciliationData.date} &nbsp;|&nbsp;
          <strong>Phương thức:</strong> {reconciliationData.paymentMethod}
          {reconciliationData.actualCollected && (
            <>
              &nbsp;|&nbsp;
              <strong>Thực thu:</strong>{' '}
              {formatCurrency(Number(reconciliationData.actualCollected))}
            </>
          )}
        </p>
        {reconciliationData.note && (
          <p className="mt-1 text-xs text-slate-400">{reconciliationData.note}</p>
        )}
      </div>

      <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
        <p className="text-sm font-medium text-green-700">
          ✓ Sau khi hoàn tất, {summary.count} đơn hàng sẽ được đánh dấu <strong>Đã đối soát</strong>
          .
        </p>
      </div>
    </div>
  );

  const footer = (
    <div className="flex w-full items-center justify-between">
      <span className="text-xs text-slate-400">
        Bước {step}/{STEP_LABELS.length}
      </span>
      <div className="flex gap-2">
        {step > 1 && (
          <Button variant="secondary" onClick={() => onStepChange(step - 1)}>
            Quay lại
          </Button>
        )}
        {step < 3 ? (
          <Button variant="primary" disabled={!canProceed} onClick={() => onStepChange(step + 1)}>
            Tiếp tục
          </Button>
        ) : (
          <Button variant="primary" onClick={onSubmit}>
            Hoàn tất đối soát
          </Button>
        )}
        <Button variant="secondary" onClick={onClose}>
          Hủy bỏ
        </Button>
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Đối soát đơn hàng" size="4xl" footer={footer}>
      {stepIndicator}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </Modal>
  );
};

export default OrderReconciliationModal;
