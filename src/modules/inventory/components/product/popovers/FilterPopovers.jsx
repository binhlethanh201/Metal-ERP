/**
 * FilterPopovers - DatePickerPopup + QuickRangePopover dÃ¹ng chung cho ProductFilterSidebar.
 */
import Icon from '../../../../../shared/components/Icon';

export const DatePickerPopup = ({ onCancel, onApply }) => (
  <div className="absolute left-[calc(100%+10px)] top-14 z-30 w-[620px] rounded-xl border border-slate-200 bg-white shadow-2xl">
    <div className="px-4 pb-3 pt-4">
      <p className="text-sm text-slate-500">
        Tá»« ngÃ y: <span className="font-semibold text-slate-800">17/05/2026</span> - Äáº¿n ngÃ y:{' '}
        <span className="font-semibold text-slate-800">17/05/2026</span>
      </p>
      <div className="mt-4 grid grid-cols-2 gap-4">
        {[0, 1].map((side) => (
          <div key={side}>
            <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-2">
              <button
                type="button"
                className="rounded-lg border border-slate-300 p-1 text-slate-500"
              >
                <Icon name="chevron_left" className="text-[16px]" />
              </button>
              <p className="text-lg text-slate-700">ThÃ¡ng 5 2026</p>
              <button
                type="button"
                className="rounded-lg border border-slate-300 p-1 text-slate-500"
              >
                <Icon name="chevron_right" className="text-[16px]" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-y-3 text-center text-sm text-slate-400">
              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => (
                <span key={`${side}-${d}`}>{d}</span>
              ))}
              {(side === 0
                ? [27, 28, 29, 30, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
                : [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 1, 2, 3, 4, 5, 6, 7]
              ).map((day) => (
                <span
                  key={`${side}-${day}`}
                  className={
                    side === 0
                      ? day < 4
                        ? 'text-slate-300'
                        : 'text-slate-700'
                      : day < 8
                        ? 'text-slate-700'
                        : 'text-slate-400'
                  }
                >
                  {day}
                </span>
              ))}
              <span className="flex h-10 w-10 items-center justify-center justify-self-center rounded-full bg-blue-600 font-bold text-white">
                17
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
      <button type="button" className="text-base font-semibold text-blue-600" onClick={onCancel}>
        HÃ´m nay
      </button>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-lg border border-slate-300 px-4 py-1.5 text-base font-semibold text-slate-600"
          onClick={onCancel}
        >
          Bá» qua
        </button>
        <button
          type="button"
          className="rounded-lg bg-blue-600 px-4 py-1.5 text-base font-semibold text-white"
          onClick={onApply}
        >
          Ãp dá»¥ng
        </button>
      </div>
    </div>
  </div>
);

export const QuickRangePopover = ({ ranges, onSelect, onReset }) => (
  <div
    className="absolute left-[calc(100%+10px)] top-6 z-30 rounded-xl border border-slate-200 bg-white p-4 shadow-2xl"
    style={{ width: ranges.length <= 3 ? '500px' : '740px' }}
  >
    <div className={`grid gap-4 ${ranges.length <= 3 ? 'grid-cols-3' : 'grid-cols-5'}`}>
      {ranges.map((col) => (
        <div key={col.title}>
          <p className="mb-2 text-sm font-bold text-slate-800">{col.title}</p>
          <div className="flex flex-col gap-2">
            {col.options.map((opt) => (
              <button
                key={opt}
                type="button"
                className="rounded-full border border-slate-300 px-3 py-1.5 text-left text-sm text-slate-700 hover:border-blue-600 hover:text-blue-600"
                onClick={() => onSelect(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
    <div className="mt-3 flex justify-end">
      <button
        type="button"
        className="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-bold text-white"
        onClick={onReset}
      >
        ToÃ n thá»i gian
      </button>
    </div>
  </div>
);
