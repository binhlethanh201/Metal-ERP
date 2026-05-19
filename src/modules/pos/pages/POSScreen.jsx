import React, { useMemo, useState } from 'react';

const WAREHOUSE = '/inventory/dashboard';

const categories = [
  'Tất cả',
  'Máy móc',
  'Dụng cụ cầm tay',
  'Vật liệu xây dựng',
  'Sơn & Chống thấm',
  'Bulong & Ốc vít',
  'Kim khí tổng hợp',
];

const products = [
  {
    id: 1,
    name: 'Máy khoan động lực Bosch GSB 16 RE',
    price: 1550000,
    sku: 'BOS-GSB-16RE',
    stock: 25,
    category: 'Máy móc',
    status: 'Còn hàng',
    image:
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 2,
    name: 'Chống thấm cao cấp KOVA CT-11A Plus 20kg',
    price: 3450000,
    sku: 'KOV-CT11A-20',
    stock: 4,
    category: 'Sơn & Chống thấm',
    status: 'Sắp hết',
    image:
      'https://images.unsplash.com/photo-1597595749882-66556d4a3b55?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 3,
    name: 'Kìm bấm cos thủy lực YQK-300',
    price: 950000,
    sku: 'KIM-THUY-LUC',
    stock: 12,
    category: 'Dụng cụ cầm tay',
    status: 'Còn hàng',
    image:
      'https://images.unsplash.com/photo-1609205807107-e8ec2120f9de?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 4,
    name: 'Đá mài sắt Hải Dương 100×6×16mm',
    price: 5500,
    sku: 'DAI-MAI-HD',
    stock: 500,
    category: 'Kim khí tổng hợp',
    status: 'Còn hàng',
    image:
      'https://images.unsplash.com/photo-1586864387789-628af9feed72?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 5,
    name: 'Bộ lục giác Chrome-Vanadium 9 chi tiết',
    price: 125000,
    sku: 'LUC-GIAC-CRV',
    stock: 45,
    category: 'Dụng cụ cầm tay',
    status: 'Còn hàng',
    image:
      'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 6,
    name: 'Bulong inox M10 × 50mm hộp 100 chiếc',
    price: 185000,
    sku: 'BUL-M10-50',
    stock: 86,
    category: 'Bulong & Ốc vít',
    status: 'Còn hàng',
    image:
      'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=900&auto=format&fit=crop',
  },
];

const initialCart = [
  { ...products[0], quantity: 1 },
  { ...products[1], quantity: 1 },
  { ...products[2], quantity: 1 },
];

const formatCurrency = (value) => `${Math.max(0, value).toLocaleString('vi-VN')}đ`;

const Icon = ({ name, className = '' }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const safeNavigate = (path) => {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new Event('popstate'));
};

const POSScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [activeMenu, setActiveMenu] = useState('Bán hàng');
  const [cart, setCart] = useState(initialCart);
  const [voucher, setVoucher] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Tiền mặt');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');

  const showNotice = (message) => {
    setNotice(message);
    window.clearTimeout(window.__posNoticeTimer);
    window.__posNoticeTimer = window.setTimeout(() => setNotice(''), 2200);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchCategory = selectedCategory === 'Tất cả' || product.category === selectedCategory;
      const keyword = search.trim().toLowerCase();
      const matchSearch =
        !keyword ||
        product.name.toLowerCase().includes(keyword) ||
        product.sku.toLowerCase().includes(keyword);
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, search]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existed = prev.find((item) => item.id === product.id);
      if (existed) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showNotice(`Đã thêm: ${product.name}`);
  };

  const changeQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedVoucher('');
    setVoucher('');
    showNotice('Đã xóa giỏ hàng');
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const voucherDiscount = appliedVoucher ? 50000 : 0;
  const discount = cart.length > 0 ? voucherDiscount : 0;
  const vat = Math.round((subtotal - discount) * 0.08);
  const total = subtotal - discount + vat;

  const applyVoucher = () => {
    if (!voucher.trim()) {
      showNotice('Vui lòng nhập mã giảm giá');
      return;
    }
    setAppliedVoucher(voucher.trim().toUpperCase());
    showNotice('Đã áp dụng mã giảm giá');
  };

  const handlePay = () => {
    if (cart.length === 0) {
      showNotice('Giỏ hàng đang trống');
      return;
    }
    showNotice(`Thanh toán ${formatCurrency(total)} bằng ${paymentMethod}`);
  };

  const handleSaveDraft = () => {
    if (cart.length === 0) {
      showNotice('Không có sản phẩm để lưu nháp');
      return;
    }
    showNotice('Đã lưu đơn hàng nháp');
  };

  const menuItems = [
    ['shopping_cart', 'Bán hàng'],
    ['assignment', 'Đơn hàng'],
    ['person', 'Khách'],
    ['assessment', 'Báo cáo'],
    ['settings', 'Cài đặt'],
  ];

  return (
    <div className="h-screen overflow-hidden bg-[#f7f9fc] font-sans text-slate-900">
      {notice && (
        <div className="fixed left-1/2 top-5 z-[80] -translate-x-1/2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-2xl">
          {notice}
        </div>
      )}

      <aside className="custom-scrollbar fixed left-0 top-0 z-50 flex h-screen w-[240px] flex-col overflow-y-auto border-r border-slate-200 bg-white py-4 pb-8">
        <div className="mb-8 flex items-center gap-x-2 px-6">
          <Icon name="inventory_2" className="text-2xl text-[#00315e]" />
          <span className="text-lg font-bold tracking-tight text-[#00315e]">Inventory Pro</span>
        </div>

        <nav className="flex flex-col gap-y-1 px-4">
          {menuItems.map(([icon, label]) => {
            const active = activeMenu === label;
            return (
              <button
                key={label}
                onClick={() => {
                  setActiveMenu(label);
                  showNotice(`${label} đang ở giao diện demo`);
                }}
                className={`flex w-full items-center gap-x-3 rounded-lg px-3 py-2 text-left transition-colors ${
                  active
                    ? 'bg-[#00315e]/5 font-bold text-[#00315e]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-[#00315e]'
                }`}
              >
                <Icon name={icon} className="text-xl" />
                <span className="text-sm">{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mb-10 mt-auto px-4">
          <button
            onClick={() => safeNavigate(WAREHOUSE)}
            className="flex w-full items-center justify-center gap-x-3 rounded-lg bg-[#004785] px-3 py-3 text-center font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-95"
          >
            <Icon name="inventory" className="text-xl" />
            <span className="text-sm uppercase tracking-wider">Kho hàng</span>
          </button>
        </div>
      </aside>

      <header className="fixed left-[240px] right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
        <div className="flex flex-1 items-center gap-x-8">
          <div className="group relative w-full max-w-xl">
            <Icon
              name="search"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00315e]"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none transition-all focus:border-[#00315e] focus:ring-2 focus:ring-blue-100"
              placeholder="Tìm sản phẩm (Tên, mã SKU, barcode...)"
            />
          </div>
        </div>

        <div className="flex items-center gap-x-4">
          <button
            onClick={() => showNotice('Đang mở chế độ quét mã')}
            className="flex items-center gap-x-2 rounded-lg border border-slate-200 px-3 py-1.5 text-slate-600 transition-colors hover:bg-slate-50 active:scale-95"
          >
            <Icon name="barcode_scanner" />
            <span className="text-xs font-semibold">Quét mã</span>
          </button>
          <button
            onClick={() => showNotice('Đang mở lịch sử đơn hàng')}
            className="flex items-center gap-x-2 rounded-lg border border-slate-200 px-3 py-1.5 text-slate-600 transition-colors hover:bg-slate-50 active:scale-95"
          >
            <Icon name="history" />
            <span className="text-xs font-semibold">Lịch sử</span>
          </button>
          <button
            onClick={() => showNotice('Đang mở thêm sản phẩm nhanh')}
            className="flex items-center gap-x-2 rounded-lg bg-[#00315e] px-3 py-1.5 text-white transition-opacity hover:opacity-90 active:scale-95"
          >
            <Icon name="add" />
            <span className="text-xs font-semibold">Thêm nhanh</span>
          </button>
          <div className="mx-2 h-8 w-px bg-slate-200" />
          <div className="flex cursor-pointer items-center gap-x-3">
            <div className="text-right">
              <div className="text-xs font-bold leading-none text-slate-900">Nguyễn Văn A</div>
              <div className="mt-1 text-[10px] uppercase tracking-widest text-slate-500">
                Quản lý kho
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-slate-200 font-bold text-[#00315e]">
              A
            </div>
          </div>
        </div>
      </header>

      <main className="fixed bottom-12 left-[240px] right-[400px] top-16 flex flex-col overflow-hidden bg-[#f7f9fc] p-6">
        <div className="custom-scrollbar mb-6 flex items-center gap-x-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap rounded-full px-5 py-2 text-xs font-bold transition-colors active:scale-95 ${
                selectedCategory === category
                  ? 'bg-[#00315e] text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-[#00315e] hover:text-[#00315e]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="custom-scrollbar grid flex-1 grid-cols-3 gap-4 overflow-y-auto pb-6 pr-2">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="group flex min-h-[350px] flex-col rounded-xl border border-slate-200 bg-white p-3 text-left transition-all hover:shadow-lg active:scale-95"
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
                  className={`absolute right-2 top-2 rounded px-2 py-1 text-[10px] font-bold ${product.stock <= 5 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}
                >
                  {product.status}
                </span>
              </div>
              <div className="flex flex-1 flex-col">
                <h4 className="mb-1 line-clamp-2 text-sm font-bold text-slate-800">
                  {product.name}
                </h4>
                <div className="mt-auto text-xl font-black text-[#00315e]">
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
          ))}
        </div>
      </main>

      <aside className="fixed bottom-12 right-0 top-16 z-30 flex w-[400px] flex-col border-l border-slate-200 bg-white shadow-[-4px_0_15px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">
            Giỏ hàng hiện tại
          </h3>
          <button onClick={clearCart} className="text-slate-400 hover:text-red-600 active:scale-95">
            <Icon name="delete_sweep" />
          </button>
        </div>

        <div className="custom-scrollbar flex flex-1 flex-col gap-y-4 overflow-y-auto p-4">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center gap-x-3">
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded border border-slate-200 bg-slate-50">
                <img className="h-full w-full object-cover" src={item.image} alt={item.name} />
              </div>
              <div className="min-w-0 flex-1">
                <h5 className="truncate text-xs font-bold text-slate-900">{item.name}</h5>
                <div className="mt-1 text-xs font-black text-[#00315e]">
                  {formatCurrency(item.price)}
                </div>
              </div>
              <div className="flex items-center gap-x-2">
                <button
                  onClick={() => changeQty(item.id, -1)}
                  className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 active:scale-95"
                >
                  -
                </button>
                <span className="w-4 text-center text-xs font-bold">{item.quantity}</span>
                <button
                  onClick={() => changeQty(item.id, 1)}
                  className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 active:scale-95"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => changeQty(item.id, -item.quantity)}
                className="ml-2 text-slate-300 hover:text-red-600 active:scale-95"
              >
                <Icon name="close" className="text-sm" />
              </button>
            </div>
          ))}

          {cart.length === 0 && (
            <div className="py-16 text-center text-sm font-semibold text-slate-400">
              Giỏ hàng trống
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 bg-slate-50 p-6">
          <div className="mb-4 flex flex-col gap-y-2">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Mã giảm giá
            </div>
            <div className="flex gap-x-2">
              <input
                value={voucher}
                onChange={(e) => setVoucher(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyVoucher()}
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-[#00315e]"
                placeholder="Nhập mã..."
                type="text"
              />
              <button
                onClick={applyVoucher}
                className="rounded-lg bg-slate-200 px-4 py-1.5 text-xs font-bold uppercase text-slate-700 transition-colors hover:bg-slate-300 active:scale-95"
              >
                Áp dụng
              </button>
            </div>
          </div>

          <div className="mb-4 flex flex-col gap-y-2">
            <div className="flex justify-between text-xs font-medium text-slate-500">
              <span>Tạm tính</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs font-medium text-slate-500">
              <span>Giảm giá</span>
              <span className="text-red-600">- {formatCurrency(discount)}</span>
            </div>
            <div className="flex justify-between text-xs font-medium text-slate-500">
              <span>Thuế VAT (8%)</span>
              <span>{formatCurrency(vat)}</span>
            </div>
            <div className="my-1 h-px bg-slate-200" />
            <div className="flex items-end justify-between">
              <span className="text-xs font-bold uppercase text-slate-900">Tổng cộng</span>
              <span className="text-2xl font-black text-[#00315e]">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-2">
            {[
              ['payments', 'Tiền mặt'],
              ['account_balance', 'Chuyển khoản'],
              ['qr_code_2', 'QR Code'],
              ['credit_card', 'Thẻ ngân hàng'],
            ].map(([icon, method]) => {
              const active = paymentMethod === method;
              return (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`flex items-center gap-x-2 rounded-lg border p-2 transition-colors active:scale-95 ${active ? 'border-[#00315e] bg-[#00315e]/5 text-[#00315e]' : 'border-slate-200 bg-white text-slate-600 hover:border-[#00315e]'}`}
                >
                  <Icon name={icon} className="text-sm" />
                  <span className="text-[10px] font-bold">{method}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-y-2">
            <button
              onClick={handlePay}
              className="w-full rounded-xl bg-[#00315e] py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-blue-900/20 transition-all hover:opacity-90 active:scale-95"
            >
              THANH TOÁN (F9)
            </button>
            <button
              onClick={handleSaveDraft}
              className="w-full rounded-xl border-2 border-slate-200 bg-white py-2.5 text-xs font-bold uppercase tracking-widest text-slate-600 transition-all hover:border-[#00315e] hover:text-[#00315e] active:scale-95"
            >
              Lưu bản nháp
            </button>
          </div>
        </div>
      </aside>

      <footer className="fixed bottom-0 left-0 right-0 z-50 flex h-12 items-center justify-between bg-slate-900 px-6 text-white">
        <div className="flex items-center gap-x-6">
          <Status label="ĐƠN:" value="KK-20231024-001" />
          <Status label="NHÂN VIÊN:" value="Nguyễn Văn A" bordered />
          <Status label="KHÁCH HÀNG:" value="Khách lẻ" bordered />
        </div>
        <div className="flex items-center gap-x-6">
          <Status label="ĐIỂM:" value="125 pts" />
          <div className="flex items-center gap-x-2 border-l border-white/20 pl-6 text-[10px] font-bold uppercase tracking-tighter">
            <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <span className="opacity-80">ĐÃ ĐỒNG BỘ KHO</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const Status = ({ label, value, bordered }) => (
  <div
    className={`flex items-center gap-x-2 text-[10px] font-bold uppercase tracking-tighter opacity-80 ${bordered ? 'border-l border-white/20 pl-6' : ''}`}
  >
    <span className="text-blue-400">{label}</span>
    <span>{value}</span>
  </div>
);

export default POSScreen;
