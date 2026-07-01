/**
 * PrinterSettings - Cài đặt máy in
 */
import { Card } from '../../../../shared/components/Card';
import Toggle from '../../../../shared/components/Toggle';

const MOCK_PRINTERS = [
  'EPSON TM-T82',
  'EPSON TM-T82 Receipt',
  'EPSON TM-T82 (Copy 1)',
  'Generic / Text Only',
  'Microsoft Print to PDF',
  'Brother QL-820NWB',
  'Zebra ZD420',
];

const PrinterSettings = ({ data, onChange, disabled }) => {
  return (
    <Card header="Cài đặt máy in">
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Tên máy in</label>
          <select
            value={data.printerName || ''}
            onChange={(e) => onChange({ printerName: e.target.value })}
            disabled={disabled}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#004785] focus:outline-none disabled:bg-slate-50"
          >
            <option value="">-- Chọn máy in --</option>
            {MOCK_PRINTERS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
          <div>
            <p className="text-sm font-medium text-slate-900">Tự động in hóa đơn</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Tự động in hóa đơn sau khi thanh toán thành công
            </p>
          </div>
          <Toggle
            checked={data.autoPrint ?? data.auto_print ?? false}
            onChange={(val) => onChange({ autoPrint: val })}
            disabled={disabled}
          />
        </div>
      </div>
    </Card>
  );
};

export default PrinterSettings;
