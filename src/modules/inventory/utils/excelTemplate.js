// xlsx được load qua CDN script để tránh lỗi webpack không resolve được
// (react-scripts 5 không polyfill node modules)
const XLSX_CDN_URL = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';

const ensureXlsxLoaded = () => {
  if (typeof window.XLSX !== 'undefined') return Promise.resolve(window.XLSX);
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-xlsx="true"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(window.XLSX));
      existing.addEventListener('error', reject);
      return;
    }
    const script = document.createElement('script');
    script.src = XLSX_CDN_URL;
    script.async = true;
    script.dataset.xlsx = 'true';
    script.onload = () => resolve(window.XLSX);
    script.onerror = () => reject(new Error('Không thể tải thư viện xlsx từ CDN.'));
    document.head.appendChild(script);
  });
};

const EXCEL_TEMPLATE_HEADERS = [
  'STT',
  'Mã hàng',
  'Tên hàng',
  'ĐVT',
  'Số lượng',
  'Đơn giá nhập',
  'Bảo hành',
];

const EXCEL_TEMPLATE_SAMPLE_DATA = [
  ['1', 'SP-001', 'Thép tấm 10mm', 'Tấm', '10', '50000', '12 tháng'],
  ['2', 'SP-002', 'Inox 304 tấm 1.5mm', 'Tấm', '5', '76000', '7 ngày'],
  ['3', 'SP-003', 'Thép ống D50', 'Cây', '20', '120000', '2 năm'],
];

export const downloadExcelTemplate = async () => {
  const XLSX = await ensureXlsxLoaded();
  const ws = XLSX.utils.aoa_to_sheet([EXCEL_TEMPLATE_HEADERS, ...EXCEL_TEMPLATE_SAMPLE_DATA]);

  ws['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 26 },
    { wch: 8 },
    { wch: 10 },
    { wch: 16 },
    { wch: 14 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Nhập kho');

  XLSX.writeFile(wb, 'mau_nhap_kho.xlsx');
};

/**
 * Chuyển chuỗi số tiếng Việt sang Number.
 * VD: "1.000" -> 1000, "1.000,5" -> 1000.5, "1,5" -> 1.5
 */
const parseNumber = (raw) => {
  const s = String(raw ?? '').trim();
  if (!s) return NaN;

  const hasComma = s.includes(',');
  const hasDot = s.includes('.');

  if (hasComma && hasDot) {
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
      return Number(s.replace(/\./g, '').replace(',', '.'));
    }
    return Number(s.replace(/,/g, ''));
  }

  if (hasComma && !hasDot) {
    const parts = s.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      return Number(s.replace(',', '.'));
    }
    return Number(s.replace(/,/g, ''));
  }

  if (hasDot && !hasComma) {
    const parts = s.split('.');
    if (parts.length === 2 && parts[1].length <= 2) {
      return Number(s);
    }
    return Number(s.replace(/\./g, ''));
  }

  return Number(s);
};

const formatCurrency = (val) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
};

/**
 * Chuẩn hóa chuỗi Tiếng Việt: NFC + bỏ dấu + lowercase.
 */
const normalizeText = (str) => {
  if (!str) return '';
  return String(str)
    .normalize('NFC')
    .toLowerCase()
    .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
    .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
    .replace(/ì|í|ị|ỉ|ĩ/g, 'i')
    .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
    .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
    .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
    .replace(/đ/g, 'd')
    .trim();
};

/**
 * Parse ô "Bảo hành" từ Excel.
 * Trả về { warrantyPeriod: number, warrantyUnit: 'DAY'|'MONTH'|'YEAR' }
 */
export const parseWarrantyCell = (raw) => {
  const s = String(raw ?? '').trim();
  if (!s || s === '0') return { warrantyPeriod: 0, warrantyUnit: 'MONTH' };

  const numMatch = s.match(/(\d+)/);
  if (!numMatch) return { warrantyPeriod: 0, warrantyUnit: 'MONTH' };
  const period = parseInt(numMatch[1], 10);

  const normalized = normalizeText(s);
  if (normalized.includes('ngay') || normalized.includes('day')) return { warrantyPeriod: period, warrantyUnit: 'DAY' };
  if (normalized.includes('nam') || normalized.includes('year')) return { warrantyPeriod: period, warrantyUnit: 'YEAR' };
  return { warrantyPeriod: period, warrantyUnit: 'MONTH' };
};

/**
 * Tìm giá trị cột Bảo hành trong row object Excel.
 */
export const extractRawWarrantyValue = (rowObj) => {
  if (!rowObj || typeof rowObj !== 'object') return null;
  const keys = Object.keys(rowObj);
  const targetKey = keys.find((k) => {
    const nk = normalizeText(k);
    return nk.includes('bao hanh') || nk.includes('bh') || nk.includes('warranty');
  });
  return targetKey ? rowObj[targetKey] : null;
};

/**
 * Bước 1: Kiểm tra tính nhất quán nội bộ file Excel.
 * Cùng 1 Mã hàng bắt buộc chỉ có duy nhất 1 Tên hàng, 1 ĐVT và 1 Đơn giá.
 * Nếu phát hiện bất nhất -> chặn import, báo lỗi chi tiết từng dòng.
 * Trả về null nếu không có lỗi, hoặc mảng lỗi.
 */
const validateInternalFileConsistency = (rawRowsByCode) => {
  const errors = [];

  for (const [code, rows] of Object.entries(rawRowsByCode)) {
    if (rows.length < 2) continue;

    // 1. Kiểm tra Tên hàng: 1 mã không được gắn cho nhiều tên khác nhau
    const names = rows.map((r) => (r.productName || '').trim().toLowerCase());
    const uniqueNames = [...new Set(names)].filter(Boolean);
    if (uniqueNames.length > 1) {
      const nameDetails = rows
        .map((r) => `  - Dòng ${r.lineNum}: "${r.productName}"`)
        .join('\n');
      errors.push(
        `Mã hàng ${code} đang bị đặt cho nhiều tên sản phẩm khác nhau:\n${nameDetails}\n` +
        `→ Vui lòng sửa lại mã hàng trong file Excel.`
      );
      continue; // đã có lỗi tên thì không cần check tiếp giá và ĐVT
    }

    // 2. Kiểm tra ĐVT: 1 mã không được có nhiều ĐVT khác nhau
    const units = rows.map((r) => (r.unit || '').trim().toLowerCase());
    const uniqueUnits = [...new Set(units)].filter(Boolean);
    if (uniqueUnits.length > 1) {
      const unitDetails = rows
        .map((r) => `  - Dòng ${r.lineNum}: ${r.quantity} ${r.unit || '---'}`)
        .join('\n');
      errors.push(
        `Mã hàng ${code} (${rows[0].productName}) đang khai báo nhiều ĐVT khác nhau:\n${unitDetails}\n` +
        `→ Vui lòng đồng nhất ĐVT cho sản phẩm này trong file Excel trước khi import.`
      );
      continue;
    }

    // 3. Kiểm tra Đơn giá: 1 mã không được có nhiều đơn giá khác nhau
    const prices = rows.map((r) => r.costPrice);
    const uniquePrices = [...new Set(prices)];
    if (uniquePrices.length > 1) {
      const priceDetails = rows
        .map((r) => `  - Dòng ${r.lineNum}: ${r.quantity} x ${formatCurrency(r.costPrice)}`)
        .join('\n');
      const productName = rows[0].productName || code;
      errors.push(
        `Sản phẩm ${code} (${productName}) xuất hiện ${rows.length} lần với đơn giá khác nhau:\n${priceDetails}\n` +
        `→ Vui lòng thống nhất đơn giá cho sản phẩm này trong file Excel trước khi import.`
      );
    }
  }

  return errors.length > 0 ? errors : null;
};

/**
 * Parse file Excel/CSV người dùng upload, validate đúng định dạng mẫu.
 * Trả về { success: true, data: [...] }
 * hoặc { success: false, error: '...' }
 */
export const parseImportExcelFile = async (file) => {
  const XLSX = await ensureXlsxLoaded();
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          resolve({ success: false, error: 'File Excel không có sheet dữ liệu nào.' });
          return;
        }

        const sheet = workbook.Sheets[sheetName];
        // Đọc cả dạng object (có key) để tìm cột Bảo hành linh hoạt
        const rowsAsObjects = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

        if (rows.length < 2) {
          resolve({
            success: false,
            error: 'File Excel phải có ít nhất 1 dòng tiêu đề và 1 dòng dữ liệu.',
          });
          return;
        }

        const headerRow = rows[0];
        const normalizedHeaders = headerRow.map((h) =>
          String(h).trim().replace(/\s+/g, ' ')
        );

        // Tìm index của từng cột theo tên (linh hoạt, ko phụ thuộc vị trí)
        const findColIndex = (keywords) => {
          return normalizedHeaders.findIndex((h) => {
            const norm = h.toLowerCase().replace(/\s+/g, '');
            return keywords.some((kw) => norm.includes(kw.toLowerCase().replace(/\s+/g, '')));
          });
        };

        const idxProductCode = findColIndex(['mã hàng', 'ma hang', 'mã sp', 'productcode', 'product code', 'mã']);
        const idxProductName = findColIndex(['tên hàng', 'ten hang', 'tên sp', 'productname', 'product name', 'tên']);
        const idxUnit = findColIndex(['đvt', 'dvt', 'đơn vị', 'don vi', 'unit']);
        const idxQuantity = findColIndex(['số lượng', 'so luong', 'quantity', 'sl']);
        const idxCostPrice = findColIndex(['đơn giá', 'don gia', 'giá nhập', 'gia nhap', 'costprice', 'cost price', 'đơn giá nhập']);
        const idxWarranty = findColIndex(['bảo hành', 'bao hanh', 'bh', 'warranty', 'bảo', 'bảo hành (']);

        if (idxProductCode === -1 || idxProductName === -1 || idxQuantity === -1) {
          resolve({
            success: false,
            error: `File Excel thiếu cột bắt buộc: Mã hàng, Tên hàng, Số lượng. Các cột tìm thấy: ${normalizedHeaders.join(', ')}`,
          });
          return;
        }

        const dataRows = rows.slice(1).filter((row) => {
          return row.some((cell) => String(cell ?? '').trim() !== '');
        });

        if (dataRows.length === 0) {
          resolve({ success: false, error: 'File Excel không có dòng dữ liệu nào.' });
          return;
        }

        const getVal = (row, idx) => (idx >= 0 ? String(row[idx] ?? '').trim() : '');

        // Lưu tất cả dòng raw theo ProductCode để phát hiện chênh lệch giá
        const rawRowsByCode = {};

        for (let i = 0; i < dataRows.length; i++) {
          const row = dataRows[i];
          const rowObj = rowsAsObjects[i] || {};
          const lineNum = i + 2;
          const productCode = getVal(row, idxProductCode);
          const productName = getVal(row, idxProductName);
          const unit = getVal(row, idxUnit);
          const quantityRaw = getVal(row, idxQuantity);
          const costPriceRaw = getVal(row, idxCostPrice);
          // Ưu tiên lấy từ index, fallback từ object key
          const warrantyRaw = getVal(row, idxWarranty) || extractRawWarrantyValue(rowObj);

          if (!productCode || !productName) {
            resolve({
              success: false,
              error: `Dòng ${lineNum}: Thiếu mã hàng hoặc tên hàng.`,
            });
            return;
          }

          const quantity = parseNumber(quantityRaw);
          if (!quantityRaw || isNaN(quantity) || quantity <= 0 || quantity > 999999) {
            resolve({
              success: false,
              error: `Dòng ${lineNum}: Số lượng "${quantityRaw}" không hợp lệ (phải là số dương <= 999.999).`,
            });
            return;
          }

          const costPrice = parseNumber(costPriceRaw);
          if (!costPriceRaw || isNaN(costPrice) || costPrice < 0 || costPrice > 999999999) {
            resolve({
              success: false,
              error: `Dòng ${lineNum}: Đơn giá nhập "${costPriceRaw}" không hợp lệ (phải là số >= 0 và <= 999.999.999).`,
            });
            return;
          }

          const { warrantyPeriod, warrantyUnit } = parseWarrantyCell(warrantyRaw);

          if (!rawRowsByCode[productCode]) {
            rawRowsByCode[productCode] = [];
          }
          rawRowsByCode[productCode].push({
            lineNum,
            productCode,
            productName,
            unit,
            quantity,
            costPrice,
            warrantyPeriod,
            warrantyUnit,
          });
        }

        // Bước 1: Kiểm tra tính nhất quán nội bộ file Excel (Tên, ĐVT, Đơn giá)
        const internalErrors = validateInternalFileConsistency(rawRowsByCode);
        if (internalErrors) {
          resolve({
            success: false,
            error: 'File Excel chứa dữ liệu không nhất quán:\n\n' + internalErrors.join('\n\n'),
          });
          return;
        }

        // Cộng dồn các dòng trùng mã SP (chỉ khi đã xác nhận cùng giá)
        const parsed = [];
        for (const [code, rows] of Object.entries(rawRowsByCode)) {
          if (rows.length === 1) {
            const r = rows[0];
            parsed.push({
              productCode: r.productCode,
              productName: r.productName,
              unitName: r.unit,
              unit: r.unit,
              quantity: r.quantity,
              costPrice: r.costPrice,
              warrantyPeriod: r.warrantyPeriod,
              warrantyUnit: r.warrantyUnit,
            });
          } else {
            // Cùng giá -> cộng dồn số lượng
            const totalQty = rows.reduce((s, r) => s + r.quantity, 0);
            parsed.push({
              productCode: code,
              productName: rows[0].productName,
              unitName: rows[0].unit,
              unit: rows[0].unit,
              quantity: totalQty,
              costPrice: rows[0].costPrice,
              warrantyPeriod: rows[0].warrantyPeriod,
              warrantyUnit: rows[0].warrantyUnit,
            });
          }
        }

        resolve({ success: true, data: parsed });
      } catch (err) {
        resolve({
          success: false,
          error: `Không thể đọc file. Hãy chắc chắn file đúng định dạng Excel (.xlsx, .xls) hoặc CSV.`,
        });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, error: 'Không thể đọc file. Vui lòng thử lại.' });
    };

    reader.readAsArrayBuffer(file);
  });
};
