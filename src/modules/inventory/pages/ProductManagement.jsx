import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import MaterialIcon from '../components/MaterialIcon';
import EditProductModal from '../components/EditProductModal';

const topTabs = [
  { key: 'inventory', label: 'Kho hàng', icon: 'inventory_2' },
  { key: 'orders', label: 'Đơn hàng', icon: 'shopping_cart' },
  { key: 'suppliers', label: 'Nhà cung cấp', icon: 'groups' },
  { key: 'promotions', label: 'Khuyến mãi', icon: 'sell' },
  { key: 'funds', label: 'Quỹ tiền', icon: 'account_balance_wallet' },
  { key: 'purchasing', label: 'Mua hàng', icon: 'shopping_bag' },
];

const hubConfigs = {
  inventory: {
    centerLabel: 'Kho hàng',
    centerIcon: 'inventory_2',
    actions: [
      { id: 'inv-1', label: 'Nhập kho', icon: 'input' },
      { id: 'inv-2', label: 'Điều chuyển từ CH khác', icon: 'store' },
      { id: 'inv-3', label: 'Xuất kho', icon: 'output' },
      { id: 'inv-4', label: 'Chuyển kho', icon: 'swap_horiz' },
      { id: 'inv-5', label: 'Lệnh điều chuyển', icon: 'assignment' },
      { id: 'inv-6', label: 'Kiểm kê kho', icon: 'inventory' },
      { id: 'inv-7', label: 'Tổng hợp tồn kho', icon: 'list_alt' },
      { id: 'inv-8', label: 'Tính giá xuất kho', icon: 'calculate' },
    ],
  },
  orders: {
    centerLabel: 'Đơn hàng',
    centerIcon: 'shopping_cart',
    actions: [
      { id: 'ord-1', label: 'Tạo đơn hàng', icon: 'add_shopping_cart' },
      { id: 'ord-2', label: 'Xử lý đơn', icon: 'inventory_2' },
      { id: 'ord-3', label: 'Giao hàng', icon: 'local_shipping' },
      { id: 'ord-4', label: 'Đổi trả', icon: 'cached' },
    ],
  },
  suppliers: {
    centerLabel: 'Nhà cung cấp',
    centerIcon: 'groups',
    actions: [
      { id: 'sup-1', label: 'Danh sách NCC', icon: 'list_alt' },
      { id: 'sup-2', label: 'Đánh giá NCC', icon: 'star' },
      { id: 'sup-3', label: 'Công nợ NCC', icon: 'request_quote' },
      { id: 'sup-4', label: 'Lịch sử hợp tác', icon: 'history' },
    ],
  },
  promotions: {
    centerLabel: 'Khuyến mãi',
    centerIcon: 'sell',
    actions: [
      { id: 'pro-1', label: 'Chương trình khuyến mãi', icon: 'campaign' },
      { id: 'pro-2', label: 'Thẻ voucher', icon: 'card_giftcard' },
    ],
  },
  funds: {
    centerLabel: 'Quỹ tiền',
    centerIcon: 'account_balance_wallet',
    actions: [
      { id: 'fund-1', label: 'Thu tiền', icon: 'south_west' },
      { id: 'fund-2', label: 'Chi tiền', icon: 'north_east' },
      { id: 'fund-3', label: 'Sổ quỹ', icon: 'menu_book' },
      { id: 'fund-4', label: 'Đối soát quỹ', icon: 'balance' },
    ],
  },
  purchasing: {
    centerLabel: 'Mua hàng',
    centerIcon: 'shopping_bag',
    actions: [
      { id: 'buy-1', label: 'Báo hàng', icon: 'notifications_active' },
      { id: 'buy-2', label: 'Nhập hàng', icon: 'inventory_2' },
      { id: 'buy-3', label: 'Đặt hàng', icon: 'assignment_add' },
      { id: 'buy-4', label: 'Trả lại hàng mua', icon: 'assignment_return' },
      { id: 'buy-5', label: 'Trả', icon: 'reply' },
    ],
  },
};

const inventoryRows = [
  {
    id: 'SP34405804',
    name: 'Xi măng Bút Sơn PCB40',
    unit: 'Bao',
    brand: 'Bút Sơn',
    salePrice: 85000,
    costPrice: 72000,
    stock: 250,
    location: 'D1-01',
    status: 'Sẵn hàng',
    statusTone: 'green',
    createdAt: '12/05/2026 16:45',
    group: 'Vật liệu thô',
    barcode: 'Chưa có',
    stockLevel: '50 - 500',
    weight: '50kg',
    dimension: 'Chưa có',
    supplier: 'Xi măng Bút Sơn',
    itemType: 'Hàng hóa thường',
    directSale: true,
    salesChannelLinked: true,
    productStatus: 'active',
    estimatedOutAt: '30/06/2026 00:00',
  },
  {
    id: 'SP34405801',
    name: 'Sơn chống thấm KOVA CT-11A Gold (20kg)',
    unit: 'Thùng',
    brand: 'KOVA',
    salePrice: 2450000,
    costPrice: 1980000,
    stock: 45,
    location: 'B3-15',
    status: 'Sẵn hàng',
    statusTone: 'green',
    createdAt: '15/05/2026 09:30',
    group: 'Sơn và Hóa chất',
    barcode: '8936014450123',
    stockLevel: '10 - 100',
    weight: '20kg',
    dimension: 'Chưa có',
    supplier: 'KOVA Việt Nam',
    itemType: 'Hàng hóa thường',
    directSale: true,
    salesChannelLinked: true,
    productStatus: 'active',
    estimatedOutAt: '22/05/2026 00:00',
  },
  {
    id: 'SP34405802',
    name: 'Thép cuộn Hòa Phát Phi 6',
    unit: 'Tấn',
    brand: 'Hòa Phát',
    salePrice: 15800000,
    costPrice: 14200000,
    stock: 12,
    location: 'Kho Ngoài',
    status: 'Sẵn hàng',
    statusTone: 'green',
    createdAt: '14/05/2026 14:15',
    group: 'Kim khí',
    barcode: '8936014459334',
    stockLevel: '8 - 40',
    weight: '1 tấn',
    dimension: 'Chưa có',
    supplier: 'Tập đoàn Hòa Phát',
    itemType: 'Hàng hóa thường',
    directSale: true,
    salesChannelLinked: false,
    productStatus: 'active',
    estimatedOutAt: '19/05/2026 00:00',
  },
  {
    id: 'SP34405797',
    name: 'Máy Thổi Lá Pin CW0556 (Cmart)',
    unit: 'Cái',
    brand: 'C-Mart',
    salePrice: 520000,
    costPrice: 375000,
    stock: 3,
    location: 'A1-02',
    status: 'Sắp hết',
    statusTone: 'amber',
    createdAt: '02/05/2026 11:08',
    group: 'Thiết bị điện',
    barcode: '8936014459335',
    stockLevel: '5 - 30',
    weight: '3.6kg',
    dimension: '30 x 15 x 20cm',
    supplier: 'C-Mart',
    itemType: 'Hàng hóa thường',
    directSale: false,
    salesChannelLinked: false,
    productStatus: 'active',
    estimatedOutAt: '18/05/2026 00:00',
  },
  {
    id: 'SP34405803',
    name: 'Máy khoan Bosch GSB 550',
    unit: 'Bộ',
    brand: 'Bosch',
    salePrice: 1150000,
    costPrice: 890000,
    stock: 0,
    location: 'C2-01',
    status: 'Hết hàng',
    statusTone: 'red',
    createdAt: '10/05/2026 08:00',
    group: 'Dụng cụ cầm tay',
    barcode: '8936014459336',
    stockLevel: '6 - 50',
    weight: '4kg',
    dimension: 'Chưa có',
    supplier: 'Bosch Việt Nam',
    itemType: 'Hàng hóa thường',
    directSale: false,
    salesChannelLinked: true,
    productStatus: 'active',
    estimatedOutAt: '17/05/2026 00:00',
  },
];

const toneClass = {
  green: 'bg-green-100 text-green-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
};

const formatMoney = (value) => new Intl.NumberFormat('vi-VN').format(value);

const estimatedQuickRanges = [
  {
    title: 'Theo ngày',
    options: ['Ngày mai', 'Ngày kia', '3 ngày tới', '5 ngày tới', '7 ngày tới'],
  },
  {
    title: 'Theo tuần',
    options: ['Tuần này', 'Tuần tới', '2 tuần tới'],
  },
  {
    title: 'Theo tháng',
    options: ['Tháng này', 'Tháng tới', '30 ngày tới', '2 tháng tới', '3 tháng tới'],
  },
];

const createdQuickRanges = [
  {
    title: 'Theo ngày',
    options: ['Hôm nay', 'Hôm qua'],
  },
  {
    title: 'Theo tuần',
    options: ['Tuần này', 'Tuần trước', '7 ngày qua'],
  },
  {
    title: 'Theo tháng',
    options: [
      'Tháng này',
      'Tháng trước',
      'Tháng này (âm lịch)',
      'Tháng trước (âm lịch)',
      '30 ngày qua',
    ],
  },
  {
    title: 'Theo quý',
    options: ['Quý này', 'Quý trước'],
  },
  {
    title: 'Theo năm',
    options: ['Năm này', 'Năm trước', 'Năm này (âm lịch)', 'Năm trước (âm lịch)'],
  },
];

const statusOptions = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Hàng đang kinh doanh', value: 'active' },
  { label: 'Hàng ngừng kinh doanh', value: 'inactive' },
];

const parseDateTime = (value) => {
  if (!value) return null;
  const [datePart, timePart = '00:00'] = value.split(' ');
  const [day, month, year] = datePart.split('/').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day, hour || 0, minute || 0, 0, 0);
};

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const endOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const getCreatedPresetRange = (label) => {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const thisWeekStart = startOfDay(addDays(now, -(now.getDay() === 0 ? 6 : now.getDay() - 1)));
  const thisWeekEnd = endOfDay(addDays(thisWeekStart, 6));
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthEnd = endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));

  switch (label) {
    case 'Hôm nay':
      return { start: todayStart, end: todayEnd };
    case 'Hôm qua':
      return { start: startOfDay(addDays(now, -1)), end: endOfDay(addDays(now, -1)) };
    case '7 ngày qua':
      return { start: startOfDay(addDays(now, -6)), end: todayEnd };
    case 'Tuần này':
      return { start: thisWeekStart, end: thisWeekEnd };
    case '30 ngày qua':
      return { start: startOfDay(addDays(now, -29)), end: todayEnd };
    case 'Tháng này':
      return { start: thisMonthStart, end: thisMonthEnd };
    default:
      return null;
  }
};

const getEstimatedPresetRange = (label) => {
  const now = new Date();
  const todayStart = startOfDay(now);

  switch (label) {
    case 'Ngày mai':
      return { start: startOfDay(addDays(now, 1)), end: endOfDay(addDays(now, 1)) };
    case '3 ngày tới':
      return { start: todayStart, end: endOfDay(addDays(now, 3)) };
    case '5 ngày tới':
      return { start: todayStart, end: endOfDay(addDays(now, 5)) };
    case '7 ngày tới':
      return { start: todayStart, end: endOfDay(addDays(now, 7)) };
    case '30 ngày tới':
      return { start: todayStart, end: endOfDay(addDays(now, 30)) };
    case 'Tháng này':
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
      };
    default:
      return null;
  }
};

export const ProductManagement = () => {
  const [activeHubKey, setActiveHubKey] = useState(null);
  const [activeTab, setActiveTab] = useState('inventory');
  const [activeDetailTab, setActiveDetailTab] = useState('info');
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);
  const [expandedId, setExpandedId] = useState('SP34405804');
  const [products, setProducts] = useState(inventoryRows);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'stock', direction: 'desc' });
  const [groupKeyword, setGroupKeyword] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [estimatedStockOutFilter, setEstimatedStockOutFilter] = useState('allTime');
  const [createdTimeFilter, setCreatedTimeFilter] = useState('allTime');
  const [estimatedQuickOpen, setEstimatedQuickOpen] = useState(false);
  const [createdQuickOpen, setCreatedQuickOpen] = useState(false);
  const [estimatedCustomOpen, setEstimatedCustomOpen] = useState(false);
  const [createdCustomOpen, setCreatedCustomOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [estimatedSelectedLabel, setEstimatedSelectedLabel] = useState('Toàn thời gian');
  const [createdSelectedLabel, setCreatedSelectedLabel] = useState('Toàn thời gian');
  const [estimatedRange, setEstimatedRange] = useState(null);
  const [createdRange, setCreatedRange] = useState(null);
  const [supplierKeyword, setSupplierKeyword] = useState('');
  const [locationKeyword, setLocationKeyword] = useState('');
  const [itemTypeKeyword, setItemTypeKeyword] = useState('');
  const [directSaleFilter, setDirectSaleFilter] = useState('all');
  const [salesChannelFilter, setSalesChannelFilter] = useState('all');
  const [productStatusFilter, setProductStatusFilter] = useState('active');
  const estimatedRef = useRef(null);
  const createdRef = useRef(null);
  const statusDropdownRef = useRef(null);
  const isHubOpen = Boolean(activeHubKey);
  const activeHubConfig = hubConfigs[activeHubKey] || hubConfigs.inventory;

  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', isHubOpen);
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isHubOpen]);

  useEffect(() => {
    const onClickOutside = (event) => {
      if (estimatedRef.current && !estimatedRef.current.contains(event.target)) {
        setEstimatedQuickOpen(false);
        setEstimatedCustomOpen(false);
      }
      if (createdRef.current && !createdRef.current.contains(event.target)) {
        setCreatedQuickOpen(false);
        setCreatedCustomOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setStatusDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const displayedRows = useMemo(() => {
    const filtered = products.filter((row) => {
      const q = search.trim().toLowerCase();
      const isSearchMatched =
        !q || row.id.toLowerCase().includes(q) || row.name.toLowerCase().includes(q);

      const groupQuery = groupKeyword.trim().toLowerCase();
      const isGroupMatched = !groupQuery || row.group.toLowerCase().includes(groupQuery);

      const supplierQuery = supplierKeyword.trim().toLowerCase();
      const isSupplierMatched =
        !supplierQuery || row.supplier.toLowerCase().includes(supplierQuery);

      const locationQuery = locationKeyword.trim().toLowerCase();
      const isLocationMatched =
        !locationQuery || row.location.toLowerCase().includes(locationQuery);

      const typeQuery = itemTypeKeyword.trim().toLowerCase();
      const isTypeMatched = !typeQuery || row.itemType.toLowerCase().includes(typeQuery);

      const isStockMatched =
        stockFilter === 'all' ||
        (stockFilter === 'inStock' && row.stock > 0) ||
        (stockFilter === 'outStock' && row.stock === 0);

      const isDirectSaleMatched =
        directSaleFilter === 'all' ||
        (directSaleFilter === 'yes' && row.directSale) ||
        (directSaleFilter === 'no' && !row.directSale);

      const isSalesChannelMatched =
        salesChannelFilter === 'all' ||
        (salesChannelFilter === 'yes' && row.salesChannelLinked) ||
        (salesChannelFilter === 'no' && !row.salesChannelLinked);

      const isStatusMatched =
        productStatusFilter === 'all' ||
        (productStatusFilter === 'active' && row.productStatus === 'active') ||
        (productStatusFilter === 'inactive' && row.productStatus === 'inactive');

      const createdDate = parseDateTime(row.createdAt);
      const estimatedDate = parseDateTime(row.estimatedOutAt);
      const isCreatedTimeMatched =
        createdTimeFilter !== 'custom' ||
        !createdRange ||
        (createdDate && createdDate >= createdRange.start && createdDate <= createdRange.end);
      const isEstimatedMatched =
        estimatedStockOutFilter !== 'custom' ||
        !estimatedRange ||
        (estimatedDate &&
          estimatedDate >= estimatedRange.start &&
          estimatedDate <= estimatedRange.end);

      return (
        isSearchMatched &&
        isGroupMatched &&
        isSupplierMatched &&
        isLocationMatched &&
        isTypeMatched &&
        isStockMatched &&
        isDirectSaleMatched &&
        isSalesChannelMatched &&
        isStatusMatched &&
        isCreatedTimeMatched &&
        isEstimatedMatched
      );
    });

    return [...filtered].sort((a, b) => {
      const valueA = a[sortConfig.key];
      const valueB = b[sortConfig.key];

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortConfig.direction === 'asc' ? valueA - valueB : valueB - valueA;
      }

      const compare = `${valueA}`.localeCompare(`${valueB}`, 'vi');
      return sortConfig.direction === 'asc' ? compare : -compare;
    });
  }, [
    search,
    sortConfig,
    groupKeyword,
    stockFilter,
    supplierKeyword,
    locationKeyword,
    itemTypeKeyword,
    directSaleFilter,
    salesChannelFilter,
    productStatusFilter,
    createdTimeFilter,
    estimatedStockOutFilter,
    createdRange,
    estimatedRange,
  ]);

  const handleSaveProduct = (updated) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
    setEditModalOpen(false);
    setProductToEdit(null);
  };

  const toggleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return 'unfold_more';
    return sortConfig.direction === 'asc' ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
  };

  const renderDatePickerPopup = (onCancel, onApply) => (
    <div className="absolute left-[calc(100%+10px)] top-14 z-30 w-[620px] rounded-xl border border-slate-200 bg-white shadow-2xl">
      <div className="px-4 pb-3 pt-4">
        <p className="text-sm text-slate-500">
          Từ ngày: <span className="font-semibold text-slate-800">17/05/2026</span> - Đến ngày:{' '}
          <span className="font-semibold text-slate-800">17/05/2026</span>
        </p>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-2">
              <button
                type="button"
                className="rounded-lg border border-slate-300 p-1 text-slate-500"
              >
                <MaterialIcon name="chevron_left" className="text-[16px]" />
              </button>
              <p className="text-lg text-slate-700">Tháng 5 2026</p>
              <button
                type="button"
                className="rounded-lg border border-slate-300 p-1 text-slate-500"
              >
                <MaterialIcon name="chevron_right" className="text-[16px]" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-y-3 text-center text-sm text-slate-400">
              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => (
                <span key={`left-week-${day}`}>{day}</span>
              ))}
              {[27, 28, 29, 30, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(
                (day) => (
                  <span
                    key={`left-day-${day}`}
                    className={day < 4 ? 'text-slate-300' : 'text-slate-700'}
                  >
                    {day}
                  </span>
                )
              )}
              <span className="flex h-10 w-10 items-center justify-center justify-self-center rounded-full bg-blue-600 font-bold text-white">
                17
              </span>
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-2">
              <button
                type="button"
                className="rounded-lg border border-slate-300 p-1 text-slate-500"
              >
                <MaterialIcon name="chevron_left" className="text-[16px]" />
              </button>
              <p className="text-lg text-slate-700">Tháng 5 2026</p>
              <button
                type="button"
                className="rounded-lg border border-slate-300 p-1 text-slate-500"
              >
                <MaterialIcon name="chevron_right" className="text-[16px]" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-y-3 text-center text-sm text-slate-400">
              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => (
                <span key={`right-week-${day}`}>{day}</span>
              ))}
              {[18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 1, 2, 3, 4, 5, 6, 7].map(
                (day) => (
                  <span
                    key={`right-day-${day}`}
                    className={day < 8 ? 'text-slate-700' : 'text-slate-400'}
                  >
                    {day}
                  </span>
                )
              )}
              <span className="flex h-10 w-10 items-center justify-center justify-self-end rounded-full bg-blue-600 font-bold text-white">
                17
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
        <button type="button" className="text-base font-semibold text-blue-600" onClick={onCancel}>
          Hôm nay
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-4 py-1.5 text-base font-semibold text-slate-600"
            onClick={onCancel}
          >
            Bỏ qua
          </button>
          <button
            type="button"
            className="rounded-lg bg-blue-600 px-4 py-1.5 text-base font-semibold text-white"
            onClick={onApply}
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="-mt-8 min-h-[calc(100vh-64px)] overflow-x-hidden bg-[#faf9fc]">
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center bg-primary/40 backdrop-blur-md transition-all duration-300 ${
          isHubOpen ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'
        }`}
      >
        <button
          type="button"
          aria-label="Đóng menu hub"
          className="absolute inset-0"
          onClick={() => setActiveHubKey(null)}
        />

        <div className="relative z-20 flex items-center justify-center">
          <button
            type="button"
            className="flex h-28 w-28 flex-col items-center justify-center rounded-full border-4 border-white/20 bg-primary text-white shadow-2xl"
          >
            <MaterialIcon name={activeHubConfig.centerIcon} className="text-4xl" />
            <span className="mt-1 text-[12px] font-bold uppercase tracking-tight">
              {activeHubConfig.centerLabel}
            </span>
          </button>

          {activeHubConfig.actions.map((action, index) => {
            const angle = -90 + index * (360 / activeHubConfig.actions.length);
            const radius = 220;
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;

            return (
              <div
                key={action.id}
                className="absolute left-1/2 top-1/2 transition-all duration-500"
                style={{
                  transform: isHubOpen
                    ? `translate(-50%, -50%) translate(${x}px, ${y}px)`
                    : 'translate(-50%, -50%) scale(0.2)',
                  opacity: isHubOpen ? 1 : 0,
                }}
              >
                <div className="group flex flex-col items-center gap-2">
                  <button
                    type="button"
                    className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/10 bg-white text-primary shadow-xl transition-all hover:scale-110 hover:bg-primary hover:text-white"
                  >
                    <MaterialIcon name={action.icon} className="text-2xl" />
                  </button>
                  <div className="whitespace-nowrap rounded bg-white/90 px-3 py-1 text-[11px] font-bold uppercase text-primary shadow-sm backdrop-blur">
                    {action.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex h-12 items-center bg-[#faf9fc]">
        <nav className="no-scrollbar flex h-10 w-full items-center gap-8 overflow-x-auto rounded-lg border border-slate-200 bg-white px-3 shadow-sm">
          {topTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`group relative flex h-full items-center gap-2 px-2 transition-colors ${
                activeTab === tab.key
                  ? 'font-semibold text-primary'
                  : 'text-slate-600 hover:text-primary'
              }`}
              onClick={() => {
                setActiveTab(tab.key);
                setActiveHubKey(tab.key);
              }}
            >
              <MaterialIcon name={tab.icon} className="text-[20px]" />
              <span className="whitespace-nowrap text-sm font-medium">{tab.label}</span>
              <span
                className={`absolute bottom-0 left-2 right-2 h-0.5 bg-primary transition-transform duration-200 ${
                  activeTab === tab.key ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`}
              />
            </button>
          ))}
        </nav>
      </div>

      <div className="relative mx-auto flex max-w-[1600px] gap-6 px-6 pb-6 pt-4">
        <button
          type="button"
          className={`fixed left-[260px] top-[148px] z-10 flex h-7 w-7 items-center justify-center rounded-full border border-blue-400 bg-white text-blue-500 shadow-md transition-all duration-300 hover:scale-110 ${
            isFilterCollapsed ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
          onClick={() => setIsFilterCollapsed(false)}
        >
          <MaterialIcon name="chevron_right" className="text-[18px]" />
        </button>

        <aside
          className={`relative shrink-0 space-y-5 self-start rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 ${
            isFilterCollapsed ? '-ml-[280px] w-[280px] -translate-x-5 opacity-0' : 'w-[280px]'
          }`}
        >
          <button
            type="button"
            className="absolute -right-3.5 top-24 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-blue-400 bg-white text-blue-500 shadow-md transition-all hover:scale-110"
            onClick={() => setIsFilterCollapsed(true)}
          >
            <MaterialIcon name="chevron_left" className="text-[18px]" />
          </button>

          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold uppercase tracking-tight text-slate-700">Nhóm hàng</h3>
            <button type="button" className="text-xs font-bold text-blue-900 hover:underline">
              Tạo mới
            </button>
          </div>
          <div>
            <input
              className="w-full rounded-lg border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
              placeholder="Chọn nhóm hàng"
              value={groupKeyword}
              onChange={(event) => setGroupKeyword(event.target.value)}
            />

            <div className="mb-6 mt-6 space-y-2">
              <p className="text-sm font-bold uppercase tracking-tight text-slate-700">Tồn kho</p>
              <select
                className="w-full rounded-lg border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
                value={stockFilter}
                onChange={(event) => setStockFilter(event.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="inStock">Còn hàng</option>
                <option value="outStock">Hết hàng</option>
              </select>
            </div>

            <div className="relative mb-6 space-y-2" ref={estimatedRef}>
              <p className="text-sm font-bold uppercase tracking-tight text-slate-700">
                Dự kiến hết hàng
              </p>
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-lg bg-white p-2 ${
                  estimatedStockOutFilter === 'allTime'
                    ? 'border border-blue-900'
                    : 'border border-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="estimatedStockOut"
                  checked={estimatedStockOutFilter === 'allTime'}
                  onChange={() => {
                    setEstimatedStockOutFilter('allTime');
                    setEstimatedRange(null);
                    setEstimatedCustomOpen(false);
                    setEstimatedQuickOpen((prev) => !prev);
                  }}
                  className="h-4 w-4 text-blue-900 focus:ring-blue-900"
                />
                <span className="flex w-full items-center justify-between text-sm font-medium text-slate-800">
                  {estimatedSelectedLabel}
                  <MaterialIcon name="chevron_right" className="text-sm text-slate-400" />
                </span>
              </label>
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-lg bg-white p-2 ${
                  estimatedStockOutFilter === 'custom'
                    ? 'border border-blue-900'
                    : 'border border-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="estimatedStockOut"
                  checked={estimatedStockOutFilter === 'custom'}
                  onChange={() => {
                    setEstimatedStockOutFilter('custom');
                    setEstimatedQuickOpen(false);
                    setEstimatedCustomOpen((prev) => !prev);
                  }}
                  className="h-4 w-4 text-blue-900 focus:ring-blue-900"
                />
                <span className="flex w-full items-center justify-between text-sm text-slate-600">
                  Tùy chỉnh
                  <MaterialIcon name="calendar_today" className="text-sm text-slate-400" />
                </span>
              </label>

              {estimatedQuickOpen && (
                <div className="absolute left-[calc(100%+10px)] top-6 z-30 w-[500px] rounded-xl border border-slate-200 bg-white p-4 shadow-2xl">
                  <div className="grid grid-cols-3 gap-4">
                    {estimatedQuickRanges.map((column) => (
                      <div key={column.title}>
                        <p className="mb-2 text-sm font-bold text-slate-800">{column.title}</p>
                        <div className="flex flex-col gap-2">
                          {column.options.map((option) => (
                            <button
                              key={option}
                              type="button"
                              className="rounded-full border border-slate-300 px-3 py-1.5 text-left text-sm text-slate-700 hover:border-blue-600 hover:text-blue-600"
                              onClick={() => {
                                setEstimatedSelectedLabel(option);
                                setEstimatedRange(getEstimatedPresetRange(option));
                                setEstimatedStockOutFilter('custom');
                                setEstimatedQuickOpen(false);
                              }}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      className="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-bold text-white"
                      onClick={() => {
                        setEstimatedSelectedLabel('Toàn thời gian');
                        setEstimatedRange(null);
                        setEstimatedStockOutFilter('allTime');
                        setEstimatedQuickOpen(false);
                      }}
                    >
                      Toàn thời gian
                    </button>
                  </div>
                </div>
              )}

              {estimatedCustomOpen &&
                renderDatePickerPopup(
                  () => setEstimatedCustomOpen(false),
                  () => {
                    setEstimatedSelectedLabel('17/05/2026 - 17/05/2026');
                    setEstimatedRange({
                      start: parseDateTime('17/05/2026 00:00'),
                      end: parseDateTime('17/05/2026 23:59'),
                    });
                    setEstimatedStockOutFilter('custom');
                    setEstimatedCustomOpen(false);
                  }
                )}
            </div>

            <div className="relative mb-6 space-y-2" ref={createdRef}>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold uppercase tracking-tight text-slate-700">
                  Thời gian tạo
                </p>
                <div className="h-2 w-2 rounded-full bg-blue-600" />
              </div>
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-lg bg-white p-2 ${
                  createdTimeFilter === 'allTime'
                    ? 'border border-blue-900'
                    : 'border border-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="createdTime"
                  checked={createdTimeFilter === 'allTime'}
                  onChange={() => {
                    setCreatedTimeFilter('allTime');
                    setCreatedRange(null);
                    setCreatedCustomOpen(false);
                    setCreatedQuickOpen((prev) => !prev);
                  }}
                  className="h-4 w-4 text-blue-900 focus:ring-blue-900"
                />
                <span className="flex w-full items-center justify-between text-sm text-slate-600">
                  {createdSelectedLabel}
                  <MaterialIcon name="chevron_right" className="text-sm text-slate-400" />
                </span>
              </label>
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-lg bg-white p-2 ${
                  createdTimeFilter === 'custom'
                    ? 'border border-blue-900'
                    : 'border border-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="createdTime"
                  checked={createdTimeFilter === 'custom'}
                  onChange={() => {
                    setCreatedTimeFilter('custom');
                    setCreatedQuickOpen(false);
                    setCreatedCustomOpen((prev) => !prev);
                  }}
                  className="h-4 w-4 text-blue-900 focus:ring-blue-900"
                />
                <span className="flex w-full items-center justify-between text-sm font-medium text-slate-800">
                  {createdSelectedLabel === 'Toàn thời gian'
                    ? '17/05/2026 - 17/05/2026'
                    : createdSelectedLabel}
                  <MaterialIcon name="calendar_today" className="text-sm text-slate-400" />
                </span>
              </label>

              {createdQuickOpen && (
                <div className="absolute left-[calc(100%+10px)] top-6 z-30 w-[740px] rounded-xl border border-slate-200 bg-white p-4 shadow-2xl">
                  <div className="grid grid-cols-5 gap-4">
                    {createdQuickRanges.map((column) => (
                      <div key={column.title}>
                        <p className="mb-2 text-sm font-bold text-slate-800">{column.title}</p>
                        <div className="flex flex-col gap-2">
                          {column.options.map((option) => (
                            <button
                              key={option}
                              type="button"
                              className="rounded-full border border-slate-300 px-3 py-1.5 text-left text-sm text-slate-700 hover:border-blue-600 hover:text-blue-600"
                              onClick={() => {
                                setCreatedSelectedLabel(option);
                                setCreatedRange(getCreatedPresetRange(option));
                                setCreatedTimeFilter('custom');
                                setCreatedQuickOpen(false);
                              }}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      className="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-bold text-white"
                      onClick={() => {
                        setCreatedSelectedLabel('Toàn thời gian');
                        setCreatedRange(null);
                        setCreatedTimeFilter('allTime');
                        setCreatedQuickOpen(false);
                      }}
                    >
                      Toàn thời gian
                    </button>
                  </div>
                </div>
              )}

              {createdCustomOpen &&
                renderDatePickerPopup(
                  () => setCreatedCustomOpen(false),
                  () => {
                    setCreatedSelectedLabel('17/05/2026 - 17/05/2026');
                    setCreatedRange({
                      start: parseDateTime('17/05/2026 00:00'),
                      end: parseDateTime('17/05/2026 23:59'),
                    });
                    setCreatedTimeFilter('custom');
                    setCreatedCustomOpen(false);
                  }
                )}
            </div>

            <div className="mb-6 space-y-2">
              <p className="text-sm font-bold uppercase tracking-tight text-slate-700">
                Nhà cung cấp
              </p>
              <input
                className="w-full rounded-lg border-slate-200 px-3 py-2 text-sm"
                placeholder="Chọn nhà cung cấp"
                value={supplierKeyword}
                onChange={(event) => setSupplierKeyword(event.target.value)}
              />
            </div>

            <div className="mb-6 space-y-2">
              <p className="text-sm font-bold uppercase tracking-tight text-slate-700">Vị trí</p>
              <input
                className="w-full rounded-lg border-slate-200 px-3 py-2 text-sm"
                placeholder="Chọn vị trí"
                value={locationKeyword}
                onChange={(event) => setLocationKeyword(event.target.value)}
              />
            </div>

            <div className="mb-6 space-y-2">
              <p className="text-sm font-bold uppercase tracking-tight text-slate-700">Loại hàng</p>
              <input
                className="w-full rounded-lg border-slate-200 px-3 py-2 text-sm"
                placeholder="Chọn loại hàng"
                value={itemTypeKeyword}
                onChange={(event) => setItemTypeKeyword(event.target.value)}
              />
            </div>

            <div className="mb-6 space-y-2">
              <p className="text-sm font-bold uppercase tracking-tight text-slate-700">
                Bán trực tiếp
              </p>
              <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  className={`flex-1 rounded-lg py-1.5 text-sm font-medium ${
                    directSaleFilter === 'all'
                      ? 'bg-blue-600 font-bold text-white'
                      : 'text-slate-600'
                  }`}
                  onClick={() => setDirectSaleFilter('all')}
                >
                  Tất cả
                </button>
                <button
                  type="button"
                  className={`flex-1 rounded-lg py-1.5 text-sm font-medium ${
                    directSaleFilter === 'yes'
                      ? 'bg-blue-600 font-bold text-white'
                      : 'text-slate-600'
                  }`}
                  onClick={() => setDirectSaleFilter('yes')}
                >
                  Có
                </button>
                <button
                  type="button"
                  className={`flex-1 rounded-lg py-1.5 text-sm font-medium ${
                    directSaleFilter === 'no'
                      ? 'bg-blue-600 font-bold text-white'
                      : 'text-slate-600'
                  }`}
                  onClick={() => setDirectSaleFilter('no')}
                >
                  Không
                </button>
              </div>
            </div>

            <div className="mb-6 space-y-2">
              <p className="text-sm font-bold uppercase tracking-tight text-slate-700">
                Liên kết kênh bán
              </p>
              <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  className={`flex-1 rounded-lg py-1.5 text-sm font-medium ${
                    salesChannelFilter === 'all'
                      ? 'bg-blue-600 font-bold text-white'
                      : 'text-slate-600'
                  }`}
                  onClick={() => setSalesChannelFilter('all')}
                >
                  Tất cả
                </button>
                <button
                  type="button"
                  className={`flex-1 rounded-lg py-1.5 text-sm font-medium ${
                    salesChannelFilter === 'yes'
                      ? 'bg-blue-600 font-bold text-white'
                      : 'text-slate-600'
                  }`}
                  onClick={() => setSalesChannelFilter('yes')}
                >
                  Có
                </button>
                <button
                  type="button"
                  className={`flex-1 rounded-lg py-1.5 text-sm font-medium ${
                    salesChannelFilter === 'no'
                      ? 'bg-blue-600 font-bold text-white'
                      : 'text-slate-600'
                  }`}
                  onClick={() => setSalesChannelFilter('no')}
                >
                  Không
                </button>
              </div>
            </div>

            <div className="relative space-y-2" ref={statusDropdownRef}>
              <p className="text-sm font-bold uppercase tracking-tight text-slate-700">
                Trạng thái hàng hóa
              </p>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-lg border border-slate-300 px-3 py-2 text-left text-sm text-slate-800"
                onClick={() => setStatusDropdownOpen((prev) => !prev)}
              >
                <span>
                  {statusOptions.find((option) => option.value === productStatusFilter)?.label}
                </span>
                <MaterialIcon
                  name={statusDropdownOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                  className="text-[18px]"
                />
              </button>

              {statusDropdownOpen && (
                <div className="absolute left-0 right-0 top-[58px] z-30 rounded-lg border border-slate-200 bg-white py-2 shadow-2xl">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-slate-800 hover:bg-slate-50"
                      onClick={() => {
                        setProductStatusFilter(option.value);
                        setStatusDropdownOpen(false);
                      }}
                    >
                      <span>{option.label}</span>
                      {productStatusFilter === option.value && (
                        <MaterialIcon name="check" className="text-[18px] text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex max-w-lg flex-1 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
              <MaterialIcon name="search" className="mr-2 text-slate-400" />
              <input
                className="w-full border-none bg-transparent text-sm focus:ring-0"
                placeholder="Theo mã, tên hàng"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <MaterialIcon name="tune" className="ml-2 cursor-pointer text-slate-400" />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-700"
              >
                <MaterialIcon name="add" className="text-sm" />
                <span>Tạo mới</span>
                <MaterialIcon name="keyboard_arrow_down" className="text-sm" />
              </button>
              <button
                type="button"
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                <MaterialIcon name="upload_file" className="text-sm" />
                <span>Import file</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                <MaterialIcon name="download" className="text-sm" />
                <span>Xuất file</span>
              </button>
            </div>
          </div>

          <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1150px] border-collapse text-left">
                <thead className="border-b border-slate-200 bg-[#e8f0fe]">
                  <tr className="text-[11px] font-bold uppercase text-slate-600">
                    <th className="w-10 px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-primary focus:ring-primary"
                      />
                    </th>
                    <th className="w-8 px-2 py-3">
                      <MaterialIcon name="star_outline" className="text-sm" />
                    </th>
                    <th className="cursor-pointer px-4 py-3" onClick={() => toggleSort('id')}>
                      <div className="flex items-center gap-1">
                        <span>Mã hàng</span>
                        <MaterialIcon name={getSortIcon('id')} className="text-[16px]" />
                      </div>
                    </th>
                    <th className="cursor-pointer px-4 py-3" onClick={() => toggleSort('name')}>
                      <div className="flex items-center gap-1">
                        <span>Tên hàng</span>
                        <MaterialIcon name={getSortIcon('name')} className="text-[16px]" />
                      </div>
                    </th>
                    <th className="px-4 py-3">Đơn vị</th>
                    <th className="px-4 py-3">Thương hiệu</th>
                    <th
                      className="cursor-pointer px-4 py-3 text-right"
                      onClick={() => toggleSort('salePrice')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Giá bán</span>
                        <MaterialIcon name={getSortIcon('salePrice')} className="text-[16px]" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-right">Giá vốn</th>
                    <th
                      className="cursor-pointer px-4 py-3 text-right"
                      onClick={() => toggleSort('stock')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Tồn kho</span>
                        <MaterialIcon name={getSortIcon('stock')} className="text-[16px]" />
                      </div>
                    </th>
                    <th className="px-4 py-3">Vị trí kho</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Thời gian tạo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {displayedRows.map((row) => {
                    const isExpanded = expandedId === row.id;

                    return (
                      <Fragment key={row.id}>
                        <tr
                          className={`group cursor-pointer transition-colors hover:bg-blue-50 ${
                            isExpanded ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => {
                            setExpandedId((prev) => (prev === row.id ? '' : row.id));
                            setActiveDetailTab('info');
                          }}
                        >
                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              className="rounded border-slate-300 text-primary"
                              onClick={(event) => event.stopPropagation()}
                            />
                          </td>
                          <td className="px-2 py-3">
                            <MaterialIcon
                              name="star_outline"
                              className="text-sm text-slate-300 group-hover:text-amber-400"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded bg-slate-100">
                                <MaterialIcon name="image" className="text-xl text-slate-400" />
                              </div>
                              <span className="font-medium text-primary">{row.id}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-700">{row.name}</td>
                          <td className="px-4 py-3">{row.unit}</td>
                          <td className="px-4 py-3">{row.brand}</td>
                          <td className="px-4 py-3 text-right font-medium">
                            {formatMoney(row.salePrice)}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-500">
                            {formatMoney(row.costPrice)}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-slate-900">
                            {row.stock}
                          </td>
                          <td className="px-4 py-3">{row.location}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2 py-1 text-[10px] font-bold ${toneClass[row.statusTone]}`}
                            >
                              {row.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500">{row.createdAt}</td>
                        </tr>

                        <tr className={isExpanded ? '' : 'hidden'}>
                          <td colSpan={12} className="border-b border-blue-200 p-0">
                            <div
                              className={`grid overflow-hidden transition-all duration-300 ${
                                isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                              }`}
                            >
                              <div className="overflow-hidden border-l-4 border-blue-500 bg-[#f8fbff] p-6">
                                <div className="mb-4 flex border-b border-slate-200">
                                  <button
                                    type="button"
                                    className={`border-b-2 px-4 py-2 text-sm font-medium ${
                                      activeDetailTab === 'info'
                                        ? 'border-blue-600 font-bold text-blue-600'
                                        : 'border-transparent text-slate-600'
                                    }`}
                                    onClick={() => setActiveDetailTab('info')}
                                  >
                                    Thông tin
                                  </button>
                                  <button
                                    type="button"
                                    className={`border-b-2 px-4 py-2 text-sm font-medium ${
                                      activeDetailTab === 'note'
                                        ? 'border-blue-600 font-bold text-blue-600'
                                        : 'border-transparent text-slate-600'
                                    }`}
                                    onClick={() => setActiveDetailTab('note')}
                                  >
                                    Mô tả, ghi chú
                                  </button>
                                  <button
                                    type="button"
                                    className={`border-b-2 px-4 py-2 text-sm font-medium ${
                                      activeDetailTab === 'card'
                                        ? 'border-blue-600 font-bold text-blue-600'
                                        : 'border-transparent text-slate-600'
                                    }`}
                                    onClick={() => setActiveDetailTab('card')}
                                  >
                                    Thẻ kho
                                  </button>
                                  <button
                                    type="button"
                                    className={`border-b-2 px-4 py-2 text-sm font-medium ${
                                      activeDetailTab === 'stock'
                                        ? 'border-blue-600 font-bold text-blue-600'
                                        : 'border-transparent text-slate-600'
                                    }`}
                                    onClick={() => setActiveDetailTab('stock')}
                                  >
                                    Tồn kho
                                  </button>
                                </div>

                                <div className="mb-8 mt-3 flex gap-8">
                                  <div className="h-32 w-32 overflow-hidden rounded-lg border border-slate-200 bg-white">
                                    <img
                                      src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=300&auto=format&fit=crop"
                                      alt={row.name}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="mb-1 text-xl font-bold text-slate-900">
                                      {row.name}
                                    </h3>
                                    <p className="mb-3 text-xs text-slate-500">
                                      Nhóm hàng:{' '}
                                      <span className="font-bold uppercase text-slate-700">
                                        {row.group}
                                      </span>
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
                                        Hàng hóa thường
                                      </span>
                                      <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
                                        Bán trực tiếp
                                      </span>
                                      <span className="rounded border border-orange-100 bg-orange-50 px-2 py-1 text-[10px] font-bold text-orange-600">
                                        Không tích điểm
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="mb-8 grid grid-cols-1 gap-x-12 gap-y-6 xl:grid-cols-4">
                                  <div className="space-y-2">
                                    <div className="space-y-1">
                                      <p className="text-[11px] font-bold uppercase tracking-tighter text-slate-400">
                                        Mã hàng
                                      </p>
                                      <p className="text-sm font-bold text-slate-800">{row.id}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-[11px] font-bold uppercase tracking-tighter text-slate-400">
                                        Giá vốn
                                      </p>
                                      <p className="text-sm font-bold text-slate-800">
                                        {formatMoney(row.costPrice)}
                                      </p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-[11px] font-bold uppercase tracking-tighter text-slate-400">
                                        Trọng lượng
                                      </p>
                                      <p className="text-sm text-slate-800">
                                        {row.weight || 'Chưa có'}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <div className="space-y-1">
                                      <p className="text-[11px] font-bold uppercase tracking-tighter text-slate-400">
                                        Mã vạch
                                      </p>
                                      <p className="text-sm text-slate-400">{row.barcode}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-[11px] font-bold uppercase tracking-tighter text-slate-400">
                                        Giá bán
                                      </p>
                                      <p className="text-sm font-bold text-slate-800">
                                        {formatMoney(row.salePrice)}
                                      </p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-[11px] font-bold uppercase tracking-tighter text-slate-400">
                                        Kích thước
                                      </p>
                                      <p className="text-sm text-slate-400">
                                        {row.dimension || 'Chưa có'}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <div className="space-y-1">
                                      <p className="text-[11px] font-bold uppercase tracking-tighter text-slate-400">
                                        Tồn kho
                                      </p>
                                      <p className="text-sm font-bold text-slate-800">
                                        {row.stock}
                                      </p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-[11px] font-bold uppercase tracking-tighter text-slate-400">
                                        Thương hiệu
                                      </p>
                                      <p className="text-sm text-slate-800">
                                        {row.brand || 'Chưa có'}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <div className="space-y-1">
                                      <p className="text-[11px] font-bold uppercase tracking-tighter text-slate-400">
                                        Định mức tồn
                                      </p>
                                      <p className="text-sm text-slate-800">{row.stockLevel}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-[11px] font-bold uppercase tracking-tighter text-slate-400">
                                        Vị trí
                                      </p>
                                      <p className="text-sm text-slate-800">
                                        {row.location || 'Chưa có'}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-between border-t border-slate-200 pt-6">
                                  <div className="flex gap-4">
                                    <button
                                      type="button"
                                      className="flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-red-600"
                                    >
                                      <MaterialIcon name="delete" className="text-[18px]" />
                                      Xóa
                                    </button>
                                    <button
                                      type="button"
                                      className="flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-blue-600"
                                    >
                                      <MaterialIcon name="content_copy" className="text-[18px]" />
                                      Sao chép
                                    </button>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setProductToEdit(row);
                                        setEditModalOpen(true);
                                      }}
                                      className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-6 py-2 text-sm font-bold text-white hover:bg-blue-700"
                                    >
                                      <MaterialIcon name="edit" className="text-[18px]" />
                                      Chỉnh sửa
                                    </button>
                                    <button
                                      type="button"
                                      className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                                    >
                                      <MaterialIcon
                                        name="barcode_scanner"
                                        className="text-[18px]"
                                      />
                                      In tem mã
                                    </button>
                                    <button
                                      type="button"
                                      className="rounded-lg border border-slate-300 p-2 text-slate-500 hover:bg-slate-50"
                                    >
                                      <MaterialIcon name="more_horiz" className="text-[20px]" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-auto flex items-center justify-between border-t border-slate-200 bg-white px-6 py-3">
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <span>Hiển thị</span>
                  <select className="rounded border border-slate-300 px-2 py-1 text-xs focus:border-primary focus:ring-primary">
                    <option>15 dòng</option>
                    <option>30 dòng</option>
                    <option>50 dòng</option>
                  </select>
                </div>
                <span>{`1 - ${displayedRows.length} trong ${displayedRows.length} hàng hóa`}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {productToEdit && (
        <EditProductModal
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setProductToEdit(null);
          }}
          product={productToEdit}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  );
};

export default ProductManagement;
