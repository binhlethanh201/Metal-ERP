/**
 * UnitSelector - Component chọn đơn vị tính khi thêm sản phẩm vào giỏ
 * Hiển thị danh sách đơn vị quy đổi, giá tương ứng và số lượng có thể mua
 */
import { useState } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { formatCurrency } from '../../../../shared/utils/formatCurrency';

const UnitSelector = ({ isOpen, onClose, product, onSelect }) => {
  const [selectedUnitId, setSelectedUnitId] = useState('base');

  if (!product) return null;

  const baseUnit = product.unit || 'Cái';
  const baseStock = product.availableStock ?? product.stock ?? 0;
  // API trả về PascalCase (ConversionUnits) - hỗ trợ cả lowercase
  const rawConversionUnits = product.ConversionUnits ?? product.conversionUnits ?? [];

  // Build list: base unit + conversion units
  const units = [
    {
      id: 'base',
      name: baseUnit,
      convertValue: 1,
      price: product.price,
      description: 'Đơn vị cơ bản',
    },
    ...rawConversionUnits.map((u) => {
      const unitName = u.UnitName ?? u.unitName ?? u.name ?? baseUnit;
      const convertValue = u.ConvertValue ?? u.convertValue ?? 1;
      const price = u.Price ?? u.price ?? product.price * convertValue;
      return {
        id: unitName,
        name: unitName,
        convertValue,
        price,
        description: `= ${convertValue} ${baseUnit}`,
      };
    }),
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
            SL tồn: {baseStock.toFixed(2)} {baseUnit}
          </p>
        </div>

        {/* Unit list */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-600">Chọn đơn vị:</p>
          {units.map((unit) => {
            const maxQty = Math.floor(baseStock / unit.convertValue);
            const isDisabled = maxQty <= 0;

            return (
              <button
                key={unit.id}
                onClick={() => !isDisabled && setSelectedUnitId(unit.id)}
                disabled={isDisabled}
                className={`flex w-full items-center justify-between rounded-lg border p-3 transition-all ${
                  selectedUnitId === unit.id
                    ? 'border-[#004785] bg-blue-50 shadow-sm'
                    : isDisabled
                      ? 'cursor-not-allowed border-slate-200 bg-slate-100 opacity-50'
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
                  <span className="block font-bold text-[#004785]">
                    {formatCurrency(unit.price)}
                  </span>
                  <span
                    className={`text-[10px] ${maxQty <= 0 ? 'text-red-500' : 'text-slate-400'}`}
                  >
                    Max: {maxQty} {unit.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};

export default UnitSelector;
