/**
 * StockCard Component - Thẻ hiển thị thông tin tồn kho
 */

import { Badge } from '../../../shared/components/Badge';
import { STOCK_STATUS, STOCK_STATUS_LABELS } from '../../../shared/utils/constants';

export const StockCard = ({ product }) => {
  const getStockStatus = (stock, minStock) => {
    if (stock === 0) return STOCK_STATUS.OUT_OF_STOCK;
    if (stock < minStock) return STOCK_STATUS.LOW_STOCK;
    return STOCK_STATUS.IN_STOCK;
  };

  const status = getStockStatus(product.stock, product.minStock);

  const statusColors = {
    [STOCK_STATUS.IN_STOCK]: 'success',
    [STOCK_STATUS.LOW_STOCK]: 'warning',
    [STOCK_STATUS.OUT_OF_STOCK]: 'danger',
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-lg">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{product.name}</h3>
          <p className="text-sm text-gray-500">{product.sku}</p>
        </div>
        <Badge variant={statusColors[status]} size="sm">
          {STOCK_STATUS_LABELS[status]}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tồn kho:</span>
          <span className="font-semibold">{product.stock}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tối thiểu:</span>
          <span className="font-semibold">{product.minStock}</span>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-blue-600"
              style={{ width: `${Math.min((product.stock / (product.minStock * 3)) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockCard;
