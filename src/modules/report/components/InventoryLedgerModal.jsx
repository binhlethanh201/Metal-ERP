import { useState, useEffect, useMemo } from 'react';
import { Modal } from '../../../shared/components/Modal';
import Icon from '../../../shared/components/Icon';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import { getStockLedger } from '../services/reportService';

const DOC_TYPE_LABELS = {
  PURCHASE: 'Nhập mua NCC',
  SALE: 'Bán hàng',
  RETURN_SUPPLIER: 'Xuất trả NCC',
  CUSTOMER_RETURN: 'Khách trả hàng',
  BALANCE_ADJUST: 'Điều chỉnh tồn',
  WRITE_OFF: 'Xuất hủy',
  TRANSFER: 'Chuyển kho',
  EXCHANGE_IN: 'Nhập đổi hàng',
  EXCHANGE_OUT: 'Xuất đổi hàng',
  DEFECTIVE_HOLD: 'Tạm giữ hàng lỗi',
  CUSTOMER_RETURN_DEFECTIVE: 'Khách trả hàng lỗi',
};

export const InventoryLedgerModal = ({
  isOpen,
  onClose,
  branchProductId,
  productCode,
  productName,
  fromDate,
  toDate,
}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !branchProductId) return;
    setLoading(true);
    setError('');
    const params = { pageSize: 200 };
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    getStockLedger(branchProductId, params)
      .then((res) => setData(res?.data || res))
      .catch((err) => setError(err.message || 'Không thể tải thẻ kho'))
      .finally(() => setLoading(false));
  }, [isOpen, branchProductId, fromDate, toDate]);

  const entries = useMemo(() => data?.entries || [], [data]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Thẻ Kho Chi Tiết${fromDate ? ` (${new Date(fromDate).toLocaleDateString('vi-VN')} - ${new Date(toDate || fromDate).toLocaleDateString('vi-VN')})` : ''}`} size="4xl">
      <div className="space-y-4">
        {/* Header info */}
        <div className="flex items-center gap-6 rounded-xl bg-slate-50 px-4 py-3 text-sm dark:bg-[#1a1a1a]">
          <div>
            <span className="text-slate-500">Sản phẩm: </span>
            <span className="font-bold text-slate-800 dark:text-[#e5e5e5]">
              {productName || '---'} ({productCode || '---'})
            </span>
          </div>
          <div>
            <span className="text-slate-500">Từ: </span>
            <span className="font-semibold">{new Date(fromDate).toLocaleDateString('vi-VN')}</span>
          </div>
          <div>
            <span className="text-slate-500">Đến: </span>
            <span className="font-semibold">{new Date(toDate || fromDate).toLocaleDateString('vi-VN')}</span>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <Icon name="sync" className="mb-3 animate-spin text-3xl" />
            <p>Đang tải thẻ kho...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-red-500">{error}</div>
        ) : entries.length === 0 ? (
          <div className="py-16 text-center text-slate-400">Không có giao dịch nào trong kỳ</div>
        ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-[#333333]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-bold uppercase text-slate-500 dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#999999]">
                    <th className="px-4 py-3">Thời gian</th>
                    <th className="px-4 py-3">Mã chứng từ</th>
                    <th className="px-4 py-3">Loại giao dịch</th>
                    <th className="px-4 py-3 text-right">Đơn giá vốn</th>
                    <th className="px-4 py-3 text-right">Nhập (SL)</th>
                    <th className="px-4 py-3 text-right">Xuất (SL)</th>
                    <th className="px-4 py-3 text-right">Tồn tức thời</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#333333]">
                  {/* Opening row */}
                  <tr className="bg-slate-50/50 dark:bg-[#1a1a1a]/50">
                    <td className="px-4 py-3 text-slate-500">---</td>
                    <td className="px-4 py-3 text-slate-500">---</td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-[#333333] dark:text-[#999999]">
                        Tồn đầu kỳ
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400">---</td>
                    <td className="px-4 py-3 text-right text-slate-400">---</td>
                    <td className="px-4 py-3 text-right text-slate-400">---</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-700 dark:text-[#b3b3b3]">
                      {data?.openingStock ?? 0}
                    </td>
                  </tr>
                  {/* Ledger entries */}
                  {entries.map((e, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-[#272727]/60">
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-[#999999]">
                        {new Date(e.transactionTime).toLocaleDateString('vi-VN')}{' '}
                        {new Date(e.transactionTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-[#004785] dark:text-blue-400">
                        {e.docCode || '---'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          e.qtyIn > 0
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
                        }`}>
                          {DOC_TYPE_LABELS[e.docType] || e.docType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-700 dark:text-[#b3b3b3]">
                        {e.unitCostPrice ? formatCurrency(e.unitCostPrice) : '---'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {e.qtyIn > 0 ? <span className="font-semibold text-emerald-600">{e.qtyIn}</span> : <span className="text-slate-300">---</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {e.qtyOut > 0 ? <span className="font-semibold text-rose-600">{e.qtyOut}</span> : <span className="text-slate-300">---</span>}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-800 dark:text-[#e5e5e5]">
                        {e.stockAfter ?? 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-300 bg-slate-50 font-bold dark:border-[#404040] dark:bg-[#1a1a1a]">
                    <td className="px-4 py-3" colSpan={4}>TỔNG CỘNG TRONG KỲ</td>
                    <td className="px-4 py-3 text-right text-emerald-600">{data?.totalInQty ?? 0}</td>
                    <td className="px-4 py-3 text-right text-rose-600">{data?.totalOutQty ?? 0}</td>
                    <td className="px-4 py-3 text-right text-slate-800 dark:text-[#e5e5e5]">{data?.closingStock ?? 0}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
        )}
      </div>
    </Modal>
  );
};

export default InventoryLedgerModal;
