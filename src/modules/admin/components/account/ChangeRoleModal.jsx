import React, { useState } from 'react';
import Icon from '../../../../shared/components/Icon';

const ChangeRoleModal = ({ isOpen, onClose, staffData, onSave }) => {
  const initialRole =
    (Array.isArray(staffData?.roles) && staffData.roles[0]) || 'INVENTORY_CONTROLLER';
  const [selectedRole, setSelectedRole] = useState(initialRole);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#0f0f0f] p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#333333] pb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-[#e5e5e5]">Äiá»u chá»‰nh Role (Quyá»n háº¡n)</h3>
          <button onClick={onClose} className="text-slate-400 dark:text-[#666666] hover:text-slate-900 dark:text-[#e5e5e5]">
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="space-y-4 py-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-[#999999]">
              TÃ i khoáº£n nhÃ¢n sá»±
            </label>
            <div className="text-sm font-bold text-slate-900 dark:text-[#e5e5e5]">
              {staffData?.fullName || staffData?.name}
            </div>
            <div className="font-mono text-xs text-slate-400 dark:text-[#666666]">{staffData?.email}</div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-[#999999]">
              Role Mapping má»›i
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full rounded-md border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#0f0f0f] p-2.5 text-sm font-semibold text-slate-900 dark:text-[#e5e5e5] outline-none focus:border-primary"
            >
              <option value="SALES_STAFF">SALES_STAFF (NhÃ¢n viÃªn bÃ¡n hÃ ng)</option>
              <option value="INVENTORY_CONTROLLER">INVENTORY_CONTROLLER (Thá»§ kho)</option>
              <option value="SYSTEM_ADMIN">SYSTEM_ADMIN (Quáº£n trá»‹ viÃªn)</option>
            </select>
          </div>

          <div className="flex items-start gap-2 rounded-md bg-slate-50 dark:bg-[#1a1a1a] p-3 text-xs leading-relaxed text-slate-500 dark:text-[#999999]">
            <Icon name="shield_alert" size={14} className="mt-0.5 shrink-0 text-secondary" />
            <span>
              <strong>BR-43:</strong> Thay Ä‘á»•i Role sáº½ buá»™c há»‡ thá»‘ng thu há»“i JWT Token hiá»‡n táº¡i.
              NhÃ¢n sá»± nÃ y sáº½ pháº£i Ä‘Äƒng nháº­p láº¡i Ä‘á»ƒ nháº­n quyá»n má»›i.
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-semibold text-slate-500 dark:text-[#999999] hover:bg-slate-100 dark:bg-[#272727]"
          >
            Há»§y
          </button>
          <button
            onClick={() => onSave(selectedRole)}
            className="rounded-md bg-[#004785] dark:bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-on-primary-fixed-variant"
          >
            LÆ°u Cáº¥u HÃ¬nh
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeRoleModal;

