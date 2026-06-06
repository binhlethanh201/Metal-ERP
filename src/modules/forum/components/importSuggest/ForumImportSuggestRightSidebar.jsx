/**
 * ForumImportSuggestRightSidebar - Cột phải trang Gợi ý nhập hàng.
 * Hiển thị tổng quan nhà cung cấp & ước tính giá trị cần nhập.
 */
import React, { useMemo } from 'react';
import Icon from '../../../../shared/components/Icon';
import { inventoryRows } from '../../../inventory/data/inventoryMockData';

const fmtMoney = (n) => {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}t`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(0)}tr`;
  return `${(n / 1e3).toFixed(0)}k`;
};

const ForumImportSuggestRightSidebar = () => {
  const { totalCost } = useMemo(() => {
    const sapHet = inventoryRows.filter((r) => r.status === 'Sắp hết' || r.status === 'Hết hàng');

    const cost = sapHet.reduce((sum, row) => {
      const thieu = Math.max(5, 15 - row.stock);
      return sum + row.costPrice * thieu;
    }, 0);

    return { totalCost: cost };
  }, []);

  return (
    <div className="space-y-4">
      {/* Ước tính giá trị cần nhập */}
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h4 className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">
          Ước tính cần nhập
        </h4>
        <p className="text-2xl font-black text-red-600">{fmtMoney(totalCost)}</p>
        <p className="mt-0.5 text-xs text-slate-400">Tổng giá trị hàng cần bổ sung</p>
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
          <Icon name="info" size={12} className="text-slate-400" />
          Ước tính dựa trên giá vốn & mức tồn tối thiểu
        </div>
      </section>

      {/* Mẹo */}
      <section className="rounded-2xl bg-amber-50/50 p-4">
        <div className="mb-2 flex items-center gap-2 text-amber-700">
          <Icon name="lightbulb" size={16} />
          <h4 className="text-xs font-black uppercase tracking-widest">Mẹo nhập hàng</h4>
        </div>
        <ul className="space-y-2 text-[11px] leading-relaxed text-amber-800">
          <li>Gom nhiều SP cùng 1 NCC để được chiết khấu cao hơn.</li>
          <li>SP sắp hết + có trend thị trường = ưu tiên số 1.</li>
          <li>Nên duy trì tồn tối thiểu = 2 tuần bán hàng.</li>
        </ul>
      </section>

      {/* Giải thích 3 nhóm */}
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h4 className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">
          Cách phân nhóm
        </h4>
        <div className="space-y-2.5">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />
            <div>
              <p className="text-xs font-bold text-slate-700">Cần nhập gấp</p>
              <p className="text-[10px] text-slate-400">
                Tồn kho dưới mức tối thiểu hoặc đã hết. Cần bổ sung ngay để không mất khách.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#004785]" />
            <div>
              <p className="text-xs font-bold text-slate-700">Nên nhập thêm</p>
              <p className="text-[10px] text-slate-400">
                Còn hàng nhưng thị trường đang hot. Nhập thêm để tối ưu giá & tránh đứt hàng sau
                này.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
            <div>
              <p className="text-xs font-bold text-slate-700">Đáng thử</p>
              <p className="text-[10px] text-slate-400">
                SP đang hot ngoài thị trường nhưng kho bạn chưa có. Nên nhập ít test trước.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ForumImportSuggestRightSidebar;
