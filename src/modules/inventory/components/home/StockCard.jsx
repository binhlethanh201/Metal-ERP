/**
 * StockCard - Thẻ tồn kho hiển thị tổng quan 1 mặt hàng.
 */
/**
 * StockCard Component - Thẻ hiển thị thông tin tồn kho
 */

import { Badge } from '../../../../shared/components/Badge';

const STOCK_STATUS = { IN_STOCK: 'IN_STOCK', LOW_STOCK: 'LOW_STOCK', OUT_OF_STOCK: 'OUT_OF_STOCK' };
const STOCK_STATUS_LABELS = {
  IN_STOCK: 'Còn hàng',
  LOW_STOCK: 'Sắp hết',
  OUT_OF_STOCK: 'Hết hàng',
};

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
    <div className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-lg dark:border-[#333333] dark:bg-[#0f0f0f]">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-[#e5e5e5]">{product.name}</h3>
          <p className="text-sm text-gray-500 dark:text-[#999999]">{product.sku}</p>
        </div>
        <Badge variant={statusColors[status]} size="sm">
          {STOCK_STATUS_LABELS[status]}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-[#999999]">Tồn kho:</span>
          <span className="font-semibold">{product.stock}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-[#999999]">Tối thiểu:</span>
          <span className="font-semibold">{product.minStock}</span>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-[#272727]">
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
