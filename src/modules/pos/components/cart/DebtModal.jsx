/**
 * DebtModal - Ghi nợ khách hàng
 * TODO (FE): Kết nối API POST /pos/payments/debt khi BE sẵn sàng.
 * Chỉ dành cho khách hàng Enterprise/Contractor có debtLimit.
 */
import { useState, useEffect, useRef } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Input } from '../../../../shared/components/Input';
import { Button } from '../../../../shared/components/Button';
import { Card } from '../../../../shared/components/Card';
import { Badge } from '../../../../shared/components/Badge';
import { formatCurrency } from '../../../../shared/utils/formatCurrency';

const DebtModal = ({ isOpen, onClose, customer, amount, onDebtRecorded }) => {
  // TODO (FE): thêm invoiceId prop khi kết nối API
  const [debtAmount, setDebtAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recorded, setRecorded] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && amount) {
      setDebtAmount(amount.toString());
    }
  }, [isOpen, amount]);

  const canDebt = customer && (customer.group === 'Doanh nghiệp' || customer.group === 'Nhà thầu');
  const currentDebt = customer?.currentDebt || 0;
  const debtLimit = customer?.debtLimit || 0;
  const remainingDebt = debtLimit - currentDebt;
  const debtRequested = parseInt(debtAmount) || 0;

  const handleRecord = async () => {
    if (debtRequested <= 0) return;
    setLoading(true);
    setError(null);
    // TODO (FE): gọi API POST /pos/payments/debt
    await new Promise((r) => setTimeout(r, 300));
    setRecorded(true);
    onDebtRecorded?.(customer?.id, debtRequested);
    setLoading(false);
  };

  const handleClose = () => {
    setDebtAmount('');
    setNote('');
    setError(null);
    setRecorded(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Ghi nợ khách hàng"
      size="md"
      footer={
        <Button variant="secondary" onClick={handleClose}>
          Đóng
        </Button>
      }
    >
      <div className="space-y-4">
        <Card padding="p-3" className="bg-slate-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900">{customer?.customerName}</p>
              <p className="text-sm text-slate-500">{customer?.phoneNumber}</p>
            </div>
            <Badge variant={customer?.group === 'Doanh nghiệp' ? 'primary' : 'success'}>
              {customer?.group}
            </Badge>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-xs text-slate-500">Hạn mức nợ</p>
            <p className="font-bold text-slate-900">{formatCurrency(debtLimit)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500">Còn có thể nợ</p>
            <p className="font-bold text-green-600">{formatCurrency(remainingDebt)}</p>
          </div>
        </div>

        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        {recorded ? (
          <Card padding="p-3" className="border-green-500 bg-green-50">
            <div className="flex items-center gap-2">
              <Badge variant="success">Đã ghi nợ</Badge>
              <span className="font-semibold text-green-600">{formatCurrency(debtRequested)}</span>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Số nợ hiện tại: {formatCurrency(currentDebt + debtRequested)}
            </p>
          </Card>
        ) : canDebt ? (
          <>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  ref={inputRef}
                  type="number"
                  placeholder="Số tiền nợ..."
                  value={debtAmount}
                  onChange={(e) => setDebtAmount(e.target.value)}
                />
              </div>
            </div>

            <Input
              placeholder="Ghi chú (tùy chọn)..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            {debtRequested > remainingDebt && (
              <div className="rounded-lg bg-orange-50 p-3 text-sm text-orange-600">
                Vượt quá hạn mức nợ! Còn có thể nợ: {formatCurrency(remainingDebt)}
              </div>
            )}

            <Button
              variant="warning"
              onClick={handleRecord}
              loading={loading}
              disabled={
                !customer?.customerId || debtRequested <= 0 || debtRequested > remainingDebt
              }
              className="w-full"
            >
              Ghi nợ {formatCurrency(debtRequested)}
            </Button>
          </>
        ) : (
          <div className="rounded-lg bg-slate-100 p-3 text-center text-slate-500">
            <p>Chỉ khách hàng Doanh nghiệp hoặc Nhà thầu mới được ghi nợ</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default DebtModal;
