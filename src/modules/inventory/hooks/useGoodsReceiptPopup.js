/**
 * Hook quản lý Popup Thêm mới Phiếu Nhập Kho (Spec đầy đủ).
 * 2 chế độ: Mua hàng (PURCHASE) / Khác (OTHER).
 */
import { useState, useCallback, useMemo, useRef } from 'react';
import { getLocalDateTimeString } from '../../../shared/utils/formatDate';
import { useAuth } from '../../../shared/hooks/useAuth';

const genNumber = (() => {
  let s = 240;
  return () => {
    s += 1;
    return `NK${String(s).padStart(6, '0')}`;
  };
})();

const emptyLine = () => ({
  id: `nl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  productId: '',
  productCode: '',
  productName: '',
  unit: '',
  lotNumber: '',
  expiryDate: '',
  serialImei: '',
  warehouseId: 'KHO_CHINH',
  warehouseName: 'Kho Chính',
  quantity: 1,
  unitPrice: 0,
  amount: 0,
  notes: '',
  isDirty: false,
});

export const useGoodsReceiptPopup = (onClose) => {
  const { user } = useAuth();

  // --- Header ---
  const [receiptType, setReceiptType] = useState('purchase');
  const isPurchase = receiptType === 'purchase';
  const isCustomerReturn = receiptType === 'customer_return';

  const [header, setHeader] = useState({
    supplierId: '',
    supplierName: '',
    partnerId: '',
    partnerName: '',
    description: '',
    receiptNumber: genNumber(),
    date: getLocalDateTimeString(),
    createdBy: user?.name || '',
    paymentStatus: 'unpaid',
    paymentMethod: 'Tiền mặt',
    invoiceCode: '',
    invoiceNumber: '',
    invoiceDate: '',
  });

  // --- Lines ---
  const [lines, setLines] = useState([emptyLine()]);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [barcodeMode, setBarcodeMode] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [attachments, setAttachments] = useState([]);

  // Autocomplete
  const [autoOpenId, setAutoOpenId] = useState(null);
  const [autoSearch, setAutoSearch] = useState('');
  const [autoResults, setAutoResults] = useState([]);
  const [autoIdx, setAutoIdx] = useState(-1);
  const autoRef = useRef(null);
  const barcodeRef = useRef(null);
  const qtyRefs = useRef({});
  const targetLineRef = useRef(null);

  const markDirty = useCallback(() => setIsDirty(true), []);

  const handleHeader = useCallback(
    (f, v) => {
      setHeader((p) => ({ ...p, [f]: v }));
      markDirty();
    },
    [markDirty]
  );

  const ensureTrailing = useCallback((ls) => {
    const last = ls[ls.length - 1];
    return last?.isDirty ? [...ls, emptyLine()] : ls;
  }, []);

  const updateLine = useCallback(
    (id, up) => {
      setLines((p) => {
        const n = p.map((l) => (l.id === id ? { ...l, ...up, isDirty: true } : l));
        return ensureTrailing(n);
      });
      markDirty();
    },
    [markDirty, ensureTrailing]
  );

  // --- Data ---
  const productList = useMemo(
    () => [
      { id: 'SP001', code: 'SP001', name: 'Thép tấm 10mm', unit: 'Kg', price: 23000, stock: 1500 },
      {
        id: 'SP002',
        code: 'SP002',
        name: 'Thép tròn D12',
        unit: 'Cây',
        price: 170000,
        stock: 2300,
      },
      {
        id: 'SP003',
        code: 'SP003',
        name: 'Inox 304 tấm 1.5mm',
        unit: 'Kg',
        price: 82000,
        stock: 800,
      },
      {
        id: 'SP004',
        code: 'SP004',
        name: 'Nhôm thanh 20x20',
        unit: 'Cây',
        price: 115000,
        stock: 500,
      },
      { id: 'SP005', code: 'SP005', name: 'Ống thép D60', unit: 'Cây', price: 310000, stock: 350 },
      {
        id: 'SP006',
        code: 'SP006',
        name: 'Tôn mạ kẽm 0.5mm',
        unit: 'Tấm',
        price: 540000,
        stock: 200,
      },
    ],
    []
  );

  const supplierList = useMemo(
    () => [
      { id: 'NCC001', code: 'NCC001', name: 'Công ty Hòa Phát' },
      { id: 'NCC002', code: 'NCC002', name: 'Thép Việt Nhật' },
      { id: 'NCC003', code: 'NCC003', name: 'Kim khí Sài Gòn' },
    ],
    []
  );

  const partnerList = useMemo(
    () => [
      { id: 'KH001', code: 'KH001', name: 'Công ty ABC', type: 'Khách hàng' },
      { id: 'NCC001', code: 'NCC001', name: 'Công ty Hòa Phát', type: 'Nhà cung cấp' },
      { id: 'NB001', code: 'NB001', name: 'Nội bộ - Kho phụ', type: 'Nội bộ' },
    ],
    []
  );

  const warehouseList = useMemo(
    () => [
      {
        id: 'KHO_CHINH',
        name: 'Kho Chính',
        locations: [
          { id: 'A1', name: 'Kệ A1' },
          { id: 'A2', name: 'Kệ A2' },
          { id: 'B1', name: 'Kệ B1' },
        ],
      },
      {
        id: 'KHO_NVL',
        name: 'Kho NVL',
        locations: [
          { id: 'N1', name: 'Kệ N1' },
          { id: 'N2', name: 'Kệ N2' },
        ],
      },
      { id: 'KHO_TP', name: 'Kho Thành Phẩm', locations: [{ id: 'T1', name: 'Kệ T1' }] },
    ],
    []
  );

  // --- Autocomplete ---
  const filterProducts = useCallback(
    (kw) => {
      if (!kw?.trim()) {
        setAutoResults(productList.slice(0, 20));
        return;
      }
      const k = kw.trim().toLowerCase();
      setAutoResults(
        productList
          .filter((p) => p.code.toLowerCase().includes(k) || p.name.toLowerCase().includes(k))
          .slice(0, 20)
      );
    },
    [productList]
  );

  const openAuto = useCallback(
    (id, code = '') => {
      setAutoOpenId(id);
      setAutoSearch(code || '');
      setAutoIdx(-1);
      filterProducts(code || '');
    },
    [filterProducts]
  );
  const closeAuto = useCallback(() => {
    setAutoOpenId(null);
    setAutoSearch('');
    setAutoResults([]);
    setAutoIdx(-1);
  }, []);

  const handleProductSelect = useCallback(
    (lineId, prod) => {
      setLines((p) => {
        const n = p.map((l) =>
          l.id === lineId
            ? {
                ...l,
                productId: prod.id,
                productCode: prod.code,
                productName: prod.name,
                unit: prod.unit,
                unitPrice: prod.price || 0,
                amount: (l.quantity || 1) * (prod.price || 0),
                isDirty: true,
              }
            : l
        );
        return ensureTrailing(n);
      });
      markDirty();
      closeAuto();
      setTimeout(() => {
        const el = qtyRefs.current[`q_${lineId}`];
        if (el) {
          el.focus();
          el.select();
        }
      }, 100);
    },
    [markDirty, ensureTrailing, closeAuto]
  );

  const handleApplyNewProduct = useCallback(
    (prod) => {
      setLines((prev) => {
        const emptyLine = prev.find((l) => !l.isDirty);
        if (!emptyLine) return prev;
        targetLineRef.current = emptyLine.id;
        const n = prev.map((l) =>
          l.id === emptyLine.id
            ? {
                ...l,
                productId: prod.id,
                productCode: prod.code || prod.sku || '',
                productName: prod.name,
                unit: prod.unit,
                unitPrice: prod.price || prod.purchasePrice || 0,
                amount: (l.quantity || 1) * (prod.price || prod.purchasePrice || 0),
                isDirty: true,
              }
            : l
        );
        return ensureTrailing(n);
      });
      markDirty();
      setTimeout(() => {
        const id = targetLineRef.current;
        if (id) {
          const el = qtyRefs.current[`q_${id}`];
          if (el) {
            el.focus();
            el.select();
          }
          targetLineRef.current = null;
        }
      }, 150);
    },
    [markDirty, ensureTrailing]
  );

  const handleAutoKey = useCallback(
    (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setAutoIdx((p) => Math.min(p + 1, autoResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setAutoIdx((p) => Math.max(p - 1, -1));
      } else if (e.key === 'Enter' && autoIdx >= 0 && autoResults[autoIdx]) {
        e.preventDefault();
        if (autoOpenId) handleProductSelect(autoOpenId, autoResults[autoIdx]);
      } else if (e.key === 'Escape') closeAuto();
    },
    [autoResults, autoIdx, autoOpenId, handleProductSelect, closeAuto]
  );

  // --- Quantity / Price ---
  const recalcLine = useCallback(
    (id, field, raw) => {
      setLines((p) => {
        const n = p.map((l) => {
          if (l.id !== id) return l;
          const updated = { ...l, [field]: Number(raw) || 0, isDirty: true };
          const qty = field === 'quantity' ? updated.quantity : l.quantity;
          const price = field === 'unitPrice' ? updated.unitPrice : l.unitPrice;
          const amt = Math.round(qty * price);
          return {
            ...updated,
            amount: amt,
            quantity: qty,
            unitPrice: price,
          };
        });
        return ensureTrailing(n);
      });
      markDirty();
    },
    [markDirty, ensureTrailing]
  );

  const handleRemoveLine = useCallback(
    (id) => {
      setLines((p) => {
        const remaining = p.filter((l) => l.id !== id);
        if (remaining.length === 0) return [emptyLine()];
        return remaining;
      });
      markDirty();
    },
    [markDirty]
  );

  // --- Attachments ---
  const handleAttach = useCallback(() => {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.multiple = true;
    inp.accept = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip,.rar';
    inp.onchange = (e) => {
      const files = Array.from(e.target.files || []);
      const valid = files.filter((f) => f.size <= 20 * 1024 * 1024);
      if (valid.length < files.length) alert('Một số file vượt quá 20MB đã bị bỏ qua');
      setAttachments((p) => [...p, ...valid.map((f) => ({ name: f.name, size: f.size, file: f }))]);
    };
    inp.click();
  }, []);

  const handleRemoveAttach = useCallback((name) => {
    setAttachments((p) => p.filter((a) => a.name !== name));
  }, []);

  // --- Computed ---
  const dirtyLines = useMemo(() => lines.filter((l) => l.isDirty), [lines]);
  const totalAmount = useMemo(() => dirtyLines.reduce((s, l) => s + l.amount, 0), [dirtyLines]);
  const totalPayment = totalAmount;

  const isValid = useMemo(() => {
    if (isPurchase) {
      if (!header.supplierId && !header.supplierName) return false;
    } else if (!isCustomerReturn) {
      if (!header.partnerId && !header.partnerName) return false;
    }
    return dirtyLines.some((l) => l.productId && l.quantity > 0);
  }, [isPurchase, isCustomerReturn, header, dirtyLines]);

  // --- Close ---
  const requestClose = useCallback(() => {
    if (isDirty) {
      setShowConfirmClose(true);
      return;
    }
    onClose?.();
  }, [isDirty, onClose]);

  // --- Submit ---
  const handleSubmit = useCallback(async () => {
    if (!isValid || saving) return false;
    setSaving(true);
    try {
      const payload = {
        receiptType: isPurchase ? 'PURCHASE' : isCustomerReturn ? 'CUSTOMER_RETURN' : 'OTHER',
        ...(isPurchase
          ? {
              supplierId: header.supplierId,
              supplierName: header.supplierName,
              paymentStatus: header.paymentStatus === 'paid' ? 'PAID' : 'UNPAID',
              paymentMethod: header.paymentMethod,
              invoiceCode: header.invoiceCode,
              invoiceNumber: header.invoiceNumber,
              invoiceDate: header.invoiceDate,
            }
          : isCustomerReturn
            ? {}
            : { partnerId: header.partnerId, partnerName: header.partnerName }),
        description: header.description,
        receiptNumber: header.receiptNumber,
        date: header.date,
        createdBy: header.createdBy,
        items: dirtyLines.map((l, i) => ({
          lineNumber: i + 1,
          productId: l.productId,
          productCode: l.productCode,
          productName: l.productName,
          unit: l.unit,
          lotNumber: l.lotNumber,
          expiryDate: l.expiryDate,
          serialImei: l.serialImei,
          warehouseId: l.warehouseId,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          amount: l.amount,
          notes: l.notes,
        })),
        attachments: attachments.map((a) => a.name),
      };
      console.log('[Demo] Lưu phiếu nhập:', payload);
      setSaving(false);
      setIsDirty(false);
      return true;
    } catch (e) {
      setSaving(false);
      alert(e?.message || 'Lỗi');
      return false;
    }
  }, [isValid, isPurchase, header, dirtyLines, attachments]);

  return {
    receiptType,
    setReceiptType,
    isPurchase,
    isCustomerReturn,
    header,
    handleHeader,
    lines,
    dirtyLines,
    updateLine,
    recalcLine,
    handleRemoveLine,
    autoOpenId,
    autoSearch,
    autoResults,
    autoIdx,
    autoRef,
    openAuto,
    closeAuto,
    handleAutoKey,
    handleProductSelect,
    handleApplyNewProduct,
    barcodeMode,
    setBarcodeMode,
    barcodeRef,
    qtyRefs,
    attachments,
    handleAttach,
    handleRemoveAttach,
    isDirty,
    saving,
    showConfirmClose,
    setShowConfirmClose,
    totalAmount,
    totalPayment,
    isValid,
    handleSubmit,
    requestClose,
    productList,
    supplierList,
    partnerList,
    warehouseList,
  };
};

export default useGoodsReceiptPopup;
