/** Grid sản phẩm POS - Layout 3 cột, render ProductCard cho từng sản phẩm đã lọc. */
import ProductCard from './ProductCard';

const ProductGrid = ({ products, onAddToCart }) => (
  <div className="custom-scrollbar grid flex-1 grid-cols-3 gap-4 overflow-y-auto pb-6 pr-2">
    {products.map((product) => (
      <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
    ))}
  </div>
);

export default ProductGrid;
