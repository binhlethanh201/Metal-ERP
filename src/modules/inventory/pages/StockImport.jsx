import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  FileSpreadsheet,
  Package,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { createInwardInventory, getProducts } from '../services/inventoryService';
import { getSuppliers } from '../services/supplierService';

const fallbackProducts = [
  {
    id: 'prod-001',
    productCode: 'SP-001',
    productName: 'Thép tấm 10mm',
    unitName: 'Tấm',
    costPrice: 50000,
  },
  {
    id: 'prod-002',
    productCode: 'SP-002',
    productName: 'Inox 304 tấm 1.5mm',
    unitName: 'Tấm',
    costPrice: 76000,
  },
  {
    id: 'prod-003',
    productCode: 'SP-003',
    productName: 'Que hàn 3.2mm',
    unitName: 'Kg',
    costPrice: 18000,
  },
  {
    id: 'prod-004',
    productCode: 'SP-004',
    productName: 'Bu lông M16x60',
    unitName: 'Hộp',
    costPrice: 32000,
  },
];

const fallbackSuppliers = [
  { id: 'sup-001', name: 'Công ty Hòa Phát', phone: '0901234567' },
  { id: 'sup-002', name: 'Công ty Nam Kim', phone: '0912345678' },
  { id: 'sup-003', name: 'Công ty Đông Á', phone: '0987654321' },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(Number(value || 0));

const extractList = (response) => {
  const payload = response?.data ?? response;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  return [];
};

const normalizeProduct = (item) => ({
  id: item?.id || item?.Id || item?.productId || item?.ProductId,
  productCode: item?.productCode || item?.ProductCode || item?.code || item?.Code || 'SP-000',
  productName: item?.productName || item?.ProductName || item?.name || item?.Name || 'Sản phẩm',
  unitName: item?.unitName || item?.UnitName || item?.unit || item?.Unit || 'Đơn vị',
  costPrice: Number(item?.costPrice ?? item?.CostPrice ?? item?.price ?? item?.Price ?? 0),
  image:
    item?.image ||
    item?.ImageUrl ||
    item?.imageUrl ||
    item?.productImageUrl ||
    item?.thumbnailUrl ||
    null,
});

const normalizeSupplier = (item) => ({
  id: item?.id || item?.Id || item?.supplierId || item?.SupplierId,
  name: item?.name || item?.Name || item?.supplierName || item?.SupplierName || 'Nhà cung cấp',
  phone: item?.phone || item?.Phone || item?.contactPhone || item?.ContactPhone || '',
});

export const StockImport = () => {
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const [searchText, setSearchText] = useState('');
  const [products, setProducts] = useState(fallbackProducts);
  const [suppliers, setSuppliers] = useState(fallbackSuppliers);
  const [supplierQuery, setSupplierQuery] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(fallbackSuppliers[0]);
  const [items, setItems] = useState([
    {
      id: fallbackProducts[0].id,
      productCode: fallbackProducts[0].productCode,
      productName: fallbackProducts[0].productName,
      unitName: fallbackProducts[0].unitName,
      quantity: 10,
      costPrice: fallbackProducts[0].costPrice,
    },
  ]);
  const [inwardType, setInwardType] = useState(1);
  const [note, setNote] = useState('Nhập hàng định kỳ');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: 'info', message: 'Sẵn sàng tạo phiếu nhập kho' });
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedDropdownIndex, setSelectedDropdownIndex] = useState(-1);

  const filteredProducts = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return products.slice(0, 6);

    return products.filter((product) => {
      const haystack = `${product.productCode} ${product.productName}`.toLowerCase();
      return haystack.includes(keyword);
    });
  }, [products, searchText]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [productResponse, supplierResponse] = await Promise.all([
          getProducts({ pageNumber: 1, pageSize: 50 }),
          getSuppliers({ pageNumber: 1, pageSize: 50 }),
        ]);

        const productList = extractList(productResponse).map(normalizeProduct).filter(Boolean);
        const supplierList = extractList(supplierResponse).map(normalizeSupplier).filter(Boolean);

        if (productList.length > 0) setProducts(productList);
        if (supplierList.length > 0) {
          setSuppliers(supplierList);
          setSelectedSupplier(supplierList[0]);
          setSupplierQuery(supplierList[0].name);
        }
        setStatus({ type: 'success', message: 'Đã tải dữ liệu sản phẩm và nhà cung cấp' });
      } catch {
        setStatus({ type: 'info', message: 'Đang dùng dữ liệu mẫu để hiển thị giao diện' });
      } finally {
        setIsLoadingData(false);
      }
    };

    loadOptions();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
          setIsDropdownOpen(false);
          setSelectedDropdownIndex(-1);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // VÁ LỖI ESLINT: Bọc hàm addProductToTicket vào useCallback
  const addProductToTicket = useCallback(
    (product) => {
      const existingItem = items.find((item) => item.id === product.id);

      if (existingItem) {
        setItems((current) =>
          current.map((item) => {
            if (item.id !== product.id) return item;
            return {
              ...item,
              quantity: item.quantity + 1,
            };
          })
        );
        setStatus({ type: 'success', message: `Đã tăng số lượng ${product.productName}` });
      } else {
        setItems((current) => [
          ...current,
          {
            id: product.id,
            productCode: product.productCode,
            productName: product.productName,
            unitName: product.unitName,
            quantity: 1,
            costPrice: product.costPrice,
          },
        ]);
        setStatus({ type: 'success', message: `Đã thêm ${product.productName}` });
      }

      setIsDropdownOpen(false);
      setSearchText('');
      setSelectedDropdownIndex(-1);
    },
    [items]
  ); // Khai báo dependency items tại đây

  // VÁ LỖI ESLINT: Khai báo addProductToTicket vào mảng dependency của useEffect này
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'F3') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }

      if (isDropdownOpen && filteredProducts.length > 0) {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setSelectedDropdownIndex((prev) => {
            const next = prev + 1;
            return next >= filteredProducts.length ? 0 : next;
          });
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          setSelectedDropdownIndex((prev) => {
            const next = prev - 1;
            return next < 0 ? filteredProducts.length - 1 : next;
          });
        } else if (event.key === 'Enter') {
          event.preventDefault();
          if (selectedDropdownIndex >= 0 && selectedDropdownIndex < filteredProducts.length) {
            addProductToTicket(filteredProducts[selectedDropdownIndex]);
          }
        } else if (event.key === 'Escape') {
          setIsDropdownOpen(false);
          setSelectedDropdownIndex(-1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDropdownOpen, selectedDropdownIndex, filteredProducts, addProductToTicket]);

  const supplierSuggestions = useMemo(() => {
    const keyword = supplierQuery.trim().toLowerCase();
    if (!keyword) return suppliers.slice(0, 5);
    return suppliers.filter((supplier) =>
      `${supplier.name} ${supplier.phone}`.toLowerCase().includes(keyword)
    );
  }, [suppliers, supplierQuery]);

  const totals = useMemo(() => {
    const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const totalAmount = items.reduce(
      (sum, item) => sum + Number(item.quantity || 0) * Number(item.costPrice || 0),
      0
    );
    return { totalQuantity, totalAmount };
  }, [items]);

  const addSampleProduct = () => {
    const sample = products[1] || fallbackProducts[1];
    addProductToTicket(sample);
  };

  const updateItem = (id, field, value) => {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          [field]: field === 'quantity' || field === 'costPrice' ? Number(value || 0) : value,
        };
      })
    );
  };

  const removeItem = (id) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const handleFinish = async (event) => {
    event.preventDefault();

    if (!items.length) {
      setStatus({
        type: 'error',
        message: 'Vui lòng thêm ít nhất một sản phẩm trước khi hoàn tất',
      });
      return;
    }

    const parseGuid = (val) => {
      if (!val) return null;
      const str = String(val);
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)) {
        return str;
      }
      return null;
    };

    const hasFallbackData = items.some((item) => !parseGuid(item.id));
    if (hasFallbackData) {
      setStatus({
        type: 'error',
        message: 'Dữ liệu sản phẩm chưa tải đầy đủ từ server. Vui lòng đợi và thử lại.',
      });
      return;
    }

    const payload = {
      InwardType: inwardType,
      SupplierId: parseGuid(selectedSupplier?.id),
      Reason: note,
      Note: note,
      Items: items.map((item) => ({
        Id: parseGuid(item.id),
        Quantity: Number(item.quantity || 0),
        CostPrice: Number(item.costPrice || 0),
      })),
    };

    setIsSubmitting(true);
    setStatus({ type: 'info', message: 'Đang gửi phiếu nhập kho...' });

    try {
      const response = await createInwardInventory(payload);
      const successMessage =
        response?.message || response?.data?.message || 'Tạo phiếu nhập kho thành công';
      setStatus({ type: 'success', message: successMessage });
    } catch (error) {
      const fallbackMessage = error?.message || 'Không thể tạo phiếu nhập kho lúc này';
      setStatus({ type: 'error', message: fallbackMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8 w-full space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Nhập hàng / Nhập kho</h1>
          <p className="mt-1 text-sm text-slate-600">
            Tạo phiếu nhập nhanh, rõ ràng và tối giản theo luồng kho thực tế.
          </p>
        </div>
        <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
          {isLoadingData ? 'Đang tải dữ liệu...' : 'Sẵn sàng tạo phiếu'}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[7fr_3fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Danh sách sản phẩm nhập</h2>
              <p className="mt-1 text-sm text-slate-500">
                Tìm nhanh bằng F3, chỉnh số lượng và đơn giá trực tiếp.
              </p>
            </div>
            <button
              type="button"
              onClick={addSampleProduct}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              <Plus size={16} />
              Thêm sản phẩm test
            </button>
          </div>

          <div className="mt-5 flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                value={searchText}
                onChange={(event) => {
                  setSearchText(event.target.value);
                  setIsDropdownOpen(true);
                  setSelectedDropdownIndex(-1);
                }}
                onFocus={() => {
                  setIsDropdownOpen(true);
                  setSelectedDropdownIndex(-1);
                }}
                placeholder="Tìm theo mã hoặc tên sản phẩm (F3)"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none ring-0"
              />

              {isDropdownOpen && filteredProducts.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-lg"
                >
                  {filteredProducts.map((product, index) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => addProductToTicket(product)}
                      onMouseEnter={() => setSelectedDropdownIndex(index)}
                      className={`flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 ${
                        selectedDropdownIndex === index ? 'bg-sky-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="mt-0.5 flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.productName}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextSibling &&
                                (e.currentTarget.nextSibling.style.display = 'flex');
                            }}
                          />
                        ) : null}
                        {!product.image && <Package size={20} className="text-slate-400" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-slate-900">
                          {product.productName} ({product.unitName})
                        </div>
                        <div className="mt-0.5 flex items-center gap-4 text-xs text-slate-600">
                          <span className="font-medium text-slate-700">
                            Mã: {product.productCode}
                          </span>
                          <span>Đơn giá: {formatCurrency(product.costPrice)}</span>
                        </div>
                        <div className="mt-1 text-xs font-medium text-emerald-700">
                          Tồn: [Data từ API]
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {isDropdownOpen && searchText && filteredProducts.length === 0 && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-center text-sm text-slate-500 shadow-lg">
                  Không tìm thấy sản phẩm phù hợp
                </div>
              )}
            </div>
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              <FileSpreadsheet size={16} />
              Import nhanh Excel
            </button>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600">
                  <th className="px-3 py-3 font-semibold">STT</th>
                  <th className="px-3 py-3 font-semibold">Mã hàng</th>
                  <th className="px-3 py-3 font-semibold">Tên hàng</th>
                  <th className="px-3 py-3 font-semibold">ĐVT</th>
                  <th className="px-3 py-3 font-semibold">Số lượng</th>
                  <th className="px-3 py-3 font-semibold">Đơn giá</th>
                  <th className="px-3 py-3 font-semibold">Thành tiền</th>
                  <th className="px-3 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-3 py-3 text-slate-600">{index + 1}</td>
                    <td className="px-3 py-3 font-medium text-slate-800">{item.productCode}</td>
                    <td className="px-3 py-3 text-slate-800">{item.productName}</td>
                    <td className="px-3 py-3 text-slate-600">{item.unitName}</td>
                    <td className="px-3 py-3">
                      <input
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(event) => updateItem(item.id, 'quantity', event.target.value)}
                        className="w-24 rounded-xl border border-slate-200 px-2.5 py-2 text-sm outline-none"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="number"
                        min="0"
                        value={item.costPrice}
                        onChange={(event) => updateItem(item.id, 'costPrice', event.target.value)}
                        className="w-28 rounded-xl border border-slate-200 px-2.5 py-2 text-sm outline-none"
                      />
                    </td>
                    <td className="px-3 py-3 font-semibold text-slate-900">
                      {formatCurrency(Number(item.quantity || 0) * Number(item.costPrice || 0))}
                    </td>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="rounded-xl p-2 text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Package size={18} className="text-[#0f4c81]" />
              <h2 className="text-lg font-semibold text-slate-900">Thông tin phiếu & hoàn tất</h2>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Người tạo
                </div>
                <div className="mt-1 font-semibold text-slate-900">Mr. Hùng</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <CalendarClock size={14} />
                  Thời gian
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-900">
                  {new Date().toLocaleString('vi-VN')}
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-1.5 block">Loại phiếu nhập</span>
                <select
                  value={inwardType}
                  onChange={(event) => setInwardType(Number(event.target.value))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
                >
                  <option value={1}>Nhập hàng từ NCC</option>
                  <option value={2}>Khách trả hàng</option>
                  <option value={3}>Cân bằng kho</option>
                </select>
              </label>

              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-1.5 block">Nhà cung cấp / Đối tượng</span>
                <input
                  value={supplierQuery}
                  onChange={(event) => {
                    setSupplierQuery(event.target.value);
                    setSelectedSupplier(null);
                  }}
                  placeholder="Tìm nhà cung cấp"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
                />
                {supplierSuggestions.length > 0 && (
                  <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">
                    {supplierSuggestions.map((supplier) => (
                      <button
                        key={supplier.id}
                        type="button"
                        onClick={() => {
                          setSelectedSupplier(supplier);
                          setSupplierQuery(supplier.name);
                        }}
                        className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-sm hover:bg-white"
                      >
                        <span>{supplier.name}</span>
                        <span className="text-xs text-slate-500">{supplier.phone}</span>
                      </button>
                    ))}
                  </div>
                )}
              </label>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Mã phiếu nhập
                </div>
                <div className="mt-1 font-semibold text-slate-900">
                  Tự động sinh theo loại phiếu
                </div>
              </div>

              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-1.5 block">Ghi chú / Lý do nhập kho</span>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows="4"
                  placeholder="Nhập nội dung ngắn gọn..."
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
                />
              </label>

              <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Tổng số lượng dòng</span>
                  <span className="font-semibold text-slate-900">{items.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Tổng tiền hàng</span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(totals.totalAmount)}
                  </span>
                </div>
              </div>

              <div
                className={`rounded-2xl border px-3 py-2.5 text-sm ${status.type === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700' : status.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-sky-200 bg-sky-50 text-sky-700'}`}
              >
                <div className="flex items-start gap-2">
                  {status.type === 'error' ? (
                    <AlertCircle size={16} className="mt-0.5" />
                  ) : status.type === 'success' ? (
                    <CheckCircle2 size={16} className="mt-0.5" />
                  ) : (
                    <Package size={16} className="mt-0.5" />
                  )}
                  <span>{status.message}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleFinish}
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Đang tạo phiếu...' : 'HOÀN TẤT'}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default StockImport;
