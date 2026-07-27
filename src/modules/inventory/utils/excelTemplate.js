import * as XLSX from 'xlsx';

const EXCEL_TEMPLATE_HEADERS = [
  'STT',
  'Mã hàng',
  'Tên hàng',
  'ĐVT',
  'Số lượng',
  'Đơn giá nhập',
];

const EXCEL_TEMPLATE_SAMPLE_DATA = [
  ['1', 'SP-001', 'Thép tấm 10mm', 'Tấm', '10', '50000'],
  ['2', 'SP-002', 'Inox 304 tấm 1.5mm', 'Tấm', '5', '76000'],
  ['3', 'SP-003', 'Thép ống D50', 'Cây', '20', '120000'],
];

export const downloadExcelTemplate = () => {
  const ws = XLSX.utils.aoa_to_sheet([EXCEL_TEMPLATE_HEADERS, ...EXCEL_TEMPLATE_SAMPLE_DATA]);

  ws['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 26 },
    { wch: 8 },
    { wch: 10 },
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

/**
 * Parse file Excel/CSV người dùng upload, validate đúng định dạng mẫu.
 * Trả về { success: true, data: [...] } hoặc { success: false, error: '...' }
 */
export const parseImportExcelFile = (file) => {
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
          String(h).trim().replace(/\s+/g, ' ')
        );
        const expectedHeaders = EXCEL_TEMPLATE_HEADERS.map((h) => h.trim());

        const headersMatch = expectedHeaders.every(
          (expected, i) => normalizedHeaders[i] === expected
        );

        if (!headersMatch) {
          resolve({
            success: false,
            error: `File không đúng định dạng mẫu. Tiêu đề cần có: ${expectedHeaders.join(', ')}. Hãy tải file mẫu và điền dữ liệu.`,
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

        const parsed = [];
        for (let i = 0; i < dataRows.length; i++) {
          const row = dataRows[i];
          const lineNum = i + 2;
          const productCode = String(row[1] ?? '').trim();
          const productName = String(row[2] ?? '').trim();
          const unit = String(row[3] ?? '').trim();
          const quantityRaw = String(row[4] ?? '').trim();
          const costPriceRaw = String(row[5] ?? '').trim();

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

          parsed.push({
            productCode,
            productName,
            unitName: unit,
            unit,
            quantity,
            costPrice,
          });
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
