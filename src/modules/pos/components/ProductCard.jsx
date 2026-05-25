/**
 * Thẻ sản phẩm POS - Ảnh, tên, giá, SKU, tồn kho, badge trạng thái. Click để thêm vào giỏ.
 */
import { formatCurrency } from '../../../shared/utils/formatCurrency';

const ProductCard = ({ product, onAddToCart, disabled = false }) => {
  const outOfStock = product.stock === 0;

  return (
    <button
      onClick={() => onAddToCart?.(product)}
      disabled={outOfStock || disabled}
      className="group flex min-h-[350px] flex-col rounded-lg border border-slate-200 bg-white p-3 text-left transition-all hover:shadow-lg active:scale-95"
    >
      <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-lg bg-slate-100">
        <img
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
          src={product.image}
          alt={product.name}
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1586864387789-628af9feed72?q=80&w=900&auto=format&fit=crop';
          }}
        />
        <span
          className={`absolute right-2 top-2 rounded-full px-2 py-1 text-[10px] font-bold ${product.stock <= 5 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}
        >
          {product.status || (outOfStock ? 'Hết hàng' : 'Còn hàng')}
        </span>
      </div>
      <div className="flex flex-1 flex-col">
        <h4 className="mb-1 line-clamp-2 text-sm font-bold text-slate-800">{product.name}</h4>
        <div className="mt-auto text-xl font-black text-[#004785]">
          {formatCurrency(product.price)}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {product.sku}
          </span>
          <span className="text-xs font-semibold text-slate-600">SL: {product.stock}</span>
        </div>
      </div>
    </button>
  );
};

export default ProductCard;
