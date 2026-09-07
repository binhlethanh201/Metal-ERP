import { formatCurrency } from '../../../../shared/utils/formatCurrency';
import { Button } from '../../../../shared/components/Button';

const DraftsPanel = ({ drafts, onContinue, onDelete, customer }) => {
  if (!drafts || drafts.length === 0) return null;

  const getDraftTotal = (d) => {
    return (d.items || []).reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);
  };

  const customerName = customer ? (customer.name || customer) : 'Khách lẻ';

  return (
    <div className="shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-[#333] dark:bg-[#1a1a1a]">
      <div className="shrink-0 px-3 py-2 border-b border-slate-200 dark:border-slate-700">
        <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          Đơn nháp ({drafts.length})
        </h3>
      </div>
      <div className="flex overflow-x-auto custom-scrollbar p-2 gap-2">
        {drafts.map((d) => {
          const total = getDraftTotal(d);
          const itemCount = d.items.reduce((sum, item) => sum + Number(item.quantity || 1), 0);
          const name = d.customer?.name || d.customer || customerName;

          return (
            <div
              key={d.id}
              className="min-w-[180px] max-w-[200px] shrink-0 rounded-lg border border-slate-200 bg-slate-50 p-2 transition-all hover:border-blue-400 dark:border-slate-700 dark:bg-slate-900/50"
            >
              <div className="mb-1.5">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" title={name}>
                  {name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {itemCount} món · {formatCurrency(total)}
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => onContinue(d)}
                >
                  Tiếp tục
                </Button>
                <button
                  type="button"
                  onClick={() => onDelete(d)}
                  title="Hủy đơn nháp"
                  className="rounded-md p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors dark:hover:bg-red-900/20"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DraftsPanel;
