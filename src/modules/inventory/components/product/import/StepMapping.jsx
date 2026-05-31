/**
 * StepMapping - Bước 2: Ghép cột hệ thống với file Excel.
 */
const systemFields = [
  { key: 'code', label: 'Mã hàng hóa', required: true },
  { key: 'name', label: 'Tên hàng hóa', required: true },
  { key: 'unit', label: 'Đơn vị tính', required: true },
  { key: 'price', label: 'Giá bán', required: false },
  { key: 'costPrice', label: 'Giá vốn', required: false },
  { key: 'barcode', label: 'Mã vạch', required: false },
  { key: 'group', label: 'Nhóm hàng', required: false },
];

const excelColumns = [
  'Mã hàng (A)',
  'Tên hàng (B)',
  'ĐVT (C)',
  'Giá bán (D)',
  'Giá vốn (E)',
  '(Không map)',
];

const StepMapping = ({ mapping, onChange, onBack, onNext }) => (
  <div className="space-y-4">
    <p className="text-sm text-slate-500">Ghép cột dữ liệu giữa hệ thống và file Excel</p>
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="w-full">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <th className="px-4 py-2.5 text-left text-xs font-bold uppercase text-slate-500">
              Cột trên hệ thống
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-bold uppercase text-slate-500">
              Cột trên file Excel
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {systemFields.map((sf) => (
            <tr key={sf.key}>
              <td className="px-4 py-3">
                <span className="text-sm text-slate-700">{sf.label}</span>
                {sf.required && <span className="ml-1 text-red-400">*</span>}
              </td>
              <td className="px-4 py-3">
                <select
                  className="w-full rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                  value={mapping[sf.key]}
                  onChange={(e) => onChange(sf.key, e.target.value)}
                >
                  <option value="">-- Chọn cột --</option>
                  {excelColumns.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="flex justify-end gap-2">
      <button
        type="button"
        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        onClick={onBack}
      >
        Quay lại
      </button>
      <button
        type="button"
        className="rounded-lg bg-[#004785] px-4 py-2 text-sm font-bold text-white hover:bg-[#003566]"
        onClick={onNext}
      >
        Tiếp tục
      </button>
    </div>
  </div>
);

export default StepMapping;
