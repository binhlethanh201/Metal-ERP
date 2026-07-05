export const extractProductList = (response) => {
  if (Array.isArray(response)) return response;
  // Chuẩn API Envelopes mới: response.data.items
  if (response?.data && Array.isArray(response.data.items)) return response.data.items;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

export const buildDimensionText = (product = {}) => {
  const specification = product?.specification || '';
  if (specification) return specification;

  const width = product?.width || '';
  const length = product?.length || '';
  const weight = product?.weight || '';
  const weightUnit = product?.weightUnit || '';
  const sizeUnit = product?.sizeUnit || '';

  const sizeParts = [width, length].filter(
    (v) => v !== undefined && v !== null && `${v}`.trim() !== ''
  );
  const sizeText = sizeParts.join(' x ');
  const weightText = weight ? `${weight}${weightUnit || ''}` : '';

  if (sizeText && weightText && sizeUnit) return `${sizeText}${sizeUnit}, ${weightText}`;
  if (sizeText && weightText) return `${sizeText}, ${weightText}`;
  if (sizeText && sizeUnit) return `${sizeText}${sizeUnit}`;
  return sizeText || weightText || '';
};

export const normalizeProduct = (product = {}, index = 0) => {
  const id = product.id || product.productId || `API-${index + 1}`;
  const actualStock = Number(product.actualStock ?? 0);
  const availableStock = Number(product.availableStock ?? actualStock);

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
    location: product.shelfLocation || '',
    shelfLocation: product.shelfLocation || '',
    image: product.imageUrl || (Array.isArray(product.images) && product.images[0]) || '',
    images: Array.isArray(product.images) ? product.images : [],
    attributes: Array.isArray(product.attributes) ? product.attributes : [],
    conversionUnits: Array.isArray(product.conversionUnits) ? product.conversionUnits : [],
    specification: product.specification || '',
    weight: product.weight || null,
    weightUnit: product.weightUnit || '',
    width: product.width || null,
    length: product.length || null,
    height: product.height || null,
    dimension: buildDimensionText(product) || 'Chưa có',
    status: product.status || (availableStock > 0 ? 'Sẵn hàng' : 'Hết hàng'),
    statusTone: product.statusTone || (availableStock > 0 ? 'green' : 'red'),
    productStatus: product.productStatus || (product.status === 'inactive' ? 'inactive' : 'active'),
    estimatedOutAt: product.estimatedOutAt || '',
    directSale: Boolean(product.directSale ?? true),
    salesChannelLinked: Boolean(product.salesChannelLinked ?? false),
  };
};

export const buildSpecification = (form) => {
  if (form.specification) return form.specification;
  const sizeParts = [form.width, form.length].filter(
    (v) => v !== undefined && v !== null && `${v}`.trim() !== ''
  );
  const weightText = [form.weight, form.weightUnit].filter(
    (v) => v !== undefined && v !== null && `${v}`.trim() !== ''
  );
  if (!sizeParts.length && !weightText.length && !form.height) return '';
  const sizeText = sizeParts.join(' x ');
  const unit = form.sizeUnit || form.weightUnit || '';
  const weightValue = form.weight ? `${form.weight}${form.weightUnit || ''}` : '';
  if (sizeText && weightValue && unit) return `${sizeText}${unit}, ${weightValue}`;
  if (sizeText && weightValue) return `${sizeText}, ${weightValue}`;
  if (sizeText && unit) return `${sizeText}${unit}`;
  if (sizeText) return sizeText;
  if (weightValue) return weightValue;
  if (form.height && unit) return `${form.height}${unit}`;
  return `${form.height || ''}`.trim();
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
  attributes: (form.attributes || []).map((a) => ({
    name: a.name || '',
    value: a.value || '',
  })),
  conversionUnits: (form.conversionUnits || []).map((u) => ({
    name: u.name || '',
    rate: Number(u.rate) || 1,
    price: Number(u.price) || 0,
    directSale: u.directSale !== false,
  })),
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
