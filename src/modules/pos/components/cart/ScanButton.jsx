/**
 * ScanButton - Nút mở scanner barcode nhỏ gọn, có thể chèn vào bất kỳ ô nhập nào
 */
import { useState } from 'react';
import Icon from '../../../../shared/components/Icon';
import BarcodeScannerModal from './BarcodeScannerModal';

export const ScanButton = ({ onScanComplete, title = 'Quét mã vạch' }) => {
  const [showScanner, setShowScanner] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowScanner(true)}
        title="Quét mã vạch bằng camera"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:border-emerald-600 dark:hover:bg-emerald-900/50"
      >
        <Icon name="barcode_scanner" size={16} />
      </button>

      <BarcodeScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        resultTitle={title}
        onScanComplete={(barcode) => {
          onScanComplete?.(barcode);
          setShowScanner(false);
        }}
      />
    </>
  );
};

export default ScanButton;
