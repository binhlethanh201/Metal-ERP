/**
 * SummaryReportTable - Bảng báo cáo Multi-header với sticky left columns.
 * Tổng cộng dùng <tfoot> để tự động khớp cột với <thead>/<tbody>.
 */
const formatNum = (v) => (v != null ? v.toLocaleString('vi-VN') : '0');

const SummaryReportTable = ({ rows, totals, showWarehouseCol }) => {
  const colSpan = showWarehouseCol ? 11 : 10;

  return (
    <div className="flex w-full flex-col overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[1200px] table-fixed border-collapse">
          {/* ===== MULTI-HEADER ===== */}
          <thead>
            {/* Row 1: Group headers */}
            <tr className="border-b border-slate-200 bg-slate-100">
              <th
                className="sticky left-0 z-10 border-r border-slate-200 bg-slate-100 px-3 py-2 text-center text-[11px] font-bold uppercase text-slate-500"
                style={{ width: 120 }}
              >
                Mã hàng hóa
              </th>
              <th
                className="sticky left-[120px] z-10 border-r border-slate-200 bg-slate-100 px-3 py-2 text-left text-[11px] font-bold uppercase text-slate-500"
                style={{ width: 180 }}
              >
                Tên hàng hóa
              </th>
              <th
                className="border-r border-slate-200 bg-slate-100 px-3 py-2 text-center text-[11px] font-bold uppercase text-slate-500"
                style={{ width: 80 }}
              >
                ĐVT
              </th>
              {showWarehouseCol && (
                <th
                  className="border-r border-slate-200 bg-slate-100 px-3 py-2 text-left text-[11px] font-bold uppercase text-slate-500"
                  style={{ width: 130 }}
                >
                  Kho
                </th>
              )}
              <th
                colSpan={2}
                className="border-r border-slate-200 bg-blue-50/60 px-3 py-2 text-center text-[11px] font-bold uppercase text-blue-800"
              >
                Tồn đầu kỳ
              </th>
              <th
                colSpan={2}
                className="border-r border-slate-200 bg-green-50/60 px-3 py-2 text-center text-[11px] font-bold uppercase text-green-800"
              >
                Nhập kho
              </th>
              <th
                colSpan={2}
                className="border-r border-slate-200 bg-red-50/60 px-3 py-2 text-center text-[11px] font-bold uppercase text-red-800"
              >
                Xuất kho
              </th>
              <th
                colSpan={2}
                className="bg-amber-50/60 px-3 py-2 text-center text-[11px] font-bold uppercase text-slate-700"
              >
                Tồn cuối kỳ
              </th>
            </tr>

            {/* Row 2: Sub-column headers */}
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="sticky left-0 z-10 border-r border-slate-200 bg-slate-50 px-3 py-1.5" />
              <th className="sticky left-[120px] z-10 border-r border-slate-200 bg-slate-50 px-3 py-1.5" />
              <th className="border-r border-slate-200 bg-slate-50 px-3 py-1.5" />
              {showWarehouseCol && (
                <th className="border-r border-slate-200 bg-slate-50 px-3 py-1.5" />
              )}
              <th className="border-r border-slate-100 bg-blue-50/30 px-2 py-1.5 text-right text-[10px] font-bold uppercase text-slate-500">
                SL
              </th>
              <th className="border-r border-slate-200 bg-blue-50/30 px-2 py-1.5 text-right text-[10px] font-bold uppercase text-slate-500">
                Giá trị
              </th>
              <th className="border-r border-slate-100 bg-green-50/30 px-2 py-1.5 text-right text-[10px] font-bold uppercase text-slate-500">
                SL
              </th>
              <th className="border-r border-slate-200 bg-green-50/30 px-2 py-1.5 text-right text-[10px] font-bold uppercase text-slate-500">
                Giá trị
              </th>
              <th className="border-r border-slate-100 bg-red-50/30 px-2 py-1.5 text-right text-[10px] font-bold uppercase text-slate-500">
                SL
              </th>
              <th className="border-r border-slate-200 bg-red-50/30 px-2 py-1.5 text-right text-[10px] font-bold uppercase text-slate-500">
                Giá trị
              </th>
              <th className="border-r border-slate-100 bg-amber-50/30 px-2 py-1.5 text-right text-[10px] font-bold uppercase text-slate-500">
                SL
              </th>
              <th className="bg-amber-50/30 px-2 py-1.5 text-right text-[10px] font-bold uppercase text-slate-500">
                Giá trị
              </th>
            </tr>
          </thead>

          {/* ===== BODY ===== */}
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="px-6 py-16 text-center text-sm text-slate-400">
                  Không có dữ liệu báo cáo
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-blue-50/30">
                  <td className="sticky left-0 z-[5] border-r border-slate-200 bg-white px-3 py-2.5">
                    <span className="font-mono text-xs font-semibold text-blue-700">
                      {row.productCode}
                    </span>
                  </td>
                  <td className="sticky left-[120px] z-[5] border-r border-slate-200 bg-white px-3 py-2.5">
                    <span className="text-sm font-medium text-slate-800">{row.productName}</span>
                  </td>
                  <td className="border-r border-slate-200 px-3 py-2.5 text-center">
                    <span className="text-xs text-slate-600">{row.unit}</span>
                  </td>
                  {showWarehouseCol && (
                    <td className="border-r border-slate-200 px-3 py-2.5">
                      <span className="text-xs text-slate-600">{row.warehouse}</span>
                    </td>
                  )}
                  <td className="border-r border-slate-100 px-2 py-2.5 text-right text-sm tabular-nums text-slate-700">
                    {formatNum(row.beginQty)}
                  </td>
                  <td className="border-r border-slate-200 px-2 py-2.5 text-right text-sm tabular-nums text-slate-700">
                    {formatNum(row.beginValue)}
                  </td>
                  <td className="border-r border-slate-100 px-2 py-2.5 text-right text-sm tabular-nums text-green-700">
                    {formatNum(row.inQty)}
                  </td>
                  <td className="border-r border-slate-200 px-2 py-2.5 text-right text-sm tabular-nums text-green-700">
                    {formatNum(row.inValue)}
                  </td>
                  <td className="border-r border-slate-100 px-2 py-2.5 text-right text-sm tabular-nums text-red-700">
                    {formatNum(row.outQty)}
                  </td>
                  <td className="border-r border-slate-200 px-2 py-2.5 text-right text-sm tabular-nums text-red-700">
                    {formatNum(row.outValue)}
                  </td>
                  <td className="border-r border-slate-100 px-2 py-2.5 text-right text-sm font-semibold tabular-nums text-slate-800">
                    {formatNum(row.endQty)}
                  </td>
                  <td className="px-2 py-2.5 text-right text-sm font-semibold tabular-nums text-slate-800">
                    {formatNum(row.endValue)}
                  </td>
                </tr>
              ))
            )}
          </tbody>

          {/* ===== TOTAL ROW (tfoot) ===== */}
          <tfoot>
            <tr className="border-t-2 border-slate-300 bg-slate-100">
              <td className="sticky left-0 z-[5] border-r border-slate-200 bg-slate-100 px-3 py-3">
                <span className="text-xs font-bold uppercase text-slate-600">Tổng cộng</span>
              </td>
              <td className="sticky left-[120px] z-[5] border-r border-slate-200 bg-slate-100 px-3 py-3" />
              <td className="border-r border-slate-200 bg-slate-100 px-3 py-3" />
              {showWarehouseCol && (
                <td className="border-r border-slate-200 bg-slate-100 px-3 py-3" />
              )}
              <td className="border-r border-slate-100 bg-slate-100 px-2 py-3 text-right text-sm font-bold tabular-nums text-slate-800">
                {formatNum(totals.beginQty)}
              </td>
              <td className="border-r border-slate-200 bg-slate-100 px-2 py-3 text-right text-sm font-bold tabular-nums text-slate-800">
                {formatNum(totals.beginValue)}
              </td>
              <td className="border-r border-slate-100 bg-slate-100 px-2 py-3 text-right text-sm font-bold tabular-nums text-green-700">
                {formatNum(totals.inQty)}
              </td>
              <td className="border-r border-slate-200 bg-slate-100 px-2 py-3 text-right text-sm font-bold tabular-nums text-green-700">
                {formatNum(totals.inValue)}
              </td>
              <td className="border-r border-slate-100 bg-slate-100 px-2 py-3 text-right text-sm font-bold tabular-nums text-red-700">
                {formatNum(totals.outQty)}
              </td>
              <td className="border-r border-slate-200 bg-slate-100 px-2 py-3 text-right text-sm font-bold tabular-nums text-red-700">
                {formatNum(totals.outValue)}
              </td>
              <td className="border-r border-slate-100 bg-slate-100 px-2 py-3 text-right text-sm font-bold tabular-nums text-slate-900">
                {formatNum(totals.endQty)}
              </td>
              <td className="bg-slate-100 px-2 py-3 text-right text-sm font-bold tabular-nums text-slate-900">
                {formatNum(totals.endValue)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default SummaryReportTable;
