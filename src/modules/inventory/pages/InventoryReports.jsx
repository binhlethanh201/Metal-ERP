import { useState, useEffect, useMemo } from 'react';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { Table } from '../../../shared/components/Table';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import { getStockMovementReport, getLowStockReport } from '../../report/services/reportService';
import { getProducts } from '../services/productService';
import { useReport } from '../../report/hooks/useReport';

const REPORT_TYPES = [
  { key: 'stock-movement', label: 'Báo cáo xuất nhập tồn' },
  { key: 'low-stock', label: 'Tồn kho sắp hết' },
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
    render: (v) => {
      // Từ điển ánh xạ màu sắc và nhãn hiển thị tiếng Việt
      const severityMap = {
        Critical: {
          label: 'Nguy cấp',
          className: 'bg-red-100 text-red-700 border border-red-200',
        },
        Warning: {
          label: 'Cảnh báo',
          className: 'bg-amber-100 text-amber-700 border border-amber-200',
        },
        Low: {
          label: 'Thấp',
          className: 'bg-blue-100 text-blue-700 border border-blue-200',
        },
      };

      // Lấy cấu hình tương ứng, nếu không khớp thì dùng mặc định
      const config = severityMap[v] || {
        label: v || 'Bình thường',
        className: 'bg-slate-100 text-slate-700 border border-slate-200',
      };

      return (
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ${config.className}`}
        >
          {config.label}
        </span>
      );
    },
  },
];

// ============ HÀM HỖ TRỢ XUẤT FILE CSV PURE FE ============
const exportToCSV = (data, columns, fileName) => {
  if (!data || !data.length) return;

  // 1. Tạo dòng Header từ danh sách cột
  const headers = columns.map((col) => `"${col.header}"`).join(',');

  // 2. Tạo các dòng dữ liệu (Rows)
  const rows = data.map((row) => {
    return columns
      .map((col) => {
        let val = row[col.key];
        if (val === null || val === undefined) val = '';
        // Thoát ký tự nháy kép nếu trong văn bản có chứa nháy kép
        const stringVal = String(val).replace(/"/g, '""');
        return `"${stringVal}"`;
      })
      .join(',');
  });

  // 3. Ghép Header và Rows lại, thêm '\uFEFF' (BOM) để Microsoft Excel hiển thị chuẩn tiếng Việt UTF-8
  const csvContent = '\uFEFF' + [headers, ...rows].join('\n');

  // 4. Tạo Blob và tự động bấm tải file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const InventoryReports = () => {
  const defaultToDate = new Date().toISOString().split('T')[0];
  const defaultFromDate = new Date(new Date().setDate(new Date().getDate() - 30))
    .toISOString()
    .split('T')[0];

  // ============ STATES ============
  const [selectedReport, setSelectedReport] = useState('stock-movement');
  const [fromDate, setFromDate] = useState(defaultFromDate);
  const [toDate, setToDate] = useState(defaultToDate);
  const [categoryId, setCategoryId] = useState('');
  const [productId, setProductId] = useState('');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [includeZeroStock, setIncludeZeroStock] = useState(false);
  const [dismissedError, setDismissedError] = useState(false);

  // ============ HOOKS ============
  const {
    data: movementData,
    isLoading: loadingStockMovement,
    error: stockMovementError,
    execute: fetchStockMovement,
  } = useReport(getStockMovementReport);

  const {
    data: lowStockData,
    isLoading: loadingLowStock,
    error: lowStockError,
    execute: fetchLowStock,
  } = useReport(getLowStockReport);

  const selectedError = useMemo(() => {
    switch (selectedReport) {
      case 'stock-movement':
        return stockMovementError;
      case 'low-stock':
        return lowStockError;
      default:
        return null;
    }
  }, [selectedReport, stockMovementError, lowStockError]);

  const selectedLoading = useMemo(() => {
    switch (selectedReport) {
      case 'stock-movement':
        return loadingStockMovement;
      case 'low-stock':
        return loadingLowStock;
      default:
        return false;
    }
  }, [selectedReport, loadingStockMovement, loadingLowStock]);

  // ============ EFFECTS ============
  useEffect(() => {
    let isMounted = true;
    const loadCategories = async () => {
      try {
        const res = await getProducts({ pageNumber: 1, pageSize: 200, status: 'active' });
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
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadFilteredProducts = async () => {
      try {
        const selectedCatName = categories.find((c) => c.id === categoryId)?.name;
        const res = await getProducts({
          pageNumber: 1,
          pageSize: 200,
          status: 'active',
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

  const loadReport = async () => {
    switch (selectedReport) {
      case 'stock-movement': {
        const movementPayload = { fromDate, toDate };
        if (categoryId) movementPayload.categoryId = categoryId;
        if (productId) movementPayload.productId = productId;

        await fetchStockMovement(movementPayload);
        break;
      }
      case 'low-stock':
        await fetchLowStock({ includeZeroStock });
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    loadReport();
    setDismissedError(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReport]);

  // ============ HANDLERS TẢI FILE ============
  const handleDownload = () => {
    if (selectedReport === 'stock-movement' && movementData?.items) {
      exportToCSV(movementData.items, STOCK_COLUMNS, 'Bao_Cao_Xuat_Nhap_Ton');
    } else if (selectedReport === 'low-stock' && lowStockData?.items) {
      exportToCSV(lowStockData.items, LOW_STOCK_COLUMNS, 'Bao_Cao_Ton_Kho_Sap_Het');
    }
  };

  const hasDataToExport = useMemo(() => {
    if (selectedReport === 'stock-movement') return (movementData?.items?.length || 0) > 0;
    if (selectedReport === 'low-stock') return (lowStockData?.items?.length || 0) > 0;
    return false;
  }, [selectedReport, movementData, lowStockData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Báo cáo Kho hàng</h1>
          <p className="mt-1 text-sm text-slate-500">
            Kiểm soát chi tiết tình trạng xuất nhập và cảnh báo hàng hóa
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

      {/* Filters Area */}
      <Card className="border-slate-200 bg-white shadow-sm" padding="p-5">
        <div className="flex flex-wrap items-end gap-4">
          {/* Khoảng thời gian */}
          {selectedReport === 'stock-movement' && (
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

              <div className="min-w-[150px] flex-1 lg:flex-none">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                  Nhóm sản phẩm
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    setProductId('');
                  }}
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
            </>
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

          {/* Action Buttons: Lọc & Xuất File */}
          <div className="ml-auto flex w-full flex-wrap gap-2 sm:w-auto">
            <Button
              variant="secondary"
              className="h-[38px] flex-1 border border-slate-300 bg-white sm:flex-none"
              onClick={handleDownload}
              disabled={!hasDataToExport || selectedLoading}
            >
              Tải về
            </Button>
            <Button
              variant="primary"
              className="h-[38px] flex-1 sm:flex-none"
              onClick={loadReport}
              disabled={selectedLoading}
            >
              {selectedLoading ? 'Đang truy xuất...' : 'Lọc Dữ Liệu'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Error State */}
      {selectedError && !dismissedError && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm">
          <svg
            className="mt-0.5 h-5 w-5 shrink-0 text-red-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div className="flex-1">
            <p className="font-semibold text-red-800">Đã xảy ra lỗi</p>
            <p className="mt-1 text-sm text-red-700">{selectedError}</p>
          </div>
          <button
            type="button"
            onClick={() => setDismissedError(true)}
            className="shrink-0 rounded p-1 text-red-400 hover:bg-red-100 hover:text-red-600"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* Results Area */}
      <div className="space-y-6">
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

        {/* LOW STOCK */}
        {selectedReport === 'low-stock' && lowStockData && (
          <>
            <Card
              padding="p-5"
              className="flex items-center gap-4 border-l-4 border-l-rose-500 bg-rose-50/50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-xl text-rose-600">
                ⚠️
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
      </div>
    </div>
  );
};

export default InventoryReports;
