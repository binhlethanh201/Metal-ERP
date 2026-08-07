import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

/**
 * Xuất báo cáo ra file Excel (.xlsx) chuyên nghiệp.
 * @param {Array} data - Dữ liệu báo cáo (items)
 * @param {Object} filterInfo - { fromDate, toDate, branchName }
 * @param {string} fileName - Tên file (không cần đuôi)
 */
export const exportStockReportToExcel = async (data, filterInfo = {}, fileName = 'Bao_Cao_Xuat_Nhap_Ton') => {
  if (!data || !data.length) return;

  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('Xuất Nhập Tồn');

  // --- Row 1: Khoảng thời gian ---
  const dateText = filterInfo.fromDate && filterInfo.toDate
    ? `Từ ngày: ${filterInfo.fromDate}  -  Đến ngày: ${filterInfo.toDate}`
    : '';
  if (dateText) {
    const r1 = ws.addRow([dateText]);
    r1.font = { size: 10, italic: true, color: { argb: 'FF64748B' } };
    ws.addRow([]);
  }

  // --- Header Row ---
  const headers = [
    'STT', 'Mã SP', 'Tên sản phẩm', 'Nhóm',
    'SL Đầu kỳ', 'SL Nhập', 'SL Xuất', 'SL Đ/Chỉnh', 'SL Cuối kỳ',
    'GT Đầu kỳ', 'GT Nhập', 'GT Xuất', 'GT Đ/Chỉnh', 'GT Cuối kỳ',
  ];
  const headerRow = ws.addRow(headers);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  // --- Data Rows ---
  const startRow = headerRow.number + 1;
  data.forEach((item, idx) => {
    const row = ws.addRow([
      idx + 1,
      item.productCode || '',
      item.productName || '',
      item.categoryName || '',
      item.openingStock ?? 0,
      item.inwardQuantity ?? 0,
      item.outwardQuantity ?? 0,
      item.adjustmentQuantity ?? 0,
      item.closingStock ?? 0,
      item.openingValue ?? 0,
      item.inwardValue ?? 0,
      item.outwardValue ?? 0,
      item.adjustmentValue ?? 0,
      item.closingValue ?? 0,
    ]);

    row.getCell(1).alignment = { horizontal: 'center' };
    row.getCell(2).alignment = { horizontal: 'center' };
    for (let c = 5; c <= 9; c++) {
      row.getCell(c).numFmt = '#,##0';
      row.getCell(c).alignment = { horizontal: 'right' };
    }
    for (let c = 10; c <= 14; c++) {
      row.getCell(c).numFmt = '#,##0\\ "đ"';
      row.getCell(c).alignment = { horizontal: 'right' };
    }
  });

  const lastDataRow = startRow + data.length - 1;

  // --- Summary Row ---
  const summaryRow = ws.addRow([
    '', '', 'TỔNG CỘNG', '',
    { formula: `SUM(E${startRow}:E${lastDataRow})` },
    { formula: `SUM(F${startRow}:F${lastDataRow})` },
    { formula: `SUM(G${startRow}:G${lastDataRow})` },
    { formula: `SUM(H${startRow}:H${lastDataRow})` },
    { formula: `SUM(I${startRow}:I${lastDataRow})` },
    { formula: `SUM(J${startRow}:J${lastDataRow})` },
    { formula: `SUM(K${startRow}:K${lastDataRow})` },
    { formula: `SUM(L${startRow}:L${lastDataRow})` },
    { formula: `SUM(M${startRow}:M${lastDataRow})` },
    { formula: `SUM(N${startRow}:N${lastDataRow})` },
  ]);
  summaryRow.font = { bold: true };
  summaryRow.getCell(3).alignment = { horizontal: 'right' };
  for (let c = 5; c <= 9; c++) {
    summaryRow.getCell(c).numFmt = '#,##0';
    summaryRow.getCell(c).alignment = { horizontal: 'right' };
  }
  for (let c = 10; c <= 14; c++) {
    summaryRow.getCell(c).numFmt = '#,##0\\ "đ"';
    summaryRow.getCell(c).alignment = { horizontal: 'right' };
  }
  // Top border đôi cho dòng tổng
  summaryRow.eachCell(cell => {
    cell.border = { top: { style: 'double' } };
  });

  // --- Auto-fit Column Widths ---
  ws.columns.forEach(col => {
    let max = 10;
    col.eachCell({ includeEmpty: true }, cell => {
      const len = cell.value ? String(cell.value).length : 8;
      if (len > max) max = len;
    });
    col.width = Math.min(max + 5, 30);
  });

  // --- Save ---
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
};
