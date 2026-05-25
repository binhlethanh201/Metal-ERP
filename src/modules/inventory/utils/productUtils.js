/**
 * Product Utils - Các hàm tiện ích xử lý dữ liệu sản phẩm.
 * Tách từ ProductManagement.jsx để tái sử dụng và giảm kích thước page.
 */

export const extractProductList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.result?.items)) return response.result.items;
  return [];
};

export const buildDimensionText = (product = {}) => {
  const specification = product?.specification || product?.Specification || '';
  if (specification) return specification;

  const width = product?.width || product?.Width || '';
  const length = product?.length || product?.Length || '';
  const weight = product?.weight || product?.Weight || '';
  const weightUnit = product?.weightUnit || product?.WeightUnit || '';
  const sizeUnit = product?.sizeUnit || product?.SizeUnit || '';

  const sizeParts = [width, length].filter(
    (v) => v !== undefined && v !== null && `${v}`.trim() !== ''
  );
  const sizeText = sizeParts.join(' x ');
  const weightText = weight ? `${weight}${weightUnit || ''}` : '';

  if (sizeText && weightText && sizeUnit) return `${sizeText}${sizeUnit}, ${weightText}`;
  if (sizeText && weightText) return `${sizeText}, ${weightText}`;
  if (sizeText && sizeUnit) return `${sizeText}${sizeUnit}`;
  if (sizeText) return sizeText;
  return weightText || '';
};

const resolveImageUrl = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object')
    return (
      value.url || value.Url || value.imageUrl || value.ImageUrl || value.src || value.path || ''
    );
  return '';
};

export const normalizeProduct = (product, index) => {
  const id =
    product?.id ||
    product?.Id ||
    product?.productId ||
    product?.ProductId ||
    product?.productCode ||
    product?.ProductCode ||
    `API-${index + 1}`;
  const productId = product?.productId || product?.ProductId || id;
  const productCode =
    product?.productCode || product?.ProductCode || product?.code || product?.Code || id;
  const stock = Number(
    product?.actualStock ??
      product?.ActualStock ??
      product?.initialStock ??
      product?.InitialStock ??
      product?.stock ??
      product?.Stock ??
      0
  );

  return {
    id,
    productId,
    productCode,
    name: product?.productName || product?.ProductName || product?.name || product?.Name || '',
    image:
      product?.image ||
      product?.ImageUrl ||
      product?.imageUrl ||
      resolveImageUrl(Array.isArray(product?.images) ? product.images[0] : null) ||
      resolveImageUrl(Array.isArray(product?.Images) ? product.Images[0] : null) ||
      product?.thumbnailUrl ||
      product?.Thumbnail ||
      '',
    unit: product?.unit || product?.Unit || '',
    brand: product?.brandName || product?.BrandName || product?.brand || product?.Brand || '',
    brandName: product?.brandName || product?.BrandName || '',
    salePrice: Number(
      product?.sellPrice ?? product?.SellPrice ?? product?.price ?? product?.Price ?? 0
    ),
    costPrice: Number(product?.costPrice ?? product?.CostPrice ?? 0),
    stock,
    reservedStock: Number(product?.reservedStock ?? product?.ReservedStock ?? 0),
    availableStock: Number(product?.availableStock ?? product?.AvailableStock ?? stock),
    location:
      product?.shelfLocation ||
      product?.ShelfLocation ||
      product?.location ||
      product?.Location ||
      '',
    shelfLocation:
      product?.shelfLocation ||
      product?.ShelfLocation ||
      product?.location ||
      product?.Location ||
      '',
    status: stock > 0 ? 'Sẵn hàng' : 'Hết hàng',
    statusTone: stock > 0 ? 'green' : 'red',
    createdAt: product?.createdAt || product?.CreatedAt || '',
    group: product?.categoryName || product?.CategoryName || product?.group || product?.Group || '',
    categoryName: product?.categoryName || product?.CategoryName || '',
    barcode: product?.barcode || product?.Barcode || 'Chưa có',
    specification: product?.specification || product?.Specification || '',
    stockLevel:
      (product?.minimumStock ?? product?.MinimumStock)
        ? `${product?.minimumStock ?? product?.MinimumStock} - ${stock}`
        : 'Chưa có',
    minimumStock: Number(product?.minimumStock ?? product?.MinimumStock ?? 0),
    weight: product?.weight || product?.Weight || 'Chưa có',
    dimension: product?.dimension || product?.Dimension || buildDimensionText(product) || 'Chưa có',
    supplier: product?.supplierName || product?.SupplierName || 'Chưa có',
    itemType: product?.itemType || product?.ItemType || 'Hàng hóa thường',
    directSale: Boolean(product?.directSale ?? product?.DirectSale ?? true),
    salesChannelLinked: Boolean(
      product?.salesChannelLinked ?? product?.SalesChannelLinked ?? false
    ),
    productStatus: (product?.isActive ?? product?.IsActive) === false ? 'inactive' : 'active',
    estimatedOutAt: product?.estimatedOutAt || product?.EstimatedOutAt || '',
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

export const createProductPayload = (form) => ({
  ProductCode: form.productCode || form.id || '',
  Barcode: form.barcode || '',
  ProductName: form.name || '',
  Unit: form.baseUnit?.name || form.unit || 'Cái',
  Specification: buildSpecification(form),
  CostPrice: Number(form.costPrice || 0),
  SellPrice: Number(form.salePrice || 0),
  ActualStock: Number(form.stock || 0),
  ReservedStock: Number(form.reservedStock || 0),
  AvailableStock: Number(form.availableStock ?? form.stock ?? 0),
  MinimumStock: Number(form.minimumStock ?? form.stockMin ?? 0),
  ShelfLocation: form.shelfLocation || form.location || form.locations?.[0] || '',
  ImageUrl: form.image || '',
  Images: (form.images || []).map((i) => i?.url || ''),
  CategoryName: form.group || '',
  BrandName: form.brand || '',
  IsActive: form.productStatus !== 'inactive',
});

export const updateProductPayload = (form) => ({
  ProductCode: form.productCode || form.id || '',
  Barcode: form.barcode || '',
  ProductName: form.name || '',
  Unit: form.baseUnit?.name || form.unit || 'Cái',
  Specification: buildSpecification(form),
  CostPrice: Number(form.costPrice || 0),
  SellPrice: Number(form.salePrice || 0),
  ActualStock: Number(form.stock || 0),
  ReservedStock: Number(form.reservedStock || 0),
  AvailableStock: Number(form.availableStock ?? form.stock ?? 0),
  MinimumStock: Number(form.minimumStock ?? form.stockMin ?? 0),
  ShelfLocation: form.shelfLocation || form.location || form.locations?.[0] || '',
  ImageUrl: form.image || '',
  Images: (form.images || []).map((i) => i?.url || ''),
  CategoryName: form.group || '',
  BrandName: form.brand || '',
  IsActive: form.productStatus !== 'inactive',
});

export const formatMoney = (value) => new Intl.NumberFormat('vi-VN').format(value);

/* ========== Date Helpers ========== */
export const parseDateTime = (value) => {
  const [datePart, timePart = '00:00'] = value.split(' ');
  const [day, month, year] = datePart.split('/').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute);
};

export const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
export const endOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
export const addDays = (date, days) => {
  const r = new Date(date);
  r.setDate(r.getDate() + days);
  return r;
};

export const getCreatedPresetRange = (label) => {
  const now = new Date();
  const todayStart = startOfDay(now),
    todayEnd = endOfDay(now);
  const thisWeekStart = startOfDay(addDays(now, -(now.getDay() === 0 ? 6 : now.getDay() - 1)));
  const thisWeekEnd = endOfDay(addDays(thisWeekStart, 6));
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthEnd = endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  switch (label) {
    case 'Hôm nay':
      return { start: todayStart, end: todayEnd };
    case 'Hôm qua':
      return { start: startOfDay(addDays(now, -1)), end: endOfDay(addDays(now, -1)) };
    case 'Tuần này':
      return { start: thisWeekStart, end: thisWeekEnd };
    case 'Tuần trước':
      return {
        start: startOfDay(addDays(thisWeekStart, -7)),
        end: endOfDay(addDays(thisWeekEnd, -7)),
      };
    case 'Tháng này':
      return { start: thisMonthStart, end: thisMonthEnd };
    case 'Tháng trước':
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        end: endOfDay(new Date(now.getFullYear(), now.getMonth(), 0)),
      };
    default:
      return null;
  }
};

export const getEstimatedPresetRange = (label) => {
  const now = new Date();
  switch (label) {
    case 'Ngày mai':
      return { start: startOfDay(addDays(now, 1)), end: endOfDay(addDays(now, 1)) };
    case '3 ngày tới':
      return { start: startOfDay(now), end: endOfDay(addDays(now, 3)) };
    case '5 ngày tới':
      return { start: startOfDay(now), end: endOfDay(addDays(now, 5)) };
    case '7 ngày tới':
      return { start: startOfDay(now), end: endOfDay(addDays(now, 7)) };
    case '30 ngày tới':
      return { start: startOfDay(now), end: endOfDay(addDays(now, 30)) };
    case 'Tháng này':
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
      };
    default:
      return null;
  }
};

/* ========== Constants ========== */
export const toneClass = {
  green: 'bg-green-100 text-green-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
};

export const estimatedQuickRanges = [
  { label: 'Hôm nay', group: 'estimated' },
  { label: 'Ngày mai', group: 'estimated' },
  { label: '3 ngày tới', group: 'estimated' },
  { label: '5 ngày tới', group: 'estimated' },
  { label: '7 ngày tới', group: 'estimated' },
  { label: '30 ngày tới', group: 'estimated' },
  { label: 'Tháng này', group: 'estimated' },
];

export const createdQuickRanges = [
  { label: 'Hôm nay', group: 'created' },
  { label: 'Hôm qua', group: 'created' },
  { label: 'Tuần này', group: 'created' },
  { label: 'Tuần trước', group: 'created' },
  { label: 'Tháng này', group: 'created' },
  { label: 'Tháng trước', group: 'created' },
];

export const statusOptions = [
  { label: 'Đang hoạt động', value: 'active' },
  { label: 'Ngừng hoạt động', value: 'inactive' },
];
