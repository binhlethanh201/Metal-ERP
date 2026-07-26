import React, { useState, useEffect } from 'react';
import Icon from '../../../../shared/components/Icon';

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

// Hàm dịch trạng thái sang tiếng Việt thuần túy
const getPoStatusLabel = (status) => {
  switch (status?.toUpperCase()) {
    case 'APPROVED':
      return { label: 'Đã duyệt', css: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
    case 'COMPLETED':
      return { label: 'Hoàn tất', css: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' };
    case 'PENDING':
      return { label: 'Chờ duyệt', css: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' };
    case 'CANCELLED':
      return { label: 'Đã hủy', css: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
    default:
      return { label: status, css: 'bg-slate-100 text-slate-700 dark:bg-[#272727] dark:text-[#b3b3b3]' };
  }
};

const SupplierDebtDetailModal = ({ isOpen, onClose, supplierId, fetchDetail }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && supplierId) {
      setLoading(true);
      fetchDetail(supplierId)
        .then((data) => setDetail(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, supplierId, fetchDetail]);

  if (!isOpen) return null;

  return (
    <div className="animate-fade-in fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 p-4">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#1a1a1a]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4 dark:border-[#333333] dark:bg-[#1a1a1a]">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-[#e5e5e5]">Chi tiết công nợ chi tiết</h2>
            <p className="mt-1 inline-block rounded bg-blue-50 px-2 py-0.5 text-sm font-semibold text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              {detail?.supplierName || 'Đang tải...'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-200 dark:text-[#808080] dark:hover:bg-[#333333]"
          >
            <Icon name="close" size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 dark:bg-[#0f0f0f]/50">
          {loading ? (
            <div className="py-20 text-center text-slate-500 dark:text-[#999999]">
              <Icon name="sync" className="mb-3 animate-spin text-3xl" />
              <p>Đang tra cứu dữ liệu đơn hàng...</p>
            </div>
          ) : detail ? (
            <div className="space-y-6">
              {/* Thông tin liên hệ */}
              <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#333333] dark:bg-[#1a1a1a] md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-slate-100 p-2 text-slate-600 dark:bg-[#272727] dark:text-[#b3b3b3]">
                    <Icon name="phone" size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 dark:text-[#808080]">Số điện thoại</p>
                    <p className="font-semibold text-slate-800 dark:text-[#e5e5e5]">
                      {detail.contactPhone || 'Chưa cập nhật'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-slate-100 p-2 text-slate-600 dark:bg-[#272727] dark:text-[#b3b3b3]">
                    <Icon name="email" size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 dark:text-[#808080]">Địa chỉ Email</p>
                    <p className="font-semibold text-slate-800 dark:text-[#e5e5e5]">
                      {detail.contactEmail || 'Chưa cập nhật'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Danh sách PO */}
              <div>
                <h3 className="mb-4 text-lg font-bold text-slate-800 dark:text-[#e5e5e5]">Lịch sử đơn mua hàng</h3>
                {detail.purchaseOrders?.length === 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-slate-500 dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#999999]">
                    Chưa có đơn mua nào phát sinh với nhà cung cấp này
                  </div>
                ) : (
                  <div className="space-y-4">
                    {detail.purchaseOrders?.map((po) => {
                      const status = getPoStatusLabel(po.status);
                      return (
                        <div
                          key={po.purchaseOrderId}
                          className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-[#333333] dark:bg-[#1a1a1a]"
                        >
                          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-4 dark:border-[#333333] dark:bg-[#1a1a1a]">
                            <div className="flex items-center gap-4">
                              <div>
                                <p className="text-xs font-medium text-slate-500 dark:text-[#999999]">Mã đơn hàng</p>
                                <p className="text-lg font-bold text-blue-700 dark:text-blue-400">{po.orderCode}</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-slate-500 dark:text-[#999999]">Ngày đặt</p>
                                <p className="font-semibold text-slate-700 dark:text-[#b3b3b3]">
                                  {po.createdAt.split('T')[0]}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-bold ${status.css}`}
                              >
                                {status.label}
                              </span>
                              <p className="mt-1 text-xl font-black text-slate-900 dark:text-[#e5e5e5]">
                                {formatCurrency(po.totalAmount)}
                              </p>
                            </div>
                          </div>

                          <div className="p-0">
                            <table className="w-full text-left text-sm">
                              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-[#1a1a1a] dark:text-[#999999]">
                                <tr>
                                  <th className="px-5 py-3">Sản phẩm</th>
                                  <th className="px-5 py-3 text-center">Số lượng</th>
                                  <th className="px-5 py-3 text-right">Đơn giá</th>
                                  <th className="px-5 py-3 text-right">Thành tiền</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-[#333333]">
                                {po.items?.map((item) => (
                                  <tr key={item.productId} className="hover:bg-slate-50 dark:hover:bg-[#333333]">
                                    <td className="px-5 py-3">
                                      <div className="font-semibold text-slate-800 dark:text-[#e5e5e5]">
                                        {item.productName}
                                      </div>
                                      <div className="text-xs text-slate-400 dark:text-[#808080]">
                                        Mã: {item.productCode}
                                      </div>
                                    </td>
                                    <td className="px-5 py-3 text-center font-medium">
                                      {item.quantity}
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                      {formatCurrency(item.unitPrice)}
                                    </td>
                                    <td className="px-5 py-3 text-right font-bold text-slate-900 dark:text-[#e5e5e5]">
                                      {formatCurrency(item.lineTotal)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-500 dark:text-[#999999]">Không tìm thấy dữ liệu</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierDebtDetailModal;
