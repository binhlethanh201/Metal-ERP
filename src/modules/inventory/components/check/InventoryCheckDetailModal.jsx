import React, { useState, useEffect } from 'react';
import Icon from '../../../../shared/components/Icon';
import { getInventoryCheckDetail } from '../../services/inventoryCheckService';

const InventoryCheckDetailModal = ({ isOpen, onClose, ticketId, onFillSubmit }) => {
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actualValues, setActualValues] = useState({}); // Lưu số lượng người dùng nhập

  // Khi mở modal, gọi API tải chi tiết phiếu
  useEffect(() => {
    if (isOpen && ticketId) {
      setLoading(true);
      getInventoryCheckDetail(ticketId)
        .then((res) => {
          if (res?.success && res.data) {
            setDetailData(res.data);
            // Khởi tạo state cho các ô input (mặc định lấy theo actualQuantity từ DB hoặc bằng systemQuantity)
            const initialValues = {};
            res.data.details.forEach((item) => {
              initialValues[item.detailId] = item.actualQuantity || 0;
            });
            setActualValues(initialValues);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setDetailData(null);
    }
  }, [isOpen, ticketId]);

  if (!isOpen) return null;

  const isDraft = detailData?.status === 'Draft';

  const handleSubmit = () => {
    // Đóng gói mảng details đúng định dạng API yêu cầu
    const detailsPayload = Object.keys(actualValues).map((detailId) => ({
      detailId: detailId,
      actualQuantity: Number(actualValues[detailId]),
    }));

    onFillSubmit(ticketId, detailsPayload, onClose);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Chi tiết phiếu:{' '}
              <span className="text-blue-600">{detailData?.ticketCode || 'Đang tải...'}</span>
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Trạng thái: <strong className="uppercase">{detailData?.status}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
          >
            <Icon name="close" size={24} />
          </button>
        </div>

        {/* Nội dung Bảng */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="py-10 text-center text-slate-400">
              <Icon name="sync" className="mb-2 animate-spin text-3xl" />
              <p>Đang tải chi tiết phiếu...</p>
            </div>
          ) : (
            <>
              <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-slate-700">
                <strong>Ghi chú:</strong> {detailData?.notes || 'Không có ghi chú'}
              </div>

              <table className="w-full overflow-hidden rounded-lg border border-slate-200 text-left text-sm text-slate-600">
                <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="border-b border-slate-200 px-4 py-3 font-bold">Mã SP</th>
                    <th className="border-b border-slate-200 px-4 py-3 font-bold">Tên sản phẩm</th>
                    <th className="border-b border-slate-200 px-4 py-3 text-center font-bold">
                      Tồn Hệ Thống
                    </th>
                    <th className="border-b border-slate-200 px-4 py-3 text-center font-bold">
                      Kiểm Đếm Thực Tế
                    </th>
                    <th className="border-b border-slate-200 px-4 py-3 text-center font-bold">
                      Chênh Lệch
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {detailData?.details?.map((item) => {
                    const currentActual = actualValues[item.detailId] ?? 0;
                    const discrepancy = currentActual - item.systemQuantity;

                    return (
                      <tr key={item.detailId} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-slate-700">
                          {item.productCode}
                        </td>
                        <td className="px-4 py-3">{item.productName}</td>
                        <td className="px-4 py-3 text-center font-bold text-slate-500">
                          {item.systemQuantity}
                        </td>

                        {/* Nếu phiếu đang Nháp -> Hiển thị Input nhập. Nếu không -> Text thường */}
                        <td className="px-4 py-3 text-center">
                          {isDraft ? (
                            <input
                              type="number"
                              min="0"
                              className="w-24 rounded border border-blue-300 px-2 py-1 text-center font-bold text-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              value={currentActual}
                              onChange={(e) =>
                                setActualValues({
                                  ...actualValues,
                                  [item.detailId]: e.target.value,
                                })
                              }
                            />
                          ) : (
                            <span className="font-bold text-blue-700">{item.actualQuantity}</span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-center">
                          {isDraft ? (
                            <span
                              className={`font-bold ${discrepancy === 0 ? 'text-slate-400' : discrepancy > 0 ? 'text-emerald-600' : 'text-red-600'}`}
                            >
                              {discrepancy > 0 ? `+${discrepancy}` : discrepancy}
                            </span>
                          ) : (
                            <span
                              className={`font-bold ${item.discrepancy === 0 ? 'text-slate-400' : item.discrepancy > 0 ? 'text-emerald-600' : 'text-red-600'}`}
                            >
                              {item.discrepancy > 0 ? `+${item.discrepancy}` : item.discrepancy}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
        </div>

        {/* Footer (Chỉ hiện nút Lưu khi đang ở trạng thái Nháp) */}
        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {isDraft ? 'Hủy bỏ' : 'Đóng'}
          </button>
          {isDraft && (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-orange-600"
            >
              <Icon name="fact_check" size={20} />
              Hoàn tất kiểm đếm
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryCheckDetailModal;
