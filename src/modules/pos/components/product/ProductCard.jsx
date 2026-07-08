/**
 * Thẻ sản phẩm POS - Hỗ trợ dọc (mặc định) và ngang (compact).
 * Hỗ trợ UOM: hiển thị badge nhiều đơn vị, mở modal chọn đơn vị khi click
 */
import { formatCurrency } from '../../../../shared/utils/formatCurrency';

const ProductCard = ({
  product,
  onAddToCart,
  onOpenUnitSelector,
  disabled = false,
  horizontal = false,
}) => {
  const outOfStock = product.stock === 0;

  // Xử lý click: nếu có nhiều đơn vị → mở modal chọn đơn vị
  const handleClick = () => {
    if (product.hasMultipleUnits && onOpenUnitSelector) {
      onOpenUnitSelector?.(product);
    } else {
      onAddToCart?.(product);
    }
  };

  if (horizontal) {
    return (
      <button
        onClick={handleClick}
        disabled={outOfStock || disabled}
        className="group flex w-full items-center gap-3 overflow-hidden rounded-lg border border-slate-200 bg-white text-left transition-all hover:shadow-md active:scale-[0.99]"
      >
        <img
          className="h-[80px] w-[80px] shrink-0 object-cover"
          src={product.image}
          alt={product.name}
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1586864387789-628af9feed72?q=80&w=900&auto=format&fit=crop';
          }}
        />
        <div className="flex min-w-0 flex-1 items-center justify-between gap-2 pr-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-slate-800">{product.name}</h3>
            <p className="mt-0.5 text-xs text-slate-400">{product.sku}</p>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`text-[11px] font-bold ${product.stock <= 5 ? 'text-orange-600' : 'text-slate-500'}`}
              >
                SL: {product.stock}
              </span>
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                  outOfStock
                    ? 'bg-red-100 text-red-600'
                    : product.stock <= 5
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-green-100 text-green-700'
                }`}
              >
                {product.status || (outOfStock ? 'Hết hàng' : 'Còn hàng')}
              </span>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-sm font-bold text-[#004785]">{formatCurrency(product.price)}</div>
            {product.unit && product.unit !== 'Cái' && (
              <div className="text-xs text-slate-400">/ {product.unit}</div>
            )}
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={outOfStock || disabled}
      className="group relative flex h-[410px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-left transition-all hover:shadow-lg active:scale-95"
    >
      <img
        className="h-[230px] w-full shrink-0 object-cover"
        src={product.image}
        alt={product.name}
        onError={(e) => {
          e.currentTarget.src =
            'https://images.unsplash.com/photo-1586864387789-628af9feed72?q=80&w=900&auto=format&fit=crop';
        }}
      />
      {/* Badge trạng thái stock */}
      <span
        className={`absolute right-2 top-2 rounded-full px-2 py-1 text-[10px] font-bold ${product.stock <= 5 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}
      >
        {product.status || (outOfStock ? 'Hết hàng' : 'Còn hàng')}
      </span>
      {/* Badge UOM - nhiều đơn vị */}
      {product.hasMultipleUnits && (
        <span className="absolute left-2 top-2 rounded-full bg-purple-100 px-2 py-1 text-[10px] font-bold text-purple-700">
          📦 Nhiều đơn vị
        </span>
      )}
      <div className="flex h-[180px] flex-col justify-between p-4">
        <div>
          <h3 className="line-clamp-2 min-h-[48px] text-[16px] font-semibold leading-6 text-slate-800">
            {product.name}
          </h3>
        </div>
        <div className="mt-auto pt-3">
          <div className="text-[20px] font-bold text-[#004785]">
            {formatCurrency(product.price)}
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {product.sku}
            </span>
            <span className="text-xs font-semibold text-slate-600">
              SL: {product.stock}
              {product.unit && product.unit !== 'Cái' && (
                <span className="ml-1 text-slate-400">({product.unit})</span>
              )}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};

export default ProductCard;
