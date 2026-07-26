/**
 * PromoModal - Áp dụng mã khuyến mãi
 * TODO (FE): Kết nối API POST /pos/invoices/{invoiceId}/promo khi BE sẵn sàng.
 */
import { useState, useEffect, useRef } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Input } from '../../../../shared/components/Input';
import { Button } from '../../../../shared/components/Button';
import { Card } from '../../../../shared/components/Card';
import { Badge } from '../../../../shared/components/Badge';
import { formatCurrency } from '../../../../shared/utils/formatCurrency';

const PromoModal = ({
  isOpen,
  onClose,
  currentPromo,
  onPromoApplied,
  onPromoRemoved,
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [appliedPromo, setAppliedPromo] = useState(currentPromo || null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    setAppliedPromo(currentPromo);
  }, [currentPromo]);

  const handleApply = async () => {
    if (!promoCode.trim()) return;
    setLoading(true);
    setError(null);
    // TODO (FE): gọi API POST /pos/invoices/{invoiceId}/promo
    await new Promise((r) => setTimeout(r, 200));
    // Giả lập: chấp nhận bất kỳ mã nào
    const fakeResult = { promoCode: promoCode.trim().toUpperCase(), discountAmount: 50000, description: 'Giảm 50.000đ' };
    setAppliedPromo(fakeResult);
    setPromoCode('');
    onPromoApplied?.(fakeResult);
    setLoading(false);
  };

  const handleRemove = async () => {
    if (!appliedPromo) return;
    setLoading(true);
    // TODO (FE): gọi API DELETE /pos/invoices/{invoiceId}/promo
    await new Promise((r) => setTimeout(r, 200));
    setAppliedPromo(null);
    onPromoRemoved?.();
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleApply();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleClose = () => {
    setPromoCode('');
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Khuyến mãi"
      size="md"
      footer={
        <Button variant="secondary" onClick={handleClose}>
          Đóng
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Current promo */}
        {appliedPromo && (
          <Card padding="p-3" className="border-green-500 bg-green-50 dark:border-green-600 dark:bg-green-900/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="success">Đã áp dụng</Badge>
                  <span className="font-semibold text-slate-900 dark:text-[#e5e5e5]">{appliedPromo.promoCode}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600 dark:text-[#999999]">{appliedPromo.description}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">
                  -{formatCurrency(appliedPromo.discountAmount || 0)}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  loading={loading}
                  className="text-red-500"
                >
                  Xóa
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Apply new promo */}
        {!appliedPromo && (
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                ref={inputRef}
                placeholder="Nhập mã khuyến mãi..."
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </div>
            <Button
              variant="primary"
              onClick={handleApply}
              loading={loading}
              disabled={!promoCode.trim()}
            >
              Áp dụng
            </Button>
          </div>
        )}

        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/30">{error}</div>}

        <div className="text-xs text-slate-400 dark:text-[#808080]">
          <p>Nhập mã → Enter để áp dụng</p>
        </div>
      </div>
    </Modal>
  );
};

export default PromoModal;
