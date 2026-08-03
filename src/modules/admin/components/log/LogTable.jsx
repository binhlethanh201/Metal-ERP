import React from 'react';

const actionTranslations = {
  'CREATE_OWNER': 'Tạo tài khoản Chủ cửa hàng',
  'CREATE_STAFF': 'Tạo tài khoản Nhân viên',
  'UPDATE_ROLE_PERMISSIONS': 'Cập nhật phân quyền',
  'CANCEL_EXPENSE_VOUCHER': 'Hủy phiếu chi',
  'CREATE_EXPENSE_VOUCHER': 'Tạo phiếu chi',
  'CONFIRM_EXPENSE_VOUCHER': 'Xác nhận phiếu chi',
  'CANCEL_RETURN_ORDER': 'Hủy đơn trả hàng',
  'CREATE_CUSTOMER': 'Tạo khách hàng mới',
  'UPDATE_CUSTOMER': 'Cập nhật khách hàng',
  'CONFIRM_OUTWARD_INVENTORY': 'Xác nhận xuất kho',
  'INVENTORY_CHECK_RECONCILIATION': 'Cân bằng kho (Kiểm kê)',
  'FINALIZE_INVOICE': 'Hoàn tất hóa đơn',
  'RECORD_PAYMENT': 'Ghi nhận thanh toán',
  'CREATE_INVOICE': 'Tạo hóa đơn',
  'CANCEL_INVOICE': 'Hủy hóa đơn',
  'CONFIRM_TRANSFER': 'Xác nhận chuyển khoản',
  'CANCEL_TRANSFER': 'Hủy chuyển khoản',
  'CREATE_INWARD_INVENTORY': 'Tạo phiếu nhập kho',
  'CONFIRM_INWARD_INVENTORY': 'Xác nhận nhập kho',
  'CANCEL_INWARD_INVENTORY': 'Hủy phiếu nhập kho',
  'CREATE_OUTWARD_INVENTORY': 'Tạo phiếu xuất kho',
  'CANCEL_OUTWARD_INVENTORY': 'Hủy phiếu xuất kho',
  'CREATE_INVENTORY_CHECK': 'Tạo phiếu kiểm kê',
  'CANCEL_INVENTORY_CHECK': 'Hủy phiếu kiểm kê',
  'APPROVE_INVENTORY_CHECK': 'Duyệt phiếu kiểm kê',
  'REJECT_INVENTORY_CHECK': 'Từ chối phiếu kiểm kê',
  'LOGIN': 'Đăng nhập',
  'LOGOUT': 'Đăng xuất',
  'UPDATE_USER': 'Cập nhật tài khoản',
  'DELETE_USER': 'Xóa tài khoản',
  'PERMANENT_DELETE_USER': 'Xóa vĩnh viễn tài khoản',
  'UPDATE_PRODUCT': 'Cập nhật sản phẩm',
  'CREATE_PRODUCT': 'Tạo sản phẩm',
  'DELETE_PRODUCT': 'Xóa sản phẩm',
  'ASSIGN_ROLE': 'Gán vai trò',
  'BAN_STAFF': 'Khóa tài khoản nhân viên',
  'EXCEL_IMPORT': 'Nhập từ Excel',
  'APPROVE_PO': 'Duyệt đơn mua hàng',
  'CREATE_STOCK_TICKET': 'Tạo phiếu kiểm kho',
  'RESOLVE_VIOLATION': 'Xử lý vi phạm',
  'CREATE_BRANCH_PRODUCT': 'Thêm sản phẩm chi nhánh',
  'DEACTIVATE_USER': 'Khóa tài khoản',
  'ACTIVATE_USER': 'Kích hoạt tài khoản',
  'RESET_PASSWORD': 'Khôi phục mật khẩu',
  'DELETE_BRANCH': 'Xóa cửa hàng',
  'CREATE_BRANCH': 'Tạo cửa hàng'
};

export const translateAction = (action) => {
  if (!action) return '—';
  return actionTranslations[action.toUpperCase()] || action;
};

const LogTable = ({ logs, onRowClick }) => {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-[#333333] dark:bg-[#0f0f0f]">
      <div className="min-h-[400px] overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-900 dark:text-[#e5e5e5]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#999999]">
              <th className="px-4 py-3 font-bold">Thời gian</th>
              <th className="px-4 py-3 font-bold">Mức độ</th>
              <th className="px-4 py-3 font-bold">Người thực hiện</th>
              <th className="px-4 py-3 font-bold">Hành động</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 dark:divide-[#333333]">
            {logs.map((log) => (
              <tr
                key={log.logId}
                onClick={() => onRowClick?.(log)}
                className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-[#1a1a1a]"
              >
                <td className="whitespace-nowrap px-4 py-3 text-[11px] font-medium text-slate-500 dark:text-[#999999]">
                  {log.timestamp
                    ? new Date(log.timestamp).toLocaleString('vi-VN', {
                      hour12: false,
                    })
                    : '—'}
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`rounded-sm px-2 py-1 text-[10px] font-bold ${(log.level || 'INFO').toUpperCase() === 'ERROR'
                      ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-500'
                      : (log.level || 'INFO').toUpperCase() === 'WARN'
                        ? 'bg-secondary-container text-on-secondary-container'
                        : 'bg-slate-100 text-slate-900 dark:bg-[#272727] dark:text-[#e5e5e5]'
                      }`}
                  >
                    {(log.level || 'INFO').toUpperCase()}
                  </span>
                </td>

                <td className="whitespace-nowrap px-4 py-3">
                  <div className="font-bold text-[#004785] dark:text-blue-400">{log.userName || 'Hệ thống'}</div>
                </td>

                <td className="px-4 py-3">
                  <div className="font-bold">{translateAction(log.action)}</div>

                  <div
                    className="mt-0.5 max-w-xl truncate text-[11px] text-slate-500 dark:text-[#999999]"
                    title={(log.description || '')
                      .replace(/( - Branch: | tại chi nhánh )[a-f0-9-]{36}/gi, '')
                      .replace(/SalesStaff|Sales Staff/g, 'Nhân viên Bán hàng')
                      .replace(/InventoryStaff|Inventory Staff/g, 'Nhân viên Kho')
                      .replace(/Owner/g, 'Chủ cửa hàng')
                      .replace(/Role:/g, 'Vai trò:')
                      .replace(/Branch:/g, 'Cửa hàng:')
                      .replace(/\(soft\)/g, '(tạm ẩn)')
                      .replace(/chi nhánh/g, 'cửa hàng')
                    }
                  >
                    {(log.description || 'Không có mô tả')
                      .replace(/( - Branch: | tại chi nhánh )[a-f0-9-]{36}/gi, '')
                      .replace(/SalesStaff|Sales Staff/g, 'Nhân viên Bán hàng')
                      .replace(/InventoryStaff|Inventory Staff/g, 'Nhân viên Kho')
                      .replace(/Owner/g, 'Chủ cửa hàng')
                      .replace(/Role:/g, 'Vai trò:')
                      .replace(/Branch:/g, 'Cửa hàng:')
                      .replace(/\(soft\)/g, '(tạm ẩn)')
                      .replace(/chi nhánh/g, 'cửa hàng')
                    }
                  </div>
                </td>
              </tr>
            ))}

            {logs.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="px-4 py-12 text-center font-sans text-sm font-semibold text-slate-400 dark:text-[#666666]"
                >
                  Không tìm thấy nhật ký hoạt động nào khớp với bộ lọc.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LogTable;