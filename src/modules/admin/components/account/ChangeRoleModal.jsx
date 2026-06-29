import React, { useState } from 'react';
import Icon from '../../../../shared/components/Icon';

const ChangeRoleModal = ({ isOpen, onClose, staffData, onSave }) => {
  const initialRole =
    (Array.isArray(staffData?.roles) && staffData.roles[0]) || 'INVENTORY_CONTROLLER';
  const [selectedRole, setSelectedRole] = useState(initialRole);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-outline-variant bg-surface-container-lowest p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
          <h3 className="text-base font-bold text-on-surface">Điều chỉnh Role (Quyền hạn)</h3>
          <button onClick={onClose} className="text-outline hover:text-on-surface">
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="space-y-4 py-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-on-surface-variant">
              Tài khoản nhân sự
            </label>
            <div className="text-sm font-bold text-on-surface">
              {staffData?.fullName || staffData?.name}
            </div>
            <div className="font-mono text-xs text-outline">{staffData?.email}</div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-on-surface-variant">
              Role Mapping mới
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full rounded-md border border-outline-variant bg-surface-container-lowest p-2.5 text-sm font-semibold text-on-surface outline-none focus:border-primary"
            >
              <option value="SALES_STAFF">SALES_STAFF (Nhân viên bán hàng)</option>
              <option value="INVENTORY_CONTROLLER">INVENTORY_CONTROLLER (Thủ kho)</option>
              <option value="SYSTEM_ADMIN">SYSTEM_ADMIN (Quản trị viên)</option>
            </select>
          </div>

          <div className="flex items-start gap-2 rounded-md bg-surface-container-low p-3 text-xs leading-relaxed text-on-surface-variant">
            <Icon name="shield_alert" size={14} className="mt-0.5 shrink-0 text-secondary" />
            <span>
              <strong>BR-43:</strong> Thay đổi Role sẽ buộc hệ thống thu hồi JWT Token hiện tại.
              Nhân sự này sẽ phải đăng nhập lại để nhận quyền mới.
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high"
          >
            Hủy
          </button>
          <button
            onClick={() => onSave(selectedRole)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-on-primary hover:bg-on-primary-fixed-variant"
          >
            Lưu Cấu Hình
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeRoleModal;
