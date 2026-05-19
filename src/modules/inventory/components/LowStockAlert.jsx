/**
 * LowStockAlert Component - Cảnh báo hàng sắp hết
 */

import { Badge } from '../../../shared/components/Badge';

export const LowStockAlert = ({ products }) => {
  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock < p.minStock);
  const outOfStockProducts = products.filter((p) => p.stock === 0);

  if (lowStockProducts.length === 0 && outOfStockProducts.length === 0) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <p className="text-sm text-green-800">✓ Tất cả sản phẩm đều đủ hàng</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-3">
        <h3 className="font-semibold text-gray-900">Cảnh báo tồn kho</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {outOfStockProducts.length > 0 && (
          <div className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <Badge variant="danger" size="sm">
                Hết hàng ({outOfStockProducts.length})
              </Badge>
            </div>
            <div className="space-y-2">
              {outOfStockProducts.map((product) => (
                <div key={product.id} className="text-sm">
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-gray-500">SKU: {product.sku}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {lowStockProducts.length > 0 && (
          <div className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <Badge variant="warning" size="sm">
                Sắp hết ({lowStockProducts.length})
              </Badge>
            </div>
            <div className="space-y-2">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="text-sm">
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-gray-500">
                    Tồn: {product.stock} / Tối thiểu: {product.minStock}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LowStockAlert;
