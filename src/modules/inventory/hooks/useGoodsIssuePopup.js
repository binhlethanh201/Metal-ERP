/**
 * Hook quản lý toàn bộ state + logic cho Popup Thêm mới Phiếu Xuất Kho.
 *
 * Các logic quan trọng:
 * - Auto-sinh dòng trống khi người dùng nhập vào dòng trống cuối cùng.
 * - Barcode mode: focus luôn ở ô Mã HH, quét xong SL tự +1, focus quay lại.
 * - Lot/HSD chỉ cho phép nhập nếu sản phẩm được chọn có quản lý lô/HSD.
 * - isDirty tracking để cảnh báo khi người dùng muốn đóng popup.
 */
import { useState, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../../../shared/hooks/useAuth';
import {
  productListForExport,
  warehouseList,
  customerList,
  issueTypes,
} from '../data/goodsIssueMockData';

const generateIssueNumber = (() => {
  let seq = 1133;
  return () => {
    seq += 1;
    return `XK${String(seq).padStart(5, '0')}`;
  };
})();

const createEmptyLine = () => ({
  id: `line_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  productId: '',
  productCode: '',
  productName: '',
  unit: '',
  lotNumber: '',
  expiryDate: '',
  warehouseId: 'KHO_TONG',
  warehouseName: 'Kho Tổng',
  location: '',
  quantity: 1,
  unitPrice: 0,
  totalAmount: 0,
  hasLotControl: false,
  hasExpiryControl: false,
  stock: 0,
  isDirty: false, // đã được người dùng chạm vào
});

export const useGoodsIssuePopup = (onClose, editData = null) => {
  const { user } = useAuth();
  const isEditMode = !!editData;

  // ---- Header State ----
  const [header, setHeader] = useState(() => {
    if (editData) {
      return {
        issueNumber: editData.issueNumber || generateIssueNumber(),
        issueType: editData.issueType || 'Xuất kho khác',
        customerId: editData.customerId || '',
        customerName: editData.customer || '',
        description: editData.description || '',
        reference: editData.reference || '',
        date: editData.date
          ? new Date(editData.date).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16),
        createdBy: editData.createdBy || user?.name || user?.email || 'Người dùng hiện tại',
      };
    }
    return {
      issueNumber: generateIssueNumber(),
      issueType: 'Xuất kho khác',
      customerId: '',
      customerName: '',
      description: '',
      reference: '',
      date: new Date().toISOString().slice(0, 16),
      createdBy: user?.name || user?.email || 'Người dùng hiện tại',
    };
  });

  // ---- Lines State ----
  const [lines, setLines] = useState(() => {
    if (editData?.lines && editData.lines.length > 0) {
      const mapped = editData.lines.map((l) => ({
        ...createEmptyLine(),
        id: l.id || `line_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        productId: l.productId || '',
        productCode: l.productCode || '',
        productName: l.productName || '',
        unit: l.unit || '',
        lotNumber: l.lotNumber || '',
        expiryDate: l.expiryDate || '',
        warehouseId: l.warehouseId || 'KHO_TONG',
        warehouseName: l.warehouseName || 'Kho Tổng',
        location: l.location || '',
        quantity: l.quantity || 1,
        unitPrice: l.unitPrice || 0,
        totalAmount: (l.quantity || 1) * (l.unitPrice || 0),
        hasLotControl: l.hasLotControl || false,
        hasExpiryControl: l.hasExpiryControl || false,
        stock: l.stock || 0,
        isDirty: true,
      }));
      return [...mapped, createEmptyLine()];
    }
    return [createEmptyLine()];
  });

  // ---- UI State ----
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [barcodemode, setBarcodemode] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [showQuickAddCustomer, setShowQuickAddCustomer] = useState(false);

  // ---- Autocomplete State ----
  const [autoOpenLineId, setAutoOpenLineId] = useState(null);
  const [autoSearch, setAutoSearch] = useState('');
  const [autoResults, setAutoResults] = useState([]);
  const [autoActiveIdx, setAutoActiveIdx] = useState(-1);
  const autoDropdownRef = useRef(null);
  const autoInputRef = useRef(null);
  const barcodeInputRef = useRef(null);

  // ---- Ref cho tung o input trong bang (dung cho barcode mode) ----
  const lineInputRefs = useRef({});

  // ========== MARK DIRTY ==========
  const markDirty = useCallback(() => setIsDirty(true), []);

  // ========== HEADER HANDLERS ==========
  const handleHeaderChange = useCallback(
    (field, value) => {
      setHeader((prev) => ({ ...prev, [field]: value }));
      markDirty();
    },
    [markDirty]
  );

  // ========== AUTO-GENERATE EMPTY ROW LOGIC ==========
  const ensureTrailingEmptyRow = useCallback((currentLines) => {
    const last = currentLines[currentLines.length - 1];
    // Neu dòng cuoi cung da bi cham vao (isDirty) -> sinh dòng trong moi
    if (last && last.isDirty) {
      return [...currentLines, createEmptyLine()];
    }
    return currentLines;
  }, []);

  const updateLine = useCallback(
    (lineId, updates) => {
      setLines((prev) => {
        const next = prev.map((line) =>
          line.id === lineId ? { ...line, ...updates, isDirty: true } : line
        );
        return ensureTrailingEmptyRow(next);
      });
      markDirty();
    },
    [markDirty, ensureTrailingEmptyRow]
  );

  // ========== PRODUCT AUTOCOMPLETE ==========
  const filterProducts = useCallback((keyword) => {
    if (!keyword || !keyword.trim()) {
      setAutoResults(productListForExport.slice(0, 20));
      return;
    }
    const kw = keyword.trim().toLowerCase();
    const filtered = productListForExport.filter(
      (p) => p.code.toLowerCase().includes(kw) || p.name.toLowerCase().includes(kw)
    );
    setAutoResults(filtered.slice(0, 20));
  }, []);

  const openAutocomplete = useCallback(
    (lineId, currentCode = '') => {
      setAutoOpenLineId(lineId);
      setAutoSearch(currentCode || '');
      setAutoActiveIdx(-1);
      filterProducts(currentCode || '');
    },
    [filterProducts]
  );

  const closeAutocomplete = useCallback(() => {
    setAutoOpenLineId(null);
    setAutoSearch('');
    setAutoResults([]);
    setAutoActiveIdx(-1);
  }, []);

  const handleAutoSearchChange = useCallback(
    (value) => {
      setAutoSearch(value);
      filterProducts(value);
      setAutoActiveIdx(-1);
    },
    [filterProducts]
  );

  // ========== CHON SAN PHAM -> FILL DATA ==========
  const handleProductSelect = useCallback(
    (lineId, product) => {
      setLines((prev) => {
        const next = prev.map((line) =>
          line.id === lineId
            ? {
                ...line,
                productId: product.id,
                productCode: product.code,
                productName: product.name,
                unit: product.unit,
                unitPrice: product.price || 0,
                totalAmount: (line.quantity || 1) * (product.price || 0),
                quantity: line.isDirty ? line.quantity : 1,
                warehouseId: product.warehouseId || line.warehouseId,
                stock: product.stock || 0,
                hasLotControl: product.hasLotControl || false,
                hasExpiryControl: product.hasExpiryControl || false,
                isDirty: true,
              }
            : line
        );
        return ensureTrailingEmptyRow(next);
      });
      markDirty();
      closeAutocomplete();

      // Focus chuyển sang ô Số lượng
      setTimeout(() => {
        const qtyInput = lineInputRefs.current[`qty_${lineId}`];
        if (qtyInput) {
          qtyInput.focus();
          qtyInput.select();
        }
      }, 100);
    },
    [markDirty, ensureTrailingEmptyRow, closeAutocomplete]
  );

  // ========== BARCODE MODE LOGIC ==========
  const handleBarcodeScanned = useCallback(
    (barcode) => {
      const product = productListForExport.find((p) => p.code === barcode);
      if (!product) {
        alert(`Không tìm thấy hàng hóa có mã: ${barcode}`);
        return;
      }

      setLines((prev) => {
        // Tim dòng da co san pham nay (gom nhom)
        const existingIdx = prev.findIndex((line) => line.productId === product.id && line.isDirty);
        let next;
        if (existingIdx >= 0) {
          // Tang Số lượng dòng hien co
          next = prev.map((line, idx) =>
            idx === existingIdx
              ? {
                  ...line,
                  quantity: line.quantity + 1,
                  totalAmount: (line.quantity + 1) * line.unitPrice,
                }
              : line
          );
        } else {
          // Them dòng moi vao truoc dòng trong cuoi cung
          const emptyLine = prev[prev.length - 1];
          const newLine = {
            ...createEmptyLine(),
            id: `barcode_${Date.now()}`,
            productId: product.id,
            productCode: product.code,
            productName: product.name,
            unit: product.unit,
            unitPrice: product.price || 0,
            totalAmount: product.price || 0,
            quantity: 1,
            warehouseId: product.warehouseId || 'KHO_TONG',
            stock: product.stock || 0,
            hasLotControl: product.hasLotControl || false,
            hasExpiryControl: product.hasExpiryControl || false,
            isDirty: true,
          };
          next = emptyLine.isDirty
            ? [...prev.slice(0, -1), newLine, emptyLine]
            : [...prev.slice(0, -1), newLine, createEmptyLine()];
        }
        return next;
      });
      markDirty();

      // Focus lai vao o barcode
      setTimeout(() => {
        if (barcodeInputRef.current) {
          barcodeInputRef.current.value = '';
          barcodeInputRef.current.focus();
        }
      }, 50);
    },
    [markDirty]
  );

  // ========== LINE CRUD ==========
  const handleLineFieldChange = useCallback(
    (lineId, field, value) => {
      updateLine(lineId, { [field]: value });
    },
    [updateLine]
  );

  const handleQuantityChange = useCallback(
    (lineId, rawValue) => {
      const qty = Math.max(0, Number(rawValue) || 0);
      setLines((prev) => {
        const next = prev.map((line) =>
          line.id === lineId
            ? {
                ...line,
                quantity: qty,
                totalAmount: Math.round(qty * line.unitPrice),
                isDirty: true,
              }
            : line
        );
        return ensureTrailingEmptyRow(next);
      });
      markDirty();
    },
    [markDirty, ensureTrailingEmptyRow]
  );

  const handlePriceChange = useCallback(
    (lineId, rawValue) => {
      const price = Math.max(0, Number(rawValue) || 0);
      setLines((prev) => {
        const next = prev.map((line) =>
          line.id === lineId
            ? {
                ...line,
                unitPrice: price,
                totalAmount: Math.round(line.quantity * price),
                isDirty: true,
              }
            : line
        );
        return ensureTrailingEmptyRow(next);
      });
      markDirty();
    },
    [markDirty, ensureTrailingEmptyRow]
  );

  const handleRemoveLine = useCallback(
    (lineId) => {
      setLines((prev) => {
        const dirtyLines = prev.filter((l) => l.isDirty);
        if (dirtyLines.length <= 1) return prev; // Khong Xóa dòng duy nhat
        return prev.filter((line) => line.id !== lineId);
      });
      markDirty();
    },
    [markDirty]
  );

  // ========== KEYBOARD NAVIGATION CHO AUTOCOMPLETE ==========
  const handleAutoKeyDown = useCallback(
    (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setAutoActiveIdx((prev) => Math.min(prev + 1, autoResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setAutoActiveIdx((prev) => Math.max(prev - 1, -1));
      } else if (e.key === 'Enter' && autoActiveIdx >= 0 && autoResults[autoActiveIdx]) {
        e.preventDefault();
        if (autoOpenLineId) {
          handleProductSelect(autoOpenLineId, autoResults[autoActiveIdx]);
        }
      } else if (e.key === 'Escape') {
        closeAutocomplete();
      }
    },
    [autoResults, autoActiveIdx, autoOpenLineId, handleProductSelect, closeAutocomplete]
  );

  // ========== COMPUTED ==========
  const dirtyLines = useMemo(() => lines.filter((l) => l.isDirty), [lines]);

  const totalAmount = useMemo(
    () => dirtyLines.reduce((sum, l) => sum + l.totalAmount, 0),
    [dirtyLines]
  );

  const totalQuantity = useMemo(
    () => dirtyLines.reduce((sum, l) => sum + l.quantity, 0),
    [dirtyLines]
  );

  const isValid = useMemo(() => {
    if (!header.customerId && !header.customerName) return false;
    if (!header.date) return false;
    const hasValidLine = dirtyLines.some((l) => l.productId && l.quantity > 0);
    return hasValidLine;
  }, [header, dirtyLines]);

  // ========== CLOSE LOGIC (WITH isDirty CHECK) ==========
  const requestClose = useCallback(
    (actionType) => {
      if (isDirty) {
        setShowConfirmClose(true);
        return;
      }
      onClose?.();
    },
    [isDirty, onClose]
  );

  const handleConfirmCancel = useCallback(() => {
    setShowConfirmClose(false);
    // Giu nguyen form
  }, []);

  const handleConfirmDiscard = useCallback(() => {
    setShowConfirmClose(false);
    onClose?.();
  }, [onClose]);

  const handleConfirmSave = useCallback(async () => {
    setShowConfirmClose(false);
    const success = await handleSubmit();
    if (success) {
      onClose?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose]);

  // ========== SUBMIT ==========
  const handleSubmit = useCallback(async () => {
    if (!isValid || saving) return false;
    setSaving(true);
    try {
      const payload = {
        IssueNumber: header.issueNumber,
        IssueType: header.issueType,
        CustomerId: header.customerId,
        CustomerName: header.customerName,
        Description: header.description,
        Reference: header.reference,
        Date: header.date,
        CreatedBy: header.createdBy,
        Lines: dirtyLines.map((line, idx) => ({
          LineNumber: idx + 1,
          ProductId: line.productId,
          ProductCode: line.productCode,
          ProductName: line.productName,
          Unit: line.unit,
          LotNumber: line.lotNumber,
          ExpiryDate: line.expiryDate,
          WarehouseId: line.warehouseId,
          Location: line.location,
          Quantity: line.quantity,
          UnitPrice: line.unitPrice,
          TotalAmount: line.totalAmount,
        })),
      };

      // Goi API (hoac fallback)
      try {
        if (isEditMode) {
          const { updateGoodsIssue } = await import('../services/goodsIssueService');
          await updateGoodsIssue(editData.id, payload);
        } else {
          const { createGoodsIssue } = await import('../services/goodsIssueService');
          await createGoodsIssue(payload);
        }
      } catch {
        // Fallback: gia lap luu thanh cong
        console.log(`[demo] ${isEditMode ? 'Cap nhat' : 'Luu'} phiếu xuất:`, payload);
      }

      setSaving(false);
      setIsDirty(false);
      return true;
    } catch (error) {
      setSaving(false);
      alert(error?.message || 'Loi khi luu phiếu xuất');
      return false;
    }
  }, [header, dirtyLines, isValid, isEditMode, editData?.id]);

  // ========== QUICK ADD CUSTOMER ==========
  const handleQuickAddCustomer = useCallback(
    (newCust) => {
      handleHeaderChange('customerId', newCust.code || `KH_${Date.now()}`);
      handleHeaderChange('customerName', newCust.name);
      setShowQuickAddCustomer(false);
    },
    [handleHeaderChange]
  );

  // ========== ATTACH FILE ==========
  const handleAttachFile = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e) => {
      const files = e.target.files;
      if (files?.length) {
        alert(`Da chon ${files.length} file dinh kem (demo)`);
      }
    };
    input.click();
  }, []);

  return {
    // Header
    header,
    handleHeaderChange,
    // Lines
    lines,
    dirtyLines,
    handleLineFieldChange,
    handleQuantityChange,
    handlePriceChange,
    handleRemoveLine,
    // Autocomplete
    autoOpenLineId,
    autoSearch,
    autoResults,
    autoActiveIdx,
    autoDropdownRef,
    autoInputRef,
    openAutocomplete,
    closeAutocomplete,
    handleAutoSearchChange,
    handleAutoKeyDown,
    handleProductSelect,
    // Barcode
    barcodemode,
    setBarcodemode,
    barcodeInputRef,
    handleBarcodeScanned,
    // Refs
    lineInputRefs,
    // UI State
    isDirty,
    saving,
    showConfirmClose,
    showQuickAddCustomer,
    setShowQuickAddCustomer,
    // Totals
    totalAmount,
    totalQuantity,
    isValid,
    // Actions
    handleSubmit,
    requestClose,
    handleConfirmCancel,
    handleConfirmDiscard,
    handleConfirmSave,
    handleQuickAddCustomer,
    handleAttachFile,
    // Data
    customerList,
    issueTypes,
    warehouseList,
    productListForExport,
  };
};

export default useGoodsIssuePopup;
