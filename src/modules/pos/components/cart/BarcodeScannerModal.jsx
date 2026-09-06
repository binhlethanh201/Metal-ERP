/**
 * BarcodeScannerModal - Modal quét mã vạch bằng camera
 * Tích hợp html5-qrcode vào Modal của dự án
 */
import { useState, useEffect } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import Icon from '../../../../shared/components/Icon';
import { useBarcodeScanner } from '../../../../shared/hooks/useBarcodeScanner';

const ScannerOverlay = ({ result, error, isScanning, onConfirm }) => (
  <>
    {result && (
      <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
        <div className="flex items-center gap-2">
          <Icon name="check_circle" size={18} className="text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Quét thành công!</span>
        </div>
        <p className="mt-2 break-all font-mono text-lg font-bold text-slate-800 dark:text-[#e5e5e5]">
          {result}
        </p>
        <div className="mt-3 flex gap-2">
          <Button variant="primary" size="sm" onClick={onConfirm}>
            <Icon name="check" size={16} /> Sử dụng mã này
          </Button>
        </div>
      </div>
    )}

    {error && !isScanning && (
      <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
        <div className="flex items-start gap-2">
          <Icon name="warning" size={18} className="mt-0.5 text-red-600 dark:text-red-400" />
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">Lỗi camera</p>
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    )}

    {!result && !error && (
      <div className="mb-3 text-center">
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
          <Icon name="barcode_scanner" size={20} className="text-[#004785] dark:text-blue-400" />
        </div>
        <p className="text-sm text-slate-500 dark:text-[#999999]">
          {!isScanning ? 'Nhấn "Mở camera" để bắt đầu' : 'Đưa mã vạch vào khung quét'}
        </p>
        <p className="mt-1 text-xs text-slate-400 dark:text-[#808080]">
          Hỗ trợ: EAN-13, EAN-8, Code 128, QR Code, UPC...
        </p>
      </div>
    )}
  </>
);

export const BarcodeScannerModal = ({ isOpen, onClose, onScanComplete, resultTitle = 'Kết quả quét' }) => {
  const {
    isScanning,
    hasCameraPermission,
    cameraError,
    scannedResult,
    startScanning,
    stopScanning,
    clearResult,
  } = useBarcodeScanner({ qrbox: { width: 260, height: 150 } });

  useEffect(() => {
    if (!isOpen) {
      clearResult();
    }
  }, [isOpen]);

  const handleOpen = async () => {
    await startScanning('scanner-container');
  };

  const handleClose = async () => {
    await stopScanning();
    clearResult();
    onClose();
  };

  const handleConfirm = () => {
    onScanComplete?.(scannedResult);
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={resultTitle || 'Quét mã vạch'}
      size="lg"
      footer={
        <div className="flex gap-2">
          {!isScanning && !scannedResult && (
            <Button variant="success" size="sm" onClick={handleOpen}>
              <Icon name="barcode_scanner" size={16} /> Mở camera
            </Button>
          )}
          {isScanning && (
            <Button variant="danger" size="sm" onClick={stopScanning}>
              <Icon name="close" size={16} /> Dừng quét
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={handleClose}>
            Đóng
          </Button>
        </div>
      }
    >
      <div>
        <ScannerOverlay
          result={scannedResult}
          error={cameraError}
          isScanning={isScanning}
          onConfirm={handleConfirm}
        />

        {/* Container cho html5-qrcode tự render camera + UI */}
        <div
          id="scanner-container"
          className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-[#333333] dark:bg-[#0f0f0f]"
          style={{ minHeight: 250 }}
        />

        <div className="mt-3 flex flex-col gap-2 text-xs text-slate-400 dark:text-[#808080] sm:flex-row sm:items-center sm:justify-between">
          <p>
            <strong>Lưu ý:</strong> Đảm bảo ánh sáng đủ tốt và mã vạch thẳng hàng với camera
          </p>
          <p>{hasCameraPermission ? 'Đã cấp quyền camera' : 'Chưa cấp quyền'}</p>
        </div>
      </div>
    </Modal>
  );
};

export default BarcodeScannerModal;
