/**
 * GoodsReceiptPopup - Popup Thêm mới Phiếu Nhập Kho (Spec đầy đủ).
 * Đã tách sub-components: ReceiptHeader, ReceiptMasterData, ReceiptLineTable, ReceiptFooter.
 */
import { useEffect, useRef, useState } from 'react';
import Icon from '../../../../shared/components/Icon';
import ReceiptHeader from './ReceiptHeader';
import ReceiptMasterData from './ReceiptMasterData';
import ReceiptLineTable from './ReceiptLineTable';
import ReceiptFooter from './ReceiptFooter';
import SupplierQuickAddPopup from './SupplierQuickAddPopup';
import ProductQuickAddPopup from './ProductQuickAddPopup';
import { useGoodsReceiptPopup } from '../../hooks/useGoodsReceiptPopup';

const GoodsReceiptPopup = ({ isOpen, onClose }) => {
  const p = useGoodsReceiptPopup(onClose);
  const overlayRef = useRef(null);
  const [showSupplierPopup, setShowSupplierPopup] = useState(false);
  const [showProductPopup, setShowProductPopup] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'Escape') p.requestClose();
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [p.requestClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[250] flex items-start justify-center overflow-y-auto py-4">
        <div
          ref={overlayRef}
          className="fixed inset-0 bg-black/60"
          onClick={(e) => {
            if (e.target === overlayRef.current) p.requestClose();
          }}
        />
        <div className="relative z-10 flex max-h-[95vh] w-full max-w-[1500px] flex-col rounded-xl bg-white shadow-2xl">
          <ReceiptHeader
            receiptType={p.receiptType}
            onTypeChange={p.setReceiptType}
            onClose={p.requestClose}
          />
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            <ReceiptMasterData p={p} onAddSupplier={() => setShowSupplierPopup(true)} />
            <ReceiptLineTable p={p} onRequestNewProduct={() => setShowProductPopup(true)} />
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase text-slate-600">📎 File đính kèm</h3>
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-4 py-2 text-sm font-semibold text-slate-500 hover:border-blue-400 hover:text-blue-600"
                  onClick={p.handleAttach}
                >
                  <Icon name="upload_file" className="text-base" /> Chọn tệp
                </button>
              </div>
              {p.attachments.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {p.attachments.map((a) => (
                    <div
                      key={a.name}
                      className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                    >
                      <span className="text-sm text-slate-600">
                        {a.name}{' '}
                        <span className="text-xs text-slate-400">
                          ({(a.size / 1024).toFixed(1)} KB)
                        </span>
                      </span>
                      <button
                        type="button"
                        className="text-slate-400 hover:text-red-500"
                        onClick={() => p.handleRemoveAttach(a.name)}
                      >
                        <Icon name="close" size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-2 text-xs text-slate-400">
                Hỗ trợ: pdf, doc, docx, xls, xlsx, jpg, png, zip, rar - Tối đa 20MB/file
              </p>
            </div>
          </div>
          <ReceiptFooter p={p} onClose={p.requestClose} />

          <SupplierQuickAddPopup
            isOpen={showSupplierPopup}
            onClose={() => setShowSupplierPopup(false)}
            onSave={(data) => p.handleHeader('supplierName', data.name)}
          />

          {p.showConfirmClose && (
            <div className="fixed inset-0 z-[400] flex items-center justify-center">
              <div
                className="fixed inset-0 bg-black/50"
                onClick={() => p.setShowConfirmClose(false)}
              />
              <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
                <div className="mb-4 flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100">
                    <Icon name="warning" className="text-amber-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Bạn có chắc muốn thoát?</h3>
                    <p className="mt-1 text-sm text-slate-500">Dữ liệu chưa được lưu sẽ bị mất.</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    onClick={() => p.setShowConfirmClose(false)}
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                    onClick={() => {
                      p.setShowConfirmClose(false);
                      onClose?.();
                    }}
                  >
                    Thoát không lưu
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-[#004785] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#003566]"
                    onClick={async () => {
                      const ok = await p.handleSubmit();
                      if (ok) onClose?.();
                    }}
                  >
                    Lưu
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ProductQuickAddPopup
        isOpen={showProductPopup}
        onClose={() => setShowProductPopup(false)}
        onSave={(prod) => {
          p.handleApplyNewProduct(prod);
          setShowProductPopup(false);
        }}
      />
    </>
  );
};

export default GoodsReceiptPopup;
