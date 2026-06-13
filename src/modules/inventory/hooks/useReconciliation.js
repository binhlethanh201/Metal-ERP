import { useState, useMemo, useCallback } from 'react';
import { formatDate } from '../utils/orderUtils';

const generateVoucherNo = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
  return `DS-${y}${m}${d}-${rand}`;
};

export const useReconciliation = (allOrders, selectedOrderIds, onOrdersUpdated) => {
  const [showReconciliation, setShowReconciliation] = useState(false);
  const [reconciliationStep, setReconciliationStep] = useState(1);

  // Orders eligible: unreconciled, filtered from all orders
  const unreconciledOrders = useMemo(
    () => allOrders.filter((o) => o.reconciliationStatus !== 'Đã đối soát'),
    [allOrders]
  );

  // Pre-select from checked rows that are unreconciled
  const [reconciliationOrderIds, setReconciliationOrderIds] = useState(new Set());

  const [reconSearch, setReconSearch] = useState('');

  // Search-filtered unreconciled orders
  const searchedOrders = useMemo(() => {
    const q = reconSearch.toLowerCase().trim();
    if (!q) return unreconciledOrders;
    return unreconciledOrders.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.recipientName.toLowerCase().includes(q) ||
        o.recipientPhone.includes(q) ||
        (o.invoiceNo && o.invoiceNo.toLowerCase().includes(q)) ||
        (o.trackingCode && o.trackingCode.toLowerCase().includes(q))
    );
  }, [unreconciledOrders, reconSearch]);

  const reconciliationOrders = useMemo(
    () => unreconciledOrders.filter((o) => reconciliationOrderIds.has(o.id)),
    [unreconciledOrders, reconciliationOrderIds]
  );

  const [reconciliationData, setReconciliationData] = useState({
    voucherNo: '',
    date: formatDate(new Date()),
    paymentMethod: 'Chuyển khoản',
    actualCollected: '',
    note: '',
  });

  const reconciliationSummary = useMemo(() => {
    const orders = reconciliationOrders;
    return {
      count: orders.length,
      totalPayment: orders.reduce((s, o) => s + o.totalPayment, 0),
      totalDeposit: orders.reduce((s, o) => s + o.deposit, 0),
      totalCod: orders.reduce((s, o) => s + o.codAmount, 0),
      totalRemaining: orders.reduce((s, o) => s + o.remainingToCollect, 0),
      totalShippingCustomer: orders.reduce((s, o) => s + o.shippingFeeCustomer, 0),
      totalShippingPartner: orders.reduce((s, o) => s + o.shippingFeePartner, 0),
      totalCustomerDebt: orders.reduce((s, o) => s + o.customerDebt, 0),
    };
  }, [reconciliationOrders]);

  const openReconciliation = useCallback(() => {
    // Pre-select currently checked orders that are unreconciled
    const preselected = new Set(
      [...selectedOrderIds].filter((id) => unreconciledOrders.some((o) => o.id === id))
    );
    setReconciliationOrderIds(preselected);
    setReconciliationData({
      voucherNo: generateVoucherNo(),
      date: formatDate(new Date()),
      paymentMethod: 'Chuyển khoản',
      actualCollected: '',
      note: '',
    });
    setReconciliationStep(1);
    setReconSearch('');
    setShowReconciliation(true);
  }, [selectedOrderIds, unreconciledOrders]);

  const closeReconciliation = useCallback(() => {
    setShowReconciliation(false);
  }, []);

  const toggleReconciliationOrder = useCallback((id) => {
    setReconciliationOrderIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleAllReconciliationOrders = useCallback(() => {
    if (reconciliationOrderIds.size === searchedOrders.length && searchedOrders.length > 0) {
      setReconciliationOrderIds(new Set());
    } else {
      setReconciliationOrderIds((prev) => {
        const next = new Set(prev);
        searchedOrders.forEach((o) => next.add(o.id));
        return next;
      });
    }
  }, [reconciliationOrderIds, searchedOrders]);

  const submitReconciliation = useCallback(() => {
    const voucherNo = reconciliationData.voucherNo;
    if (onOrdersUpdated) {
      onOrdersUpdated([...reconciliationOrderIds], voucherNo);
    }
    setShowReconciliation(false);
  }, [reconciliationData, reconciliationOrderIds, onOrdersUpdated]);

  const canProceed = reconciliationOrderIds.size > 0;

  return {
    showReconciliation,
    reconciliationStep,
    setReconciliationStep,
    unreconciledOrders,
    searchedOrders,
    reconSearch,
    setReconSearch,
    reconciliationOrderIds,
    reconciliationOrders,
    reconciliationData,
    setReconciliationData,
    reconciliationSummary,
    canProceed,
    openReconciliation,
    closeReconciliation,
    toggleReconciliationOrder,
    toggleAllReconciliationOrders,
    submitReconciliation,
  };
};
