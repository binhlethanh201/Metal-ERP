import React, { useState, useEffect } from 'react';
import Icon from '../../../../shared/components/Icon';

const AssignRoleModal = ({ isOpen, onClose, onSave, roles, user }) => {
  const [roleIds, setRoleIds] = useState([]);

  useEffect(() => {
    if (isOpen && user) {
      setRoleIds((user.roles || []).map((r) => r.roleId));
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const handleRoleToggle = (roleId) => {
    setRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(user.userId, roleIds);
  };

  const assignableRoles = roles.filter(
    (r) => r.roleName.toLowerCase() !== 'admin' && r.roleName.toLowerCase() !== 'communityuser'
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#0f0f0f] p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#333333] pb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-[#e5e5e5]">Chá»‰nh sá»­a Chá»©c Vá»¥</h3>
          <button onClick={onClose} className="text-slate-400 dark:text-[#666666] hover:text-slate-900 dark:text-[#e5e5e5]">
            <Icon name="x" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="text-xs text-slate-500 dark:text-[#999999]">
            Bạn đang cấp quyền cho tài khoản:{' '}
            <strong className="text-slate-900 dark:text-[#e5e5e5]">{user.email}</strong>
          </div>

          <div className="space-y-2">
            {assignableRoles.map((role) => (
              <label
                key={role.roleId}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 dark:border-[#333333] p-3 transition-colors hover:bg-slate-50 dark:bg-[#1a1a1a]"
              >
                <input
                  type="checkbox"
                  checked={roleIds.includes(role.roleId)}
                  onChange={() => handleRoleToggle(role.roleId)}
                  className="h-4 w-4 rounded text-[#004785] dark:text-blue-400 focus:ring-primary"
                />
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-[#e5e5e5]">{role.roleName}</div>
                  <div className="text-[10px] leading-tight text-slate-500 dark:text-[#999999]">
                    {role.description || `Quyền hạn của ${role.roleName}`}
                  </div>
                </div>
              </label>
            ))}
          </div>

          <div className="mt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-[#333333] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded px-4 py-2 text-xs font-bold text-slate-500 dark:text-[#999999] transition-colors hover:bg-slate-100 dark:bg-[#272727]"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="rounded bg-[#004785] dark:bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#004785] dark:bg-blue-600/90"
            >
              Lưu Thay Đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignRoleModal;

