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
import { getSuppliers } from '../../inventory/services/supplierService';
import { useReport } from '../hooks/useReport';
import { getProducts } from '../../inventory/services/productService';

// Import Lucide React Icons
import { Download, Filter, AlertTriangle } from 'lucide-react';

// Import Recharts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  {
    key: 'severity',
    header: 'Mức độ',
    render: (v) => (
      <span
        className={`rounded-full px-2 py-1 text-xs font-semibold ${
          v === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
        }`}
      >
        {v}
      </span>
    ),
  },
];

const PRODUCT_PROFIT_COLUMNS = [
  { key: 'productCode', header: 'Mã SP' },
  { key: 'productName', header: 'Tên sản phẩm' },
  { key: 'categoryName', header: 'Nhóm' },
  {
    key: 'quantitySold',
    header: 'SL Bán',
    render: (v) => <span className="font-medium">{v}</span>,
  },
  { key: 'revenue', header: 'Doanh thu', render: (v) => formatCurrency(v) },
  { key: 'cost', header: 'Giá vốn', render: (v) => formatCurrency(v) },
  {
    key: 'profit',
    header: 'Lợi nhuận',
    render: (v) => <span className="font-bold text-green-600">{formatCurrency(v)}</span>,
  },
  {
    key: 'profitMargin',
    header: 'Biên LN',
    render: (v) => <span className="font-semibold text-purple-600">{v}%</span>,
  },
];

const PURCHASE_COLUMNS = [
  { key: 'orderCode', header: 'Mã đơn' },
  { key: 'createdAt', header: 'Ngày tạo', render: (v) => new Date(v).toLocaleDateString('vi-VN') },
  {
    key: 'totalAmount',
    header: 'Tổng tiền',
    render: (v) => <span className="font-medium text-slate-900">{formatCurrency(v)}</span>,
  },
  { key: 'status', header: 'Trạng thái' },
];

const PAYMENT_COLUMNS = [
  { key: 'paymentId', header: 'Mã thanh toán' },
  {
    key: 'createdAt',
    header: 'Ngày thanh toán',
    render: (v) => new Date(v).toLocaleDateString('vi-VN'),
  },
  {
    key: 'amount',
    header: 'Số tiền',
    render: (v) => <span className="font-medium text-slate-900">{formatCurrency(v)}</span>,
  },
  { key: 'note', header: 'Ghi chú' },
];

// ============ HÀM XUẤT FILE CSV THUẦN FE (HỖ TRỢ UTF-8 BOM) ============
const exportToCSV = (data, columns, fileName) => {
  if (!data || !data.length) return;

  const headers = columns.map((col) => `"${col.header}"`).join(',');

  const rows = data.map((row) => {
    return columns
      .map((col) => {
        let val = row[col.key];
        if (val === null || val === undefined) val = '';
        const stringVal = String(val).replace(/"/g, '""');
        return `"${stringVal}"`;
      })
      .join(',');
  });

  const csvContent = '\uFEFF' + [headers, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

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

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === categoryId),
    [categories, categoryId]
  );

  const selectedSupplier = useMemo(
    () => suppliers.find((supplier) => (supplier.id || supplier.supplierId) === supplierId),
    [suppliers, supplierId]
  );

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

    return { totalRevenue, totalCost, totalProfit };
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

  // Kiểm tra xem báo cáo hiện tại có dữ liệu để xuất Excel không
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

  // Xử lý tải xuống CSV theo báo cáo tương ứng
  const handleDownload = () => {
    if (selectedReport === 'stock-movement' && movementData?.items) {
      exportToCSV(movementData.items, STOCK_COLUMNS, 'Bao_Cao_Xuat_Nhap_Ton');
    } else if (selectedReport === 'revenue-by-time' && revenueData?.tableData) {
      const revColumns = [
        { key: 'date', header: 'Ngày' },
        { key: 'timeKey', header: 'Thời gian' },
        { key: 'revenue', header: 'Doanh thu' },
        { key: 'orders', header: 'Số đơn' },
        { key: 'averageValue', header: 'Giá trị TB' },
        { key: 'growthPercent', header: 'Tăng trưởng (%)' },
      ];
      exportToCSV(revenueData.tableData, revColumns, 'Bao_Cao_Doanh_Thu_Theo_Thoi_Gian');
    } else if (selectedReport === 'low-stock' && lowStockData?.items) {
      exportToCSV(lowStockData.items, LOW_STOCK_COLUMNS, 'Bao_Cao_Ton_Kho_Sap_Het');
    } else if (selectedReport === 'product-profit' && productProfitItems?.length > 0) {
      exportToCSV(productProfitItems, PRODUCT_PROFIT_COLUMNS, 'Bao_Cao_Loi_Nhuan_San_Pham');
    } else if (selectedReport === 'supplier-detail' && supplierPurchaseHistory?.length > 0) {
      exportToCSV(supplierPurchaseHistory, PURCHASE_COLUMNS, 'Lich_Su_Nhap_Hang_NCC');
    }
  };

  // ============ EFFECTS ============
  useEffect(() => {
    let isMounted = true;
    const loadStaticData = async () => {
      try {
        const branchResponse = await getBranches();
        if (isMounted && branchResponse?.success && branchResponse.data) {
          const list = branchResponse.data.items || branchResponse.data || [];
          setBranches(list);

          if (list.length > 0) {
            setBranchId(list[0].branchId || list[0].id);
          }
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
          const list = supplierResponse.data.items || supplierResponse.data || [];
          setSuppliers(list);
          if (list.length > 0) {
            setSupplierId(list[0].id || list[0].supplierId);
          }
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
        const res = await getProducts({
          pageNumber: 1,
          pageSize: 200,
          status: 'active',
          branchId: branchId || undefined,
        });

        if (isMounted && res?.success && res.data) {
          const productList = res.data.items || res.data || [];

          const uniqueCategories = [];
          const catMap = new Map();

          productList.forEach((p) => {
            const id = p.categoryId || p.categoryName;

            if (id && p.categoryName && !catMap.has(id)) {
              catMap.set(id, true);
              uniqueCategories.push({ id: id, name: p.categoryName });
            }
          });
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error('Lỗi tải danh mục:', error);
      }
    };

    loadCategories();
    return () => {
      isMounted = false;
    };
  }, [branchId]);

  useEffect(() => {
    let isMounted = true;
    const loadFilteredProducts = async () => {
      try {
        const selectedCatName = categories.find((c) => c.id === categoryId)?.name;

        const res = await getProducts({
          pageNumber: 1,
          pageSize: 200,
          status: 'active',
          branchId: branchId || undefined,
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
  }, [branchId, categoryId, categories]);

  const loadReport = async () => {
    switch (selectedReport) {
      case 'daily-end':
        await fetchDailyEnd({ date: reportDate, branchId: branchId || null });
        break;
      case 'stock-movement': {
        const movementPayload = {
          fromDate,
          toDate,
          branchId: branchId || null,
          productId: productId || null,
        };

        if (selectedCategory) {
          movementPayload.categoryId = selectedCategory.id;
          if (selectedCategory.name) movementPayload.categoryName = selectedCategory.name;
        } else if (categoryId) {
          movementPayload.categoryId = categoryId;
        }

        await fetchStockMovement(movementPayload);
        break;
      }
      case 'revenue-by-time':
        await fetchRevenue({ fromDate, toDate, branchId: branchId || null, timeGrouping });
        break;
      case 'low-stock':
        await fetchLowStock({ branchId: branchId || null, includeZeroStock });
        break;
      case 'product-profit': {
        const profitPayload = {
          fromDate,
          toDate,
          sortBy,
          pageNumber: 1,
          pageSize,
        };

        if (branchId) profitPayload.branchId = branchId;
        if (selectedCategory) {
          profitPayload.categoryId = selectedCategory.id;
          if (selectedCategory.name) profitPayload.categoryName = selectedCategory.name;
        } else if (categoryId) {
          profitPayload.categoryId = categoryId;
        }

        await fetchProductProfit(profitPayload);
        break;
      }
      case 'supplier-detail': {
        if (!supplierId) return;

        const supplierPayload = {
          supplierId,
          pageNumber: 1,
          pageSize,
        };

        if (selectedSupplier) {
          supplierPayload.supplierName =
            selectedSupplier.name ||
            selectedSupplier.fullName ||
            selectedSupplier.companyName ||
            selectedSupplier.supplierName ||
            undefined;
        }

        if (purchaseFromDate) supplierPayload.purchaseFromDate = purchaseFromDate;
        if (purchaseToDate) supplierPayload.purchaseToDate = purchaseToDate;

        await fetchSupplierDetail(supplierPayload);
        break;
      }
      default:
        break;
    }
  };

  useEffect(() => {
    if (selectedReport === 'supplier-detail' && !supplierId) return;
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReport]);

  useEffect(() => {
    if (selectedReport === 'supplier-detail' && supplierId) {
      loadReport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplierId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Báo cáo Tổng hợp</h1>
          <p className="mt-1 text-sm text-slate-500">
            Phân tích dữ liệu kinh doanh và vận hành hệ thống
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200">
        <div className="no-scrollbar flex space-x-1 overflow-x-auto">
          {REPORT_TYPES.map((report) => (
            <button
              key={report.key}
              onClick={() => setSelectedReport(report.key)}
              className={`whitespace-nowrap border-b-2 px-5 py-3 text-sm font-semibold transition-all ${
                selectedReport === report.key
                  ? 'border-[#004785] bg-blue-50/50 text-[#004785]'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              {report.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters Area (Top Bar Layout) */}
      <Card className="border-slate-200 bg-white shadow-sm" padding="p-5">
        <div className="flex flex-wrap items-end gap-4">
          {/* Chung cho nhiều báo cáo */}
          {(selectedReport === 'daily-end' ||
            selectedReport === 'stock-movement' ||
            selectedReport === 'revenue-by-time' ||
            selectedReport === 'low-stock' ||
            selectedReport === 'product-profit') && (
            <div className="min-w-[150px] flex-1 lg:flex-none">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Chi nhánh
              </label>
              <select
                value={branchId}
                onChange={(e) => {
                  setBranchId(e.target.value);
                  if (selectedReport === 'stock-movement' || selectedReport === 'product-profit')
                    setCategoryId('');
                  if (selectedReport === 'stock-movement') setProductId('');
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {branches.map((branch) => (
                  <option key={branch.branchId || branch.id} value={branch.branchId || branch.id}>
                    {branch.branchName || branch.branchCode || branch.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Daily End */}
          {selectedReport === 'daily-end' && (
            <div className="min-w-[150px] flex-1 lg:flex-none">
              <Input
                label="Ngày chốt ca"
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
              />
            </div>
          )}

          {/* Khoảng thời gian chung */}
          {(selectedReport === 'stock-movement' ||
            selectedReport === 'revenue-by-time' ||
            selectedReport === 'product-profit') && (
            <>
              <div className="min-w-[150px] flex-1 lg:flex-none">
                <Input
                  label="Từ ngày"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div className="min-w-[150px] flex-1 lg:flex-none">
                <Input
                  label="Đến ngày"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Product Categories */}
          {(selectedReport === 'stock-movement' || selectedReport === 'product-profit') && (
            <div className="min-w-[150px] flex-1 lg:flex-none">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Nhóm sản phẩm
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">-- Tất cả nhóm --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Stock Movement specifics */}
          {selectedReport === 'stock-movement' && (
            <div className="min-w-[150px] flex-1 lg:flex-none">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Sản phẩm cụ thể
              </label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">-- Tất cả sản phẩm --</option>
                {products.map((product) => (
                  <option
                    key={product.productId || product.id}
                    value={product.productId || product.id}
                  >
                    {product.productCode || product.code} - {product.productName || product.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Revenue By Time specifics */}
          {selectedReport === 'revenue-by-time' && (
            <div className="min-w-[150px] flex-1 lg:flex-none">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Gom nhóm
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
          )}

          {/* Low Stock specifics */}
          {selectedReport === 'low-stock' && (
            <div className="flex h-[38px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-4">
              <input
                id="includeZeroStock"
                type="checkbox"
                checked={includeZeroStock}
                onChange={(e) => setIncludeZeroStock(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="includeZeroStock"
                className="cursor-pointer text-sm font-medium text-slate-700"
              >
                Không tồn kho
              </label>
            </div>
          )}

          {/* Product Profit specifics */}
          {selectedReport === 'product-profit' && (
            <div className="min-w-[150px] flex-1 lg:flex-none">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Sắp xếp theo
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="revenue">Doanh thu cao nhất</option>
                <option value="profit">Lợi nhuận cao nhất</option>
                <option value="quantity">Bán chạy nhất</option>
              </select>
            </div>
          )}

          {/* Supplier Detail specifics */}
          {selectedReport === 'supplier-detail' && (
            <>
              <div className="min-w-[200px] flex-1 lg:flex-none">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
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
              <div className="min-w-[130px] flex-1 lg:flex-none">
                <Input
                  label="Mua từ ngày"
                  type="date"
                  value={purchaseFromDate}
                  onChange={(e) => setPurchaseFromDate(e.target.value)}
                />
              </div>
              <div className="min-w-[130px] flex-1 lg:flex-none">
                <Input
                  label="Đến ngày"
                  type="date"
                  value={purchaseToDate}
                  onChange={(e) => setPurchaseToDate(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Action Buttons: Tải Excel & Lọc Dữ Liệu */}
          <div className="ml-auto flex w-full flex-wrap gap-2 sm:w-auto">
            {selectedReport !== 'daily-end' && (
              <Button
                variant="secondary"
                className="flex h-[38px] flex-1 items-center justify-center border border-slate-300 bg-white sm:flex-none"
                onClick={handleDownload}
                disabled={!hasDataToExport || selectedLoading}
              >
                <Download className="mr-1.5 h-4 w-4 text-slate-600" />
                <span>Tải về</span>
              </Button>
            )}
            <Button
              variant="primary"
              className="flex h-[38px] flex-1 items-center justify-center sm:flex-none"
              onClick={loadReport}
              disabled={selectedLoading}
            >
              <Filter className="mr-1.5 h-4 w-4 text-white" />
              <span>{selectedLoading ? 'Đang truy xuất...' : 'Lọc Dữ Liệu'}</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Error State */}
      {selectedError && (
        <div className="flex items-center rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-sm">
          <AlertTriangle className="mr-2 h-5 w-5 flex-shrink-0 text-red-600" />
          <span>{selectedError}</span>
        </div>
      )}

      {/* Results Area */}
      <div className="space-y-6">
        {/* DAILY END */}
        {selectedReport === 'daily-end' && dailyEndData && (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card padding="p-5" className="border-t-4 border-t-blue-500">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Ngày / Chi nhánh
                </p>
                <p className="mt-2 text-lg font-bold text-slate-900">
                  {new Date(dailyEndData.reportDate).toLocaleDateString('vi-VN')}
                </p>
                <p className="text-sm text-slate-500">
                  {dailyEndData.branchName || 'Toàn hệ thống'}
                </p>
              </Card>
              <Card padding="p-5" className="border-t-4 border-t-green-500">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Tổng doanh thu
                </p>
                <p className="mt-2 text-2xl font-extrabold text-green-600">
                  {formatCurrency(dailyEndData.totalRevenue)}
                </p>
              </Card>
              <Card padding="p-5" className="border-t-4 border-t-indigo-500">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Số lượng đơn
                </p>
                <p className="mt-2 text-2xl font-extrabold text-slate-900">
                  {dailyEndData.totalOrders}
                </p>
              </Card>
              <Card padding="p-5" className="border-t-4 border-t-amber-500">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Giá trị trung bình/đơn
                </p>
                <p className="mt-2 text-2xl font-extrabold text-amber-600">
                  {formatCurrency(dailyEndData.averageOrderValue)}
                </p>
              </Card>
            </div>
            <Card header={<h4 className="text-lg font-bold text-slate-800">Cơ cấu thanh toán</h4>}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Tiền mặt */}
                <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-amber-600">
                    Tiền mặt
                  </p>
                  <p className="mt-1 text-xl font-bold text-slate-800">
                    {formatCurrency(dailyEndData.paymentBreakdown?.cashAmount || 0)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {dailyEndData.paymentBreakdown?.cashCount || 0} đơn
                  </p>
                </div>

                {/* Chuyển khoản */}
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                    Chuyển khoản
                  </p>
                  <p className="mt-1 text-xl font-bold text-slate-800">
                    {formatCurrency(dailyEndData.paymentBreakdown?.transferAmount || 0)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {dailyEndData.paymentBreakdown?.transferCount || 0} đơn
                  </p>
                </div>

                {/* Ghi nợ */}
                <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-rose-600">
                    Ghi nợ (Công nợ)
                  </p>
                  <p className="mt-1 text-xl font-bold text-slate-800">
                    {formatCurrency(dailyEndData.paymentBreakdown?.debtAmount || 0)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {dailyEndData.paymentBreakdown?.debtCount || 0} đơn
                  </p>
                </div>

                {/* Kết hợp */}
                <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-purple-600">
                    Thanh toán kết hợp
                  </p>
                  <p className="mt-1 text-xl font-bold text-slate-800">
                    {formatCurrency(dailyEndData.paymentBreakdown?.combinedAmount || 0)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {dailyEndData.paymentBreakdown?.combinedCount || 0} đơn
                  </p>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* STOCK MOVEMENT */}
        {selectedReport === 'stock-movement' && movementData && (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Card padding="p-5" className="border-l-4 border-l-blue-500">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Giá trị Tồn Đầu Kỳ
                </p>
                <p className="mt-1 text-2xl font-extrabold text-blue-700">
                  {formatCurrency(movementData.totalOpeningValue)}
                </p>
              </Card>
              <Card padding="p-5" className="border-l-4 border-l-emerald-500">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Giá trị Nhập Trong Kỳ
                </p>
                <p className="mt-1 text-2xl font-extrabold text-emerald-600">
                  {formatCurrency(movementData.totalInwardValue)}
                </p>
              </Card>
              <Card padding="p-5" className="border-l-4 border-l-rose-500">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Giá trị Xuất Trong Kỳ
                </p>
                <p className="mt-1 text-2xl font-extrabold text-rose-600">
                  {formatCurrency(movementData.totalOutwardValue)}
                </p>
              </Card>
            </div>
            <Card padding="p-0">
              <Table
                columns={STOCK_COLUMNS}
                data={movementData.items || []}
                loading={loadingStockMovement}
                emptyMessage="Không có dữ liệu xuất nhập tồn trong khoảng thời gian này"
              />
            </Card>
          </>
        )}

        {/* REVENUE BY TIME */}
        {selectedReport === 'revenue-by-time' && revenueData && (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <Card padding="p-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Tổng doanh thu
                </p>
                <p className="mt-1 text-2xl font-extrabold text-[#004785]">
                  {formatCurrency(revenueData.totalRevenue)}
                </p>
              </Card>
              <Card padding="p-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Tổng số đơn
                </p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">
                  {revenueData.totalOrders}
                </p>
              </Card>
              <Card padding="p-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Trung bình/Đơn
                </p>
                <p className="mt-1 text-2xl font-extrabold text-emerald-600">
                  {formatCurrency(revenueData.averageOrderValue)}
                </p>
              </Card>
            </div>
            <Card
              header={<h2 className="text-lg font-bold text-slate-800">Biểu đồ tăng trưởng</h2>}
            >
              {revenueData.chartData?.length ? (
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={revenueData.chartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="timeKey"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        tickFormatter={(value) => `${value / 1000000}M`}
                      />
                      <Tooltip
                        cursor={{ fill: '#f8fafc' }}
                        formatter={(value) => formatCurrency(value)}
                        contentStyle={{
                          borderRadius: '8px',
                          border: 'none',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                      />
                      <Bar
                        dataKey="revenue"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={60}
                        name="Doanh thu"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-64 items-center justify-center text-slate-400">
                  Không có dữ liệu biểu đồ
                </div>
              )}
            </Card>
            <Card padding="p-0">
              <Table
                columns={[
                  {
                    key: 'timeKey',
                    header: 'Thời gian',
                    render: (v) => <span className="font-semibold text-slate-800">{v}</span>,
                  },
                  { key: 'revenue', header: 'Doanh thu', render: (v) => formatCurrency(v) },
                  { key: 'orders', header: 'Số đơn' },
                  { key: 'averageValue', header: 'Giá trị TB', render: (v) => formatCurrency(v) },
                  {
                    key: 'growthPercent',
                    header: 'Tăng trưởng',
                    render: (v) => (
                      <span
                        className={
                          v > 0
                            ? 'font-medium text-green-600'
                            : v < 0
                              ? 'font-medium text-red-600'
                              : ''
                        }
                      >
                        {v > 0 ? `+${v}%` : `${v}%`}
                      </span>
                    ),
                  },
                ]}
                data={revenueData.tableData || []}
                loading={loadingRevenue}
                emptyMessage="Chưa có dữ liệu"
              />
            </Card>
          </>
        )}

        {/* LOW STOCK */}
        {selectedReport === 'low-stock' && lowStockData && (
          <>
            <Card
              padding="p-5"
              className="flex items-center gap-4 border-l-4 border-l-rose-500 bg-rose-50/50"
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-rose-100">
                <AlertTriangle className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-rose-800">
                  Sản phẩm chạm ngưỡng tồn tối thiểu
                </p>
                <p className="text-2xl font-extrabold text-rose-600">
                  {lowStockData.totalItems || 0}{' '}
                  <span className="text-base font-normal">mã hàng hóa</span>
                </p>
              </div>
            </Card>
            <Card padding="p-0">
              <Table
                columns={LOW_STOCK_COLUMNS}
                data={lowStockData.items || []}
                loading={loadingLowStock}
                emptyMessage="Kho đang ở trạng thái an toàn, không có mặt hàng nào sắp hết."
              />
            </Card>
          </>
        )}

        {/* PRODUCT PROFIT */}
        {selectedReport === 'product-profit' && productProfitData && (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <Card padding="p-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Tổng doanh thu
                </p>
                <p className="mt-1 text-2xl font-extrabold text-blue-600">
                  {formatCurrency(productProfitTotals.totalRevenue)}
                </p>
              </Card>
              <Card padding="p-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Tổng chi phí vốn
                </p>
                <p className="mt-1 text-2xl font-extrabold text-rose-600">
                  {formatCurrency(productProfitTotals.totalCost)}
                </p>
              </Card>
              <Card padding="p-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Lợi nhuận gộp
                </p>
                <p className="mt-1 text-2xl font-extrabold text-emerald-600">
                  {formatCurrency(productProfitTotals.totalProfit)}
                </p>
              </Card>
            </div>
            <Card padding="p-0">
              <Table
                columns={PRODUCT_PROFIT_COLUMNS}
                data={productProfitItems}
                loading={loadingProductProfit}
                emptyMessage="Không có dữ liệu kinh doanh"
              />
            </Card>
          </>
        )}

        {/* SUPPLIER DETAIL */}
        {selectedReport === 'supplier-detail' && supplierDetailData && (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <Card header={<h3 className="text-lg font-bold">Thông tin nhập hàng</h3>}>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500">Đối tác</p>
                    <p className="text-xl font-bold text-slate-900">
                      {supplierDetailData.supplierName}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs uppercase text-slate-500">Tổng đơn nhập</p>
                      <p className="mt-1 text-lg font-bold text-blue-700">
                        {supplierDetailData.totalPurchaseOrders}
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs uppercase text-slate-500">Tổng tiền nhập</p>
                      <p className="mt-1 text-lg font-bold text-blue-700">
                        {formatCurrency(supplierDetailData.totalPurchaseAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
              <Card header={<h3 className="text-lg font-bold">Tình trạng công nợ</h3>}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 py-2">
                    <span className="text-sm text-slate-600">Tổng nợ phát sinh:</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(supplierDetailData.debtInfo?.totalDebt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-100 py-2">
                    <span className="text-sm text-slate-600">Đã thanh toán:</span>
                    <span className="font-semibold text-emerald-600">
                      {formatCurrency(supplierDetailData.debtInfo?.totalPaid)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-bold text-slate-900">Dư nợ hiện tại:</span>
                    <span className="text-lg font-bold text-rose-600">
                      {formatCurrency(supplierDetailData.debtInfo?.remainingDebt)}
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card padding="p-0" className="overflow-hidden">
                <div className="border-b border-slate-200 bg-slate-100 px-4 py-3 font-semibold text-slate-800">
                  Lịch sử nhập hàng
                </div>
                <Table
                  columns={PURCHASE_COLUMNS}
                  data={supplierPurchaseHistory}
                  loading={loadingSupplierDetail}
                  emptyMessage="Không có đơn nhập"
                />
              </Card>
              <Card padding="p-0" className="overflow-hidden">
                <div className="border-b border-slate-200 bg-slate-100 px-4 py-3 font-semibold text-slate-800">
                  Lịch sử thanh toán
                </div>
                <Table
                  columns={PAYMENT_COLUMNS}
                  data={supplierPaymentHistory}
                  loading={loadingSupplierDetail}
                  emptyMessage="Chưa có thanh toán nào"
                />
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OwnerReports;
