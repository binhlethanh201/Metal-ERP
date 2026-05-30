/**
 * ImportExcelWizard - Modal nhập liệu từ Excel với Stepper 4 bước.
 * B1: Upload file | B2: Ghép cột | B3: Kiểm tra dữ liệu | B4: Hoàn tất
 */
import { useState } from 'react';
import Icon from '../../../../shared/components/Icon';

const STEPS = ['Tải lên tệp', 'Ghép cột', 'Kiểm tra dữ liệu', 'Hoàn tất'];

/* Mock preview data */
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

const ImportExcelWizard = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [mapping, setMapping] = useState({
    code: 'Mã hàng (A)',
    name: 'Tên hàng (B)',
    unit: 'ĐVT (C)',
    price: '',
  });
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!isOpen) return null;

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

  const totalRows = 5;
  const validRows = 2;
  const errorRows = 3;

  const handleFileDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer?.files?.[0];
    if (f && (f.name.endsWith('.xlsx') || f.name.endsWith('.xls'))) {
      setFile(f);
      setTimeout(() => setStep(2), 500);
    }
  };

  const handleStartImport = () => {
    setImporting(true);
    let p = 0;
    const timer = setInterval(() => {
      p += 20;
      setProgress(p);
      if (p >= 100) {
        clearInterval(timer);
        setImporting(false);
        setStep(4);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Nhập dữ liệu từ Excel</h2>
          <button
            type="button"
            className="rounded p-1 text-slate-400 hover:bg-slate-100"
            onClick={onClose}
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Stepper */}
        <div className="flex items-center border-b border-slate-200 px-6 py-4">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${i + 1 < step ? 'bg-green-500 text-white' : i + 1 === step ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}
              >
                {i + 1 < step ? '✓' : i + 1}
              </div>
              <span
                className={`ml-2 text-sm font-semibold ${i + 1 === step ? 'text-slate-800' : 'text-slate-400'}`}
              >
                {s}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={`mx-3 h-0.5 w-8 ${i + 1 < step ? 'bg-green-500' : 'bg-slate-200'}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/* Step 1: Upload */}
          {step === 1 && (
            <div className="space-y-4">
              <button type="button" className="text-sm font-semibold text-blue-600 hover:underline">
                Tải file mẫu
              </button>
              <div
                className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-16"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={() => {
                  const i = document.createElement('input');
                  i.type = 'file';
                  i.accept = '.xlsx,.xls';
                  i.onchange = (e) => handleFileDrop({ dataTransfer: { files: e.target.files } });
                  i.click();
                }}
              >
                <Icon name="upload_file" size={48} className="text-slate-300" />
                <p className="mt-4 text-sm font-semibold text-slate-600">
                  Kéo thả file vào đây hoặc click để chọn
                </p>
                <p className="mt-1 text-xs text-slate-400">Hỗ trợ .xlsx, .xls</p>
              </div>
            </div>
          )}

          {/* Step 2: Mapping */}
          {step === 2 && (
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
                            onChange={(e) =>
                              setMapping((p) => ({ ...p, [sf.key]: e.target.value }))
                            }
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
                  onClick={() => setStep(1)}
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-[#004785] px-4 py-2 text-sm font-bold text-white hover:bg-[#003566]"
                  onClick={() => setStep(3)}
                >
                  Tiếp tục
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Validation */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm">
                  <strong className="text-slate-700">{totalRows}</strong> Tổng số dòng
                </div>
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
                  <strong>{validRows}</strong> Dòng hợp lệ
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                  <strong>{errorRows}</strong> Dòng lỗi
                </div>
              </div>
              <div className="max-h-[300px] overflow-auto rounded-lg border border-slate-200">
                <table className="w-full">
                  <thead className="sticky top-0 border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-bold text-slate-500">STT</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-slate-500">
                        Mã hàng
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-slate-500">
                        Tên hàng
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-slate-500">ĐVT</th>
                      <th className="px-3 py-2 text-right text-xs font-bold text-slate-500">Giá</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mockPreviewRows.map((row) => (
                      <tr
                        key={row.stt}
                        className={`${row.status === 'error' ? 'bg-red-50/50' : ''}`}
                      >
                        <td className="px-3 py-2 text-sm text-slate-600">{row.stt}</td>
                        <td className="px-3 py-2 text-sm text-slate-700">
                          {row.code || <span className="text-red-500">--</span>}
                        </td>
                        <td className="px-3 py-2 text-sm text-slate-700">
                          {row.name || <span className="text-red-500">--</span>}
                        </td>
                        <td className="px-3 py-2 text-sm text-slate-700">{row.unit}</td>
                        <td className="px-3 py-2 text-right text-sm text-slate-700">
                          {row.price.toLocaleString()}
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
                  onClick={() => setStep(2)}
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-[#004785] px-4 py-2 text-sm font-bold text-white hover:bg-[#003566]"
                  onClick={handleStartImport}
                  disabled={importing}
                >
                  {importing ? `Đang nhập... ${progress}%` : 'Bắt đầu nhập dữ liệu'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {step === 4 && (
            <div className="flex flex-col items-center py-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Icon name="check" size={32} className="text-green-600" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-800">Nhập dữ liệu thành công</h3>
              <p className="mt-1 text-sm text-slate-500">
                Đã nhập {totalRows} dòng dữ liệu vào hệ thống
              </p>
              <div className="mt-2 flex items-center gap-3 text-sm">
                <span className="text-green-600">{validRows} dòng thành công</span>
                <span className="text-red-500">{errorRows} dòng lỗi (bỏ qua)</span>
              </div>
              <div className="mt-6 w-full rounded-lg bg-slate-100">
                <div
                  className="h-2 rounded-full bg-green-500"
                  style={{ width: `${(validRows / totalRows) * 100}%` }}
                />
              </div>
              <button
                type="button"
                className="mt-6 rounded-lg bg-[#004785] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#003566]"
                onClick={onClose}
              >
                Đóng
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportExcelWizard;
