/**
 * ScanModal - Quét barcode/SKU để thêm nhanh sản phẩm vào giỏ hàng
 * TODO (FE): Kết nối API POST /pos/invoices/{invoiceId}/items/scan khi BE sẵn sàng.
 * Hiện tìm kiếm local từ prop 'products' hoặc đơn giản thông báo.
 */
import { useState, useEffect, useRef } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Input } from '../../../../shared/components/Input';
import { Button } from '../../../../shared/components/Button';
import { Card } from '../../../../shared/components/Card';
import { formatCurrency } from '../../../../shared/utils/formatCurrency';

const ScanModal = ({ isOpen, onClose, onItemAdded, products = [] }) => {
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [foundProduct, setFoundProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleScan = async () => {
    if (!barcode.trim()) return;

    setLoading(true);
    setError(null);
    setFoundProduct(null);

    // TODO (FE): thay bằng API call POST /pos/invoices/{invoiceId}/items/scan
    await new Promise((r) => setTimeout(r, 200)); // giả lập delay
    const kw = barcode.trim().toLowerCase();
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
      setError('Không tìm thấy sản phẩm với barcode/SKU này');
    }
    setLoading(false);
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

  return (
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
          <div className="flex-1">
            <Input
              ref={inputRef}
              placeholder="Nhập barcode hoặc quét..."
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>
          <div className="w-20">
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
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

        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/30">{error}</div>}

        {foundProduct && (
          <Card padding="p-3">
            <div className="flex items-center gap-3">
              {foundProduct.imageUrl && (
                <img
                  src={foundProduct.imageUrl}
                  alt={foundProduct.productName}
                  className="h-12 w-12 rounded object-cover"
                />
              )}
              <div className="flex-1">
                <p className="font-semibold text-slate-900 dark:text-[#e5e5e5]">{foundProduct.productName}</p>
                <p className="text-sm text-slate-500 dark:text-[#999999]">{foundProduct.sku}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#004785]">
                  {formatCurrency(foundProduct.unitPrice || 0)}
                </p>
                <p className="text-xs text-slate-500 dark:text-[#999999]">x{foundProduct.quantity}</p>
              </div>
            </div>
          </Card>
        )}

        <div className="text-xs text-slate-400 dark:text-[#808080]">
          <p>Nhập barcode → Enter để thêm</p>
          <p>Hoặc dùng máy quét barcode</p>
        </div>
      </div>
    </Modal>
  );
};

export default ScanModal;
