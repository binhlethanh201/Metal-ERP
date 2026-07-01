import React from 'react';
import Icon from '../../../../shared/components/Icon';

// 🌟 Thêm onDelete vào props
const StaffTable = ({
  staffs,
  loading,
  onEdit,
  onToggleStatus,
  onDelete,
  onAssign,
  onUnassign,
}) => {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-6 py-4 font-bold">Nhân viên</th>
              <th className="px-6 py-4 font-bold">Liên hệ</th>
              {/* <th className="px-6 py-4 font-bold">Chi nhánh làm việc</th> */}
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
              staffs.map((staff) => (
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
                      {staff.phoneNumber || 'Chưa cập nhật SDT'}
                    </div>
                  </td>
                  {/* <td className="px-6 py-4 font-medium text-slate-700">
                    {staff.branchId ? (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-blue-800">{staff.branchName}</span>
                        <button
                          onClick={() => onUnassign(staff.userId, staff.branchId)}
                          className="rounded-full bg-red-50 p-1 text-red-500 transition-colors hover:bg-red-100 hover:text-red-700"
                          title="Gỡ khỏi chi nhánh này"
                        >
                          <Icon name="link_off" size={16} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs italic text-orange-500">Chưa gán chi nhánh</span>
                    )}
                  </td> */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onToggleStatus(staff.userId)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition-all hover:scale-105 ${
                        staff.isActive === 1
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                      title="Bấm để đổi trạng thái"
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${staff.isActive === 1 ? 'bg-green-600' : 'bg-red-600'}`}
                      ></span>
                      {staff.isActive === 1 ? 'Đang hoạt động' : 'Đã khóa'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* <button
                        onClick={() => onAssign(staff)}
                        className="rounded-lg p-2 text-orange-600 transition-colors hover:bg-orange-50"
                        title="Điều chuyển chi nhánh"
                      >
                        <Icon name="swap_horiz" size={20} />
                      </button> */}

                      <button
                        onClick={() => onEdit(staff)}
                        className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50"
                        title="Chỉnh sửa nhân viên"
                      >
                        <Icon name="edit" size={20} />
                      </button>

                      <button
                        onClick={() => onDelete(staff.userId)}
                        className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                        title="Xóa vĩnh viễn"
                      >
                        <Icon name="delete" size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffTable;
