import { useState } from 'react';
import { Modal } from '../../../shared/components/Modal';
import Icon from '../../../shared/components/Icon';

const STEPS = [
  {
    title: '1. Tồn Đầu Kỳ',
    subtitle: 'Số lượng tồn kho đầu kỳ báo cáo',
    icon: 'inventory_2',
    badge: 'Mốc dữ liệu đầu',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
    desc: 'Số lượng và giá trị hàng hóa đang lưu kho tính đến trước thời điểm bắt đầu của khoảng thời gian lọc báo cáo.',
    example: 'Đầu ngày 01/08, số lượng tồn kho ban đầu ghi nhận trên hệ thống là 10 sản phẩm.',
    result: 'Tồn đầu kỳ = 10 sản phẩm',
  },
  {
    title: '2. Nhập Trong Kỳ',
    subtitle: 'Biến động tăng tồn kho',
    icon: 'move_to_inbox',
    badge: '+ Tăng tồn kho',
    badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    desc: 'Tổng số lượng hàng hóa phát sinh tăng kho trong khoảng thời gian xem báo cáo.',
    includes: ['Nhập mua hàng từ Nhà cung cấp', 'Nhận hàng trả lại từ Khách hàng'],
    example: 'Ngày 02/08, phát sinh phiếu nhập mua hàng từ Nhà cung cấp với số lượng 5 sản phẩm.',
    result: 'Nhập trong kỳ = +5 sản phẩm',
  },
  {
    title: '3. Xuất Trong Kỳ',
    subtitle: 'Biến động giảm tồn kho',
    icon: 'outbox',
    badge: '- Giảm tồn kho',
    badgeClass: 'bg-rose-100 text-rose-700 border-rose-300',
    desc: 'Tổng số lượng hàng hóa phát sinh giảm kho trong khoảng thời gian xem báo cáo.',
    includes: ['Xuất bán hàng cho khách', 'Xuất trả hàng Nhà cung cấp', 'Xuất hủy hàng hỏng/hết hạn', 'Xuất chuyển kho nội bộ'],
    example: 'Ngày 03/08, phát sinh hóa đơn xuất bán cho khách hàng với số lượng 3 sản phẩm.',
    result: 'Xuất trong kỳ = -3 sản phẩm',
  },
  {
    title: '4. Điều Chỉnh Kho',
    subtitle: 'Xử lý chênh lệch kiểm kê',
    icon: 'tune',
    badge: '± Cân bằng kho',
    badgeClass: 'bg-amber-100 text-amber-700 border-amber-300',
    desc: 'Số lượng điều chỉnh tăng hoặc giảm do chênh lệch giữa đếm kiểm kê thực tế và số liệu trên hệ thống.',
    includes: ['Cộng (+): Kiểm kê thực tế THỪA so với hệ thống', 'Trừ (-): Kiểm kê thực tế THIẾU so với hệ thống'],
    example: 'Phiếu kiểm kê kho phát sinh chênh lệch giảm 1 sản phẩm do hao hụt/hư hỏng.',
    result: 'Số lượng điều chỉnh = -1 sản phẩm',
  },
  {
    title: '5. Tồn Cuối Kỳ',
    subtitle: 'Số lượng tồn kho thời điểm cuối',
    icon: 'calculate',
    badge: 'Kết quả tồn kho',
    badgeClass: 'bg-blue-600 text-white border-blue-600',
    desc: 'Số lượng và giá trị hàng hóa tồn kho thực tế tại thời điểm kết thúc khoảng thời gian lọc báo cáo.',
    example: 'Công thức xác định số lượng tồn kho cuối kỳ:',
    result: '10 (Đầu) + 5 (Nhập) - 3 (Xuất) + (-1) (Điều chỉnh) = 11 sản phẩm',
  },
];

export const ReportHelpModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);
  const s = STEPS[step];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hướng dẫn chỉ tiêu báo cáo kho" size="md">
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

          {s.includes && (
            <div className="space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs dark:border-[#333] dark:bg-[#1a1a1a]">
              <span className="font-semibold text-slate-700 dark:text-[#b3b3b3]">Các chứng từ phát sinh bao gồm:</span>
              <ul className="list-disc space-y-0.5 pl-4 text-slate-600 dark:text-[#999]">
                {s.includes.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          )}

          <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-100/80 p-4 dark:border-[#333] dark:bg-[#1a1a1a]/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-[#e5e5e5]">
              <Icon name="lightbulb" size={14} className="text-amber-500" /> Ví dụ nghiệp vụ minh họa:
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

export default ReportHelpModal;
