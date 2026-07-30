export const extractProductList = (response) => {
  if (Array.isArray(response)) return response;
  // Chuẩn API Envelopes mới: response.data.items
  if (response?.data && Array.isArray(response.data.items)) return response.data.items;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

export const buildDimensionText = (product = {}) => {
  const specification = product?.specification || product?.Specification || '';
  if (specification) return specification;

  const width = product?.width ?? product?.Width ?? '';
  const length = product?.length ?? product?.Length ?? '';
  const height = product?.height ?? product?.Height ?? '';
  const sizeUnit = product?.sizeUnit || product?.SizeUnit || '';

  const sizeParts = [width, length, height].filter(
    (v) => v !== undefined && v !== null && `${v}`.trim() !== ''
  );
  if (!sizeParts.length) return '';
  const sizeText = sizeParts.join(' × ');
  return sizeUnit ? `${sizeText} ${sizeUnit}` : sizeText;
};

/**
 * ĐÚNG NGUỒN SỰ THẬT cho trạng thái kinh doanh của sản phẩm.
 * API trả về `productStatus`: "active" | "inactive".
 * KHÔNG dùng field `status` ("Sẵn hàng"/"Sắp hết"/"Hết hàng") để suy ra trạng thái này,
 * vì đó là trạng thái TỒN KHO, khác hoàn toàn với trạng thái KINH DOANH.
 */
const isInactiveValue = (value) => {
  const normalized = String(value ?? '').trim().toLowerCase();
  return (
    value === false ||
    value === 0 ||
    value === -1 ||
    normalized === '0' ||
    normalized === '-1' ||
    normalized === 'inactive' ||
    normalized === 'false'
  );
};

export const isProductActive = (row = {}) => row.productStatus !== 'inactive';

export const normalizeProduct = (product = {}, index = 0) => {
  const id = product.id || product.productId || `API-${index + 1}`;
  const actualStock = Number(product.actualStock ?? 0);
  const availableStock = Number(product.availableStock ?? actualStock);
  const productStatus = isInactiveValue(product.productStatus)
    ? 'inactive'
    : isInactiveValue(product.isActive)
      ? 'inactive'
      : isInactiveValue(product.IsActive)
        ? 'inactive'
        : isInactiveValue(product.status)
          ? 'inactive'
          : isInactiveValue(product.Status)
            ? 'inactive'
            : 'active';

  return {
    id,
    productId: id,
    productCode: product.productCode || id,
    name: product.productName || '',
    barcode: product.barcode || 'Chưa có',
    unit: product.unit || '',
    brand: product.brandName || '',
    brandName: product.brandName || '',
    group: product.categoryName || '',
    categoryName: product.categoryName || '',
    supplierId: product.supplierId || null,
    supplier: product.supplierName || 'Không xác định',
    itemType: product.itemType || 'Goods',
    costPrice: Number(product.costPrice ?? 0),
    salePrice: Number(product.salePrice ?? 0),
    stock: actualStock,
    actualStock,
    availableStock,
    reservedStock: Number(product.reservedStock ?? 0),
    minimumStock: Number(product.minimumStock ?? product.MinimumStock ?? 0),
    minStock: Number(product.minimumStock ?? product.MinimumStock ?? 0),
    location: product.shelfLocation || '',
    shelfLocation: product.shelfLocation || '',
    image: product.imageUrl || (Array.isArray(product.images) && product.images[0]) || '',
    images: Array.isArray(product.images) ? product.images : [],
    attributes: Array.isArray(product.attributes) ? product.attributes : [],
    conversionUnits: Array.isArray(product.conversionUnits) ? product.conversionUnits : [],
    specification: product.specification || '',
    weight: product.weight ?? product.Weight ?? null,
    weightUnit: product.weightUnit || product.WeightUnit || '',
    width: product.width ?? product.Width ?? null,
    length: product.length ?? product.Length ?? null,
    height: product.height ?? product.Height ?? null,
    sizeUnit: product.sizeUnit || product.SizeUnit || 'mm',
    dimension: buildDimensionText(product) || 'Chưa có',
    // status: trạng thái TỒN KHO (hiển thị dạng chữ + màu), không phải trạng thái kinh doanh
    status: product.status || (availableStock > 0 ? 'Sẵn hàng' : 'Hết hàng'),
    statusTone: product.statusTone || (availableStock > 0 ? 'green' : 'red'),
    // productStatus: trạng thái KINH DOANH (active/inactive) - dùng cho toggle & filter
    productStatus,
    // isActive: cờ boolean tiện dùng trong JSX, LUÔN đồng bộ với productStatus
    isActive: productStatus !== 'inactive',
    estimatedOutAt: product.estimatedOutAt || '',
    createdAt: product.createdAt || '',
    directSale: Boolean(product.directSale ?? true),
    salesChannelLinked: Boolean(product.salesChannelLinked ?? false),
  };
};

export const buildSpecification = (form) => {
  if (form.specification) return form.specification;
  const sizeParts = [form.width, form.length, form.height].filter(
    (v) => v !== undefined && v !== null && `${v}`.trim() !== ''
  );
  if (!sizeParts.length) return '';
  const sizeText = sizeParts.join(' × ');
  const unit = form.sizeUnit || '';
  return unit ? `${sizeText} ${unit}` : sizeText;
};

// Chuẩn hóa Payload CREATE (ProductUpsertDto - camelCase chuẩn)
export const createProductPayload = (form) => ({
  productCode: form.productCode || form.id || `SP${Date.now()}`,
  productName: form.name || form.productName || '',
  barcode: form.barcode || '',
  unit: form.baseUnit?.name || form.unit || 'cái',
  brandName: form.brand || '',
  categoryName: form.group || '',
  supplierId: form.supplierId || null,
  itemType: form.itemType || 'Goods',
  costPrice: Number(form.costPrice || 0),
  salePrice: Number(form.salePrice || 0),
  actualStock: Number(form.stock || 0),
  availableStock: Number(form.availableStock ?? form.stock ?? 0),
  reservedStock: Number(form.reservedStock || 0),
  shelfLocation: form.shelfLocation || form.location || form.locations?.[0] || '',
  minimumStock: Number(form.minimumStock ?? form.stockMin ?? 0),
  maximumStock: Number(form.stockMax ?? 0),
  weight: Number(form.weight) || null,
  weightUnit: form.weightUnit || 'g',
  width: Number(form.width) || null,
  length: Number(form.length) || null,
  height: Number(form.height) || null,
  specification: buildSpecification(form),
  imageUrl: form.image || '',
  images: (form.images || [])
    .map((i) => (typeof i === 'string' ? i : i?.url || ''))
    .filter(Boolean),
  // Lọc bỏ attribute rỗng tên (xảy ra khi 1 thuộc tính khả dụng bị xóa khỏi danh sách chung)
  attributes: (form.attributes || [])
    .filter((a) => (a?.name || '').trim())
    .map((a) => ({
      name: a.name || '',
      value: a.value || '',
    })),
  conversionUnits: (form.conversionUnits || []).map((u) => ({
    name: u.name || '',
    rate: Number(u.rate) || 1,
    price: Number(u.price) || 0,
    directSale: u.directSale !== false,
  })),
  isActive: form.productStatus !== 'inactive' && form.status !== 'inactive' && form.isActive !== false,
});

// Chuẩn hóa Payload UPDATE (Backend yêu cầu ProductCode)
export const updateProductPayload = (form) => {
  const base = createProductPayload(form);
  // Giữ lại productCode từ sản phẩm gốc - Backend yêu cầu ProductCode bắt buộc
  base.productCode = form.productCode || form.id || base.productCode || '';
  return base;
};

export const formatMoney = (value) => new Intl.NumberFormat('vi-VN').format(value);

export {
  parseDateTime,
  startOfDay,
  endOfDay,
  addDays,
  getCreatedPresetRange,
  getEstimatedPresetRange,
} from './dateUtils';

export const toneClass = {
  green: 'bg-green-100 text-green-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
};

export const statusOptions = [
  { label: 'Đang hoạt động', value: 'active' },
  { label: 'Ngừng hoạt động', value: 'inactive' },
  { label: 'Bản nháp', value: 'draft' },
];
