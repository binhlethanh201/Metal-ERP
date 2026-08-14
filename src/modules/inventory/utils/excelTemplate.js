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
  'Bảo hành (tháng)', // 0 = không bảo hành
];

const EXCEL_TEMPLATE_SAMPLE_DATA = [
  ['1', 'SP-001', 'Thép tấm 10mm', 'Tấm', '10', '50000', '12'],
  ['2', 'SP-002', 'Inox 304 tấm 1.5mm', 'Tấm', '5', '76000', '12'],
  ['3', 'SP-003', 'Thép ống D50', 'Cây', '20', '120000', '6'],
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
    { wch: 16 },
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
 * Bỏ dấu tiếng Việt + lowercase để so khớp linh hoạt.
 */
const normalizeText = (raw) =>
  String(raw ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Nhận diện đơn vị bảo hành từ chuỗi người dùng nhập,
 * chấp nhận mọi cách viết (có/không dấu, viết tắt, lẫn tiếng Anh).
 * VD: "12 tháng", "6 thang", "1 năm", "30 ngay", "365 day", "1y" ...
 * Trả về 'DAY' | 'MONTH' | 'YEAR' (mặc định MONTH theo tiêu đề cột).
 */
const detectWarrantyUnit = (raw) => {
  const s = normalizeText(raw);
  if (!s) return 'MONTH';
  // năm/nam/nam/year/y (đặt trước để tránh "nam" bị nuốt bởi month/day)
  if (s.includes('nam') || s.includes('year') || /\b(y|yr)\b/.test(s) || /\d+y\b/.test(s)) return 'YEAR';
  // ngày/ngay/day/d
  if (s.includes('ngay') || s.includes('day') || /\b(d|dd)\b/.test(s) || /\d+d\b/.test(s)) return 'DAY';
  // tháng/thang/month/m/t
  if (s.includes('thang') || s.includes('month') || /\b(m|mm|mo)\b/.test(s) || /\d+m\b/.test(s)) return 'MONTH';
  return 'MONTH';
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
          String(h ?? '').trim().replace(/\s+/g, ' ').toLowerCase()
        );

        // Dò cột theo tên (linh hoạt): cho phép thêm cột phụ, đổi thứ tự,
        // sai lệch khoảng trắng. Mỗi field có nhiều alias phổ biến.
        const COLUMN_ALIASES = {
          stt: ['stt', 'so thu tu', '#', 'no'],
          productCode: ['ma hang', 'ma san pham', 'mã hàng', 'mã sp', 'code', 'sku', 'mã'],
          productName: ['ten hang', 'ten san pham', 'tên hàng', 'tên sản phẩm', 'name', 'tên', 'mo ta'],
          unit: ['dvt', 'don vi tinh', 'đvt', 'đơn vị tính', 'unit', 'đv'],
          quantity: ['so luong', 'số lượng', 'qty', 'sl', 's.luong'],
          costPrice: ['don gia nhap', 'don gia', 'đơn giá nhập', 'đơn giá', 'gia nhap', 'giá nhập', 'price', 'cost', 'gia'],
          warranty: ['bao hanh', 'bảo hành', 'bao hanh (thang)', 'bảo hành (tháng)', 'bh', 'warranty', 'thang bh', 'tháng bh'],
        };

        const findColIndex = (aliases) => {
          for (const alias of aliases) {
            const idx = normalizedHeaders.indexOf(alias);
            if (idx >= 0) return idx;
          }
          // khớp mờ: chứa alias như chuỗi con
          for (const alias of aliases) {
            const idx = normalizedHeaders.findIndex((h) => h && h.includes(alias));
            if (idx >= 0) return idx;
          }
          return -1;
        };

        const colMap = {
          productCode: findColIndex(COLUMN_ALIASES.productCode),
          productName: findColIndex(COLUMN_ALIASES.productName),
          unit: findColIndex(COLUMN_ALIASES.unit),
          quantity: findColIndex(COLUMN_ALIASES.quantity),
          costPrice: findColIndex(COLUMN_ALIASES.costPrice),
          warranty: findColIndex(COLUMN_ALIASES.warranty),
        };

        const missing = Object.entries(colMap)
          .filter(([field, idx]) => idx < 0 && field !== 'warranty')
          .map(([field]) => field);

        if (missing.length > 0) {
          const missingVi = missing.map((f) => ({
            productCode: 'Mã hàng',
            productName: 'Tên hàng',
            unit: 'ĐVT',
            quantity: 'Số lượng',
            costPrice: 'Đơn giá nhập',
          }[f] || f));
          resolve({
            success: false,
            error:
              `File thiếu cột: ${missingVi.join(', ')}.\n` +
              `Các cột cần có: STT, Mã hàng, Tên hàng, ĐVT, Số lượng, Đơn giá nhập, Bảo hành (tháng).\n` +
              `Mẹo: cột STT và Bảo hành được phép thiếu; các cột còn lại bắt buộc. Hãy tải file mẫu để có đúng định dạng.`,
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

        // Lưu tất cả dòng raw theo ProductCode để phát hiện chênh lệch giá
        const rawRowsByCode = {};

        for (let i = 0; i < dataRows.length; i++) {
          const row = dataRows[i];
          const lineNum = i + 2;
          const productCode = String(row[colMap.productCode] ?? '').trim();
          const productName = String(row[colMap.productName] ?? '').trim();
          const unit = String(row[colMap.unit] ?? '').trim();
          const quantityRaw = String(row[colMap.quantity] ?? '').trim();
          const costPriceRaw = String(row[colMap.costPrice] ?? '').trim();
          // Cột "Bảo hành (tháng)" — để trống hoặc 0 = không bảo hành
          const warrantyPeriodRaw = String(row[colMap.warranty] ?? '').trim();

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

          // Bảo hành: trích số nguyên đầu tiên + nhận diện đơn vị (ngày/tháng/năm)
          // từ mọi cách viết ("12", "12 tháng", "6 thang", "1 năm", "30 ngay"...)
          // 0 hoặc để trống = không bảo hành
          let warrantyPeriod = 0;
          let warrantyUnit = 'MONTH';
          if (warrantyPeriodRaw !== '') {
            const m = warrantyPeriodRaw.replace(/[.,\s]/g, '').match(/\d+/);
            const wp = m ? Number(m[0]) : NaN;
            if (isNaN(wp) || wp < 0 || wp > 60000 || !Number.isInteger(wp)) {
              resolve({
                success: false,
                error: `Dòng ${lineNum}: Bảo hành "${warrantyPeriodRaw}" không hợp lệ (phải là số nguyên từ 0 đến 60000; 0 = không bảo hành).`,
              });
              return;
            }
            warrantyPeriod = wp;
            warrantyUnit = detectWarrantyUnit(warrantyPeriodRaw);
          }

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
            // Cùng giá -> cộng dồn số lượng, bảo hành lấy theo dòng đầu tiên
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
