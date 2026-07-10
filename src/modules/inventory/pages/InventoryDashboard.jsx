import React from 'react';
// import { useOutletContext } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import AiChatWidget from '../components/home/AiChatWidget';
import KPICard from '../components/home/KPICard';
import FinanceMetric from '../components/home/FinanceMetric';
import { getInventoryDashboard } from '../services/inventoryService';
import {
  dashboardKpis as fallbackKpis,
  financeKpis as fallbackFinance,
  inventoryTrend as fallbackTrend,
  recentTransactions as fallbackTxs,
  cashSummary as fallbackCash,
} from '../data/inventoryMockData';
import { transactionToneClass } from '../data/inventoryPageData';

const mapDashboard = (data) => {
  if (!data) return {};
  return {
    kpis: data.dashboardKpis || data.kpis || fallbackKpis,
    finance: data.financeKpis || data.finance || fallbackFinance,
    trend: data.inventoryTrend || data.trend || fallbackTrend,
    transactions: data.recentTransactions || data.transactions || fallbackTxs,
    cash: data.cashSummary || data.cash || fallbackCash,
  };
};

const InventoryDashboard = () => {
  // const { setActiveHubKey } = useOutletContext();

  const [dashboard, setDashboard] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await getInventoryDashboard();
        const data = res?.data || res;
        if (!cancelled) setDashboard(mapDashboard(data));
      } catch (err) {
        if (!cancelled) {
          // API chưa có → im lặng dùng mock data
          setDashboard(mapDashboard(null));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  const {
    kpis = fallbackKpis,
    finance = fallbackFinance,
    trend = fallbackTrend,
    transactions = fallbackTxs,
    cash = fallbackCash,
  } = dashboard || {};

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

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-[#004785]" />
          <p className="text-sm text-slate-500">Đang tải dữ liệu tổng quan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 pb-8">
      {/* 1. Khu vực KPI và Chỉ số tài chính */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KPICard key={kpi.id} {...kpi} />
        ))}
        {finance.map((metric) => (
          <FinanceMetric key={metric.id} {...metric} />
        ))}
      </section>

      {/* 2. Biểu đồ xu hướng */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 grid grid-cols-1 gap-6 lg:col-span-12 lg:grid-cols-2">
          {/* Xu hướng tồn kho */}
          <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h4 className="mb-4 text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500">
              XU HƯỚNG TỒN KHO (7 NGÀY)
            </h4>
            <div className="flex h-48 items-end gap-2 px-2">
              {trend.map((item) => (
                <div
                  key={item.day}
                  className="h-full w-full rounded-t-md bg-blue-100 transition-colors hover:bg-[#004785]"
                  style={{ height: `${item.height}%` }}
                  title={`${item.day}: ${item.value}`}
                />
              ))}
            </div>
            <div className="mt-3 flex justify-between px-2 text-[10px] font-bold uppercase text-slate-400">
              {trend.map((item) => (
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
                {transactions.map((tx) => (
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
            {cash.total} <span className="text-sm font-medium">VND</span>
          </h2>
          <div className="flex items-end justify-between border-t border-slate-50 pt-4">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase text-slate-400">THU (THÁNG)</p>
              <p className="text-sm font-black text-green-600">{cash.income}</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[10px] font-bold uppercase text-slate-400">CHI (THÁNG)</p>
              <p className="text-sm font-black text-red-600">{cash.expense}</p>
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
