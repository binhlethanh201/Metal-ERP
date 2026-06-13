/**
 * Mock data cho trang Don hang - Order Management
 */

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const randomFloat = (min, max, decimals = 0) => {
  const val = Math.random() * (max - min) + min;
  return Number(val.toFixed(decimals));
};

const CUSTOMERS = [
  { name: 'Nguyễn Văn Hùng', phone: '0987654321' },
  { name: 'Trần Thị Mai', phone: '0912345678' },
  { name: 'Lê Văn Tuấn', phone: '0978123456' },
  { name: 'Phạm Thị Lan', phone: '0934567890' },
  { name: 'Hoàng Văn Kiệt', phone: '0967890123' },
  { name: 'Nguyễn Thị Đào', phone: '0945123789' },
  { name: 'Võ Văn Minh', phone: '0923456789' },
  { name: 'Đặng Thu Thảo', phone: '0956789012' },
  { name: 'Bùi Xuân Hòa', phone: '0989012345' },
  { name: 'Ngô Quang Huy', phone: '0918901234' },
  { name: 'Lý Thị Nhung', phone: '0971234567' },
  { name: 'Phan Văn Nam', phone: '0938901234' },
];

const ADDRESSES = [
  '12 Nguyễn Văn Bảo, P.4, Gò Vấp, TP.HCM',
  '48B Lê Đại Hành, P.7, Q.11, TP.HCM',
  'S2.09 Ocean Park, Gia Lâm, Hà Nội',
  '25 Nguyễn Trãi, Q.1, TP.HCM',
  '178 Lê Lợi, Q.5, TP.HCM',
  '56 Cách Mạng Tháng 8, Q.10, TP.HCM',
  '90 Phan Đình Phùng, P.2, Phú Nhuận, TP.HCM',
  '33 Điện Biên Phủ, Bình Thạnh, TP.HCM',
  '77 Võ Văn Ngân, Thủ Đức, TP.HCM',
  '15 Quang Trung, Gò Vấp, TP.HCM',
];

const DELIVERY_PARTNERS = [
  { name: 'ahamove', phone: '0931545411' },
  { name: 'Giao Hàng Tiết Kiệm', phone: '19006092' },
  { name: 'Giao Hàng Nhanh', phone: '19006366' },
  { name: 'Viettel Post', phone: '19008095' },
  { name: 'J&T Express', phone: '19001088' },
];

const PACKAGE_SIZES = [
  { weight: '300 (g)', dims: '10x10x10 (cm)' },
  { weight: '500 (g)', dims: '15x15x10 (cm)' },
  { weight: '1200 (g)', dims: '25x20x15 (cm)' },
  { weight: '2500 (g)', dims: '30x25x20 (cm)' },
  { weight: '5000 (g)', dims: '40x30x25 (cm)' },
  { weight: '800 (g)', dims: '20x15x10 (cm)' },
];

const PRODUCTS = [
  { sku: 'FBX-BCL-300', name: 'Thép hộp 50x50x2.0', unit: 'Cái', price: 145000 },
  { sku: 'FBX-BCL-301', name: 'Thép tấm 3ly 1.25x2.5m', unit: 'Tấm', price: 320000 },
  { sku: 'FBX-BCL-302', name: 'Que hàn 2.5mm', unit: 'Hộp', price: 85000 },
  { sku: 'FBX-BCL-303', name: 'Bu lông M12 dài 50', unit: 'Cái', price: 2500 },
  { sku: 'FBX-BCL-304', name: 'Thép U100 dài 6m', unit: 'Cây', price: 450000 },
  { sku: 'FBX-BCL-305', name: 'Thép V50 dài 6m', unit: 'Cây', price: 280000 },
  { sku: 'FBX-BCL-306', name: 'Sơn chống rỉ 5kg', unit: 'Thùng', price: 550000 },
  { sku: 'FBX-BCL-307', name: 'Đinh thép 5cm', unit: 'Kg', price: 35000 },
  { sku: 'FBX-BCL-308', name: 'Que hàn inox 2.0mm', unit: 'Hộp', price: 120000 },
  { sku: 'FBX-BCL-309', name: 'Thép tròn D10 dài 6m', unit: 'Cây', price: 180000 },
  { sku: 'FBX-BCL-310', name: 'Êcu M12', unit: 'Cái', price: 1500 },
  { sku: 'FBX-BCL-311', name: 'Long đền M12', unit: 'Cái', price: 800 },
  { sku: 'FBX-BCL-312', name: 'Thép hộp 30x30x1.4', unit: 'Cây', price: 95000 },
];

const TAG_POOL = [
  { label: 'VIP', color: 'red' },
  { label: 'Gấp', color: 'orange' },
  { label: 'Nợ', color: 'yellow' },
  { label: 'COD', color: 'blue' },
  { label: 'Chuyển khoản', color: 'green' },
  { label: 'Bảo hành', color: 'purple' },
  { label: 'Đổi trả', color: 'pink' },
  { label: 'Mới', color: 'cyan' },
];

const randomTags = () => {
  const count = randomBetween(0, 3);
  if (count === 0) return [];
  const shuffled = [...TAG_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

const randomOrderItems = () => {
  const count = randomBetween(1, 6);
  const shuffled = [...PRODUCTS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((p) => ({
    ...p,
    quantity: randomBetween(1, 20),
  }));
};

const generateOrder = (index, date) => {
  const customer = randomItem(CUSTOMERS);
  const partner = randomItem(DELIVERY_PARTNERS);
  const pkg = randomItem(PACKAGE_SIZES);
  const items = randomOrderItems();
  const totalPayment = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const deposit = Math.random() > 0.6 ? randomBetween(100000, totalPayment / 2) : 0;
  const customerDebt = Math.random() > 0.85 ? randomBetween(50000, 300000) : 0;
  const remainingToCollect = totalPayment - deposit + customerDebt;
  const codAmount = Math.random() > 0.7 ? remainingToCollect : 0;
  const shippingFeeCustomer = randomBetween(15000, 65000);
  const shippingFeePartner = Math.floor(shippingFeeCustomer * randomFloat(0.5, 0.9));

  const statuses = ['Đã giao hàng', 'Đang giao hàng', 'Chờ lấy hàng', 'Đã hủy', 'Hoàn thành'];
  const orderTypes = ['Giao hàng', 'Tại cửa hàng', 'Online'];
  const channels = ['Tại cửa hàng', 'Shopee', 'Lazada', 'TikTok Shop', 'Website'];

  const day = date.getDate() + randomBetween(-15, 0);
  const createdDate = new Date(date.getFullYear(), date.getMonth(), Math.max(1, day));

  return {
    id: `DH${String(index).padStart(6, '0')}`,
    createdDate: createdDate.toISOString().split('T')[0],
    deliveryDate: new Date(createdDate.getTime() + randomBetween(1, 5) * 86400000)
      .toISOString()
      .split('T')[0],
    invoiceDate: new Date(createdDate.getTime() + randomBetween(0, 2) * 86400000)
      .toISOString()
      .split('T')[0],
    status: randomItem(statuses),
    orderType: randomItem(orderTypes),
    invoiceNo: Math.random() > 0.3 ? `HD${String(randomBetween(1000, 9999))}` : '',
    salesStaff: randomItem(['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D']),
    recipientName: customer.name,
    recipientPhone: customer.phone,
    deliveryAddress: randomItem(ADDRESSES),
    shippingFeeCustomer,
    deliveryPartner: `${partner.name}\n${partner.phone}`,
    deliveryStatus: randomItem([
      'Đã lấy hàng',
      'Đang trung chuyển',
      'Đang giao',
      'Giao thành công',
    ]),
    trackingCode: `TN${String(randomBetween(10000000, 99999999))}`,
    platformOrderCode: Math.random() > 0.5 ? `SHP${String(randomBetween(100000, 999999))}` : '',
    totalPayment,
    deposit,
    customerDebt,
    remainingToCollect: Math.max(0, remainingToCollect),
    codAmount,
    packageWeight: pkg.weight,
    packageDims: pkg.dims,
    packageInfo: `${pkg.weight}\n${pkg.dims}`,
    shippingFeePartner,
    salesChannel: randomItem(channels),
    note: Math.random() > 0.7 ? 'Giao hàng giờ hành chính' : '',
    reconciliationNo: Math.random() > 0.8 ? `DS${String(randomBetween(100, 999))}` : '',
    reconciliationStatus: randomItem(['Chưa đối soát', 'Đã đối soát', '']),
    tags: randomTags(),
    items,
  };
};

export const generateOrderData = (count = 982) => {
  const data = [];
  const startDate = new Date();
  for (let i = 1; i <= count; i++) {
    data.push(generateOrder(i, startDate));
  }
  return data;
};

export { TAG_POOL, PRODUCTS, CUSTOMERS, ADDRESSES, DELIVERY_PARTNERS };
