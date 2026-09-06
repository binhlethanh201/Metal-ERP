/**
 * ScanModal - Quét barcode/SKU để thêm nhanh sản phẩm vào giỏ hàng
 * Hỗ trợ: nhập tay, quét qua camera, gọi API backend
 */
import { useState, useEffect, useRef } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Input } from '../../../../shared/components/Input';
import { Button } from '../../../../shared/components/Button';
import { Card } from '../../../../shared/components/Card';
import Icon from '../../../../shared/components/Icon';
import { formatCurrency } from '../../../../shared/utils/formatCurrency';
import { scanBarcode as apiScanBarcode } from '../../../services/posService';
import BarcodeScannerModal from './BarcodeScannerModal';

const ScanModal = ({ isOpen, onClose, onItemAdded, products = [], invoiceId }) => {
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [foundProduct, setFoundProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleScan = async () => {
    const trimmed = barcode.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setFoundProduct(null);

    try {
      // Ưu tiên gọi API backend trước
      if (invoiceId) {
        try {
          const result = await apiScanBarcode(invoiceId, { barcode: trimmed, quantity });
          if (result?.data || result) {
            const item = result.data || result;
            setFoundProduct({
              ...item,
              productName: item.productName || item.name || '',
              sku: item.sku || item.barcode || '',
              unitPrice: item.unitPrice || item.price || 0,
              quantity,
            });
            onItemAdded?.({
              ...item,
              productName: item.productName || item.name || '',
              sku: item.sku || item.barcode || '',
              unitPrice: item.unitPrice || item.price || 0,
              quantity,
            });
            setBarcode('');
            setQuantity(1);
            setLoading(false);
            return;
          }
        } catch (apiErr) {
          console.warn('[ScanModal] API scan failed, falling back to local search:', apiErr.message);
        }
      }

      // Fallback: tìm kiếm local từ prop 'products'
      const kw = trimmed.toLowerCase();
      const found = products.find(
        (p) =>
          (p.sku || '').toLowerCase() === kw ||
          (p.barcode || '').toLowerCase() === kw ||
          (p.productCode || '').toLowerCase() === kw
      );

      if (found) {
        setFoundProduct(found);
        onItemAdded?.({ ...found, quantity });
        setBarcode('');
        setQuantity(1);
      } else {
        setError('Không tìm thấy sản phẩm với barcode này');
      }
    } catch (err) {
      setError('Lỗi khi quét barcode: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleScan();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleClose = () => {
    setBarcode('');
    setFoundProduct(null);
    setError(null);
    setQuantity(1);
    onClose();
  };

  const handleCameraScanComplete = (scannedBarcode) => {
    setBarcode(scannedBarcode);
    setShowCameraScanner(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Quét barcode sản phẩm"
        size="md"
        footer={
          <Button variant="secondary" onClick={handleClose}>
            Đóng
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                placeholder="Nhập barcode hoặc quét..."
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowCameraScanner(true)}
                title="Quét mã vạch bằng camera"
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:border-emerald-600 dark:hover:bg-emerald-900/50"
              >
                <Icon name="barcode_scanner" size={16} />
              </button>
            </div>
            <div className="w-20 shrink-0">
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                placeholder="SL"
              />
            </div>
            <Button
              variant="primary"
              onClick={handleScan}
              loading={loading}
              disabled={!barcode.trim()}
            >
              Thêm
            </Button>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/30">{error}</div>
          )}

          {foundProduct && (
            <Card padding="p-3">
              <div className="flex items-center gap-3">
                {(foundProduct.imageUrl || foundProduct.image) && (
                  <img
                    src={foundProduct.imageUrl || foundProduct.image}
                    alt={foundProduct.productName || foundProduct.name}
                    className="h-12 w-12 rounded object-cover"
                  />
                )}
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-[#e5e5e5]">
                    {foundProduct.productName || foundProduct.name}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-[#999999]">
                    {foundProduct.sku || foundProduct.barcode || foundProduct.productCode}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#004785]">
                    {formatCurrency(foundProduct.unitPrice || foundProduct.price || 0)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-[#999999]">x{foundProduct.quantity || quantity}</p>
                </div>
              </div>
            </Card>
          )}

          <div className="text-xs text-slate-400 dark:text-[#808080]">
            <p>Nhập barcode → Enter để thêm</p>
            <p>Hoặc nhấn icon máy quét để dùng camera</p>
          </div>
        </div>
      </Modal>

      <BarcodeScannerModal
        isOpen={showCameraScanner}
        onClose={() => setShowCameraScanner(false)}
        resultTitle="Quét barcode thêm vào giỏ"
        onScanComplete={handleCameraScanComplete}
      />
    </>
  );
};

export default ScanModal;
