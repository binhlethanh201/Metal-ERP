/**
 * Trang Ban hang chinh - Container: PosSidebar + PosHeader + CategoryTabs + ProductGrid +
 * PosCartPanel + PosFooter. Ket noi usePosCart (gio hang) + usePosProducts (loc san pham).
 * Du lieu san pham lay tu kho hang (inventory).
 */
import { useState, useRef, useCallback, useMemo } from 'react';
import PosSidebar from '../components/PosSidebar';
import PosHeader from '../components/PosHeader';
import PosCartPanel from '../components/PosCartPanel';
import PosFooter from '../components/PosFooter';
import CategoryTabs from '../components/CategoryTabs';
import ProductGrid from '../components/ProductGrid';
import { usePosCart } from '../hooks/usePosCart';
import { usePosProducts } from '../hooks/usePosProducts';
import { useProductList } from '../../inventory/hooks/useProductList';
import { initialCart } from '../data/posMockData';

const WAREHOUSE = '/inventory/dashboard';

const safeNavigate = (path) => {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new Event('popstate'));
};

const mapToPosProduct = (p) => ({
  id: p.productCode || p.id || '',
  name: p.name || '',
  price: p.salePrice ?? p.price ?? 0,
  sku: p.productCode || p.barcode || p.id || '',
  stock: p.stock ?? 0,
  category: p.group || p.category || '',
  status: p.status || (p.stock > 0 ? 'Còn hàng' : 'Hết hàng'),
  image: p.image || '',
});

const POSScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [activeMenu, setActiveMenu] = useState('Ban hang');
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const noticeTimer = useRef(null);

  const showNotice = useCallback((message) => {
    setNotice(message);
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(''), 2200);
  }, []);

  const { products: inventoryProducts } = useProductList();
  const posProducts = useMemo(() => inventoryProducts.map(mapToPosProduct), [inventoryProducts]);

  const categories = useMemo(() => {
    const groups = [...new Set(posProducts.map((p) => p.category).filter(Boolean))];
    return ['Tất cả', ...groups.sort()];
  }, [posProducts]);

  const cart = usePosCart(initialCart);
  const { filteredProducts } = usePosProducts(posProducts, selectedCategory, search);

  const handleMenuSelect = (label) => {
    setActiveMenu(label);
    showNotice(`${label} đang ở giao diện demo`);
  };

  const handleAddToCart = (product) => {
    cart.addToCart(product);
    showNotice(`Đã thêm: ${product.name}`);
  };

  const handleClearCart = () => {
    cart.clearCart();
    showNotice('Đã xóa giỏ hàng');
  };

  const handleApplyVoucher = () => {
    const ok = cart.applyVoucher();
    showNotice(ok ? 'Đã áp dụng mã giảm giá' : 'Vui lòng nhập mã giảm giá');
  };

  const handlePay = () => {
    if (cart.cart.length === 0) {
      showNotice('Giỏ hàng đang trống');
      return;
    }
    showNotice(`Thanh toán ${cart.total.toLocaleString('vi-VN')}đ bằng ${cart.paymentMethod}`);
  };

  const handleSaveDraft = () => {
    if (cart.cart.length === 0) {
      showNotice('Không có sản phẩm để lưu nháp');
      return;
    }
    showNotice('Đã lưu đơn hàng nháp');
  };

  return (
    <div className="h-screen overflow-hidden bg-[#f7f9fc] font-sans text-slate-900">
      {notice && (
        <div className="fixed left-1/2 top-5 z-[80] -translate-x-1/2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-2xl">
          {notice}
        </div>
      )}

      <PosSidebar
        activeMenu={activeMenu}
        onMenuSelect={handleMenuSelect}
        onNavigateWarehouse={() => safeNavigate(WAREHOUSE)}
      />

      <PosHeader
        search={search}
        onSearchChange={setSearch}
        onBarcodeScan={() => showNotice('Đang mở chế độ quét mã')}
        onHistory={() => showNotice('Đang mở lịch sử đơn hàng')}
        onQuickAdd={() => showNotice('Đang mở thêm sản phẩm nhanh')}
      />

      <main className="fixed bottom-12 left-[260px] right-[400px] top-16 flex flex-col overflow-hidden bg-[#f7f9fc] p-6">
        <CategoryTabs
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
        <ProductGrid products={filteredProducts} onAddToCart={handleAddToCart} />
      </main>

      <PosCartPanel
        cart={cart.cart}
        voucher={cart.voucher}
        onVoucherChange={cart.setVoucher}
        onApplyVoucher={handleApplyVoucher}
        paymentMethod={cart.paymentMethod}
        onPaymentMethodChange={cart.setPaymentMethod}
        subtotal={cart.subtotal}
        discount={cart.discount}
        vat={cart.vat}
        total={cart.total}
        onClearCart={handleClearCart}
        onPay={handlePay}
        onSaveDraft={handleSaveDraft}
        onQtyChange={cart.changeQty}
        onRemoveItem={cart.removeItem}
      />

      <PosFooter />
    </div>
  );
};

export default POSScreen;
