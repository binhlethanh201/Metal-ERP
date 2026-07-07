/**
 * Hook quản lý form Thêm mới / Sửa phiếu xuất kho.
 * Quản lý: header info, dòng hàng hóa, validations, isDirty, submit.
 */
import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../../shared/hooks/useAuth';
import { createGoodsIssue } from '../services/goodsIssueService';
import { buildIssuePayload, buildIssueLine } from '../utils/goodsIssueUtils';

const generateIssueNumber = () => {
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  return `XK${seq}`;
};

export const useGoodsIssueForm = (initialData = null) => {
  const { user } = useAuth();

  const [header, setHeader] = useState({
    issueNumber: initialData?.issueNumber || generateIssueNumber(),
    issueType: initialData?.issueType || 'Xuất kho khác',
    customerId: initialData?.customerId || '',
    customerName: initialData?.customer || '',
    description: initialData?.description || '',
    reference: initialData?.reference || '',
    date: initialData?.date || new Date().toISOString().slice(0, 16),
    createdBy: initialData?.createdBy || user?.name || user?.email || 'Người dùng hiện tại',
  });

  const [lines, setLines] = useState(
    initialData?.lines?.length ? initialData.lines : [buildIssueLine()]
  );

  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [barcodeMode, setBarcodeMode] = useState(false);

  const markDirty = useCallback(() => setIsDirty(true), []);

  const handleHeaderChange = useCallback(
    (field, value) => {
      setHeader((prev) => ({ ...prev, [field]: value }));
      markDirty();
    },
    [markDirty]
  );

  const handleLineChange = useCallback(
    (lineId, field, value) => {
      setLines((prev) =>
        prev.map((line) => (line.id === lineId ? { ...line, [field]: value } : line))
      );
      markDirty();
    },
    [markDirty]
  );

  const handleProductSelect = useCallback(
    (lineId, product) => {
      setLines((prev) =>
        prev.map((line) =>
          line.id === lineId
            ? {
                ...line,
                productId: product.id,
                productCode: product.code,
                productName: product.name,
                unit: product.unit,
                unitPrice: product.price || 0,
                totalAmount: line.quantity * (product.price || 0),
                warehouseId: product.warehouseId || line.warehouseId,
                stock: product.stock,
              }
            : line
        )
      );
      markDirty();
    },
    [markDirty]
  );

  const handleLineQuantityChange = useCallback(
    (lineId, quantity) => {
      setLines((prev) =>
        prev.map((line) =>
          line.id === lineId
            ? {
                ...line,
                quantity: Math.max(0, Number(quantity)),
                totalAmount: Math.round(Math.max(0, Number(quantity)) * line.unitPrice),
              }
            : line
        )
      );
      markDirty();
    },
    [markDirty]
  );

  const handleLinePriceChange = useCallback(
    (lineId, price) => {
      setLines((prev) =>
        prev.map((line) =>
          line.id === lineId
            ? {
                ...line,
                unitPrice: Number(price),
                totalAmount: Math.round(line.quantity * Number(price)),
              }
            : line
        )
      );
      markDirty();
    },
    [markDirty]
  );

  const addLine = useCallback(() => {
    setLines((prev) => [...prev, buildIssueLine()]);
    markDirty();
  }, [markDirty]);

  const removeLine = useCallback(
    (lineId) => {
      setLines((prev) => {
        if (prev.length <= 1) return prev;
        return prev.filter((line) => line.id !== lineId);
      });
      markDirty();
    },
    [markDirty]
  );

  const totalAmount = useMemo(
    () => lines.reduce((sum, line) => sum + line.totalAmount, 0),
    [lines]
  );

  const totalQuantity = useMemo(
    () => lines.reduce((sum, line) => sum + Number(line.quantity), 0),
    [lines]
  );

  const isValid = useMemo(() => {
    if (!header.customerId && !header.customerName) return false;
    if (!header.date) return false;
    const hasValidLine = lines.some((line) => line.productId && Number(line.quantity) > 0);
    return hasValidLine;
  }, [header, lines]);

  const handleSubmit = useCallback(async () => {
    if (!isValid || saving) return false;
    setSaving(true);
    try {
      const payload = buildIssuePayload(header, lines);
      await createGoodsIssue(payload);
      setSaving(false);
      setIsDirty(false);
      return true;
    } catch (error) {
      setSaving(false);
      alert(error?.message || 'Lỗi khi lưu phiếu xuất');
      return false;
    }
  }, [header, lines, isValid, saving]);

  const resetForm = useCallback(() => {
    setHeader({
      issueNumber: generateIssueNumber(),
      issueType: 'Xuất kho khác',
      customerId: '',
      customerName: '',
      description: '',
      reference: '',
      date: new Date().toISOString().slice(0, 16),
      createdBy: user?.name || user?.email || 'Người dùng hiện tại',
    });
    setLines([buildIssueLine()]);
    setIsDirty(false);
  }, [user]);

  return {
    header,
    lines,
    isDirty,
    saving,
    barcodeMode,
    setBarcodeMode,
    totalAmount,
    totalQuantity,
    isValid,
    handleHeaderChange,
    handleLineChange,
    handleProductSelect,
    handleLineQuantityChange,
    handleLinePriceChange,
    addLine,
    removeLine,
    handleSubmit,
    resetForm,
  };
};

export default useGoodsIssueForm;
