import { useState, useEffect, useMemo } from 'react';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { Table } from '../../../shared/components/Table';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import {
  getDailyEndReport,
  getStockMovementReport,
  getRevenueByTimeReport,
  getLowStockReport,
  getProductProfitReport,
  getSupplierDetailReport,
} from '../services/reportService';
import { getBranches } from '../../owner/services/branchService';
import { getProducts } from '../../inventory/services/inventoryService';
import { getSuppliers } from '../../inventory/services/supplierService';
import { useReport } from '../hooks/useReport';

// Import Recharts
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const REPORT_TYPES = [
  { key: 'daily-end', label: 'Báo cáo cuối ngày' },
  { key: 'stock-movement', label: 'Báo cáo xuất nhập tồn' },
  { key: 'revenue-by-time', label: 'Doanh thu theo thời gian' },
  { key: 'low-stock', label: 'Tồn kho sắp hết' },
  { key: 'product-profit', label: 'Lợi nhuận theo sản phẩm' },
  { key: 'supplier-detail', label: 'Chi tiết nhà cung cấp' },
];

const STOCK_COLUMNS = [
  { key: 'productCode', header: 'Mã SP' },
  { key: 'productName', header: 'Tên sản phẩm' },
  { key: 'categoryName', header: 'Nhóm' },
  { key: 'openingStock', header: 'Đầu kỳ' },
  { key: 'inwardQuantity', header: 'Nhập' },
  { key: 'outwardQuantity', header: 'Xuất' },
  { key: 'closingStock', header: 'Cuối kỳ' },
  { key: 'openingValue', header: 'Giá trị đầu kỳ', render: (v) => formatCurrency(v) },
  { key: 'inwardValue', header: 'Giá trị nhập', render: (v) => formatCurrency(v) },
  { key: 'outwardValue', header: 'Giá trị xuất', render: (v) => formatCurrency(v) },
  { key: 'closingValue', header: 'Giá trị cuối kỳ', render: (v) => formatCurrency(v) },
];

const LOW_STOCK_COLUMNS = [
  { key: 'productCode', header: 'Mã SP' },
  { key: 'productName', header: 'Tên sản phẩm' },
  { key: 'categoryName', header: 'Nhóm' },
  { key: 'currentStock', header: 'Tồn hiện tại' },
  { key: 'minimumStock', header: 'Tồn tối thiểu' },
  { key: 'shortage', header: 'Chênh lệch' },
  { key: 'severity', header: 'Mức độ' },
];

const PRODUCT_PROFIT_COLUMNS = [
  { key: 'productCode', header: 'Mã SP' },
  { key: 'productName', header: 'Tên sản phẩm' },
  { key: 'categoryName', header: 'Nhóm' },
  { key: 'quantitySold', header: 'SL Bán' },
  { key: 'revenue', header: 'Doanh thu', render: (v) => formatCurrency(v) },
  { key: 'cost', header: 'Giá vốn', render: (v) => formatCurrency(v) },
  { key: 'profit', header: 'Lợi nhuận', render: (v) => formatCurrency(v) },
  {
    key: 'profitMargin',
    header: 'Biên LN',
    render: (v) => <span className="font-semibold text-purple-600">{v}%</span>,
  },
];

const PURCHASE_COLUMNS = [
  { key: 'orderCode', header: 'Mã đơn' },
  { key: 'createdAt', header: 'Ngày tạo' },
  { key: 'totalAmount', header: 'Tổng tiền', render: (v) => formatCurrency(v) },
  { key: 'status', header: 'Trạng thái' },
];

const PAYMENT_COLUMNS = [
  { key: 'paymentId', header: 'Mã thanh toán' },
  { key: 'createdAt', header: 'Ngày thanh toán' },
  { key: 'amount', header: 'Số tiền', render: (v) => formatCurrency(v) },
  { key: 'note', header: 'Ghi chú' },
];

export const OwnerReports = () => {
  const defaultToDate = new Date().toISOString().split('T')[0];
  const defaultFromDate = new Date(new Date().setDate(new Date().getDate() - 30))
    .toISOString()
    .split('T')[0];
  const defaultDate = new Date().toISOString().split('T')[0];

  const [selectedReport, setSelectedReport] = useState('daily-end');
  const [reportDate, setReportDate] = useState(defaultDate);
  const [fromDate, setFromDate] = useState(defaultFromDate);
  const [toDate, setToDate] = useState(defaultToDate);
  const [branchId, setBranchId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [productId, setProductId] = useState('');
  const [branches, setBranches] = useState([]);
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

  useEffect(() => {
    let isMounted = true;
    const loadStaticData = async () => {
      try {
        const branchResponse = await getBranches();
        if (isMounted && branchResponse?.success && branchResponse.data) {
          setBranches(branchResponse.data.items || branchResponse.data || []);
        }
      } catch (error) {
        console.error('Không tải được danh sách chi nhánh:', error);
      }

      try {
        const supplierResponse = await getSuppliers({
          pageNumber: 1,
          pageSize: 200,
          status: 'active',
        });
        if (isMounted && supplierResponse?.success && supplierResponse.data) {
          setSuppliers(supplierResponse.data.items || supplierResponse.data || []);
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
    const loadProductFilters = async () => {
      try {
        const productResponse = await getProducts({
          pageNumber: 1,
          pageSize: 200,
          status: 'active',
          branchId: branchId || undefined,
        });
        if (isMounted && productResponse?.success && productResponse.data) {
          const productList = productResponse.data.items || productResponse.data || [];
          setProducts(productList);
          const uniqueCategories = Array.from(
            new Set(
              productList
                .map((product) => product.categoryName || product.group || '')
                .filter(Boolean)
            )
          );
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error('Không tải được sản phẩm:', error);
      }
    };
    loadProductFilters();
    return () => {
      isMounted = false;
    };
  }, [branchId]);

  const loadReport = async () => {
    switch (selectedReport) {
      case 'daily-end':
        await fetchDailyEnd({ date: reportDate, branchId: branchId || null });
        break;
      case 'stock-movement':
        await fetchStockMovement({
          fromDate,
          toDate,
          branchId: branchId || null,
          categoryId: categoryId || null,
          productId: productId || null,
        });
        break;
      case 'revenue-by-time':
        await fetchRevenue({
          fromDate,
          toDate,
          branchId: branchId || null,
          timeGrouping,
        });
        break;
      case 'low-stock':
        await fetchLowStock({
          branchId: branchId || null,
          includeZeroStock,
        });
        break;
      case 'product-profit':
        await fetchProductProfit({
          fromDate,
          toDate,
          branchId: branchId || null,
          categoryId: categoryId || null,
          sortBy,
          pageNumber: 1,
          pageSize,
        });
        break;
      case 'supplier-detail':
        await fetchSupplierDetail({
          supplierId,
          purchaseFromDate: purchaseFromDate || null,
          purchaseToDate: purchaseToDate || null,
          paymentFromDate: paymentFromDate || null,
          paymentToDate: paymentToDate || null,
        });
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReport]);

  const renderReportHeader = () => {
    switch (selectedReport) {
      case 'daily-end':
        return 'Báo cáo cuối ngày';
      case 'stock-movement':
        return 'Báo cáo xuất nhập tồn';
      case 'revenue-by-time':
        return 'Báo cáo doanh thu theo thời gian';
      case 'low-stock':
        return 'Báo cáo tồn kho sắp hết';
      case 'product-profit':
        return 'Báo cáo doanh thu/lợi nhuận theo sản phẩm';
      case 'supplier-detail':
        return 'Chi tiết nhà cung cấp';
      default:
        return 'Báo cáo';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Báo cáo</h1>
        <p className="mt-1 text-gray-600">
          Sử dụng API báo cáo để tải và xem dữ liệu theo từng loại.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {REPORT_TYPES.map((report) => (
            <button
              key={report.key}
              onClick={() => setSelectedReport(report.key)}
              className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                selectedReport === report.key
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {report.label}
            </button>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 lg:col-span-1">
            <h2 className="mb-4 text-lg font-bold text-slate-800">{renderReportHeader()}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {selectedReport === 'daily-end' && (
                <>
                  <Input
                    label="Ngày"
                    type="date"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                  />
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Chi nhánh
                    </label>
                    <select
                      value={branchId}
                      onChange={(e) => setBranchId(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">-- Lấy theo token --</option>
                      {branches.map((branch) => (
                        <option
                          key={branch.branchId || branch.id}
                          value={branch.branchId || branch.id}
                        >
                          {branch.branchName || branch.branchCode || branch.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {selectedReport === 'stock-movement' && (
                <>
                  <Input
                    label="Từ ngày"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                  <Input
                    label="Đến ngày"
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Chi nhánh
                    </label>
                    <select
                      value={branchId}
                      onChange={(e) => {
                        setBranchId(e.target.value);
                        setCategoryId('');
                        setProductId('');
                      }}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">-- Lấy theo token --</option>
                      {branches.map((branch) => (
                        <option
                          key={branch.branchId || branch.id}
                          value={branch.branchId || branch.id}
                        >
                          {branch.branchName || branch.branchCode || branch.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Nhóm sản phẩm
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">-- Không bắt buộc --</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Sản phẩm
                    </label>
                    <select
                      value={productId}
                      onChange={(e) => setProductId(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">-- Không bắt buộc --</option>
                      {products.map((product) => (
                        <option
                          key={product.productId || product.id}
                          value={product.productId || product.id}
                        >
                          {product.productCode || product.code} -{' '}
                          {product.productName || product.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {selectedReport === 'revenue-by-time' && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Nhóm theo
                    </label>
                    <select
                      value={timeGrouping}
                      onChange={(e) => setTimeGrouping(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="day">Theo ngày</option>
                      <option value="week">Theo tuần</option>
                      <option value="month">Theo tháng</option>
                    </select>
                  </div>
                  <Input
                    label="Từ ngày"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                  <Input
                    label="Đến ngày"
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Chi nhánh
                    </label>
                    <select
                      value={branchId}
                      onChange={(e) => setBranchId(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">-- Lấy theo token --</option>
                      {branches.map((branch) => (
                        <option
                          key={branch.branchId || branch.id}
                          value={branch.branchId || branch.id}
                        >
                          {branch.branchName || branch.branchCode || branch.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {selectedReport === 'low-stock' && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Chi nhánh
                    </label>
                    <select
                      value={branchId}
                      onChange={(e) => setBranchId(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">-- Lấy theo token --</option>
                      {branches.map((branch) => (
                        <option
                          key={branch.branchId || branch.id}
                          value={branch.branchId || branch.id}
                        >
                          {branch.branchName || branch.branchCode || branch.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-3 py-3">
                    <input
                      id="includeZeroStock"
                      type="checkbox"
                      checked={includeZeroStock}
                      onChange={(e) => setIncludeZeroStock(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    <label htmlFor="includeZeroStock" className="text-sm text-slate-700">
                      Bao gồm tồn = 0
                    </label>
                  </div>
                </>
              )}

              {selectedReport === 'product-profit' && (
                <>
                  <Input
                    label="Từ ngày"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                  <Input
                    label="Đến ngày"
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Chi nhánh
                    </label>
                    <select
                      value={branchId}
                      onChange={(e) => {
                        setBranchId(e.target.value);
                        setCategoryId('');
                      }}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">-- Lấy theo token --</option>
                      {branches.map((branch) => (
                        <option
                          key={branch.branchId || branch.id}
                          value={branch.branchId || branch.id}
                        >
                          {branch.branchName || branch.branchCode || branch.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Nhóm sản phẩm
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">-- Không bắt buộc --</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Sắp xếp theo
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="revenue">Doanh thu</option>
                      <option value="profit">Lợi nhuận</option>
                      <option value="quantity">Số lượng</option>
                    </select>
                  </div>
                </>
              )}

              {selectedReport === 'supplier-detail' && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Nhà cung cấp
                    </label>
                    <select
                      value={supplierId}
                      onChange={(e) => setSupplierId(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">-- Chọn nhà cung cấp --</option>
                      {suppliers.map((supplier) => (
                        <option
                          key={supplier.id || supplier.supplierId}
                          value={supplier.id || supplier.supplierId}
                        >
                          {supplier.name ||
                            supplier.fullName ||
                            supplier.companyName ||
                            supplier.supplierName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Input
                    label="Ngày mua từ"
                    type="date"
                    value={purchaseFromDate}
                    onChange={(e) => setPurchaseFromDate(e.target.value)}
                  />
                  <Input
                    label="Ngày mua đến"
                    type="date"
                    value={purchaseToDate}
                    onChange={(e) => setPurchaseToDate(e.target.value)}
                  />
                  <Input
                    label="Ngày thanh toán từ"
                    type="date"
                    value={paymentFromDate}
                    onChange={(e) => setPaymentFromDate(e.target.value)}
                  />
                  <Input
                    label="Ngày thanh toán đến"
                    type="date"
                    value={paymentToDate}
                    onChange={(e) => setPaymentToDate(e.target.value)}
                  />
                </>
              )}
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Tóm tắt</h3>
                <p className="text-sm text-slate-500">
                  Thực hiện truy vấn theo API và xem kết quả ngay.
                </p>
              </div>
              <Button variant="primary" onClick={loadReport} disabled={selectedLoading}>
                {selectedLoading ? 'Đang tải...' : 'Tải báo cáo'}
              </Button>
            </div>

            {selectedError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {selectedError}
              </div>
            )}

            <div className="grid gap-3">
              {selectedReport === 'daily-end' && dailyEndData && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Card padding="p-4" className="border-l-4 border-l-blue-500">
                      <p className="text-xs uppercase text-slate-500">Ngày báo cáo</p>
                      <p className="mt-2 text-lg font-bold text-slate-900">
                        {new Date(dailyEndData.reportDate).toLocaleDateString('vi-VN')}
                      </p>
                    </Card>
                    <Card padding="p-4" className="border-l-4 border-l-green-500">
                      <p className="text-xs uppercase text-slate-500">Chi nhánh</p>
                      <p className="mt-2 text-lg font-bold text-slate-900">
                        {dailyEndData.branchName || dailyEndData.branchId || 'Không có'}
                      </p>
                    </Card>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Card padding="p-4" className="border-l-4 border-l-blue-500">
                      <p className="text-xs uppercase text-slate-500">Tổng doanh thu</p>
                      <p className="mt-2 text-xl font-bold text-blue-700">
                        {formatCurrency(dailyEndData.totalRevenue)}
                      </p>
                    </Card>
                    <Card padding="p-4" className="border-l-4 border-l-indigo-500">
                      <p className="text-xs uppercase text-slate-500">Tổng đơn</p>
                      <p className="mt-2 text-xl font-bold text-slate-900">
                        {dailyEndData.totalOrders}
                      </p>
                    </Card>
                    <Card padding="p-4" className="border-l-4 border-l-emerald-500">
                      <p className="text-xs uppercase text-slate-500">Giá trị trung bình</p>
                      <p className="mt-2 text-xl font-bold text-emerald-700">
                        {formatCurrency(dailyEndData.averageOrderValue)}
                      </p>
                    </Card>
                  </div>
                  <Card
                    padding="p-4"
                    header={<h4 className="text-base font-semibold text-slate-800">Thanh toán</h4>}
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      {Object.entries(dailyEndData.paymentBreakdown || {}).map(([key, value]) => (
                        <div key={key} className="rounded-lg bg-slate-50 p-3">
                          <p className="text-xs uppercase text-slate-500">{key}</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {selectedReport === 'stock-movement' && movementData && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Card padding="p-4" className="border-l-4 border-l-blue-500">
                      <p className="text-xs uppercase text-slate-500">Từ</p>
                      <p className="mt-2 text-lg font-bold text-slate-900">
                        {movementData.fromDate}
                      </p>
                    </Card>
                    <Card padding="p-4" className="border-l-4 border-l-blue-500">
                      <p className="text-xs uppercase text-slate-500">Đến</p>
                      <p className="mt-2 text-lg font-bold text-slate-900">{movementData.toDate}</p>
                    </Card>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Card padding="p-4" className="border-l-4 border-l-green-500">
                      <p className="text-xs uppercase text-slate-500">Tổng giá trị đầu kỳ</p>
                      <p className="mt-2 text-xl font-bold text-green-700">
                        {formatCurrency(movementData.totalOpeningValue)}
                      </p>
                    </Card>
                    <Card padding="p-4" className="border-l-4 border-l-indigo-500">
                      <p className="text-xs uppercase text-slate-500">Tổng giá trị nhập</p>
                      <p className="mt-2 text-xl font-bold text-indigo-700">
                        {formatCurrency(movementData.totalInwardValue)}
                      </p>
                    </Card>
                    <Card padding="p-4" className="border-l-4 border-l-rose-500">
                      <p className="text-xs uppercase text-slate-500">Tổng giá trị xuất</p>
                      <p className="mt-2 text-xl font-bold text-rose-700">
                        {formatCurrency(movementData.totalOutwardValue)}
                      </p>
                    </Card>
                  </div>
                  <Card padding="p-0" className="overflow-hidden">
                    <Table
                      columns={STOCK_COLUMNS}
                      data={movementData.items || []}
                      loading={loadingStockMovement}
                      emptyMessage="Không có dữ liệu xuất nhập tồn"
                    />
                  </Card>
                </>
              )}

              {selectedReport === 'revenue-by-time' && revenueData && (
                <>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Card padding="p-4" className="border-l-4 border-l-blue-500">
                      <p className="text-xs uppercase text-slate-500">Tổng doanh thu</p>
                      <p className="mt-2 text-xl font-bold text-blue-700">
                        {formatCurrency(revenueData.totalRevenue)}
                      </p>
                    </Card>
                    <Card padding="p-4" className="border-l-4 border-l-indigo-500">
                      <p className="text-xs uppercase text-slate-500">Tổng đơn</p>
                      <p className="mt-2 text-xl font-bold text-slate-900">
                        {revenueData.totalOrders}
                      </p>
                    </Card>
                    <Card padding="p-4" className="border-l-4 border-l-emerald-500">
                      <p className="text-xs uppercase text-slate-500">Giá trị trung bình</p>
                      <p className="mt-2 text-xl font-bold text-emerald-700">
                        {formatCurrency(revenueData.averageOrderValue)}
                      </p>
                    </Card>
                  </div>
                  <Card padding="p-4">
                    {revenueData.chartData?.length ? (
                      <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={revenueData.chartData}
                            margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              stroke="#e2e8f0"
                            />
                            <XAxis
                              dataKey="timeKey"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 12, fill: '#64748b' }}
                            />
                            <YAxis
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 12, fill: '#64748b' }}
                              tickFormatter={(value) => `${value / 1000000}M`}
                            />
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Legend />
                            <Bar dataKey="revenue" fill="#0ea5e9" name="Doanh thu" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="py-10 text-center text-slate-400">
                        Không có dữ liệu biểu đồ
                      </div>
                    )}
                  </Card>
                  <Card padding="p-0" className="overflow-hidden">
                    <Table
                      columns={[
                        { key: 'date', header: 'Ngày' },
                        { key: 'timeKey', header: 'Định dạng' },
                        { key: 'revenue', header: 'Doanh thu', render: (v) => formatCurrency(v) },
                        { key: 'orders', header: 'Đơn', render: (v) => v },
                        {
                          key: 'averageValue',
                          header: 'Trung bình',
                          render: (v) => formatCurrency(v),
                        },
                        { key: 'growthPercent', header: 'Tăng trưởng', render: (v) => `${v}%` },
                      ]}
                      data={revenueData.tableData || []}
                      loading={loadingRevenue}
                      emptyMessage="Không có bảng dữ liệu"
                    />
                  </Card>
                </>
              )}

              {selectedReport === 'low-stock' && lowStockData && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Card padding="p-4" className="border-l-4 border-l-blue-500">
                      <p className="text-xs uppercase text-slate-500">Chi nhánh</p>
                      <p className="mt-2 text-lg font-bold text-slate-900">
                        {lowStockData.branchName || lowStockData.branchId || 'Không có'}
                      </p>
                    </Card>
                    <Card padding="p-4" className="border-l-4 border-l-rose-500">
                      <p className="text-xs uppercase text-slate-500">Tổng sản phẩm</p>
                      <p className="mt-2 text-lg font-bold text-rose-700">
                        {lowStockData.totalItems || 0}
                      </p>
                    </Card>
                  </div>
                  <Card padding="p-0" className="overflow-hidden">
                    <Table
                      columns={LOW_STOCK_COLUMNS}
                      data={lowStockData.items || []}
                      loading={loadingLowStock}
                      emptyMessage="Không có sản phẩm cảnh báo tồn kho"
                    />
                  </Card>
                </>
              )}

              {selectedReport === 'product-profit' && productProfitData && (
                <>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Card padding="p-4" className="border-l-4 border-l-blue-500">
                      <p className="text-xs uppercase text-slate-500">Doanh thu</p>
                      <p className="mt-2 text-xl font-bold text-blue-700">
                        {formatCurrency(productProfitData.totalRevenue)}
                      </p>
                    </Card>
                    <Card padding="p-4" className="border-l-4 border-l-red-500">
                      <p className="text-xs uppercase text-slate-500">Giá vốn</p>
                      <p className="mt-2 text-xl font-bold text-red-700">
                        {formatCurrency(productProfitData.totalCost)}
                      </p>
                    </Card>
                    <Card padding="p-4" className="border-l-4 border-l-green-500">
                      <p className="text-xs uppercase text-slate-500">Lợi nhuận</p>
                      <p className="mt-2 text-xl font-bold text-green-700">
                        {formatCurrency(productProfitData.totalProfit)}
                      </p>
                    </Card>
                  </div>
                  <Card padding="p-0" className="overflow-hidden">
                    <Table
                      columns={PRODUCT_PROFIT_COLUMNS}
                      data={productProfitData.items || []}
                      loading={loadingProductProfit}
                      emptyMessage="Không có dữ liệu sản phẩm"
                    />
                  </Card>
                </>
              )}

              {selectedReport === 'supplier-detail' && supplierDetailData && (
                <>
                  <Card padding="p-4" className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase text-slate-500">Nhà cung cấp</p>
                      <p className="mt-2 text-lg font-bold text-slate-900">
                        {supplierDetailData.supplierName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-slate-500">Tổng đơn nhập</p>
                      <p className="mt-2 text-lg font-bold text-slate-900">
                        {supplierDetailData.totalPurchaseOrders}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-slate-500">Tổng tiền nhập</p>
                      <p className="mt-2 text-lg font-bold text-slate-900">
                        {formatCurrency(supplierDetailData.totalPurchaseAmount)}
                      </p>
                    </div>
                  </Card>

                  <Card
                    padding="p-4"
                    header={<h4 className="text-base font-semibold text-slate-800">Công nợ</h4>}
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-lg bg-slate-50 p-4">
                        <p className="text-xs uppercase text-slate-500">Tổng công nợ</p>
                        <p className="mt-2 text-lg font-bold text-slate-900">
                          {formatCurrency(supplierDetailData.debtInfo?.totalDebt)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-4">
                        <p className="text-xs uppercase text-slate-500">Đã thanh toán</p>
                        <p className="mt-2 text-lg font-bold text-slate-900">
                          {formatCurrency(supplierDetailData.debtInfo?.totalPaid)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-4">
                        <p className="text-xs uppercase text-slate-500">Còn lại</p>
                        <p className="mt-2 text-lg font-bold text-slate-900">
                          {formatCurrency(supplierDetailData.debtInfo?.remainingDebt)}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card padding="p-0" className="overflow-hidden">
                    <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                      Lịch sử mua hàng
                    </div>
                    <Table
                      columns={PURCHASE_COLUMNS}
                      data={supplierDetailData.purchaseHistory || []}
                      loading={loadingSupplierDetail}
                      emptyMessage="Không có lịch sử mua hàng"
                    />
                  </Card>

                  <Card padding="p-0" className="overflow-hidden">
                    <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                      Lịch sử thanh toán
                    </div>
                    <Table
                      columns={PAYMENT_COLUMNS}
                      data={supplierDetailData.paymentHistory || []}
                      loading={loadingSupplierDetail}
                      emptyMessage="Không có lịch sử thanh toán"
                    />
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerReports;
