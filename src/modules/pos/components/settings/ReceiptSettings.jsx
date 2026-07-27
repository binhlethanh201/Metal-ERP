/**
 * ReceiptSettings - Cài đặt hóa đơn (receipt header/footer, VAT)
 */
import { Card } from '../../../../shared/components/Card';
import { Input } from '../../../../shared/components/Input';

const ReceiptSettings = ({ data, onChange, disabled }) => {
  return (
    <Card header="Cài đặt hóa đơn">
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">
            Dòng tiêu đề hóa đơn
          </label>
          <Input
            placeholder="VD: CẢM ƠN QUÝ KHÁCH"
            value={data.receiptHeader || ''}
            onChange={(e) => onChange({ receiptHeader: e.target.value })}
            disabled={disabled}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">Dòng chân hóa đơn</label>
          <Input
            placeholder="VD: Hẹn gặp lại!"
            value={data.receiptFooter || ''}
            onChange={(e) => onChange({ receiptFooter: e.target.value })}
            disabled={disabled}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">
            Thuế VAT mặc định (%)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={data.vatRate ?? data.vat_rate ?? 8}
              onChange={(e) => onChange({ vatRate: parseFloat(e.target.value) || 0 })}
              disabled={disabled}
              className="w-32 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#004785] focus:outline-none disabled:bg-slate-50 dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#e5e5e5] dark:disabled:bg-[#1a1a1a]"
            />
            <span className="text-sm text-slate-500 dark:text-[#999999]">%</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ReceiptSettings;
