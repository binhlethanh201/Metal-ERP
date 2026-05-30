/**
 * Hook quản lý Báo cáo Tổng hợp Tồn kho.
 * Xử lý: tham số báo cáo (kỳ, ngày, kho, gộp kho, chỉ phát sinh),
 * fetch/lọc dữ liệu, tính toán tồn cuối, tổng cộng.
 */
import { useState, useMemo } from 'react';
import { reportRows } from '../data/reportMockData';

const getMonthRange = (preset) => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  switch (preset) {
    case 'thisMonth':
      return {
        from: new Date(y, m, 1).toISOString().slice(0, 10),
        to: new Date(y, m + 1, 0).toISOString().slice(0, 10),
      };
    case 'lastMonth':
      return {
        from: new Date(y, m - 1, 1).toISOString().slice(0, 10),
        to: new Date(y, m, 0).toISOString().slice(0, 10),
      };
    case 'thisQuarter':
      return {
        from: new Date(y, Math.floor(m / 3) * 3, 1).toISOString().slice(0, 10),
        to: new Date(y, Math.floor(m / 3) * 3 + 3, 0).toISOString().slice(0, 10),
      };
    case 'thisYear':
      return {
        from: new Date(y, 0, 1).toISOString().slice(0, 10),
        to: new Date(y, 11, 31).toISOString().slice(0, 10),
      };
    default:
      return null;
  }
};

export const useInventoryReport = () => {
  const [showParams, setShowParams] = useState(false);
  const [applied, setApplied] = useState(true); // Mặc định hiển thị dữ liệu luôn

  // Tham số trong popup (có thể chưa apply)
  const [period, setPeriod] = useState('thisMonth');
  const [dateFrom, setDateFrom] = useState(() => {
    const r = getMonthRange('thisMonth');
    return r ? r.from : '';
  });
  const [dateTo, setDateTo] = useState(() => {
    const r = getMonthRange('thisMonth');
    return r ? r.to : '';
  });
  const [selectedWarehouses, setSelectedWarehouses] = useState(['Tất cả']);
  const [mergeWarehouses, setMergeWarehouses] = useState(true);
  const [onlyWithMovement, setOnlyWithMovement] = useState(false);

  // Pagination
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // Tham số đã apply (dùng để hiển thị filter chips)
  const [appliedParams, setAppliedParams] = useState({
    period: 'thisMonth',
    dateFrom: dateFrom,
    dateTo: dateTo,
    warehouses: ['Tất cả'],
    mergeWarehouses: true,
    onlyWithMovement: false,
  });

  const handlePeriodChange = (value) => {
    setPeriod(value);
    if (value !== 'custom') {
      const range = getMonthRange(value);
      if (range) {
        setDateFrom(range.from);
        setDateTo(range.to);
      }
    }
  };

  const handleDateChange = (field, value) => {
    if (field === 'from') setDateFrom(value);
    else setDateTo(value);
    setPeriod('custom');
  };

  const handleWarehouseToggle = (wh) => {
    setSelectedWarehouses((prev) => {
      if (wh === 'Tất cả') return ['Tất cả'];
      const withoutAll = prev.filter((w) => w !== 'Tất cả');
      if (prev.includes(wh)) {
        const next = withoutAll.filter((w) => w !== wh);
        return next.length === 0 ? ['Tất cả'] : next;
      }
      return [...withoutAll, wh];
    });
  };

  const handleApply = () => {
    setAppliedParams({
      period,
      dateFrom,
      dateTo,
      warehouses: [...selectedWarehouses],
      mergeWarehouses,
      onlyWithMovement,
    });
    setApplied(true);
    setShowParams(false);
  };

  const handleOpenParams = () => {
    setPeriod(appliedParams.period);
    setDateFrom(appliedParams.dateFrom);
    setDateTo(appliedParams.dateTo);
    setSelectedWarehouses([...appliedParams.warehouses]);
    setMergeWarehouses(appliedParams.mergeWarehouses);
    setOnlyWithMovement(appliedParams.onlyWithMovement);
    setShowParams(true);
  };

  // Lọc & tính toán dữ liệu
  const filteredRows = useMemo(() => {
    let rows = [...reportRows];

    // Lọc theo kho
    const isAllWarehouses = appliedParams.warehouses.includes('Tất cả');
    if (!isAllWarehouses) {
      rows = rows.filter((r) => appliedParams.warehouses.includes(r.warehouse));
    }

    // Lọc chỉ có phát sinh
    if (appliedParams.onlyWithMovement) {
      rows = rows.filter((r) => r.inQty > 0 || r.outQty > 0);
    }

    // Cộng gộp kho
    if (appliedParams.mergeWarehouses) {
      const merged = {};
      rows.forEach((r) => {
        const key = r.productCode;
        if (!merged[key]) {
          merged[key] = { ...r, warehouse: 'Tất cả' };
        } else {
          merged[key].beginQty += r.beginQty;
          merged[key].beginValue += r.beginValue;
          merged[key].inQty += r.inQty;
          merged[key].inValue += r.inValue;
          merged[key].outQty += r.outQty;
          merged[key].outValue += r.outValue;
          merged[key].endQty += r.endQty;
          merged[key].endValue += r.endValue;
        }
      });
      rows = Object.values(merged);
    }

    // Tự tính tồn cuối = đầu + nhập - xuất
    rows = rows.map((r) => ({
      ...r,
      endQty: r.beginQty + r.inQty - r.outQty,
      endValue: r.beginValue + r.inValue - r.outValue,
    }));

    return rows;
  }, [appliedParams]);

  // Tổng cộng
  const totals = useMemo(() => {
    return filteredRows.reduce(
      (acc, r) => ({
        beginQty: acc.beginQty + r.beginQty,
        beginValue: acc.beginValue + r.beginValue,
        inQty: acc.inQty + r.inQty,
        inValue: acc.inValue + r.inValue,
        outQty: acc.outQty + r.outQty,
        outValue: acc.outValue + r.outValue,
        endQty: acc.endQty + r.endQty,
        endValue: acc.endValue + r.endValue,
      }),
      {
        beginQty: 0,
        beginValue: 0,
        inQty: 0,
        inValue: 0,
        outQty: 0,
        outValue: 0,
        endQty: 0,
        endValue: 0,
      }
    );
  }, [filteredRows]);

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('vi-VN');
  };

  return {
    // Popup state
    showParams,
    setShowParams,
    period,
    setPeriod: handlePeriodChange,
    dateFrom,
    setDateFrom: (v) => handleDateChange('from', v),
    dateTo,
    setDateTo: (v) => handleDateChange('to', v),
    selectedWarehouses,
    handleWarehouseToggle,
    mergeWarehouses,
    setMergeWarehouses,
    onlyWithMovement,
    setOnlyWithMovement,
    handleApply,
    handleOpenParams,
    // Applied params
    applied,
    appliedParams,
    // Data
    filteredRows,
    pagedRows: filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    totals,
    totalCount: filteredRows.length,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    formatDate,
  };
};

export default useInventoryReport;
