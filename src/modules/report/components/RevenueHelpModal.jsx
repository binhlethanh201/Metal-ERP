import { useState } from 'react';
import { Modal } from '../../../shared/components/Modal';
import Icon from '../../../shared/components/Icon';

const STEPS = [
  {
    title: '1. Doanh thu',
    subtitle: 'Tổng tiền khách hàng thanh toán',
    icon: 'payments',
    badge: 'Giá bán × SL',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-300',
    desc: 'Tổng số tiền khách hàng trả cho các hóa đơn đã hoàn thành trong kỳ. Doanh thu được tính theo giá bán trên từng đơn vị đã chọn (không quy đổi).',
    formula: 'Doanh thu = Tổng tiền tất cả hóa đơn đã hoàn thành trong kỳ',
    example: 'Bán 1 cuộn cáp (giá 2.000.000đ/cuộn) + 5 mét cáp (giá 25.000đ/mét). Doanh thu = 1 × 2.000.000 + 5 × 25.000 = 2.125.000đ',
    result: 'Doanh thu = 2.125.000đ',
  },
  {
    title: '2. Giá vốn hàng bán',
    subtitle: 'Chi phí gốc của hàng đã bán',
    icon: 'shopping_cart',
    badge: 'Giá vốn × SL gốc',
    badgeClass: 'bg-rose-100 text-rose-700 border-rose-300',
    desc: 'Tổng giá vốn của hàng hóa đã bán, tính theo đơn vị cơ bản (đã quy đổi). Giá vốn được chốt cố định tại thời điểm bán hàng, không thay đổi dù giá nhập sau này có khác.',
    formula: 'Giá vốn = Tổng( Số lượng bán × Hệ số quy đổi × Giá vốn tại thời điểm bán )',
    example: '1 cuộn = 100 mét, giá vốn lúc bán 10.000đ/mét. Giá vốn = 1 × 100 × 10.000 + 5 × 1 × 10.000 = 1.050.000đ',
    result: 'Giá vốn = 1.050.000đ',
  },
  {
    title: '3. Lợi nhuận gộp',
    subtitle: 'Doanh thu trừ giá vốn',
    icon: 'trending_up',
    badge: 'DT - GV',
    badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    desc: 'Lợi nhuận trước khi trừ chi phí vận hành (điện, nước, lương, thuê mặt bằng...). Đây là chỉ số quan trọng để đánh giá hiệu quả kinh doanh cốt lõi.',
    formula: 'Lợi nhuận gộp = Doanh thu - Giá vốn hàng bán',
    example: '2.125.000đ (Doanh thu) - 1.050.000đ (Giá vốn) = 1.075.000đ',
    result: 'Lợi nhuận gộp = 1.075.000đ',
  },
  {
    title: '4. Tỷ suất lợi nhuận',
    subtitle: 'Biên lợi nhuận trên doanh thu',
    icon: 'percent',
    badge: '% lãi / DT',
    badgeClass: 'bg-amber-100 text-amber-700 border-amber-300',
    desc: 'Tỷ lệ phần trăm lợi nhuận gộp trên doanh thu. Cho biết cứ 100đ doanh thu thì thu về bao nhiêu đồng lợi nhuận gộp. Tỷ suất càng cao nghĩa là biên lợi nhuận càng tốt.',
    formula: 'Tỷ suất lợi nhuận = (Lợi nhuận gộp ÷ Doanh thu) × 100%',
    example: '(1.075.000 / 2.125.000) × 100% = 50,59%',
    result: 'Tỷ suất lợi nhuận = 50,59%',
  },
  {
    title: '5. Lưu ý quan trọng',
    subtitle: 'Giá vốn được chốt cố định, không đổi',
    icon: 'info',
    badge: 'Ghi nhớ',
    badgeClass: 'bg-purple-100 text-purple-700 border-purple-300',
    desc: 'Giá vốn được lưu cố định tại thời điểm bán hàng. Khi nhập thêm hàng với giá mới, giá vốn của hóa đơn cũ KHÔNG bị thay đổi. Điều này đảm bảo số liệu báo cáo luôn chính xác theo từng thời điểm.',
    includes: [
      'Giá vốn bán hàng = Giá vốn tại thời điểm chốt hóa đơn',
      'Giá vốn nhập kho = Bình quân gia quyền sau mỗi lần nhập',
      'Hai giá vốn này là ĐỘC LẬP, không ảnh hưởng lẫn nhau',
    ],
    example: 'Sáng bán với giá vốn 10k, chiều nhập thêm giá 12k → giá vốn BQ thành 11k. Hóa đơn sáng vẫn giữ nguyên giá vốn 10k, không bị đổi thành 11k.',
    result: '→ Báo cáo lợi nhuận luôn khớp với thực tế tại thời điểm bán',
  },
];

export const RevenueHelpModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);
  const s = STEPS[step];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cách tính Doanh thu - Lợi nhuận" size="md">
      <div className="space-y-4">
        {/* Progress Bar */}
        <div className="rounded-xl bg-slate-100 px-5 pt-5 pb-3 dark:bg-[#1a1a1a]">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-[#999]">
            <span>BƯỚC {step + 1} / {STEPS.length}</span>
            <span>{s.subtitle}</span>
          </div>
          <div className="flex h-1.5 gap-1.5 rounded-full bg-slate-200 dark:bg-[#333]">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-full flex-1 rounded-full transition ${i <= step ? 'bg-[#004785]' : 'bg-transparent'}`} />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#004785] dark:bg-blue-950/30 dark:text-blue-400">
                <Icon name={s.icon} size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-[#e5e5e5]">{s.title}</h3>
            </div>
            <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${s.badgeClass}`}>{s.badge}</span>
          </div>

          <p className="text-sm leading-relaxed text-slate-600 dark:text-[#b3b3b3]">{s.desc}</p>

          {s.formula && (
            <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3 dark:border-blue-800 dark:bg-blue-950/20">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400">Công thức: </span>
              <code className="text-xs text-blue-800 dark:text-blue-300">{s.formula}</code>
            </div>
          )}

          {s.includes && (
            <div className="space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs dark:border-[#333] dark:bg-[#1a1a1a]">
              <span className="font-semibold text-slate-700 dark:text-[#b3b3b3]">Ghi nhớ:</span>
              <ul className="list-disc space-y-0.5 pl-4 text-slate-600 dark:text-[#999]">
                {s.includes.map((item, i) => <li key={i}>{item}</li>)}
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

        {/* Navigation */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-[#333]">
          <button
            type="button" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-[#404040] dark:text-[#999] dark:hover:bg-[#272727]"
          >
            <Icon name="chevron_left" size={14} /> Quay lại
          </button>
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))} className="inline-flex items-center gap-1 rounded-lg bg-[#004785] px-4 py-2 text-xs font-semibold text-white hover:bg-[#003566]">
              Tiếp theo <Icon name="chevron_right" size={14} />
            </button>
          ) : (
            <button type="button" onClick={onClose} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700">
              <Icon name="check" size={14} /> Đã hiểu
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default RevenueHelpModal;