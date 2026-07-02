import React, { useState, useEffect } from 'react';
import Icon from '../../../../shared/components/Icon';
import { getProducts } from '../../services/inventoryService';
import { getStaffs } from '../../../owner/services/staffService';
import { useAuth } from '../../../../shared/hooks/useAuth';

const EditCheckModal = ({ isOpen, onClose, detailData, branches = [], onSave }) => {
  const { user } = useAuth();
  const isOwner = user?.roles?.includes('Owner') || user?.role === 'Owner';
  const currentUserId = user?.userId || user?.id;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedIds, setSelectedIds] = useState([]);
  const [notes, setNotes] = useState('');
  const [search, setSearch] = useState('');

  const [assigneeUserId, setAssigneeUserId] = useState('');
  const [staffList, setStaffList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);

  const branchId = detailData?.branchId;
  const branchName =
    branches.find((b) => b.branchId === branchId)?.branchName || 'Chi nhánh hiện tại';

  // Khởi tạo dữ liệu từ detailData
  useEffect(() => {
    if (isOpen && detailData) {
      setNotes(detailData.notes || '');
      setAssigneeUserId(detailData.assigneeUserId || '');

      // Lấy danh sách ID sản phẩm đã có sẵn trong phiếu
      const initialProductIds =
        detailData.details?.map((d) => d.branchProductId || d.productId || d.id) || [];
      setSelectedIds(initialProductIds);

      // Fetch danh sách sản phẩm trong kho
      setLoading(true);
      getProducts({ branchId: branchId, pageSize: 100, status: 'active' })
        .then((res) => {
          if (res?.success && res.data) {
            setProducts(res.data.items || res.data || []);
          }
        })
        .finally(() => setLoading(false));

      // Fetch danh sách nhân viên
      if (isOwner) {
        setLoadingStaff(true);
        getStaffs({ pageSize: 100 })
          .then((res) => {
            if (res?.success && res.data) {
              const allStaff = res.data.items || [];
              const qualifiedStaff = allStaff.filter((staff) => {
                const isSameBranch = staff.branchId === branchId || !staff.branchId;
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
    } else {
      setSearch('');
    }
  }, [isOpen, detailData, branchId, isOwner, currentUserId]);

  if (!isOpen || !detailData) return null;

  const filteredProducts = products.filter(
    (p) =>
      p.productName?.toLowerCase().includes(search.toLowerCase()) ||
      p.productCode?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSelectAll = (checked) => {
    if (checked)
      setSelectedIds(filteredProducts.map((p) => p.branchProductId || p.productId || p.id));
    else setSelectedIds([]);
  };

  const handleSubmit = () => {
    if (selectedIds.length === 0) {
      alert('Vui lòng chọn ít nhất 1 sản phẩm để kiểm kê!');
      return;
    }

    // TÍNH TOÁN DANH SÁCH THÊM/BỚT THEO API DOCUMENT
    const originalIds = detailData.details.map((d) => d.branchProductId || d.productId || d.id);

    // addProductIds: Có trong selectedIds nhưng KHÔNG CÓ trong originalIds
    const addProductIds = selectedIds.filter((id) => !originalIds.includes(id));

    // removeProductIds: Có trong originalIds nhưng KHÔNG CÓ trong selectedIds
    const removeProductIds = originalIds.filter((id) => !selectedIds.includes(id));

    const finalAssignee = assigneeUserId || null;

    const payload = {
      notes,
      assigneeUserId: finalAssignee,
      addProductIds,
      removeProductIds,
    };

    onSave(detailData.ticketId, payload);
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/60 p-4">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Cập nhật Phiếu: <span className="text-blue-600">{detailData.ticketCode}</span>
            </h2>
            <p className="mt-1 text-xs text-slate-500">Chi nhánh: {branchName}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
          >
            <Icon name="close" size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6">
          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Mục đích / Ghi chú
              </label>
              <textarea
                rows="2"
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="VD: Kiểm kê định kỳ..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {isOwner && (
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Người phụ trách
                </label>
                <select
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100"
                  value={assigneeUserId}
                  onChange={(e) => setAssigneeUserId(e.target.value)}
                  disabled={loadingStaff}
                >
                  <option value="">-- Chưa gán (Để trống) --</option>
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
                {loadingStaff && (
                  <span className="mt-1 inline-block text-xs text-slate-500">
                    Đang tải nhân viên...
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Danh sách Hàng hóa</h3>
            <div className="flex w-64 items-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 shadow-sm focus-within:border-blue-500">
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
                      Không tìm thấy sản phẩm
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const id = p.productId || p.id;
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
                        <td className="px-4 py-3 text-center font-bold text-slate-700">{stock}</td>
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
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
          >
            <Icon name="save" size={20} /> Cập nhật phiếu
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCheckModal;
