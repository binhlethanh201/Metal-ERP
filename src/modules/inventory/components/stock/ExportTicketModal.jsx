import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import Icon from '../../../../shared/components/Icon';
import {
  createOutwardInventory,
  confirmOutwardInventory,
  getProducts,
} from '../../services/inventoryService';
import { getSuppliers } from '../../services/supplierService';

const extractList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.result?.items)) return response.result.items;
  return [];
};

const REASON_OPTIONS = [
  {
    value: 'Xuất trả nhà cung cấp',
    label: 'Xuất trả nhà cung cấp',
    description: 'Sử dụng khi xuất trả lại hàng hóa bị lỗi, hỏng hoặc không đúng cam kết cho Nhà cung cấp.',
  },
  {
    value: 'Xuất hủy / Hao hụt',
    label: 'Xuất hủy / Hao hụt',
    description: 'Sử dụng khi xuất loại bỏ hàng hóa bị hết hạn sử dụng, hỏng hóc, vỡ nát trong quá trình lưu kho.',
  },
  {
    value: 'Xuất sử dụng nội bộ',
    label: 'Xuất sử dụng nội bộ',
    description: 'Sử dụng khi xuất hàng hóa để làm hàng mẫu (sample), tặng nhân viên, hoặc phục vụ hoạt động nội bộ công ty.',
  },
];

const TARGET_OPTIONS = [
  { value: 'Nhà cung cấp', label: 'Nhà cung cấp' },
  { value: 'Nội bộ', label: 'Nội bộ' },
  { value: '__other__', label: 'Khác...' },
];

const getOutwardType = (reason) => {
  if (reason === 'Xuất trả nhà cung cấp' || reason === 'Trả hàng nhà cung cấp' || reason === 'Xuất trả NCC') return 1;
  if (reason === 'Xuất hủy / Hao hụt' || reason === 'Xuất hủy') return 2;
  if (reason === 'Xuất sử dụng nội bộ' || reason === 'Xuất nội bộ / Điều chuyển') return 3;
  return 3;
};

const nowDateTime = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
};

const getItemKey = (item) => item.branchProductId || item.productId || item.id || item.Id;

export const ExportTicketModal = ({ isOpen, onClose, onSuccess }) => {
  const today = nowDateTime();

  const [products, setProducts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const [ticketCode, setTicketCode] = useState('');
  const [exportDate, setExportDate] = useState(today.date);
  const [exportTime, setExportTime] = useState(today.time);
  const [targetType, setTargetType] = useState('Nhà cung cấp');
  const [targetName, setTargetName] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [reasonType, setReasonType] = useState('Xuất trả nhà cung cấp');
  const [note, setNote] = useState('');

  const [items, setItems] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Excel import
  const fileInputRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const ticketSeqRef = useRef(1);

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

  useEffect(() => {
    if (!isOpen) return;
    const t = nowDateTime();
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const seq = String(ticketSeqRef.current).padStart(3, '0');
    ticketSeqRef.current += 1;
    const generatedCode = `PX-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${seq}`;

    setTicketCode(generatedCode);
    setExportDate(t.date);
    setExportTime(t.time);
    setTargetType('Nhà cung cấp');
    setTargetName('');
    setReasonType('Xuất trả nhà cung cấp');
    setNote('');
    setItems([]);
    setSelectedProductId('');
    setSelectedQuantity('');
    setProductSearch('');
    setStatusMessage('');
    setFieldErrors({});
    setIsSubmitting(false);

    const loadProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const res = await getProducts({ pageNumber: 1, pageSize: 100 });
        setProducts(extractList(res));
      } catch {
        setProducts([]);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    loadProducts();
  }, [isOpen]);

  const resolvedReason = reasonType;

  const getProductStock = (product) => {
    const stock = product.actualStock ?? product.availableStock ?? product.stock ?? product.quantity ?? 0;
    return Number(stock);
  };

  const getUnit = (p) =>
    p.baseUnit?.name || p.baseUnit?.Name || p.BaseUnit?.name || p.BaseUnit?.Name ||
    p.unit || p.Unit || p.unitName || p.UnitName || '';

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
        setStatusMessage(`Lỗi: Vượt tồn kho! "${product.productName || product.ProductName}" chỉ còn ${stock} ${getUnit(product)}`);
        return prev;
      }

      if (existing) {
        return prev.map((i) => (getItemKey(i) === key ? { ...i, quantity: newQty } : i));
      }
      return [...prev, {
        branchProductId: product.branchProductId || null,
        productId: getItemKey(product),
        productCode: product.productCode || product.ProductCode || '',
        productName: product.productName || product.ProductName || '',
        unit: getUnit(product),
        quantity: qty,
        maxStock: stock,
        unitPrice: 0,
      }];
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
        if (numQty > max) setStatusMessage(`Đã chạm tồn kho tối đa: ${max} ${i.unit || ''}`);
        else setStatusMessage('');
        return { ...i, quantity: clamped };
      })
    );
  };

  const updateItemPrice = (key, price) => {
    const cleaned = String(price).replace(/[^0-9]/g, '');
    setItems((prev) =>
      prev.map((i) =>
        getItemKey(i) === key ? { ...i, unitPrice: cleaned ? Number(cleaned) : 0 } : i
      )
    );
  };

  const isSale = false;

  const handleDownloadTemplate = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/outwardinventoryexcel/template`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Tải template thất bại');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Template_XuatKho_Excel.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setStatusMessage('Lỗi: Không thể tải template');
    }
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('File', file);
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/outwardinventoryexcel/parse`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data?.success) {
        const { validRows, errors, groups } = data.data;
        if (errors?.length > 0) setImportResult(data.data);
        if (validRows?.length > 0) {
          const mappedItems = validRows.map((row) => {
            const pid = row.productId || row.resolvedProductId || '';
            const matchedProduct = products.find((p) => String(getItemKey(p)) === String(pid));
            const stock = matchedProduct ? getProductStock(matchedProduct) : 0;
            const unit = matchedProduct ? getUnit(matchedProduct) : '';
            return { branchProductId: pid, productId: pid, productCode: row.maSanPham || '', productName: row.tenSanPham || '', unit, quantity: Number(row.soLuong || 0), unitPrice: Number(row.donGiaXuat || 0), maxStock: stock };
          });
          setItems(mappedItems);
          if (groups?.length === 1) {
            const lyDo = groups[0].lyDo;
            if (lyDo === 'Trả NCC' || lyDo === 'Tra NCC') { setTargetType('Nhà cung cấp'); setReasonType('Xuất trả nhà cung cấp'); }
            else if (lyDo === 'Xuất hủy' || lyDo === 'Xuat huy') { setTargetType('Nội bộ'); setReasonType('Xuất hủy / Hao hụt'); }
            else if (lyDo === 'Điều chuyển' || lyDo === 'Dieu chuyen') { setTargetType('Nội bộ'); setReasonType('Xuất sử dụng nội bộ'); }
          }
          setStatusMessage(errors?.length > 0 ? `Đã nạp ${mappedItems.length} dòng hợp lệ. ${errors.length} dòng lỗi.` : `Đã nạp ${mappedItems.length} sản phẩm từ Excel.`);
        } else if (errors?.length > 0) {
          setStatusMessage('File có lỗi, không có dòng nào hợp lệ.');
        }
      } else {
        setStatusMessage('Lỗi: ' + (data?.message || 'Parse thất bại'));
      }
    } catch (err) {
      setStatusMessage('Lỗi: ' + (err.message || 'Lỗi import file'));
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const errors = [];
    const fields = {};

    if (!exportDate.trim()) {
      errors.push('Chưa chọn ngày xuất kho');
      fields.exportDate = true;
    }

    if (targetType === 'Nhà cung cấp' && !selectedSupplier) {
      errors.push('Chưa chọn nhà cung cấp');
      fields.targetName = true;
    } else if (targetType !== 'Nhà cung cấp' && !targetName.trim()) {
      const label = targetType === 'Nội bộ' ? 'tên đơn vị / bộ phận' : 'tên đối tượng xuất';
      errors.push(`Chưa nhập ${label}`);
      fields.targetName = true;
    }

    if (!items.length) {
      errors.push('Chưa thêm sản phẩm nào vào phiếu xuất');
      fields.items = true;
    }

    items.forEach((item) => {
      if (!item.quantity || Number(item.quantity) <= 0) {
        errors.push(`Sản phẩm "${item.productName}" chưa nhập số lượng hoặc số lượng không hợp lệ`);
        fields[`qty_${getItemKey(item)}`] = true;
      }
    });

    setFieldErrors(fields);
    return errors;
  };

  const handleSubmit = async (event, isDraft = false) => {
    if (event?.preventDefault) event.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      setStatusMessage(errors.join('; '));
      return;
    }

    const reasonText = resolvedReason.trim();

    setIsSubmitting(true);
    setStatusMessage('');

    try {
      const payload = {
        outwardType: getOutwardType(resolvedReason),
        reason: reasonText,
        note: note || reasonText,
        ...(ticketCode.trim() && { ticketCode: ticketCode.trim() }),
        ...(selectedSupplier && { supplierId: selectedSupplier.id || selectedSupplier.supplierId }),
        items: items.map((i) => ({
          branchProductId: getItemKey(i),
          quantity: Number(i.quantity || 0),
          unitPrice: Number(i.unitPrice || 0),
        })),
      };

      setStatusMessage('Đang tạo phiếu xuất kho...');
      const createRes = await createOutwardInventory(payload);
      const ticketId = createRes?.data?.ticketId || createRes?.data?.stockTicketId;
      const newTicketCode = createRes?.data?.ticketCode || ticketId;

      if (newTicketCode && targetName.trim()) {
        try { localStorage.setItem(`outward_party_${newTicketCode}`, targetName.trim()); } catch { }
      }

      if (ticketId && !isDraft) {
        setStatusMessage('Đang xác nhận để trừ tồn kho...');
        await confirmOutwardInventory(ticketId);
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      const errors = error?.data?.errors;
      let msg;
      if (errors) {
        if (typeof errors === 'object' && !Array.isArray(errors)) {
          msg = Object.entries(errors).map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`).join(' | ');
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

  return (
    <Modal isOpen={isOpen} onClose={() => !isSubmitting && onClose()} title="Tạo phiếu xuất kho" size="5xl">
      <div className="mb-4 flex items-center gap-2">
        <input type="file" ref={fileInputRef} accept=".xlsx,.xls" onChange={handleImportExcel} className="hidden" />
        <button
          type="button"
          onClick={handleDownloadTemplate}
          disabled={importing}
          className="flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Icon name="download" size={16} /> Tải file Excel mẫu
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          className="flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#b3b3b3] dark:hover:bg-[#333333]"
        >
          <Icon name="upload_file" size={16} /> {importing ? 'Đang import...' : 'Nhập từ Excel'}
        </button>
        {importing && <span className="text-xs text-slate-500 dark:text-[#999999]">Đang xử lý file...</span>}
      </div>
      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* Status Banner */}
        {importResult && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-amber-800 dark:text-amber-300">
                Kết quả import: {importResult.validRows?.length || 0} dòng hợp lệ, {importResult.errors?.length || 0} lỗi
              </h3>
              <Button variant="secondary" size="sm" onClick={() => setImportResult(null)}>Đóng</Button>
            </div>
            {importResult.errors?.length > 0 && (
              <div className="max-h-40 overflow-y-auto space-y-1">
                {importResult.errors.map((err, i) => (
                  <p key={i} className="text-sm text-red-600 dark:text-red-400">Dòng {err.rowNumber}: {err.errorMessage}</p>
                ))}
              </div>
            )}
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">Các dòng hợp lệ đã được nạp vào form bên dưới.</p>
          </div>
        )}
        {statusMessage && (
          (() => {
            const msg = statusMessage.toLowerCase();
            const isError = msg.includes('lỗi') || msg.includes('chưa') || msg.includes('tối thiểu') || msg.includes('không hợp lệ') || msg.includes('vượt');
            return (
              <div className={`flex items-start gap-3 rounded-lg border p-4 ${isError
                  ? 'border-red-300 bg-red-100 text-red-800 dark:border-red-700 dark:bg-red-950/30 dark:text-red-300'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                }`}>
                <Icon name={isError ? 'error' : 'check_circle'} size={20} className="mt-0.5 shrink-0" />
                <div className={`flex-1 text-sm font-semibold ${isError ? 'text-red-800 dark:text-red-300' : 'text-emerald-800 dark:text-emerald-400'}`}>{statusMessage}</div>
                <button type="button" onClick={() => { setStatusMessage(''); setFieldErrors({}); }} className="shrink-0 rounded p-1 opacity-60 hover:opacity-100">
                  <Icon name="close" size={16} />
                </button>
              </div>
            );
          })()
        )}

        {/* THÔNG TIN CHỨNG TỪ */}
        <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-[#333333] dark:bg-[#1a1a1a]/50">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-600 dark:text-[#b3b3b3]">
            Thông tin chứng từ
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-[#b3b3b3]">Số phiếu xuất</label>
              <input type="text" className="w-full rounded-lg border border-slate-300 bg-blue-50/40 px-3 py-2 font-mono text-sm font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200 dark:border-[#404040] dark:bg-blue-950/30 dark:text-[#b3b3b3]"
                value={ticketCode} onChange={(e) => setTicketCode(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-[#b3b3b3]">Ngày xuất <span className="text-red-500">*</span></label>
              <input type="date" required
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200 ${fieldErrors.exportDate ? 'border-red-400 bg-red-50 dark:border-red-700 dark:bg-red-950/30' : 'border-slate-300 dark:border-[#404040] dark:bg-[#272727] dark:text-[#e5e5e5]'
                  }`}
                value={exportDate} onChange={(e) => { setExportDate(e.target.value); setFieldErrors((prev) => ({ ...prev, exportDate: false })); }} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-[#b3b3b3]">Giờ xuất</label>
              <input type="time"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200 dark:border-[#404040] dark:bg-[#272727] dark:text-[#e5e5e5]"
                value={exportTime} onChange={(e) => setExportTime(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-[#b3b3b3]">Đối tượng xuất <span className="text-red-500">*</span></label>
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200 dark:border-[#404040] dark:bg-[#272727] dark:text-[#e5e5e5]"
                value={targetType} onChange={(e) => { setTargetType(e.target.value); setTargetName(''); }}>
                {TARGET_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
              </select>
            </div>
          </div>

          {/* Tên đối tượng */}
          {targetType === 'Nhà cung cấp' ? (
            <div className="mt-3">
              <label className="text-xs font-semibold text-slate-600 dark:text-[#b3b3b3]">
                Tên nhà cung cấp <span className="text-red-500">*</span>
              </label>
              <select
                className={`mt-1.5 w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200 ${fieldErrors.targetName ? 'border-red-400 bg-red-50 dark:border-red-700 dark:bg-red-950/30' : 'border-slate-300 dark:border-[#404040] dark:bg-[#272727] dark:text-[#e5e5e5]'}`}
                value={selectedSupplier ? (selectedSupplier.id || selectedSupplier.supplierId || '') : ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) { setSelectedSupplier(null); return; }
                  const s = suppliers.find(x => (x.id || x.supplierId) == val);
                  setSelectedSupplier(s || null);
                  setFieldErrors(prev => ({ ...prev, targetName: false }));
                }}>
                <option value="">-- Chọn nhà cung cấp --</option>
                {suppliers.map(s => (
                  <option key={s.id || s.supplierId} value={s.id || s.supplierId}>
                    {s.supplierName || s.name || s.fullName || s.companyName || 'NCC'}
                  </option>
                ))}
              </select>
            </div>
          ) : targetType === 'Nội bộ' ? (
            <div className="mt-3">
              <label className="text-xs font-semibold text-slate-600 dark:text-[#b3b3b3]">
                Tên đơn vị / bộ phận <span className="text-red-500">*</span>
              </label>
              <input type="text"
                placeholder="VD: Xưởng sản xuất số 1"
                className={`mt-1.5 w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200 ${fieldErrors.targetName ? 'border-red-400 bg-red-50 dark:border-red-700 dark:bg-red-950/30' : 'border-slate-300 dark:border-[#404040] dark:bg-[#272727] dark:text-[#e5e5e5]'}`}
                value={targetName}
                onChange={(e) => { setTargetName(e.target.value); setFieldErrors(prev => ({ ...prev, targetName: false })); }}
              />
            </div>
          ) : (
            <div className="mt-3">
              <label className="text-xs font-semibold text-slate-600 dark:text-[#b3b3b3]">Nhập đối tượng xuất <span className="text-red-500">*</span></label>
              <input type="text" placeholder="VD: Đối tác vận chuyển, Bảo hành..."
                className={`mt-1.5 w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200 ${fieldErrors.targetName ? 'border-red-400 bg-red-50 dark:border-red-700 dark:bg-red-950/30' : 'border-slate-300 dark:border-[#404040] dark:bg-[#272727] dark:text-[#e5e5e5]'}`}
                value={targetName}
                onChange={(e) => { setTargetName(e.target.value); setFieldErrors(prev => ({ ...prev, targetName: false })); }}
              />
            </div>
          )}
        </div>

        {/* LÝ DO XUẤT */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-[#b3b3b3]">Lý do xuất kho <span className="text-red-500">*</span></label>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200 dark:border-[#404040] dark:bg-[#272727] dark:text-[#e5e5e5]"
              value={reasonType} onChange={(e) => { setReasonType(e.target.value); }}>
              {REASON_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
            </select>
            <p className="mt-2 text-xs text-slate-500 dark:text-[#999999]">
              {REASON_OPTIONS.find((opt) => opt.value === reasonType)?.description || 'Vui lòng chọn một lý do phù hợp với quy trình xuất kho.'}
            </p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-[#b3b3b3]">Ghi chú thêm</label>
            <input type="text" placeholder="Ghi chú chi tiết (không bắt buộc)"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200 dark:border-[#404040] dark:bg-[#272727] dark:text-[#e5e5e5]"
              value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>

        {/* DANH SÁCH SẢN PHẨM */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-700 dark:text-[#b3b3b3]">
              Danh sách sản phẩm xuất <span className="text-red-500">*</span>
              {fieldErrors.items && <span className="ml-2 text-xs font-normal text-red-500">— Vui lòng thêm ít nhất 1 sản phẩm</span>}
            </label>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">{items.length} mặt hàng</span>
          </div>

          {/* Dòng thêm mới + combobox */}
          <div className="rounded-xl border-2 border-dashed border-blue-200 bg-gradient-to-r from-blue-50/60 to-white p-4 dark:border-blue-800 dark:from-blue-950/30 dark:to-[#1a1a1a]">
            <div className="flex items-end gap-3">
              <div className="relative min-w-0 flex-1">
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-[#999999]">Chọn sản phẩm</label>
                <button type="button"
                  className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-[#404040] dark:bg-[#272727] dark:text-[#e5e5e5]"
                  onClick={() => setDropdownOpen((o) => !o)}>
                  <span className={selectedProductId ? 'text-slate-800 dark:text-[#e5e5e5]' : 'text-slate-400 dark:text-[#808080]'}>
                    {selectedProductId
                      ? (() => {
                        const p = products.find((x) => getItemKey(x) === selectedProductId);
                        return p ? `${p.productCode || p.ProductCode || ''} - ${p.productName || p.ProductName || ''}` : '-- Chọn sản phẩm --';
                      })()
                      : '-- Chọn sản phẩm --'}
                  </span>
                  <Icon name="expand_more" size={18} className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => { setDropdownOpen(false); setProductSearch(''); }} />
                    <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-[#333333] dark:bg-[#1a1a1a]">
                      <div className="border-b border-slate-100 p-3 dark:border-[#333333]">
                        <div className="relative">
                          <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#808080]" />
                          <input type="text" placeholder="Tìm theo tên hoặc mã sản phẩm..."
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none dark:border-[#404040] dark:bg-[#272727] dark:text-[#e5e5e5] dark:focus:bg-[#272727]"
                            value={productSearch} onChange={(e) => setProductSearch(e.target.value)} autoFocus onClick={(e) => e.stopPropagation()} />
                        </div>
                      </div>
                      <div className="max-h-52 overflow-y-auto">
                        {filteredProducts.length === 0 ? (
                          <div className="px-4 py-8 text-center text-sm text-slate-400 dark:text-[#808080]">
                            {productSearch.trim() ? 'Không tìm thấy sản phẩm phù hợp' : isLoadingProducts ? 'Đang tải...' : 'Tất cả sản phẩm đã được thêm'}
                          </div>
                        ) : (
                          filteredProducts.map((product) => {
                            const idValue = getItemKey(product);
                            const stock = getProductStock(product);
                            return (
                              <button key={idValue} type="button"
                                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-blue-50 dark:hover:bg-[#333333] text-slate-700 dark:text-[#b3b3b3]"
                                onClick={() => { setSelectedProductId(idValue); setDropdownOpen(false); setProductSearch(''); }}>
                                <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-500 dark:bg-[#272727] dark:text-[#999999]">
                                  {product.productCode || product.ProductCode || '-'}
                                </span>
                                <span className="flex-1 truncate dark:text-[#d4d4d4]">{product.productName || product.ProductName}</span>
                                <span className={`shrink-0 text-xs font-medium ${stock <= 0 ? 'text-red-500' : stock < 10 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                  {stock <= 0 ? 'Hết hàng' : `Còn ${stock} ${getUnit(product)}`}
                                </span>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="w-36">
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-[#999999]">Số lượng</label>
                <input type="text" inputMode="numeric" placeholder="SL"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-[#404040] dark:bg-[#272727] dark:text-[#e5e5e5]"
                  value={selectedQuantity}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    if (!raw) { setSelectedQuantity(''); setStatusMessage(''); return; }
                    if (selectedProductId) {
                      const prod = products.find((p) => getItemKey(p) === selectedProductId);
                      if (prod) {
                        const stock = getProductStock(prod);
                        const num = Number(raw);
                        if (num > stock) { setSelectedQuantity(String(stock)); setStatusMessage(`Đã chạm tồn kho tối đa: ${stock} ${prod.unit || prod.unitName || ''}`); return; }
                        setStatusMessage(''); setSelectedQuantity(raw); return;
                      }
                    }
                    setSelectedQuantity(raw);
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem(); } }} />
              </div>

              <button type="button" onClick={addItem}
                className="flex h-[42px] shrink-0 items-center gap-1.5 rounded-lg bg-[#004785] px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#003566] active:scale-95">
                <Icon name="add" size={18} /> Thêm
              </button>
            </div>

            {selectedProductId && (() => {
              const prod = products.find((p) => getItemKey(p) === selectedProductId);
              if (!prod) return null;
              const stock = getProductStock(prod);
              const unit = getUnit(prod);
              const isOver = selectedQuantity && Number(selectedQuantity) > stock;
              return (
                <div className="mt-2 flex items-center gap-2 text-[11px]">
                  <Icon name="inventory_2" size={14} className={stock <= 0 ? 'text-red-400' : stock < 10 ? 'text-amber-400' : 'text-emerald-400'} />
                  <span className={stock <= 0 ? 'font-semibold text-red-500' : stock < 10 ? 'font-semibold text-amber-600' : 'text-slate-500 dark:text-[#999999]'}>
                    Tồn kho: {stock} {unit}
                  </span>
                  {isOver && <span className="font-semibold text-red-500">(đã chạm giới hạn)</span>}
                </div>
              );
            })()}
          </div>

          {/* Bảng sản phẩm đã thêm */}
          {items.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm dark:border-[#333333]">
              <table className="w-full table-fixed text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white dark:border-[#333333] dark:from-[#1a1a1a] dark:to-[#1a1a1a]">
                    <th className="w-10 py-3 pl-5 pr-2 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#808080]">#</th>
                    <th className="w-24 px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#808080]">Mã SP</th>
                    <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#808080]">Tên sản phẩm</th>
                    <th className="w-16 px-3 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#808080]">ĐVT</th>
                    <th className="w-20 px-3 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#808080]">Tồn kho</th>
                    <th className="w-32 px-3 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#808080]">Số lượng xuất</th>
                    {isSale && (
                      <>
                        <th className="w-28 px-2 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#808080]">Đơn giá</th>
                        <th className="w-28 px-2 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#808080]">Thành tiền</th>
                      </>
                    )}
                    <th className="w-10 py-3 pl-1 pr-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#808080]">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-[#333333]">
                  {items.map((item, idx) => {
                    const key = getItemKey(item);
                    const maxStock = item.maxStock ?? 999999;
                    const isOverStock = item.quantity > maxStock;
                    return (
                      <tr key={key} className={`group transition-colors ${isOverStock ? 'bg-red-50/50 hover:bg-red-100/50 dark:bg-red-950/20 dark:hover:bg-red-950/40' : 'hover:bg-blue-50/30 dark:hover:bg-[#333333]'}`}>
                        <td className="py-3 pl-5 pr-2 text-center">
                          <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${isOverStock ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-slate-100 text-slate-500 dark:bg-[#272727] dark:text-[#b3b3b3]'}`}>{idx + 1}</span>
                        </td>
                        <td className="w-24 truncate px-3 py-3">
                          <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-600 dark:bg-[#272727] dark:text-[#b3b3b3]">{item.productCode || 'N/A'}</span>
                        </td>
                        <td className="truncate px-3 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isOverStock ? 'bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400' : 'bg-slate-100 text-slate-400 dark:bg-[#272727] dark:text-[#808080]'}`}>
                              <Icon name="inventory_2" size={16} />
                            </div>
                            <span className="truncate text-[13px] font-semibold text-slate-800 dark:text-[#e5e5e5]">{item.productName}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center"><span className="text-[12px] text-slate-500 dark:text-[#999999]">{item.unit || '---'}</span></td>
                        <td className="px-3 py-3 text-center">
                          <span className={`text-[12px] font-semibold ${maxStock <= 0 ? 'text-red-600' : maxStock < 10 ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {maxStock <= 0 ? 'Hết' : maxStock}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <div className={`inline-flex items-center rounded-lg border shadow-sm ${isOverStock ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/30' : 'border-slate-200 bg-white dark:border-[#404040] dark:bg-[#272727]'}`}>
                            <button type="button" onClick={() => updateItemQty(key, Math.max(0, (item.quantity || 0) - 1))}
                              className="flex h-7 w-7 items-center justify-center rounded-l-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-[#808080] dark:hover:bg-[#404040]"><Icon name="remove" size={14} /></button>
                            <input type="number" min="0"
                              className={`h-7 w-14 border-x border-slate-200 bg-transparent text-center text-[13px] font-semibold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${isOverStock ? 'text-red-600' : 'text-slate-800 dark:text-[#e5e5e5]'} dark:border-[#404040]`}
                              value={item.quantity} onChange={(e) => updateItemQty(key, e.target.value)} />
                            <button type="button" onClick={() => updateItemQty(key, (item.quantity || 0) + 1)}
                              className="flex h-7 w-7 items-center justify-center rounded-r-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-[#808080] dark:hover:bg-[#404040]"><Icon name="add" size={14} /></button>
                          </div>
                          {isOverStock && <p className="mt-1 text-[10px] font-semibold text-red-500">Vượt {item.quantity - maxStock}</p>}
                        </td>
                        {isSale && (
                          <>
                            <td className="px-2 py-3 text-center">
                              <input type="text" inputMode="numeric" placeholder="0"
                                className="h-8 w-24 rounded-lg border border-slate-200 bg-white px-2 text-right text-[13px] font-semibold text-slate-800 outline-none focus:border-blue-500 dark:border-[#404040] dark:bg-[#272727] dark:text-[#e5e5e5]"
                                value={item.unitPrice ? Number(item.unitPrice).toLocaleString('vi-VN') : ''}
                                onChange={(e) => updateItemPrice(key, e.target.value.replace(/[^0-9]/g, ''))} />
                            </td>
                            <td className="max-w-[160px] truncate px-2 py-3 text-right font-semibold text-blue-700 dark:text-blue-400">
                              {(Number(item.quantity || 0) * Number(item.unitPrice || 0)).toLocaleString('vi-VN')}
                            </td>
                          </>
                        )}
                        <td className="py-3 pl-1 pr-3 text-center">
                          <button type="button" onClick={() => removeItem(key)}
                            className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-[#808080] dark:hover:bg-red-900/30 dark:hover:text-red-400"><Icon name="delete" size={16} /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-10 ${fieldErrors.items ? 'border-red-300 bg-red-50/30 text-red-400 dark:border-red-700 dark:bg-red-950/20' : 'border-slate-200 text-slate-400 dark:border-[#333333] dark:text-[#808080]'
              }`}>
              <Icon name="inventory_2" size={32} className="mb-2 opacity-40" />
              <p className="text-sm font-medium">Chưa có sản phẩm nào</p>
              <p className="mt-1 text-xs">Thêm sản phẩm ở trên để tạo phiếu xuất</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-[#333333]">
          <button type="button" disabled={isSubmitting}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-[#404040] dark:text-[#b3b3b3] dark:hover:bg-[#333333]"
            onClick={() => !isSubmitting && onClose()}>Hủy</button>
          <button type="button" disabled={isSubmitting || items.length === 0}
            className="rounded-lg border border-sky-300 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-100 disabled:opacity-50 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-400 dark:hover:bg-sky-900/30"
            onClick={(e) => handleSubmit(e, true)}>Lưu chờ duyệt</button>
          <Button type="button" variant="primary" disabled={isSubmitting || items.length === 0}
            onClick={(e) => handleSubmit(e, false)}>
            {isSubmitting ? 'Đang xử lý...' : 'Xác nhận xuất kho'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ExportTicketModal;
