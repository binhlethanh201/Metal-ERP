import React from 'react';
import Icon from '../../../../shared/components/Icon';

const StaffTable = ({ staffs, loading, currentUserId, onViewDetail, onToggleStatus, onDelete }) => {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-6 py-4 font-bold">Nhân viên</th>
              <th className="px-6 py-4 font-bold">Liên hệ</th>
              <th className="px-6 py-4 font-bold">Chi nhánh</th>
              <th className="px-6 py-4 font-bold">Trạng thái</th>
              <th className="px-6 py-4 text-right font-bold">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">
                  <Icon name="sync" className="mb-2 animate-spin text-3xl" />
                  <p>Đang tải danh sách nhân viên...</p>
                </td>
              </tr>
            ) : staffs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">
                  Không tìm thấy nhân viên nào.
                </td>
              </tr>
            ) : (
              staffs.map((staff) => {
                const isSelf = currentUserId && staff.userId === currentUserId;

                return (
                  <tr key={staff.userId} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-blue-900">{staff.fullName}</div>
                      <div className="text-xs font-medium text-slate-400">
                        Vai trò: {staff.roles?.join(', ') || 'Chưa gán'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-700">{staff.email}</div>
                      <div className="text-xs text-slate-400">
                        {staff.phoneNumber || 'Chưa cập nhật SĐT'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                        <Icon name="store" size={14} className="text-slate-500" />
                        {staff.branchName || 'Chi nhánh chính'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        disabled={isSelf}
                        onClick={() => !isSelf && onToggleStatus(staff.userId)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition-all ${
                          isSelf ? 'cursor-not-allowed opacity-60' : 'hover:scale-105'
                        } ${
                          staff.isActive === 1
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                        title={
                          isSelf
                            ? 'Bạn không thể tự vô hiệu hóa tài khoản chính mình'
                            : 'Bấm để đổi trạng thái hoạt động'
                        }
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            staff.isActive === 1 ? 'bg-green-600' : 'bg-red-600'
                          }`}
                        ></span>
                        {staff.isActive === 1 ? 'Đang hoạt động' : 'Đã khóa'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/*  ĐỔI NÚT SỬA THÀNH NÚT XEM CHI TIẾT (ICON CON MẮT) */}
                        <button
                          onClick={() => onViewDetail(staff)}
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100"
                          title="Xem chi tiết & Cập nhật nhân viên"
                        >
                          <Icon name="visibility" size={18} />
                        </button>

                        <button
                          disabled={isSelf}
                          onClick={() => !isSelf && onDelete(staff.userId)}
                          className={`rounded-lg p-2 transition-colors ${
                            isSelf
                              ? 'cursor-not-allowed text-slate-300'
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                          title={
                            isSelf
                              ? 'Bạn không thể tự xóa tài khoản của chính mình'
                              : 'Xóa vĩnh viễn'
                          }
                        >
                          <Icon name="delete" size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffTable;
