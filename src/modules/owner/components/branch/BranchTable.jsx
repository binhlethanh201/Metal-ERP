import React, { useState } from 'react';
import Icon from '../../../../shared/components/Icon';
import BranchHistoryPanel from './BranchHistoryPanel'; // Import panel lịch sử vừa tạo

const BranchTable = ({ branches, loading, onEdit }) => {
  // Quản lý dòng chi nhánh nào đang được mở rộng xem lịch sử kho
  const [expandedBranchId, setExpandedBranchId] = useState('');

  const toggleExpandHistory = (branchId) => {
    setExpandedBranchId((prev) => (prev === branchId ? '' : branchId));
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-[#333333] dark:bg-[#0f0f0f]">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 dark:text-[#999999]">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-[#1a1a1a] dark:text-[#999999]">
            <tr>
              <th className="px-6 py-4 font-bold">Mã CN</th>
              <th className="px-6 py-4 font-bold">Tên chi nhánh</th>
              <th className="px-6 py-4 font-bold">Liên hệ & Địa chỉ</th>
              <th className="px-6 py-4 font-bold">Người quản lý</th>
              <th className="px-6 py-4 font-bold">Trạng thái</th>
              <th className="px-6 py-4 text-right font-bold">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#333333]">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400 dark:text-[#808080]">
                  <Icon name="sync" className="mb-2 animate-spin text-3xl" />
                  <p>Đang tải danh sách chi nhánh...</p>
                </td>
              </tr>
            ) : branches.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400 dark:text-[#808080]">
                  Không có chi nhánh nào.
                </td>
              </tr>
            ) : (
              branches.map((branch) => {
                const isExpanded = expandedBranchId === branch.branchId;
                return (
                  <React.Fragment key={branch.branchId}>
                    {/* Dòng dữ liệu chính */}
                    <tr
                      className={`transition-colors hover:bg-slate-50/60 dark:hover:bg-[#272727]/60 ${isExpanded ? 'bg-blue-50/20 dark:bg-blue-900/20' : ''}`}
                    >
                      <td className="px-6 py-4 font-semibold text-slate-800 dark:text-[#e5e5e5]">
                        {branch.branchCode}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-blue-900">{branch.branchName}</div>
                        <div className="text-xs text-slate-400 dark:text-[#808080]">{branch.type}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-700 dark:text-[#b3b3b3]">
                          {branch.phone || 'Chưa cập nhật SDT'}
                        </div>
                        <div className="text-xs text-slate-400 dark:text-[#808080]">
                          {branch.address}, {branch.city}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-700 dark:text-[#b3b3b3]">{branch.managerFullName}</div>
                        <div className="text-xs text-slate-400 dark:text-[#808080]">{branch.managerEmail}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                            branch.isActive === 1
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${branch.isActive === 1 ? 'bg-green-600' : 'bg-red-600'}`}
                          ></span>
                          {branch.isActive === 1 ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Nút bật/tắt xem lịch sử phiếu kho */}
                          <button
                            type="button"
                            onClick={() => toggleExpandHistory(branch.branchId)}
                            className={`rounded-lg p-2 transition-colors ${isExpanded ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-slate-500 hover:bg-slate-100 dark:text-[#999999] dark:hover:bg-[#333333]'}`}
                            title="Xem lịch sử phiếu kho"
                          >
                            <Icon name="history" size={20} />
                          </button>

                          <button
                            type="button"
                            onClick={() => onEdit(branch)}
                            className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/30"
                            title="Chỉnh sửa chi nhánh"
                          >
                            <Icon name="edit" size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Dòng mở rộng chứa Panel Lịch sử Phiếu Kho (Render Real-time khi bấm) */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={6} className="border-b border-blue-200 p-0">
                          <BranchHistoryPanel branchId={branch.branchId} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BranchTable;
