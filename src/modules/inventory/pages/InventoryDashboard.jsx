import React from 'react';
// import { useOutletContext } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import AiChatWidget from '../components/home/AiChatWidget';
import KPICard from '../components/home/KPICard';
import FinanceMetric from '../components/home/FinanceMetric';
import {
  dashboardKpis,
  financeKpis,
  inventoryTrend,
  forumProducts,
  forumReports,
  recentTransactions,
  cashSummary,
} from '../data/inventoryMockData';
import { transactionToneClass } from '../data/inventoryPageData';

const InventoryDashboard = () => {
  // const { setActiveHubKey } = useOutletContext();

  const [isAssistantOpen, setIsAssistantOpen] = React.useState(false);
  const [assistantInput, setAssistantInput] = React.useState('');
  const [assistantMessages, setAssistantMessages] = React.useState([
    {
      id: 'assistant-welcome',
      role: 'assistant',
      text: 'Xin chào! Tôi là trợ lý ảo. Bạn muốn tra cứu tồn kho, đơn hàng hay báo cáo nào?',
    },
  ]);

  const handleAssistantSend = () => {
    const value = assistantInput.trim();
    if (!value) return;
    setAssistantMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: 'user', text: value },
      {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: 'Đã nhận yêu cầu. Tôi sẽ hỗ trợ bạn ngay sau khi đồng bộ dữ liệu nghiệp vụ.',
      },
    ]);
    setAssistantInput('');
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 pb-8">
      {/* 1. Khu vực KPI và Chỉ số tài chính */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardKpis.map((kpi) => (
          <KPICard key={kpi.id} {...kpi} />
        ))}
        {financeKpis.map((metric) => (
          <FinanceMetric key={metric.id} {...metric} />
        ))}
      </section>

      {/* 2. Biểu đồ xu hướng và Tin tức Diễn đàn B2B */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 grid grid-cols-1 gap-6 lg:col-span-8 lg:grid-cols-2">
          {/* Xu hướng tồn kho */}
          <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h4 className="mb-4 text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500">
              XU HƯỚNG TỒN KHO (7 NGÀY)
            </h4>
            <div className="flex h-48 items-end gap-2 px-2">
              {inventoryTrend.map((item) => (
                <div
                  key={item.day}
                  className="h-full w-full rounded-t-md bg-blue-100 transition-colors hover:bg-[#004785]"
                  style={{ height: `${item.height}%` }}
                  title={`${item.day}: ${item.value}`}
                />
              ))}
            </div>
            <div className="mt-3 flex justify-between px-2 text-[10px] font-bold uppercase text-slate-400">
              {inventoryTrend.map((item) => (
                <span key={item.day}>{item.day}</span>
              ))}
            </div>
          </article>

          {/* Nhập / Xuất kho */}
          <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h4 className="mb-4 text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500">
              NHẬP / XUẤT KHO
            </h4>
            <div className="relative h-48 overflow-hidden">
              <svg className="h-full w-full" viewBox="0 0 400 150" aria-hidden="true">
                <path
                  d="M0,120 Q50,80 100,100 T200,60 T300,90 T400,30"
                  fill="none"
                  stroke="#22C55E"
                  strokeWidth="2"
                />
                <path
                  d="M0,100 Q50,130 100,70 T200,110 T300,50 T400,80"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2"
                />
              </svg>
              <div className="absolute bottom-2 right-2 flex gap-3">
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-[10px] font-bold uppercase text-slate-500">Nhập</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-orange-500" />
                  <span className="text-[10px] font-bold uppercase text-slate-500">Xuất</span>
                </div>
              </div>
            </div>
          </article>
        </div>

        {/* Diễn đàn B2B */}
        <article className="col-span-12 flex flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:col-span-4">
          <div className="mb-6 flex items-center justify-between">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.05em] text-primary">
              TIN TỨC & XU HƯỚNG DIỄN ĐÀN
            </h4>
            <Icon name="forum" className="text-2xl text-primary" />
          </div>
          <div className="flex flex-1 flex-col gap-6">
            <section>
              <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                SẢN PHẨM MỚI
              </p>
              <div className="space-y-4">
                {forumProducts.map((p) => (
                  <div key={p.id} className="flex items-center gap-4">
                    <img alt={p.alt} className="h-12 w-12 rounded-xl object-cover" src={p.image} />
                    <div className="flex-1">
                      <p className="text-sm font-bold leading-snug text-slate-900">{p.name}</p>
                      <button
                        type="button"
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <section className="mt-2">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                BÁO CÁO XU HƯỚNG
              </p>
              <div className="space-y-3">
                {forumReports.map((r) => (
                  <div
                    key={r.id}
                    className={`flex items-start justify-between rounded-xl border p-4 ${r.tone === 'red' ? 'border-blue-100/50 bg-blue-50/50' : 'border-green-100/50 bg-green-50/50'}`}
                  >
                    <div className="flex-1">
                      <h5
                        className={`text-sm font-bold ${r.tone === 'red' ? 'text-primary' : 'text-green-900'}`}
                      >
                        {r.title}
                      </h5>
                      <p className="mt-1 text-[11px] text-slate-500">{r.desc}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${r.tone === 'red' ? 'bg-red-100 text-red-600' : 'bg-green-200 text-green-800'}`}
                    >
                      {r.level}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </article>
      </div>

      {/* 3. Nhật ký Giao dịch và Dòng tiền mặt */}
      <div className="grid grid-cols-12 gap-6">
        {/* Giao dịch gần đây */}
        <article className="col-span-12 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:col-span-8">
          <div className="flex items-center justify-between border-b border-slate-100 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2 text-primary">
                <Icon name="history" />
              </div>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500">
                GIAO DỊCH GẦN ĐÂY
              </h4>
            </div>
            <button
              type="button"
              className="rounded-lg border border-blue-100 px-4 py-2 text-xs font-bold text-primary hover:bg-blue-50"
            >
              Xem báo cáo
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  {['Loại', 'Đối tác / Mã đơn', 'Thời gian', 'Giá trị (VND)'].map((h) => (
                    <th
                      key={h}
                      className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 ${h === 'Giá trị (VND)' ? 'text-right' : ''}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${transactionToneClass[tx.type] || transactionToneClass.transfer}`}
                      >
                        <Icon
                          name={
                            tx.type === 'import'
                              ? 'check'
                              : tx.type === 'transfer'
                                ? 'swap_horiz'
                                : 'north_east'
                          }
                          className="text-sm"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900">{tx.partner}</p>
                      <p className="text-[10px] text-slate-500">{tx.location}</p>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-500">{tx.time}</td>
                    <td className="px-6 py-4 text-right text-sm font-black text-slate-900">
                      {tx.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        {/* Quỹ tiền mặt */}
        <article className="col-span-12 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:col-span-4">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500">
              TỔNG QUỸ TIỀN MẶT
            </h4>
            <Icon name="account_balance_wallet" className="text-slate-400" />
          </div>
          <h2 className="mb-6 text-2xl font-extrabold text-blue-900">
            {cashSummary.total} <span className="text-sm font-medium">VND</span>
          </h2>
          <div className="flex items-end justify-between border-t border-slate-50 pt-4">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase text-slate-400">THU (THÁNG)</p>
              <p className="text-sm font-black text-green-600">{cashSummary.income}</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[10px] font-bold uppercase text-slate-400">CHI (THÁNG)</p>
              <p className="text-sm font-black text-red-600">{cashSummary.expense}</p>
            </div>
          </div>
        </article>
      </div>

      {/* 4. Trợ lý ảo AI Floating Button */}
      <AiChatWidget
        isOpen={isAssistantOpen}
        onToggle={setIsAssistantOpen}
        messages={assistantMessages}
        input={assistantInput}
        setInput={setAssistantInput}
        onSend={handleAssistantSend}
      />
    </div>
  );
};

export default InventoryDashboard;
