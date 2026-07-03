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
  // 1. TẢI DANH MỤC SẢN PHẨM
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

  // 2. TẢI DANH SÁCH SẢN PHẨM (Phụ thuộc vào Danh mục được chọn)
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

  // 3. TẢI BÁO CÁO
  const loadReport = async () => {
    switch (selectedReport) {
      case 'stock-movement': {
        const movementPayload = { fromDate, toDate };
        if (categoryId) movementPayload.categoryId = categoryId;
        if (productId) movementPayload.productId = productId;

        // Cố tình không truyền branchId để Backend lấy từ Token của InventoryStaff
        await fetchStockMovement(movementPayload);
        break;
      }
      case 'low-stock':
        await fetchLowStock({ includeZeroStock }); // Không truyền branchId
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReport]);

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

          {/* Action Button */}
          <div className="ml-auto w-full sm:w-auto">
            <Button
              variant="primary"
              className="h-[38px] w-full sm:w-auto"
              onClick={loadReport}
              disabled={selectedLoading}
            >
              {selectedLoading ? 'Đang truy xuất...' : 'Lọc Dữ Liệu'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Error State */}
      {selectedError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-sm">
          🚨 {selectedError}
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
