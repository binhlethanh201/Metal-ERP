import React, { useState, useEffect } from 'react';
import Icon from '../../../../shared/components/Icon';

const initialFormState = {
  branchName: '',
  branchCode: '',
  phone: '',
  city: '',
  address: '',
  type: 'Cửa hàng bán lẻ',
  isActive: 1,
};

const BranchModal = ({ isOpen, onClose, branch, onSave }) => {
  const [form, setForm] = useState(initialFormState);

  useEffect(() => {
    if (isOpen) {
      setForm(branch ? { ...branch } : initialFormState);
    }
  }, [isOpen, branch]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.branchName.trim()) {
      alert('Tên chi nhánh không được để trống!');
      return;
    }
    if (!branch && !form.branchCode.trim()) {
      alert('Mã chi nhánh không được để trống!');
      return;
    }
    onSave(form);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Lớp CSS dùng chung cho các ô input để đảm bảo hiển thị sắc nét
  const inputCss =
    'w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5] dark:placeholder-[#808080]';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-[#0f0f0f]">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4 dark:border-[#333333] dark:bg-[#1a1a1a]">
          <h2 className="text-lg font-bold text-slate-800 dark:text-[#e5e5e5]">
            {branch ? 'Cập nhật Chi nhánh' : 'Tạo Chi nhánh mới'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600 dark:text-[#808080] dark:hover:bg-[#333333] dark:hover:text-[#b3b3b3]"
          >
            <Icon name="close" size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-[#b3b3b3]">
                Tên chi nhánh <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: Chi nhánh miền Tây"
                className={inputCss}
                value={form.branchName}
                onChange={(e) => handleChange('branchName', e.target.value)}
              />
            </div>

            {!branch && (
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-[#b3b3b3]">
                  Mã chi nhánh <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: CN_MIENTAY_01"
                  className={`${inputCss} uppercase`}
                  value={form.branchCode}
                  onChange={(e) => handleChange('branchCode', e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-[#b3b3b3]">
                Số điện thoại
              </label>
              <input
                type="text"
                placeholder="VD: 0912345678"
                className={inputCss}
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-[#b3b3b3]">
                  Tỉnh/Thành phố
                </label>
                <input
                  type="text"
                  placeholder="VD: Cần Thơ"
                  className={inputCss}
                  value={form.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-[#b3b3b3]">
                  Loại cơ sở
                </label>
                <select
                  className={inputCss}
                  value={form.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                >
                  <option value="Cửa hàng bán lẻ">Cửa hàng bán lẻ</option>
                  <option value="Kho hàng kiêm phân phối">Kho hàng kiêm phân phối</option>
                  <option value="Chi nhánh tổng">Chi nhánh tổng</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-[#b3b3b3]">
                Địa chỉ cụ thể
              </label>
              <input
                type="text"
                placeholder="VD: 123 Đường 3/2, Ninh Kiều"
                className={inputCss}
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </div>

            {branch && (
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-[#b3b3b3]">
                  Trạng thái hoạt động
                </label>
                <select
                  className={inputCss}
                  value={form.isActive}
                  onChange={(e) => handleChange('isActive', Number(e.target.value))}
                >
                  <option value={1}>Đang hoạt động</option>
                  <option value={0}>Ngừng hoạt động</option>
                </select>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-[#333333]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#b3b3b3] dark:hover:bg-[#333333]"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              {branch ? 'Lưu thay đổi' : 'Tạo chi nhánh'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BranchModal;
