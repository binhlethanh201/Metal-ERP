import React, { useState, useEffect } from 'react';
import Icon from '../../../../shared/components/Icon';
import { getProducts } from '../../services/inventoryService';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { getStaffs } from '../../../owner/services/staffService';

const CreateCheckModal = ({ isOpen, onClose, initialBranchId, branches = [], onSave }) => {
  const { user } = useAuth();
  const isOwner = user?.roles?.includes('Owner') || user?.role === 'Owner';
  const currentUserId = user?.userId || user?.id;

  // State quản lý chi nhánh đang được chọn bên TRONG modal
  const [localBranchId, setLocalBranchId] = useState('');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedIds, setSelectedIds] = useState([]);
  const [notes, setNotes] = useState('');
  const [search, setSearch] = useState('');

  const [assigneeUserId, setAssigneeUserId] = useState('');
  const [staffList, setStaffList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);

  // Khởi tạo giá trị chi nhánh khi vừa mở Modal
  useEffect(() => {
    if (isOpen) {
      setLocalBranchId(initialBranchId || (branches.length > 0 ? branches[0].branchId : ''));
    } else {
      // Reset khi đóng
      setSelectedIds([]);
      setNotes('');
      setAssigneeUserId('');
      setSearch('');
      setLocalBranchId('');
    }
  }, [isOpen, initialBranchId, branches]);

  // Fetch dữ liệu mỗi khi người dùng đổi chi nhánh (localBranchId thay đổi)
  useEffect(() => {
    if (isOpen && localBranchId) {
      setLoading(true);
      getProducts({ branchId: localBranchId, pageSize: 100, status: 'active' })
        .then((res) => {
          if (res?.success && res.data) {
            setProducts(res.data.items || res.data || []);
          }
        })
        .finally(() => setLoading(false));

      if (isOwner) {
        setLoadingStaff(true);
        getStaffs({ pageSize: 100 })
          .then((res) => {
            if (res?.success && res.data) {
              const allStaff = res.data.items || [];
              const qualifiedStaff = allStaff.filter((staff) => {
                const isSameBranch = staff.branchId === localBranchId || !staff.branchId;
                const hasInventoryRole =
                  staff.roles?.includes('InventoryStaff') || staff.roles?.includes('Owner');
                const hasPermission =
                  staff.permissionCodes?.includes('STOCK_CHECK_CREATE') ||
                  staff.permissionCodes?.includes('STOCK_CHECK_APPROVE');
                return isSameBranch && (hasInventoryRole || hasPermission);
              });
              setStaffList(qualifiedStaff);
            }
          })
          .catch((err) => console.error('Lỗi lấy danh sách NV:', err))
          .finally(() => setLoadingStaff(false));
      } else {
        setAssigneeUserId(currentUserId);
      }
    }
  }, [isOpen, localBranchId, isOwner, currentUserId]);

  // Hàm xử lý khi user chuyển chi nhánh khác
  const handleBranchChange = (e) => {
    setLocalBranchId(e.target.value);
    setSelectedIds([]); // Hủy chọn sản phẩm cũ vì qua chi nhánh mới rồi
    setAssigneeUserId(''); // Hủy người phụ trách cũ
  };

  if (!isOpen) return null;

  const filteredProducts = products.filter(
    (p) =>
      p.productName?.toLowerCase().includes(search.toLowerCase()) ||
      p.productCode?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSelectAll = (checked) => {
    if (checked) setSelectedIds(filteredProducts.map((p) => p.productId).filter(Boolean));
    else setSelectedIds([]);
  };

  const handleSubmit = () => {
    if (selectedIds.length === 0) {
      alert('Vui lòng chọn ít nhất 1 sản phẩm để kiểm kê!');
      return;
    }
    const finalAssignee = assigneeUserId || null;
    // Bắn trả về localBranchId để API gửi lên Backend
    onSave(selectedIds, notes, finalAssignee, localBranchId);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 p-4">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Tạo Phiếu Kiểm Kê Mới</h2>
            <p className="mt-1 text-xs text-slate-500">Chọn mặt hàng có trong kho để kiểm đếm</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
          >
            <Icon name="close" size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6">
          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* THÊM MỚI: BỘ LỌC CHI NHÁNH BÊN TRONG MODAL */}
            {isOwner && (
              <div className="col-span-1">
                <label className="mb-2 block text-sm font-bold text-blue-700">
                  Kiểm kê tại Chi nhánh
                </label>
                <select
                  className="w-full rounded-lg border-2 border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={localBranchId}
                  onChange={handleBranchChange}
                >
                  {branches.map((b) => (
                    <option key={b.branchId} value={b.branchId}>
                      {b.branchName || b.branchCode}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className={isOwner ? 'col-span-1' : 'col-span-2'}>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Mục đích / Ghi chú
              </label>
              <textarea
                rows="1"
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="VD: Định kỳ..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {isOwner && (
              <div className="col-span-1">
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Người phụ trách
                </label>
                <select
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100"
                  value={assigneeUserId}
                  onChange={(e) => setAssigneeUserId(e.target.value)}
                  disabled={loadingStaff}
                >
                  <option value="">-- Để trống --</option>
                  <option value={currentUserId}>Tự giao cho tôi</option>
                  {staffList.map(
                    (staff) =>
                      staff.userId !== currentUserId && (
                        <option key={staff.userId} value={staff.userId}>
                          {staff.fullName || staff.email}
                        </option>
                      )
                  )}
                </select>
              </div>
            )}
          </div>

          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Danh sách Hàng hóa trong kho</h3>
            <div className="flex w-64 items-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
              <Icon name="search" size={18} className="mr-2 text-slate-400" />
              <input
                type="text"
                className="w-full text-sm outline-none"
                placeholder="Tìm tên, mã SP..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="max-h-[400px] overflow-hidden overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="sticky top-0 z-10 bg-slate-100 text-xs uppercase text-slate-500 shadow-sm">
                <tr>
                  <th className="w-12 border-b px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300"
                      checked={
                        filteredProducts.length > 0 &&
                        selectedIds.length === filteredProducts.length
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th className="border-b px-4 py-3 font-bold">Mã SP</th>
                  <th className="border-b px-4 py-3 font-bold">Tên SP</th>
                  <th className="border-b px-4 py-3 text-center font-bold">Tồn Hệ Thống</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400">
                      <Icon name="sync" className="animate-spin text-2xl" />
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400">
                      Không tìm thấy sản phẩm nào trong kho này
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const id = p.productId;
                    const isSelected = selectedIds.includes(id);
                    const stock = p.actualStock ?? p.availableStock ?? 0;

                    return (
                      <tr
                        key={id}
                        className={`cursor-pointer transition-colors hover:bg-blue-50 ${isSelected ? 'bg-blue-50/50' : ''}`}
                        onClick={() => toggleSelect(id)}
                      >
                        <td className="px-4 py-3 text-center">
                          <input type="checkbox" checked={isSelected} readOnly />
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-700">{p.productCode}</td>
                        <td className="px-4 py-3">{p.productName}</td>
                        <td
                          className={`px-4 py-3 text-center font-bold ${stock === 0 ? 'text-slate-400' : 'text-slate-700'}`}
                        >
                          {stock}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <Icon name="save" size={20} /> Tạo phiếu nháp
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCheckModal;
