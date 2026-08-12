import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const createSheet = (workbook, sheetName, dateText, headers, data, rowMapper, sumCols = []) => {
  const ws = workbook.addWorksheet(sheetName);

  if (dateText) {
    const r1 = ws.addRow([dateText]);
    r1.font = { size: 10, italic: true, color: { argb: 'FF64748B' } };
    ws.addRow([]);
  }

  const headerRow = ws.addRow(headers);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  const startRow = headerRow.number + 1;
  data.forEach((item, idx) => {
    const row = ws.addRow(rowMapper(item, idx));
    row.getCell(1).alignment = { horizontal: 'center' };
    row.getCell(2).alignment = { horizontal: 'center' };
  });

  const lastDataRow = startRow + data.length - 1;

  if (sumCols.length > 0) {
    const summaryCells = ['', '', 'TỔNG CỘNG'];
    while (summaryCells.length < headers.length) summaryCells.push('');
    sumCols.forEach(col => {
      const colLetter = String.fromCharCode(64 + col);
      summaryCells[col - 1] = { formula: `SUM(${colLetter}${startRow}:${colLetter}${lastDataRow})` };
    });
    const summaryRow = ws.addRow(summaryCells);
    summaryRow.font = { bold: true };
    summaryRow.getCell(3).alignment = { horizontal: 'right' };
    summaryRow.eachCell(cell => {
      cell.border = { top: { style: 'double' } };
    });
  }

  ws.columns.forEach(col => {
    let max = 10;
    col.eachCell({ includeEmpty: true }, cell => {
      const len = cell.value ? String(cell.value).length : 8;
      if (len > max) max = len;
    });
    col.width = Math.min(max + 5, 30);
  });
};

const dateText = (filterInfo) =>
  filterInfo.fromDate && filterInfo.toDate
    ? `Từ ngày: ${filterInfo.fromDate}  -  Đến ngày: ${filterInfo.toDate}`
    : '';

const saveWorkbook = async (workbook, fileName) => {
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

/**
 * Xuất báo cáo xuất nhập tồn
 */
export const exportStockReportToExcel = async (data, filterInfo = {}, fileName = 'Bao_Cao_Xuat_Nhap_Ton') => {
  if (!data || !data.length) return;
  const workbook = new ExcelJS.Workbook();
  createSheet(workbook, 'Xuất Nhập Tồn', dateText(filterInfo),
    ['STT', 'Mã SP', 'Tên sản phẩm', 'Nhóm', 'SL Đầu kỳ', 'SL Nhập', 'SL Xuất', 'SL Đ/Chỉnh', 'SL Cuối kỳ', 'GT Đầu kỳ', 'GT Nhập', 'GT Xuất', 'GT Đ/Chỉnh', 'GT Cuối kỳ'],
    data,
    (item, idx) => [
      idx + 1, item.productCode || '', item.productName || '', item.categoryName || '',
      item.openingStock ?? 0, item.inwardQuantity ?? 0, item.outwardQuantity ?? 0, item.adjustmentQuantity ?? 0, item.closingStock ?? 0,
      item.openingValue ?? 0, item.inwardValue ?? 0, item.outwardValue ?? 0, item.adjustmentValue ?? 0, item.closingValue ?? 0,
    ],
    [5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
  );
  await saveWorkbook(workbook, fileName);
};

/**
 * Xuất báo cáo doanh thu theo thời gian
 */
export const exportRevenueReportToExcel = async (data, filterInfo = {}, fileName = 'Bao_Cao_Doanh_Thu') => {
  if (!data || !data.length) return;
  const workbook = new ExcelJS.Workbook();
  createSheet(workbook, 'Doanh Thu', dateText(filterInfo),
    ['STT', 'Thời gian', 'Doanh thu', 'Tổng giá vốn', 'Lợi nhuận gộp', 'Tỷ suất LN (%)'],
    data,
    (item, idx) => [
      idx + 1, item.timeKey || '', item.revenue ?? 0, item.totalCost ?? 0, item.grossProfit ?? 0, (item.profitMargin ?? 0).toFixed(2) + '%',
    ],
    [3, 4, 5]
  );
  await saveWorkbook(workbook, fileName);
};

/**
 * Xuất báo cáo lợi nhuận theo sản phẩm
 */
export const exportProductProfitReportToExcel = async (data, filterInfo = {}, fileName = 'Bao_Cao_Loi_Nhuan_SP') => {
  if (!data || !data.length) return;
  const workbook = new ExcelJS.Workbook();
  createSheet(workbook, 'Lợi Nhuận SP', dateText(filterInfo),
    ['STT', 'Mã SP', 'Tên sản phẩm', 'Nhóm', 'SL Bán', 'Doanh thu', 'Giá vốn', 'Lợi nhuận', 'Biên LN (%)'],
    data,
    (item, idx) => [
      idx + 1, item.productCode || '', item.productName || '', item.categoryName || '',
      item.quantitySold ?? 0, item.revenue ?? 0, item.cost ?? 0, item.profit ?? 0, (item.profitMargin ?? 0).toFixed(2) + '%',
    ],
    [5, 6, 7, 8]
  );
  await saveWorkbook(workbook, fileName);
};

/**
 * Xuất báo cáo tồn kho sắp hết
 */
export const exportLowStockReportToExcel = async (data, filterInfo = {}, fileName = 'Bao_Cao_Ton_Kho_Sap_Het') => {
  if (!data || !data.length) return;
  const workbook = new ExcelJS.Workbook();
  createSheet(workbook, 'Tồn Kho Sắp Hết', dateText(filterInfo),
    ['STT', 'Mã SP', 'Tên sản phẩm', 'Nhóm', 'Tồn kho', 'Tồn tối thiểu', 'Giá bán', 'Giá vốn'],
    data,
    (item, idx) => [
      idx + 1, item.productCode || '', item.productName || '', item.categoryName || '',
      item.currentStock ?? 0, item.minimumStock ?? 0, item.salePrice ?? 0, item.costPrice ?? 0,
    ],
    [5]
  );
  await saveWorkbook(workbook, fileName);
};
