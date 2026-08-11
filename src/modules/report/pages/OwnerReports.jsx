// src/modules/report/pages/OwnerReports.jsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';

import {
  getDailyEndReport,
  getStockMovementReport,
  getRevenueByTimeReport,
  getLowStockReport,
  getProductProfitReport,
  getSupplierDetailReport,
} from '../services/reportService';
import { getSuppliers } from '../../inventory/services/supplierService';
import { getProducts, getCategories } from '../../inventory/services/productService';
import { useReport } from '../hooks/useReport';

import { ReportFilters } from '../components/ReportFilters';
import { DailyEndReport } from '../components/DailyEndReport';
import { StockMovementReport } from '../components/StockMovementReport';
import { RevenueByTimeReport } from '../components/RevenueByTimeReport';
import { LowStockReport } from '../components/LowStockReport';
import { ProductProfitReport } from '../components/ProductProfitReport';
import { SupplierDetailReport } from '../components/SupplierDetailReport';
import { exportStockReportToExcel } from '../utils/reportUtils';

export const OwnerReports = () => {
  const defaultToDate = new Date().toISOString().split('T')[0];
  const defaultFromDate = new Date(new Date().setDate(new Date().getDate() - 30))
    .toISOString()
    .split('T')[0];
  const defaultDate = new Date().toISOString().split('T')[0];

  // ============ STATES ============
  const [selectedReport, setSelectedReport] = useState('daily-end');
  const [reportDate, setReportDate] = useState(defaultDate);
  const [fromDate, setFromDate] = useState(defaultFromDate);
  const [toDate, setToDate] = useState(defaultToDate);
  const [categoryId, setCategoryId] = useState('');
  const [productId, setProductId] = useState('');
  const [productStatus, setProductStatus] = useState('all'); // all | active | deleted
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [timeGrouping, setTimeGrouping] = useState('day');
  const [includeZeroStock, setIncludeZeroStock] = useState(false);
  const [sortBy, setSortBy] = useState('revenue');
  const [pageSize] = useState(20);
  const [supplierId, setSupplierId] = useState('');
  const [purchaseFromDate, setPurchaseFromDate] = useState('');
  const [purchaseToDate, setPurchaseToDate] = useState('');
  const [paymentFromDate, setPaymentFromDate] = useState('');
  const [paymentToDate, setPaymentToDate] = useState('');

  // ============ HOOKS ============
  const {
    data: dailyEndData,
    isLoading: loadingDailyEnd,
    error: dailyEndError,
    execute: fetchDailyEnd,
  } = useReport(getDailyEndReport);

  const {
    data: movementData,
    isLoading: loadingStockMovement,
    error: stockMovementError,
    execute: fetchStockMovement,
  } = useReport(getStockMovementReport);

  const {
    data: revenueData,
    isLoading: loadingRevenue,
    error: revenueError,
    execute: fetchRevenue,
  } = useReport(getRevenueByTimeReport);

  const {
    data: lowStockData,
    isLoading: loadingLowStock,
    error: lowStockError,
    execute: fetchLowStock,
  } = useReport(getLowStockReport);

  const {
    data: productProfitData,
    isLoading: loadingProductProfit,
    error: productProfitError,
    execute: fetchProductProfit,
  } = useReport(getProductProfitReport);

  const {
    data: supplierDetailData,
    isLoading: loadingSupplierDetail,
    error: supplierDetailError,
    execute: fetchSupplierDetail,
  } = useReport(getSupplierDetailReport);

  // ============ DERIVED STATE ============
  const selectedError = useMemo(() => {
    switch (selectedReport) {
      case 'daily-end':
        return dailyEndError;
      case 'stock-movement':
        return stockMovementError;
      case 'revenue-by-time':
        return revenueError;
      case 'low-stock':
        return lowStockError;
      case 'product-profit':
        return productProfitError;
      case 'supplier-detail':
        return supplierDetailError;
      default:
        return null;
    }
  }, [
    selectedReport,
    dailyEndError,
    stockMovementError,
    revenueError,
    lowStockError,
    productProfitError,
    supplierDetailError,
  ]);

  const selectedLoading = useMemo(() => {
    switch (selectedReport) {
      case 'daily-end':
        return loadingDailyEnd;
      case 'stock-movement':
        return loadingStockMovement;
      case 'revenue-by-time':
        return loadingRevenue;
      case 'low-stock':
        return loadingLowStock;
      case 'product-profit':
        return loadingProductProfit;
      case 'supplier-detail':
        return loadingSupplierDetail;
      default:
        return false;
    }
  }, [
    selectedReport,
    loadingDailyEnd,
    loadingStockMovement,
    loadingRevenue,
    loadingLowStock,
    loadingProductProfit,
    loadingSupplierDetail,
  ]);

  const productProfitItems = useMemo(() => {
    if (!productProfitData) return [];
    if (Array.isArray(productProfitData)) return productProfitData;
    return productProfitData.items || productProfitData.data || [];
  }, [productProfitData]);

  const productProfitTotals = useMemo(() => {
    const totalRevenue =
      productProfitData?.totalRevenue ??
      productProfitItems.reduce((sum, item) => sum + (item.revenue || 0), 0);
    const totalCost =
      productProfitData?.totalCost ??
      productProfitItems.reduce((sum, item) => sum + (item.cost || 0), 0);
    const totalProfit =
      productProfitData?.totalProfit ??
      productProfitItems.reduce((sum, item) => sum + (item.profit || 0), 0);
    const averageProfitMargin =
      productProfitData?.averageProfitMargin ??
      (totalRevenue ? (totalProfit / totalRevenue) * 100 : 0);
    const totalQuantitySold =
      productProfitData?.totalQuantitySold ??
      productProfitItems.reduce((sum, item) => sum + (item.quantitySold || 0), 0);
    return { totalRevenue, totalCost, totalProfit, averageProfitMargin, totalQuantitySold };
  }, [productProfitData, productProfitItems]);

  const supplierPurchaseHistory = useMemo(() => {
    if (!supplierDetailData) return [];
    return (
      supplierDetailData.purchaseHistory ||
      supplierDetailData.purchaseOrders ||
      supplierDetailData.purchases ||
      []
    );
  }, [supplierDetailData]);

  const supplierPaymentHistory = useMemo(() => {
    if (!supplierDetailData) return [];
    return supplierDetailData.paymentHistory || supplierDetailData.payments || [];
  }, [supplierDetailData]);

  const hasDataToExport = useMemo(() => {
    if (selectedReport === 'stock-movement') return (movementData?.items?.length || 0) > 0;
    if (selectedReport === 'revenue-by-time') return (revenueData?.tableData?.length || 0) > 0;
    if (selectedReport === 'low-stock') return (lowStockData?.items?.length || 0) > 0;
    if (selectedReport === 'product-profit') return (productProfitItems?.length || 0) > 0;
    if (selectedReport === 'supplier-detail') return (supplierPurchaseHistory?.length || 0) > 0;
    return false;
  }, [
    selectedReport,
    movementData,
    revenueData,
    lowStockData,
    productProfitItems,
    supplierPurchaseHistory,
  ]);

  // ============ HANDLERS ============
  const handleDownload = () => {
    const info = { fromDate, toDate };
    if (selectedReport === 'stock-movement' && movementData?.items) {
      exportStockReportToExcel(movementData.items, info, 'Bao_Cao_Xuat_Nhap_Ton');
    } else if (selectedReport === 'revenue-by-time' && revenueData?.tableData) {
      exportStockReportToExcel(revenueData.tableData, info, 'Bao_Cao_Doanh_Thu');
    } else if (selectedReport === 'low-stock' && lowStockData?.items) {
      exportStockReportToExcel(lowStockData.items, info, 'Bao_Cao_Ton_Kho_Sap_Het');
    } else if (selectedReport === 'product-profit' && productProfitItems?.length > 0) {
      exportStockReportToExcel(productProfitItems, info, 'Bao_Cao_Loi_Nhuan_SP');
    } else if (selectedReport === 'supplier-detail' && supplierPurchaseHistory?.length > 0) {
      exportStockReportToExcel(supplierPurchaseHistory, info, 'Lich_Su_Nhap_Hang_NCC');
    }
  };

  // FIX: dùng useCallback với đầy đủ dependencies để tránh stale closure.
  // Trước đây loadReport là hàm thường bên trong component → closure capture giá trị state
  // tại thời điểm render — khi filter thay đổi mà không re-render đúng cách thì API vẫn
  // gọi với giá trị cũ.
  const loadReport = useCallback(async () => {
    switch (selectedReport) {
      case 'daily-end':
        await fetchDailyEnd({ date: reportDate });
        break;

      case 'stock-movement': {
        const movementPayload = { fromDate, toDate, productId: productId || null };
        if (categoryId) movementPayload.categoryName = categoryId;
        await fetchStockMovement(movementPayload);
        break;
      }

      case 'revenue-by-time':
        await fetchRevenue({ fromDate, toDate, timeGrouping });
        break;

      case 'low-stock':
        await fetchLowStock({ includeZeroStock });
        break;

      case 'product-profit': {
        const profitPayload = { fromDate, toDate, sortBy, pageNumber: 1, pageSize };
        if (categoryId) profitPayload.categoryName = categoryId;
        await fetchProductProfit(profitPayload);
        break;
      }

      case 'supplier-detail': {
        if (!supplierId) return;
        const supplierPayload = { supplierId };
        if (purchaseFromDate) supplierPayload.purchaseFromDate = purchaseFromDate;
        if (purchaseToDate) supplierPayload.purchaseToDate = purchaseToDate;
        if (paymentFromDate) supplierPayload.paymentFromDate = paymentFromDate;
        if (paymentToDate) supplierPayload.paymentToDate = paymentToDate;
        await fetchSupplierDetail(supplierPayload);
        break;
      }

      default:
        break;
    }
  }, [
    selectedReport,
    reportDate,
    fromDate,
    toDate,
    categoryId,
    productId,
    timeGrouping,
    includeZeroStock,
    sortBy,
    pageSize,
    supplierId,
    purchaseFromDate,
    purchaseToDate,
    paymentFromDate,
    paymentToDate,
    fetchDailyEnd,
    fetchStockMovement,
    fetchRevenue,
    fetchLowStock,
    fetchProductProfit,
    fetchSupplierDetail,
  ]);

  // ============ EFFECTS ============
  useEffect(() => {
    let isMounted = true;

    const loadStaticData = async () => {
      try {
        const supplierResponse = await getSuppliers({
          pageNumber: 1,
          pageSize: 200,
          status: 'active',
        });
        if (isMounted && supplierResponse?.success && supplierResponse.data) {
          const list = supplierResponse.data.items || supplierResponse.data || [];
          setSuppliers(list);
          if (list.length > 0) setSupplierId(list[0].id || list[0].supplierId);
        }
      } catch (error) {
        console.error('Không tải được danh sách nhà cung cấp:', error);
      }
    };

    loadStaticData();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        const res = await getCategories();
        if (isMounted && res?.success && res.data) {
          const raw = res.data.items || res.data || [];
          const normalized = raw.map((c) =>
            typeof c === 'string' ? { id: c, name: c } : { id: c.id ?? c.name, name: c.name }
          );
          setCategories(normalized);
        }
      } catch (error) {
        console.error('Lỗi tải danh mục:', error);
      }
    };

    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadFilteredProducts = async () => {
      try {
        const selectedCatName = categories.find((c) => c.id === categoryId)?.name;
        const res = await getProducts({
          pageNumber: 1,
          pageSize: 1000,
          categoryName: selectedCatName || undefined,
        });
        if (isMounted && res?.success && res.data) {
          setProducts(res.data.items || res.data || []);
        }
      } catch (error) {
        console.error('Lỗi tải sản phẩm:', error);
      }
    };

    loadFilteredProducts();
    return () => {
      isMounted = false;
    };
  }, [categoryId, categories]);

  // Khi chuyển tab báo cáo hoặc đổi supplier → load lại báo cáo
  // loadReport là stable useCallback nên không cần eslint-disable
  useEffect(() => {
    if (selectedReport === 'supplier-detail' && !supplierId) return;
    loadReport();
  }, [selectedReport, supplierId, loadReport]);

  // ============ RENDER ============
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-[#e5e5e5]">
            Báo cáo Tổng hợp
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-[#999999]">
            Phân tích dữ liệu kinh doanh và vận hành hệ thống
          </p>
        </div>
      </div>

      <ReportFilters
        selectedReport={selectedReport}
        onSelectReport={setSelectedReport}
        reportDate={reportDate}
        onReportDateChange={setReportDate}
        fromDate={fromDate}
        onFromDateChange={setFromDate}
        toDate={toDate}
        onToDateChange={setToDate}
        categoryId={categoryId}
        onCategoryChange={setCategoryId}
        categories={categories}
        productId={productId}
        onProductChange={setProductId}
        products={products}
        productStatus={productStatus}
        onProductStatusChange={setProductStatus}
        timeGrouping={timeGrouping}
        onTimeGroupingChange={setTimeGrouping}
        includeZeroStock={includeZeroStock}
        onIncludeZeroStockChange={setIncludeZeroStock}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        supplierId={supplierId}
        onSupplierChange={setSupplierId}
        suppliers={suppliers}
        purchaseFromDate={purchaseFromDate}
        onPurchaseFromDateChange={setPurchaseFromDate}
        purchaseToDate={purchaseToDate}
        onPurchaseToDateChange={setPurchaseToDate}
        paymentFromDate={paymentFromDate}
        onPaymentFromDateChange={setPaymentFromDate}
        paymentToDate={paymentToDate}
        onPaymentToDateChange={setPaymentToDate}
        onFilter={loadReport}
        onDownload={handleDownload}
        isLoading={selectedLoading}
        hasDataToExport={hasDataToExport}
      />

      {selectedError && (
        <div className="flex items-center rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-sm">
          <AlertTriangle className="mr-2 h-5 w-5 flex-shrink-0 text-red-600" />
          <span>{selectedError}</span>
        </div>
      )}

      <div className="space-y-6">
        {selectedReport === 'daily-end' && <DailyEndReport data={dailyEndData} />}
        {selectedReport === 'stock-movement' && (
          <StockMovementReport data={movementData} isLoading={loadingStockMovement} fromDate={fromDate} toDate={toDate} productStatus={productStatus} />
        )}
        {selectedReport === 'revenue-by-time' && (
          <RevenueByTimeReport data={revenueData} isLoading={loadingRevenue} />
        )}
        {selectedReport === 'low-stock' && (
          <LowStockReport data={lowStockData} isLoading={loadingLowStock} />
        )}
        {selectedReport === 'product-profit' && (
          <ProductProfitReport
            data={productProfitData}
            items={productProfitItems}
            totals={productProfitTotals}
            isLoading={loadingProductProfit}
          />
        )}
        {selectedReport === 'supplier-detail' && (
          <SupplierDetailReport
            data={supplierDetailData}
            purchaseHistory={supplierPurchaseHistory}
            paymentHistory={supplierPaymentHistory}
            isLoading={loadingSupplierDetail}
          />
        )}
      </div>
    </div>
  );
};

export default OwnerReports;
