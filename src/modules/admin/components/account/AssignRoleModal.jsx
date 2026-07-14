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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-lg border border-outline-variant bg-surface-container-lowest p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
          <h3 className="text-base font-bold text-on-surface">Chỉnh sửa Chức Vụ</h3>
          <button onClick={onClose} className="text-outline hover:text-on-surface">
            <Icon name="x" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="text-xs text-on-surface-variant">
            Bạn đang cấp quyền cho tài khoản:{' '}
            <strong className="text-on-surface">{user.email}</strong>
          </div>

          <div className="space-y-2">
            {assignableRoles.map((role) => (
              <label
                key={role.roleId}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-outline-variant p-3 transition-colors hover:bg-surface-container-low"
              >
                <input
                  type="checkbox"
                  checked={roleIds.includes(role.roleId)}
                  onChange={() => handleRoleToggle(role.roleId)}
                  className="h-4 w-4 rounded text-primary focus:ring-primary"
                />
                <div>
                  <div className="text-sm font-bold text-on-surface">{role.roleName}</div>
                  <div className="text-[10px] leading-tight text-on-surface-variant">
                    {role.description || `Quyền hạn của ${role.roleName}`}
                  </div>
                </div>
              </label>
            ))}
          </div>

          <div className="mt-4 flex justify-end gap-3 border-t border-surface-container-high pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded px-4 py-2 text-xs font-bold text-on-surface-variant transition-colors hover:bg-surface-container-high"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="rounded bg-primary px-4 py-2 text-xs font-bold text-on-primary shadow-sm transition-colors hover:bg-primary/90"
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
