import { useState } from 'react';
import { Modal } from '../../../shared/components/Modal';
import Icon from '../../../shared/components/Icon';

const STEPS = [
  {
    title: '1. Doanh thu theo sản phẩm',
    subtitle: 'Tổng tiền bán được của từng sản phẩm',
    icon: 'payments',
    badge: 'Giá bán × SL',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-300',
    desc: 'Tổng số tiền khách hàng trả cho từng sản phẩm trong kỳ. Doanh thu tính theo giá bán trên đơn vị đã chọn (không quy đổi).',
    formula: 'Doanh thu = Tổng( Số lượng bán × Giá bán ) của từng sản phẩm',
    example:
      'Sản phẩm "Cáp điện CVV 4x16": bán 2 cuộn (giá 2.000.000đ/cuộn) + 10 mét lẻ (giá 25.000đ/mét). Doanh thu = 2 × 2.000.000 + 10 × 25.000 = 4.250.000đ',
    result: 'Doanh thu SP = 4.250.000đ',
  },
  {
    title: '2. Số lượng đã bán',
    subtitle: 'Tổng số lượng đã quy đổi ra đơn vị cơ bản',
    icon: 'inventory_2',
    badge: 'SL × Hệ số',
    badgeClass: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    desc: 'Số lượng bán được quy đổi về đơn vị cơ bản (mét, kg, cái...) để tính giá vốn chính xác. Mỗi đơn vị bán có thể có hệ số quy đổi khác nhau (vd: 1 cuộn = 100 mét, 1 thùng = 50 kg).',
    formula: 'Số lượng quy đổi = Tổng( Số lượng bán × Hệ số quy đổi )',
    example: '2 cuộn × 100 + 10 mét × 1 = 210 mét (đơn vị cơ bản)',
    result: 'Tổng SL quy đổi = 210 mét',
  },
  {
    title: '3. Giá vốn hàng bán',
    subtitle: 'Chi phí gốc của hàng đã bán',
    icon: 'shopping_cart',
    badge: 'Giá vốn × SL gốc',
    badgeClass: 'bg-rose-100 text-rose-700 border-rose-300',
    desc: 'Tổng giá vốn của từng sản phẩm đã bán. Giá vốn được chốt cố định tại thời điểm bán hàng, không bị thay đổi khi nhập hàng mới với giá khác.',
    formula: 'Giá vốn = Tổng( Số lượng bán × Hệ số quy đổi × Giá vốn tại thời điểm bán )',
    example: 'Giá vốn lúc bán là 10.000đ/mét. Giá vốn = 210 mét × 10.000đ = 2.100.000đ',
    result: 'Giá vốn SP = 2.100.000đ',
  },
  {
    title: '4. Lợi nhuận gộp & Biên lợi nhuận',
    subtitle: 'Lãi thuần từ sản phẩm trước chi phí vận hành',
    icon: 'trending_up',
    badge: 'DT - GV',
    badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    desc: 'Lợi nhuận gộp là số tiền lãi thu được từ sản phẩm sau khi trừ giá vốn. Biên lợi nhuận là tỷ lệ phần trăm lãi trên doanh thu — nói cách khác, cứ 100đ bán được thì lãi bao nhiêu đồng.',
    formula:
      'Lợi nhuận gộp = Doanh thu - Giá vốn\nBiên lợi nhuận = (Lợi nhuận gộp / Doanh thu) × 100%',
    note: 'Biên lợi nhuận tính trên doanh thu gốc. Nếu đơn có chiết khấu/giảm giá thì con số này sẽ cao hơn mức lãi thực tế bạn nhận về.',
    example:
      '4.250.000đ - 2.100.000đ = 2.150.000đ. Biên LN = (2.150.000 / 4.250.000) × 100% = 50,6%',
    result: 'Lợi nhuận = 2.150.000đ (biên 50,6%)',
  },
  {
    title: '5. Sản phẩm đã xóa',
    subtitle: 'Vẫn hiển thị nếu có giao dịch trong kỳ',
    icon: 'info',
    badge: 'Ghi nhớ',
    badgeClass: 'bg-purple-100 text-purple-700 border-purple-300',
    desc: 'Sản phẩm đã bị xóa khỏi danh sách hàng hóa vẫn xuất hiện trong báo cáo này nếu có phát sinh bán hàng trong kỳ. Điều này đảm bảo số liệu doanh thu - lợi nhuận không bị thiếu, phản ánh đúng thực tế kinh doanh.',
    includes: [
      'SP đã xóa có mã dạng d_xxx_TênSP để phân biệt',
      'Doanh thu và giá vốn của SP đã xóa vẫn được tính đầy đủ',
      'Xóa SP không làm mất dữ liệu bán hàng lịch sử',
    ],
    example:
      'Sản phẩm "Băng keo" đã xóa cuối kỳ, nhưng trong kỳ có bán 50 cuộn. Báo cáo vẫn ghi nhận đủ 50 cuộn với doanh thu và giá vốn tương ứng.',
    result: '→ Dữ liệu báo cáo luôn đầy đủ, không bị hao hụt khi xóa sản phẩm',
  },
];

export const ProductProfitHelpModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);
  const s = STEPS[step];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cách tính Lợi nhuận theo sản phẩm" size="md">
      <div className="space-y-4">
        <div className="rounded-xl bg-slate-100 px-5 pb-3 pt-5 dark:bg-[#1a1a1a]">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-[#999]">
            <span>
              BƯỚC {step + 1} / {STEPS.length}
            </span>
            <span>{s.subtitle}</span>
          </div>
          <div className="flex h-1.5 gap-1.5 rounded-full bg-slate-200 dark:bg-[#333]">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-full flex-1 rounded-full transition ${i <= step ? 'bg-[#004785]' : 'bg-transparent'}`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#004785] dark:bg-blue-950/30 dark:text-blue-400">
                <Icon name={s.icon} size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-[#e5e5e5]">{s.title}</h3>
            </div>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${s.badgeClass}`}
            >
              {s.badge}
            </span>
          </div>

          <p className="text-sm leading-relaxed text-slate-600 dark:text-[#b3b3b3]">{s.desc}</p>

          {s.formula && (
            <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3 dark:border-blue-800 dark:bg-blue-950/20">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400">
                Công thức:{' '}
              </span>
              <code className="whitespace-pre-line text-xs text-blue-800 dark:text-blue-300">
                {s.formula}
              </code>
            </div>
          )}

          {s.note && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs dark:border-amber-800 dark:bg-amber-950/20">
              <div className="flex items-start gap-1.5">
                <Icon name="info" size={14} className="mt-0.5 flex-none text-amber-600" />
                <span className="text-slate-700 dark:text-[#b3b3b3]">{s.note}</span>
              </div>
            </div>
          )}

          {s.includes && (
            <div className="space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs dark:border-[#333] dark:bg-[#1a1a1a]">
              <span className="font-semibold text-slate-700 dark:text-[#b3b3b3]">Ghi nhớ:</span>
              <ul className="list-disc space-y-0.5 pl-4 text-slate-600 dark:text-[#999]">
                {s.includes.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-100/80 p-4 dark:border-[#333] dark:bg-[#1a1a1a]/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-[#e5e5e5]">
              <Icon name="lightbulb" size={14} className="text-amber-500" /> Ví dụ minh họa:
            </div>
            <p className="text-xs text-slate-700 dark:text-[#b3b3b3]">"{s.example}"</p>
            <div className="flex items-center gap-1 border-t border-slate-200 pt-1.5 text-xs font-bold text-slate-900 dark:text-[#e5e5e5]">
              <Icon name="check_circle" size={14} className="text-emerald-600" /> {s.result}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-[#333]">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-[#404040] dark:text-[#999] dark:hover:bg-[#272727]"
          >
            <Icon name="chevron_left" size={14} /> Quay lại
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              className="inline-flex items-center gap-1 rounded-lg bg-[#004785] px-4 py-2 text-xs font-semibold text-white hover:bg-[#003566]"
            >
              Tiếp theo <Icon name="chevron_right" size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              <Icon name="check" size={14} /> Đã hiểu
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ProductProfitHelpModal;
