/**
 * SupplierQuickAddPopup - Popup Thêm mới Nhà cung cấp.
 * Mở từ nút [+] trong popup Nhập kho.
 */
import { useState } from 'react';
import Icon from '../../../../shared/components/Icon';

const SupplierQuickAddPopup = ({ isOpen, onClose, onSave }) => {
  const [type, setType] = useState('organization');
  const isCustomer = false;
  const [saving, setSaving] = useState(false);

  // Supplier groups & quick-add
  // eslint-disable-next-line no-unused-vars
  const [supplierGroups, setSupplierGroups] = useState([
    'Nguyên vật liệu',
    'Thành phẩm',
    'Dịch vụ',
    'Khác',
  ]);
  // eslint-disable-next-line no-unused-vars
  const [showGroupPopup, setShowGroupPopup] = useState(false);
  const [newGroup, setNewGroup] = useState({
    code: '',
    name: '',
    parentGroup: '',
    description: '',
  });

  // eslint-disable-next-line no-unused-vars
  const handleAddGroup = () => {
    if (!newGroup.name.trim()) {
      alert('Vui lòng nhập Tên nhóm NCC');
      return;
    }
    setSupplierGroups((p) => [...p, newGroup.name.trim()]);
    setForm((p) => ({ ...p, group: newGroup.name.trim() }));
    setNewGroup({ code: '', name: '', parentGroup: '', description: '' });
    setShowGroupPopup(false);
  };
  const [form, setForm] = useState({
    code: '',
    name: '',
    phone: '',
    email: '',
    taxCode: '',
    debtDays: '',
    maxDebt: '',
    bankName: '',
    bankBranch: '',
    bankAccount: '',
    province: '',
    district: '',
    ward: '',
    address: '',
    group: '',
    notes: '',
    // Cá nhân
    idNumber: '',
    idIssueDate: '',
    idIssuePlace: '',
    // Người liên hệ
    contactName: '',
    contactTitle: '',
    contactPhone: '',
    contactEmail: '',
    contactPosition: '',
    contactAddress: '',
  });

  if (!isOpen) return null;

  const handleChange = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const handleSave = async (keepOpen) => {
    if (!form.code.trim() || !form.name.trim()) {
      alert('Vui lòng nhập Mã và Tên nhà cung cấp');
      return;
    }
    setSaving(true);
    try {
      onSave?.({ ...form, type, isCustomer });
      if (!keepOpen) onClose();
      else {
        setForm({
          code: '',
          name: '',
          phone: '',
          email: '',
          taxCode: '',
          debtDays: '',
          maxDebt: '',
          bankName: '',
          bankBranch: '',
          bankAccount: '',
          province: '',
          district: '',
          ward: '',
          address: '',
          group: '',
          notes: '',
        });
      }
    } catch {
      alert('Lỗi khi lưu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[350] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Thêm mới Nhà cung cấp</h2>
          <button
            type="button"
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            onClick={onClose}
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[65vh] space-y-5 overflow-y-auto px-6 py-5">
          {/* Loại NCC */}
          <div className="flex items-center gap-6">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="supType"
                className="h-4 w-4 text-blue-600"
                checked={type === 'individual'}
                onChange={() => setType('individual')}
              />
              <span className="text-sm text-slate-700">Cá nhân</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="supType"
                className="h-4 w-4 text-blue-600"
                checked={type === 'organization'}
                onChange={() => setType('organization')}
              />
              <span className="text-sm text-slate-700">Tổ chức</span>
            </label>
          </div>

          {/* Thông tin cơ bản */}
          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-600">
              Thông tin cơ bản
            </h3>
            {type === 'individual' ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">
                    Mã đối tác giao hàng <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    value={form.code}
                    onChange={(e) => handleChange('code', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">Họ tên</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-bold text-slate-500">Địa chỉ</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    value={form.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">Email</label>
                  <input
                    type="email"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">Điện thoại</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    value={form.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">Số CMND</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    value={form.idNumber}
                    onChange={(e) => handleChange('idNumber', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">
                    Ngày cấp CMND
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    value={form.idIssueDate}
                    onChange={(e) => handleChange('idIssueDate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">
                    Nơi cấp CMND
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    value={form.idIssuePlace}
                    onChange={(e) => handleChange('idIssuePlace', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">
                    Số nợ tối đa
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    value={form.maxDebt}
                    onChange={(e) => handleChange('maxDebt', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">
                    Hạn nợ (ngày)
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    value={form.debtDays}
                    onChange={(e) => handleChange('debtDays', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">
                    Số tài khoản ngân hàng
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    value={form.bankAccount}
                    onChange={(e) => handleChange('bankAccount', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">
                    Chi nhánh NH
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    value={form.bankBranch}
                    onChange={(e) => handleChange('bankBranch', e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">
                    Mã NCC <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    value={form.code}
                    onChange={(e) => handleChange('code', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">
                    Tên NCC <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    value={form.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">Email</label>
                  <input
                    type="email"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">Mã số thuế</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    value={form.taxCode}
                    onChange={(e) => handleChange('taxCode', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">
                    Hạn nợ (ngày)
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    value={form.debtDays}
                    onChange={(e) => handleChange('debtDays', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">
                    Số nợ tối đa
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    value={form.maxDebt}
                    onChange={(e) => handleChange('maxDebt', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {type === 'organization' && (
            <>
              {/* Thông tin người liên hệ */}
              <div className="border-t border-slate-100 pt-4">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-600">
                  Thông tin người liên hệ
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-500">Họ và tên</label>
                    <div className="flex items-stretch overflow-hidden rounded-lg border border-slate-200 focus-within:border-blue-500">
                      <select
                        className="border-r border-slate-200 bg-slate-50 px-2 py-2.5 text-sm text-slate-600 outline-none"
                        value={form.contactTitle}
                        onChange={(e) => handleChange('contactTitle', e.target.value)}
                      >
                        <option value="">--</option>
                        <option value="Ông">Ông</option>
                        <option value="Bà">Bà</option>
                        <option value="Khác">Khác</option>
                      </select>
                      <input
                        type="text"
                        className="flex-1 border-none px-3 py-2.5 text-sm outline-none"
                        value={form.contactName}
                        onChange={(e) => handleChange('contactName', e.target.value)}
                        placeholder="Nhập họ và tên"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-500">
                      Điện thoại
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                      value={form.contactPhone}
                      onChange={(e) => handleChange('contactPhone', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-500">Email</label>
                    <input
                      type="email"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                      value={form.contactEmail}
                      onChange={(e) => handleChange('contactEmail', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-500">Chức danh</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                      value={form.contactPosition}
                      onChange={(e) => handleChange('contactPosition', e.target.value)}
                      placeholder="VD: Giám đốc, Trưởng phòng..."
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="mb-1 block text-xs font-bold text-slate-500">Địa chỉ</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                      value={form.contactAddress}
                      onChange={(e) => handleChange('contactAddress', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Thông tin ngân hàng */}
              <div className="border-t border-slate-100 pt-4">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-600">
                  Thông tin ngân hàng
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-500">
                      Tên ngân hàng
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                      value={form.bankName}
                      onChange={(e) => handleChange('bankName', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-500">Chi nhánh</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                      value={form.bankBranch}
                      onChange={(e) => handleChange('bankBranch', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-500">
                      Số tài khoản
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                      value={form.bankAccount}
                      onChange={(e) => handleChange('bankAccount', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Địa chỉ */}
              <div className="border-t border-slate-100 pt-4">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-600">
                  Địa chỉ
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-500">
                      Tỉnh thành
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                      value={form.province}
                      onChange={(e) => handleChange('province', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-500">
                      Quận/Huyện
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                      value={form.district}
                      onChange={(e) => handleChange('district', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-500">Phường/Xã</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                      value={form.ward}
                      onChange={(e) => handleChange('ward', e.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="mb-1 block text-xs font-bold text-slate-500">
                    Địa chỉ chi tiết
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    placeholder="Số nhà, tên đường..."
                    value={form.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {/* Khác */}
          <div className="border-t border-slate-100 pt-4">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-600">
              Thông tin khác
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500">Ghi chú</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  value={form.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            className="text-sm text-slate-500 hover:text-slate-700"
            onClick={onClose}
          >
            Hủy
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              type="button"
              className="rounded-lg border border-[#004785] bg-white px-5 py-2.5 text-sm font-semibold text-[#004785] hover:bg-blue-50"
              onClick={() => handleSave(true)}
              disabled={saving}
            >
              Lưu và thêm mới
            </button>
            <button
              type="button"
              className="rounded-lg bg-[#004785] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#003566] disabled:opacity-50"
              onClick={() => handleSave(false)}
              disabled={saving}
            >
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierQuickAddPopup;
