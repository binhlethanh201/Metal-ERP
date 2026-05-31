/**
 * StepValidation - Bước 3: Kiểm tra dữ liệu trước khi import.
 */
const mockPreviewRows = [
  { stt: 1, code: 'SP011', name: 'Thép không gỉ 304', unit: 'Kg', price: 120000, status: 'ok' },
  {
    stt: 2,
    code: '',
    name: 'Sắt tròn D10',
    unit: 'Cây',
    price: 95000,
    status: 'error',
    errorMsg: 'Mã hàng không được để trống',
  },
  {
    stt: 3,
    code: 'SP001',
    name: 'Trùng mã SP001',
    unit: 'Kg',
    price: 25000,
    status: 'error',
    errorMsg: 'Trùng mã hàng hóa',
  },
  { stt: 4, code: 'SP012', name: 'Que hàn inox', unit: 'Kg', price: 55000, status: 'ok' },
  {
    stt: 5,
    code: 'SP013',
    name: '',
    unit: 'Cái',
    price: 15000,
    status: 'error',
    errorMsg: 'Tên hàng không được để trống',
  },
];

const StepValidation = ({ onBack, onStartImport, importing, progress }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-4">
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm">
        <strong>5</strong> Tổng dòng
      </div>
      <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
        <strong>2</strong> Dòng hợp lệ
      </div>
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
        <strong>3</strong> Dòng lỗi
      </div>
    </div>
    <div className="max-h-[300px] overflow-auto rounded-lg border border-slate-200">
      <table className="w-full">
        <thead className="sticky top-0 border-b border-slate-200 bg-slate-50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-bold text-slate-500">STT</th>
            <th className="px-3 py-2 text-left text-xs font-bold text-slate-500">Mã</th>
            <th className="px-3 py-2 text-left text-xs font-bold text-slate-500">Tên</th>
            <th className="px-3 py-2 text-left text-xs font-bold text-slate-500">ĐVT</th>
            <th className="px-3 py-2 text-right text-xs font-bold text-slate-500">Giá</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {mockPreviewRows.map((r) => (
            <tr key={r.stt} className={r.status === 'error' ? 'bg-red-50/50' : ''}>
              <td className="px-3 py-2 text-sm text-slate-600">{r.stt}</td>
              <td className="px-3 py-2 text-sm">
                {r.code || <span className="text-red-500">--</span>}
              </td>
              <td className="px-3 py-2 text-sm">
                {r.name || <span className="text-red-500">--</span>}
              </td>
              <td className="px-3 py-2 text-sm">{r.unit}</td>
              <td className="px-3 py-2 text-right text-sm">{r.price.toLocaleString()}</td>
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
        onClick={onStartImport}
        disabled={importing}
      >
        {importing ? `Đang nhập... ${progress}%` : 'Bắt đầu nhập dữ liệu'}
      </button>
    </div>
  </div>
);

export default StepValidation;
