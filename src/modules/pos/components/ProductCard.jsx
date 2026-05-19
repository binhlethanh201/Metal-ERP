/**
 * ProductCard Component - Thẻ sản phẩm cho POS
 */

export const ProductCard = ({ product, onAddToCart, disabled = false }) => {
  const outOfStock = product.stock === 0;

  return (
    <div
      className={`overflow-hidden rounded-lg border-2 border-gray-200 bg-white transition-all hover:border-blue-500 hover:shadow-lg ${outOfStock ? 'opacity-50' : ''} `}
    >
      {/* Image */}
      <div className="flex aspect-square items-center justify-center overflow-hidden bg-gray-200">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">{product.name}</h3>

        <div className="mt-2 flex items-center justify-between">
          <div className="text-xl font-bold text-blue-600">
            {(product.price / 1000).toFixed(0)}K
          </div>
          {product.stock === 0 ? (
            <div className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700">Hết</div>
          ) : (
            <div className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
              {product.stock}
            </div>
          )}
        </div>

        <button
          onClick={() => onAddToCart(product)}
          disabled={outOfStock || disabled}
          className={`mt-3 w-full rounded-lg py-2 text-sm font-medium transition-colors ${
            outOfStock || disabled
              ? 'cursor-not-allowed bg-gray-200 text-gray-400'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } `}
        >
          {outOfStock ? 'Hết hàng' : 'Thêm'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
