/**
 * UnitSelector - Component chọn đơn vị tính khi thêm sản phẩm vào giỏ
 * Hiển thị danh sách đơn vị quy đổi và giá tương ứng
 */
import { useState } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { formatCurrency } from '../../../../shared/utils/formatCurrency';

const UnitSelector = ({ isOpen, onClose, product, onSelect }) => {
  const [selectedUnitId, setSelectedUnitId] = useState('base');

  if (!product) return null;

  const baseUnit = product.unit || 'Cái';

  // Build list: base unit + conversion units
  const units = [
    {
      id: 'base',
      name: baseUnit,
      convertValue: 1,
      price: product.price,
      description: 'Đơn vị cơ bản',
    },
    ...(product.conversionUnits || []).map((u) => ({
      id: u.unitName,
      name: u.unitName,
      convertValue: u.convertValue,
      price: u.price || product.price * u.convertValue,
      description: `= ${u.convertValue} ${baseUnit}`,
    })),
  ];

  const handleSelect = () => {
    const selected = units.find((u) => u.id === selectedUnitId);
    if (selected) {
      onSelect(product, {
        name: selected.name,
        convertValue: selected.convertValue,
        price: selected.price,
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chọn đơn vị tính"
      size="sm"
      footer={
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSelect} className="flex-1">
            Thêm vào giỏ
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        {/* Product info */}
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="font-semibold text-slate-900">{product.name}</p>
          <p className="text-xs text-slate-500">
            SL tồn: {product.stock} {baseUnit}
          </p>
        </div>

        {/* Unit list */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-600">Chọn đơn vị:</p>
          {units.map((unit) => (
            <button
              key={unit.id}
              onClick={() => setSelectedUnitId(unit.id)}
              className={`flex w-full items-center justify-between rounded-lg border p-3 transition-all ${
                selectedUnitId === unit.id
                  ? 'border-[#004785] bg-blue-50 shadow-sm'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="text-left">
                <span className="font-semibold text-slate-900">{unit.name}</span>
                {unit.convertValue !== 1 && (
                  <span className="ml-2 text-xs text-slate-500">{unit.description}</span>
                )}
              </div>
              <div className="text-right">
                <span className="block font-bold text-[#004785]">{formatCurrency(unit.price)}</span>
                {unit.convertValue !== 1 && (
                  <span className="text-xs text-slate-400">
                    {formatCurrency(unit.price / unit.convertValue)}/{baseUnit}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default UnitSelector;
