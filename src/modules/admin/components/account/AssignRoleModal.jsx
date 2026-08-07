import React, { useState, useEffect } from 'react';
import Icon from '../../../../shared/components/Icon';

const AssignRoleModal = ({ isOpen, onClose, onSave, roles, user }) => {
  const [roleId, setRoleId] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      const current = (user.roles || [])[0]?.roleId || '';
      setRoleId(current);
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!roleId) return;
    onSave(user.userId, roleId);
  };

  const assignableRoles = roles.filter(
    (r) => r.roleName.toLowerCase() !== 'admin' && r.roleName.toLowerCase() !== 'communityuser'
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-[#333333] dark:bg-[#0f0f0f]">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-[#333333]">
          <h3 className="text-base font-bold text-slate-900 dark:text-[#e5e5e5]">Phân quyền người dùng</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:text-[#666666] dark:hover:text-[#e5e5e5]">
            <Icon name="close" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <p className="text-xs text-slate-500 dark:text-[#999999]">
            Đang phân quyền cho tài khoản:{' '}
            <strong className="text-slate-900 dark:text-[#e5e5e5]">{user.email}</strong>
          </p>

          <div className="space-y-2">
            {assignableRoles.map((role) => (
              <label
                key={role.roleId}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:bg-slate-50 dark:border-[#333333] dark:hover:bg-[#1a1a1a]"
              >
                <input
                  type="radio"
                  name="role"
                  value={role.roleId}
                  checked={roleId === role.roleId}
                  onChange={() => setRoleId(role.roleId)}
                  className="h-4 w-4 accent-[#004785]"
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

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-[#333333]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-[#272727] dark:text-[#e5e5e5] dark:hover:bg-[#333333]"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={!roleId}
              className="rounded-lg bg-[#004785] px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-blue-800 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignRoleModal;
