/**
 * CustomerPickerModal - Chọn khách hàng khi tạo đơn
 * TODO (FE): Kết nối API GET /pos/customers?search=... khi BE sẵn sàng.
 * Hiện tìm kiếm từ mockCustomers local.
 */
import { useState, useEffect, useMemo } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { Badge } from '../../../../shared/components/Badge';
import { Input } from '../../../../shared/components/Input';
import { formatCurrency } from '../../../../shared/utils/formatCurrency';
import { mockCustomers } from '../../data/posMockData';

const GROUP_COLORS = {
  'Cá nhân': 'info',
  'Doanh nghiệp': 'primary',
  'Đại lý': 'warning',
  'Nhà thầu': 'success',
};

const CustomerPickerModal = ({ isOpen, onClose, selectedCustomer, onSelect }) => {
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isOpen) setSearch('');
  }, [isOpen]);

  // TODO (FE): thay bằng API call GET /pos/customers?search=...
  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase();
    if (!kw) return mockCustomers;
    return mockCustomers.filter(
      (c) =>
        (c.name || '').toLowerCase().includes(kw) ||
        (c.phone || '').includes(kw)
    );
  }, [search]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chọn khách hàng"
      size="lg"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Đóng
        </Button>
      }
    >
      <div className="space-y-3">
        <Input
          placeholder="Tìm theo tên hoặc số điện thoại..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
        <div className="max-h-72 space-y-1 overflow-y-auto">
          <button
            type="button"
            onClick={() => {
              onSelect(null);
              onClose();
            }}
            className={`w-full rounded-lg border px-4 py-3 text-left transition-colors hover:bg-slate-50 ${!selectedCustomer ? 'border-[#004785] bg-blue-50' : 'border-slate-100'}`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-500">
                L
              </div>
              <div>
                <p className="font-semibold text-slate-900">Khách lẻ</p>
                <p className="text-xs text-slate-400">Không lưu thông tin khách hàng</p>
              </div>
            </div>
          </button>
          {filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                onSelect(c);
                onClose();
              }}
              className={`w-full rounded-lg border px-4 py-3 text-left transition-colors hover:bg-slate-50 ${selectedCustomer && selectedCustomer.id === c.id ? 'border-[#004785] bg-blue-50' : 'border-slate-100'}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#004785] text-sm font-bold text-white">
                  {(c.name || '?').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900">{c.name}</p>
                    <Badge variant={GROUP_COLORS[c.group] || 'secondary'} size="sm">
                      {c.group}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    {c.phone} {c.email ? '- ' + c.email : ''}
                  </p>
                </div>
                <div className="text-right text-xs">
                  <p className="font-bold text-green-600">{formatCurrency(c.totalSpent || 0)}</p>
                  <p className="text-slate-400">{c.orderCount || 0} đơn</p>
                </div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="py-6 text-center text-sm text-slate-400">
              Không tìm thấy khách hàng
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CustomerPickerModal;
