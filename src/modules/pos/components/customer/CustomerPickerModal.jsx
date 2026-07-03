/**
 * CustomerPickerModal - Modal chọn khách hàng trong POS
 * Dùng API /pos/customers để lấy danh sách
 */
import { useState, useEffect } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { Badge } from '../../../../shared/components/Badge';
import { Input } from '../../../../shared/components/Input';
import { formatCurrency } from '../../../../shared/utils/formatCurrency';
import { getCustomers } from '../../services/posService';

const GROUP_COLORS = {
  'Cá nhân': 'info',
  'Doanh nghiệp': 'primary',
  'Đại lý': 'warning',
  'Nhà thầu': 'success',
};

// Map API customer
const mapCustomer = (c) => ({
  id: c.customerId || c.id,
  customerId: c.customerId,
  name: c.customerName || '',
  phone: c.phoneNumber || '',
  email: c.email || '',
  address: c.address || '',
  group: c.group || 'Cá nhân',
  totalSpent: parseFloat(c.totalSpent || 0),
  orderCount: parseInt(c.orderCount || 0),
});

const CustomerPickerModal = ({ isOpen, onClose, selectedCustomer, onSelect }) => {
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load customers when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getCustomers()
        .then((data) => {
          const items = Array.isArray(data) ? data : data?.items || [];
          setCustomers(items.map(mapCustomer));
        })
        .catch((err) => {
          console.error('Lỗi load khách hàng:', err);
          setCustomers([]);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const filtered = customers.filter((c) => {
    if (!search) return true;
    const kw = search.toLowerCase();
    return c.name.toLowerCase().includes(kw) || c.phone.includes(kw);
  });

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
        />
        <div className="max-h-72 space-y-1 overflow-y-auto">
          {/* Tùy chọn Khách lẻ */}
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

          {loading && <div className="py-4 text-center text-sm text-slate-400">Đang tải...</div>}

          {!loading && filtered.length === 0 && (
            <div className="py-4 text-center text-sm text-slate-400">
              {search ? 'Không tìm thấy khách hàng' : 'Chưa có khách hàng nào'}
            </div>
          )}

          {!loading &&
            filtered.map((c) => (
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
                    {c.name.charAt(0)}
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
                    <p className="font-bold text-green-600">{formatCurrency(c.totalSpent)}</p>
                    <p className="text-slate-400">{c.orderCount} đơn</p>
                  </div>
                </div>
              </button>
            ))}
        </div>
      </div>
    </Modal>
  );
};

export default CustomerPickerModal;
