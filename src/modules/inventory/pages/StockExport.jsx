/**
 * Trang Xuất kho - Hỗ trợ xuất nhiều sản phẩm trong 1 phiếu.
 * Đầy đủ thông tin chứng từ: số phiếu, ngày xuất, giờ xuất, đối tượng xuất, lý do.
 */
import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Modal } from '../../../shared/components/Modal';
import Icon from '../../../shared/components/Icon';
import {
  createOutwardInventory,
  confirmOutwardInventory,
  getOutwardInventories,
  getProducts,
} from '../services/inventoryService';
import { InventoryHistoryCard } from '../components/stock/InventoryHistoryCard';

const extractList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.result?.items)) return response.result.items;
  return [];
};

const normalizeExportRow = (item, index) => {
  const itemsList = Array.isArray(item?.items) ? item.items : [];
  const totalQuantity = itemsList.reduce((acc, curr) => acc + Number(curr?.quantity || 0), 0);
  const productNames = itemsList.map((i) => i.productName).filter(Boolean);
  const label =
    productNames.length > 1
      ? `${productNames[0]} (+${productNames.length - 1} SP khác)`
      : productNames[0] || 'Sản phẩm xuất kho';

  return {
    id: item?.stockTicketId || item?.id || `EXP-${index + 1}`,
    stockTicketId: item?.stockTicketId || item?.id,
    ticketCode: item?.ticketCode || `EX-${index + 1}`,
    productName: label,
    quantity: totalQuantity || item?.quantity || 0,
    date: item?.createdAt || item?.Date || '',
    reason: item?.reason || item?.Reason || '',
    status: item?.status || 'COMPLETED',
    cancelReason: item?.cancelReason || '',
  };
};

const getItemKey = (item) => item.branchProductId || item.productId || item.id || item.Id;

const REASON_OPTIONS = [
  { value: 'Xuất bán hàng', label: 'Xuất bán hàng' },
  { value: 'Trả hàng nhà cung cấp', label: 'Trả hàng nhà cung cấp' },
  { value: 'Xuất hủy / Hao hụt', label: 'Xuất hủy / Hao hụt' },
  { value: 'Xuất nội bộ / Điều chuyển', label: 'Xuất nội bộ / Điều chuyển' },
  { value: 'Xuất nguyên vật liệu sản xuất', label: 'Xuất nguyên vật liệu sản xuất' },
  { value: '__other__', label: 'Khác...' },
];

const TARGET_OPTIONS = [
  { value: 'Khách hàng', label: 'Khách hàng' },
  { value: 'Nhà cung cấp', label: 'Nhà cung cấp' },
  { value: 'Nội bộ', label: 'Nội bộ' },
  { value: '__other__', label: 'Khác...' },
];

const nowDateTime = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
};

export const StockExport = () => {
  const today = nowDateTime();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exports, setExports] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Thông tin chứng từ
  const [ticketCode, setTicketCode] = useState('');
  const [exportDate, setExportDate] = useState(today.date);
  const [exportTime, setExportTime] = useState(today.time);
  const [targetType, setTargetType] = useState('Khách hàng');
  const [targetName, setTargetName] = useState('');
  const [reasonType, setReasonType] = useState('Xuất bán hàng');
  const [reasonOther, setReasonOther] = useState('');
  const [note, setNote] = useState('');

  // Danh sách sản phẩm
  const [items, setItems] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Sản phẩm đã lọc theo search, loại trừ sp đã thêm
  const filteredProducts = useMemo(() => {
    const kw = productSearch.toLowerCase().trim();
    return products.filter((p) => {
      if (items.some((i) => getItemKey(i) === getItemKey(p))) return false;
      if (!kw) return true;
      const name = (p.productName || p.ProductName || '').toLowerCase();
      const code = (p.productCode || p.ProductCode || '').toLowerCase();
      return name.includes(kw) || code.includes(kw);
    });
  }, [products, items, productSearch]);

  const loadData = async (filterParams = {}) => {
    setIsLoading(true);
    try {
      const queryParams = { pageNumber: 1, pageSize: 50, ...filterParams };

      // Load sản phẩm - độc lập với lịch sử phiếu
      try {
        const productsResponse = await getProducts({ pageNumber: 1, pageSize: 100 });
        const productItems = extractList(productsResponse);
        setProducts(productItems);
      } catch {
        setProducts([]);
      }

      // Load lịch sử phiếu xuất
      try {
        const exportsResponse = await getOutwardInventories(queryParams);
        const exportItems = extractList(exportsResponse).map(normalizeExportRow).filter(Boolean);
        setExports(exportItems);
        setStatusMessage('Đã đồng bộ dữ liệu xuất kho từ API');
      } catch {
        setExports([]);
        setStatusMessage('Đang dùng dữ liệu cục bộ');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Bộ đếm tự sinh mã phiếu
  const ticketSeqRef = useRef(1);

  const generateTicketCode = () => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const datePart = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
    const seq = String(ticketSeqRef.current).padStart(3, '0');
    ticketSeqRef.current += 1;
    return `PX-${datePart}-${seq}`;
  };

  const openModal = () => {
    const t = nowDateTime();
    setTicketCode(generateTicketCode());
    setExportDate(t.date);
    setExportTime(t.time);
    setTargetType('Khách hàng');
    setTargetName('');
    setReasonType('Xuất bán hàng');
    setReasonOther('');
    setNote('');
    setItems([]);
    setSelectedProductId('');
    setSelectedQuantity('');
    setProductSearch('');
    setStatusMessage('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (!isSubmitting) setIsModalOpen(false);
  };

  const resolvedReason = reasonType === '__other__' ? reasonOther : reasonType;

  // Lấy tồn kho khả dụng của sản phẩm
  const getProductStock = (product) => {
    const stock =
      product.actualStock ?? product.availableStock ?? product.stock ?? product.quantity ?? 0;
    return Number(stock);
  };

  // Thêm sản phẩm
  const addItem = useCallback(() => {
    const id = selectedProductId;
    const qty = Number(selectedQuantity);
    if (!id) return setStatusMessage('Lỗi: Vui lòng chọn sản phẩm');
    if (!qty || qty <= 0) return setStatusMessage('Lỗi: Số lượng phải lớn hơn 0');

    const product = products.find((p) => getItemKey(p) === id);
    if (!product) return setStatusMessage('Lỗi: Không tìm thấy sản phẩm');

    const stock = getProductStock(product);

    setItems((prev) => {
      const key = getItemKey(product);
      const existing = prev.find((i) => getItemKey(i) === key);
      const currentQty = existing ? existing.quantity : 0;
      const newQty = currentQty + qty;

      if (newQty > stock) {
        setStatusMessage(
          `Lỗi: Vượt tồn kho! "${product.productName || product.ProductName}" chỉ còn ${stock} ${product.unit || ''}`
        );
        return prev;
      }

      if (existing) {
        return prev.map((i) => (getItemKey(i) === key ? { ...i, quantity: newQty } : i));
      }
      return [
        ...prev,
        {
          branchProductId: product.branchProductId || null,
          productId: getItemKey(product),
          productCode: product.productCode || product.ProductCode || '',
          productName: product.productName || product.ProductName || '',
          unit: product.unit || product.unitName || '',
          quantity: qty,
          maxStock: stock,
        },
      ];
    });

    setSelectedProductId('');
    setSelectedQuantity('');
    setStatusMessage('');
  }, [selectedProductId, selectedQuantity, products]);

  const removeItem = (key) => setItems((prev) => prev.filter((i) => getItemKey(i) !== key));

  const updateItemQty = (key, qty) => {
    const numQty = Number(String(qty).replace(/[^0-9]/g, ''));
    if (!numQty || numQty <= 0) {
      setItems((prev) => prev.map((i) => (getItemKey(i) === key ? { ...i, quantity: 0 } : i)));
      setStatusMessage('');
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (getItemKey(i) !== key) return i;
        const max = i.maxStock ?? 999999;
        const clamped = Math.min(numQty, max);
        if (numQty > max) {
          setStatusMessage(`Đã chạm tồn kho tối đa: ${max} ${i.unit || ''}`);
        } else {
          setStatusMessage('');
        }
        return { ...i, quantity: clamped };
      })
    );
  };

  const totals = useMemo(
    () => ({
      totalLines: items.length,
      totalQuantity: items.reduce((sum, i) => sum + Number(i.quantity || 0), 0),
    }),
    [items]
  );

  const summary = useMemo(() => {
    const qty = exports.reduce((total, item) => total + Number(item.quantity || 0), 0);
    return { totalExports: exports.length, totalQuantity: qty, monthlyCount: exports.length };
  }, [exports]);

  // Validate form, return first error message or null if valid
  const validateForm = () => {
    // 1. Ngày xuất
    if (!exportDate.trim()) return 'Vui lòng chọn ngày xuất kho';

    // 2. Đối tượng xuất
    if (!targetName.trim()) {
      const label =
        targetType === 'Khách hàng'
          ? 'tên khách hàng'
          : targetType === 'Nhà cung cấp'
            ? 'tên nhà cung cấp'
            : targetType === 'Nội bộ'
              ? 'tên đơn vị / bộ phận'
              : 'tên đối tượng xuất';
      return `Vui lòng nhập ${label}`;
    }

    // 3. Lý do xuất
    if (reasonType === '__other__' && !reasonOther.trim()) {
      return 'Vui lòng nhập lý do xuất kho';
    }

    // 4. Danh sách sản phẩm
    if (!items.length) return 'Vui lòng thêm ít nhất 1 sản phẩm';

    // 5. Kiểm tra số lượng từng dòng
    const invalidItem = items.find((i) => !i.quantity || Number(i.quantity) <= 0);
    if (invalidItem) {
      return `Sản phẩm "${invalidItem.productName}" có số lượng không hợp lệ (phải > 0)`;
    }

    return null;
  };

  const handleSubmit = async (event, isDraft = false) => {
    if (event && event.preventDefault) {
      event.preventDefault();
    }

    const validationError = validateForm();
    if (validationError) {
      setStatusMessage(`Lỗi: ${validationError}`);
      return;
    }

    const reasonText = resolvedReason.trim();

    setIsSubmitting(true);
    setStatusMessage('');

    try {
      const payload = {
        outwardType: 1,
        reason: reasonText,
        note: note || reasonText,
        ...(ticketCode.trim() && { ticketCode: ticketCode.trim() }),
        items: items.map((i) => ({
          branchProductId: getItemKey(i),
          quantity: Number(i.quantity || 0),
        })),
      };
      setStatusMessage('Đang tạo phiếu xuất kho...');
      const createRes = await createOutwardInventory(payload);
      const ticketId = createRes?.data?.ticketId || createRes?.data?.stockTicketId;

      if (ticketId) {
        if (isDraft) {
          setStatusMessage(
            `Đã tạo phiếu chờ duyệt thành công! Phiếu: ${createRes?.data?.ticketCode || ticketId}`
          );
        } else {
          setStatusMessage('Đang xác nhận để trừ tồn kho...');
          await confirmOutwardInventory(ticketId);
          setStatusMessage(
            `Xuất kho thành công! Phiếu: ${createRes?.data?.ticketCode || ticketId}`
          );
        }
      } else {
        setStatusMessage('Tạo phiếu thành công.');
      }

      await loadData();
      setIsModalOpen(false);
    } catch (error) {
      const errors = error?.data?.errors;
      let msg;
      if (errors) {
        if (typeof errors === 'object' && !Array.isArray(errors)) {
          msg = Object.entries(errors)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join(' | ');
        } else {
          msg = String(errors);
        }
      } else {
        msg = error?.message || 'Không thể tạo hoặc xác nhận phiếu xuất kho';
      }
      setStatusMessage(`Lỗi: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusClass = (statusMessage || '').includes('Lỗi:')
    ? 'border-rose-200 bg-rose-50 text-rose-700'
    : 'border-emerald-200 bg-emerald-50 text-emerald-700';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Xuất kho</h1>
          <p className="mt-1 text-gray-600">Ghi nhận và quản lý các phiếu xuất từ kho</p>
        </div>
        <Button variant="primary" onClick={openModal}>
          + Xuất hàng
        </Button>
      </div>

      <div
        className={`w-fit rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm ${statusClass}`}
      >
        {isLoading
          ? 'Đang tải dữ liệu xuất kho...'
          : statusMessage || 'Sẵn sàng tạo phiếu xuất mới'}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <div className="py-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{summary.totalExports}</div>
            <p className="mt-1 text-sm text-gray-600">Tổng phiếu xuất</p>
          </div>
        </Card>
        <Card>
          <div className="py-4 text-center">
            <div className="text-3xl font-bold text-green-600">{summary.totalQuantity}</div>
            <p className="mt-1 text-sm text-gray-600">Tổng số lượng xuất</p>
          </div>
        </Card>
        <Card>
          <div className="py-4 text-center">
            <div className="text-3xl font-bold text-yellow-600">{summary.monthlyCount}</div>
            <p className="mt-1 text-sm text-gray-600">Trong tháng</p>
          </div>
        </Card>
      </div>

      <InventoryHistoryCard
        title="Lịch sử phiếu xuất kho"
        type="OUTWARD"
        tickets={exports}
        isLoading={isLoading}
        onReload={loadData}
        onNotify={(notifyObj) => setStatusMessage(notifyObj.message)}
      />

      {/* ==================== MODAL TẠO PHIẾU XUẤT ==================== */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Tạo phiếu xuất kho" size="5xl">
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* --- THÔNG TIN CHỨNG TỪ --- */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-600">
              Thông tin chứng từ
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Số phiếu xuất */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">
                  Số phiếu xuất <span className="font-normal text-slate-400"></span>
                </label>
                <input
                  type="text"
                  placeholder="PX-20260704-001"
                  className="w-full rounded-lg border border-slate-300 bg-blue-50/40 px-3 py-2 font-mono text-sm font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200"
                  value={ticketCode}
                  onChange={(e) => setTicketCode(e.target.value)}
                />
              </div>

              {/* Ngày xuất */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">
                  Ngày xuất <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200"
                  value={exportDate}
                  onChange={(e) => setExportDate(e.target.value)}
                />
              </div>

              {/* Giờ xuất */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Giờ xuất</label>
                <input
                  type="time"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200"
                  value={exportTime}
                  onChange={(e) => setExportTime(e.target.value)}
                />
              </div>

              {/* Đối tượng xuất kho */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">
                  Đối tượng xuất <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200"
                  value={targetType}
                  onChange={(e) => {
                    setTargetType(e.target.value);
                    setTargetName('');
                  }}
                >
                  {TARGET_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tên đối tượng */}
            {targetType !== '__other__' && (
              <div className="mt-3">
                <label className="text-xs font-semibold text-slate-600">
                  {targetType === 'Khách hàng'
                    ? 'Tên khách hàng'
                    : targetType === 'Nhà cung cấp'
                      ? 'Tên nhà cung cấp'
                      : 'Tên đơn vị / bộ phận'}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder={
                    targetType === 'Khách hàng'
                      ? 'VD: Công ty TNHH ABC'
                      : targetType === 'Nhà cung cấp'
                        ? 'VD: Công ty Hòa Phát'
                        : 'VD: Xưởng sản xuất số 1'
                  }
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200"
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                />
              </div>
            )}

            {/* Nếu chọn "Khác..." -> hiện input tự điền */}
            {targetType === '__other__' && (
              <div className="mt-3">
                <label className="text-xs font-semibold text-slate-600">
                  Nhập đối tượng xuất <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: Đối tác vận chuyển, Bảo hành..."
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200"
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* --- LÝ DO XUẤT --- */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">
                Lý do xuất kho <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200"
                value={reasonType}
                onChange={(e) => {
                  setReasonType(e.target.value);
                  if (e.target.value !== '__other__') setReasonOther('');
                }}
              >
                {REASON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {reasonType === '__other__' && (
                <input
                  type="text"
                  placeholder="Nhập lý do khác..."
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200"
                  value={reasonOther}
                  onChange={(e) => setReasonOther(e.target.value)}
                />
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Ghi chú thêm</label>
              <input
                type="text"
                placeholder="Ghi chú chi tiết (không bắt buộc)"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          {/* --- DANH SÁCH SẢN PHẨM --- */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-700">
                Danh sách sản phẩm xuất <span className="text-red-500">*</span>
              </label>
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                {items.length} mặt hàng &middot; SL: {totals.totalQuantity}
              </span>
            </div>

            {/* Dòng thêm mới + combobox tìm kiếm */}
            <div className="rounded-xl border-2 border-dashed border-blue-200 bg-gradient-to-r from-blue-50/60 to-white p-4">
              {/* 3 cột thẳng hàng: combobox | số lượng | nút thêm */}
              <div className="flex items-end gap-3">
                <div className="relative min-w-0 flex-1">
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Chọn sản phẩm
                  </label>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    onClick={() => setDropdownOpen((o) => !o)}
                  >
                    <span className={selectedProductId ? 'text-slate-800' : 'text-slate-400'}>
                      {selectedProductId
                        ? (() => {
                            const p = products.find((x) => getItemKey(x) === selectedProductId);
                            return p
                              ? `${p.productCode || p.ProductCode || ''} - ${p.productName || p.ProductName || ''}`
                              : '-- Chọn sản phẩm --';
                          })()
                        : '-- Chọn sản phẩm --'}
                    </span>
                    <Icon
                      name="expand_more"
                      size={18}
                      className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute left-0 right-0 z-20 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                      <div className="border-b border-slate-100 p-3">
                        <div className="relative">
                          <Icon
                            name="search"
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                          <input
                            type="text"
                            placeholder="Tìm theo tên hoặc mã sản phẩm..."
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      <div className="max-h-52 overflow-y-auto">
                        {filteredProducts.length === 0 ? (
                          <div className="px-4 py-8 text-center text-sm text-slate-400">
                            {productSearch.trim()
                              ? 'Không tìm thấy sản phẩm phù hợp'
                              : 'Tất cả sản phẩm đã được thêm'}
                          </div>
                        ) : (
                          filteredProducts.map((product) => {
                            const idValue = getItemKey(product);
                            const isActive = selectedProductId === idValue;
                            const stock = getProductStock(product);
                            return (
                              <button
                                key={idValue}
                                type="button"
                                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-blue-50 ${
                                  isActive
                                    ? 'bg-blue-50 font-semibold text-blue-700'
                                    : 'text-slate-700'
                                }`}
                                onClick={() => {
                                  setSelectedProductId(idValue);
                                  setDropdownOpen(false);
                                  setProductSearch('');
                                }}
                              >
                                <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-500">
                                  {product.productCode || product.ProductCode || '-'}
                                </span>
                                <span className="flex-1 truncate">
                                  {product.productName || product.ProductName}
                                </span>
                                <span
                                  className={`shrink-0 text-xs font-medium ${stock <= 0 ? 'text-red-500' : stock < 10 ? 'text-amber-600' : 'text-emerald-600'}`}
                                >
                                  {stock <= 0
                                    ? 'Hết hàng'
                                    : `Còn ${stock} ${product.unit || product.unitName || ''}`}
                                </span>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}

                  {dropdownOpen && (
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => {
                        setDropdownOpen(false);
                        setProductSearch('');
                      }}
                    />
                  )}
                </div>

                <div className="w-36">
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Số lượng
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="SL"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    value={selectedQuantity}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, '');
                      if (!raw) {
                        setSelectedQuantity('');
                        setStatusMessage('');
                        return;
                      }
                      if (selectedProductId) {
                        const prod = products.find((p) => getItemKey(p) === selectedProductId);
                        if (prod) {
                          const stock = getProductStock(prod);
                          const num = Number(raw);
                          if (num > stock) {
                            setSelectedQuantity(String(stock));
                            setStatusMessage(
                              `Đã chạm tồn kho tối đa: ${stock} ${prod.unit || prod.unitName || ''}`
                            );
                            return;
                          }
                          setStatusMessage('');
                          setSelectedQuantity(raw);
                          return;
                        }
                      }
                      setSelectedQuantity(raw);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addItem();
                      }
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={addItem}
                  className="flex h-[42px] shrink-0 items-center gap-1.5 rounded-lg bg-[#004785] px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#003566] active:scale-95"
                >
                  <Icon name="add" size={18} />
                  Thêm
                </button>
              </div>

              {/* Dòng thông tin tồn kho nằm dưới, không đẩy layout */}
              {selectedProductId &&
                (() => {
                  const prod = products.find((p) => getItemKey(p) === selectedProductId);
                  if (!prod) return null;
                  const stock = getProductStock(prod);
                  const unit = prod.unit || prod.unitName || '';
                  const isOver = selectedQuantity && Number(selectedQuantity) > stock;
                  return (
                    <div className="mt-2 flex items-center gap-2 text-[11px]">
                      <Icon
                        name="inventory_2"
                        size={14}
                        className={
                          stock <= 0
                            ? 'text-red-400'
                            : stock < 10
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                        }
                      />
                      <span
                        className={
                          stock <= 0
                            ? 'font-semibold text-red-500'
                            : stock < 10
                              ? 'font-semibold text-amber-600'
                              : 'text-slate-500'
                        }
                      >
                        Tồn kho: {stock} {unit}
                      </span>
                      {isOver && (
                        <span className="font-semibold text-red-500">(đã chạm giới hạn)</span>
                      )}
                    </div>
                  );
                })()}
            </div>

            {/* Bảng sản phẩm đã thêm */}
            {items.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                      <th className="w-10 py-3 pl-5 pr-2 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        #
                      </th>
                      <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Mã SP
                      </th>
                      <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Tên sản phẩm
                      </th>
                      <th className="w-16 px-3 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        ĐVT
                      </th>
                      <th className="w-20 px-3 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Tồn kho
                      </th>
                      <th className="w-32 px-3 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Số lượng xuất
                      </th>
                      <th className="w-12 py-3 pl-2 pr-5 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Xóa
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {items.map((item, idx) => {
                      const key = getItemKey(item);
                      const maxStock = item.maxStock ?? 999999;
                      const isOverStock = item.quantity > maxStock;
                      return (
                        <tr
                          key={key}
                          className={`group transition-colors ${isOverStock ? 'bg-red-50/50 hover:bg-red-100/50' : 'hover:bg-blue-50/30'}`}
                        >
                          <td className="py-3 pl-5 pr-2 text-center">
                            <span
                              className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${isOverStock ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}
                            >
                              {idx + 1}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-600">
                              {item.productCode || 'N/A'}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isOverStock ? 'bg-red-100 text-red-500' : 'bg-slate-100 text-slate-400'}`}
                              >
                                <Icon name="inventory_2" size={16} />
                              </div>
                              <span className="text-[13px] font-semibold text-slate-800">
                                {item.productName}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className="text-[12px] text-slate-500">{item.unit || '---'}</span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span
                              className={`text-[12px] font-semibold ${maxStock <= 0 ? 'text-red-600' : maxStock < 10 ? 'text-amber-600' : 'text-emerald-600'}`}
                            >
                              {maxStock <= 0 ? 'Hết' : maxStock}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <div
                              className={`inline-flex items-center rounded-lg border shadow-sm ${isOverStock ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  updateItemQty(key, Math.max(0, (item.quantity || 0) - 1))
                                }
                                className="flex h-7 w-7 items-center justify-center rounded-l-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                              >
                                <Icon name="remove" size={14} />
                              </button>
                              <input
                                type="number"
                                min="0"
                                className={`h-7 w-14 border-x border-slate-200 bg-transparent text-center text-[13px] font-semibold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${isOverStock ? 'text-red-600' : 'text-slate-800'}`}
                                value={item.quantity}
                                onChange={(e) => updateItemQty(key, e.target.value)}
                              />
                              <button
                                type="button"
                                onClick={() => updateItemQty(key, (item.quantity || 0) + 1)}
                                className="flex h-7 w-7 items-center justify-center rounded-r-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                              >
                                <Icon name="add" size={14} />
                              </button>
                            </div>
                            {isOverStock && (
                              <p className="mt-1 text-[10px] font-semibold text-red-500">
                                Vượt {item.quantity - maxStock}
                              </p>
                            )}
                          </td>
                          <td className="py-3 pl-2 pr-5 text-center">
                            <button
                              type="button"
                              onClick={() => removeItem(key)}
                              className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
                            >
                              <Icon name="delete" size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-10 text-slate-400">
                <Icon name="inventory_2" size={32} className="mb-2 opacity-40" />
                <p className="text-sm font-medium">Chưa có sản phẩm nào</p>
                <p className="mt-1 text-xs">Thêm sản phẩm ở trên để tạo phiếu xuất</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button
              type="button"
              disabled={isSubmitting}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              onClick={closeModal}
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={isSubmitting || items.length === 0}
              className="rounded-lg border border-sky-300 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-100 disabled:opacity-50"
              onClick={(e) => handleSubmit(e, true)}
            >
              Lưu chờ duyệt
            </button>
            <Button
              type="button"
              variant="primary"
              disabled={isSubmitting || items.length === 0}
              onClick={(e) => handleSubmit(e, false)}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Xác nhận xuất kho'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StockExport;
