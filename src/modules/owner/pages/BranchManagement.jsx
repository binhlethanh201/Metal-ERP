import React, { useState } from 'react';
import Icon from '../../../shared/components/Icon';
import { useBranchManager } from '../hooks/useBranchManager';
import BranchTable from '../components/branch/BranchTable';
import BranchModal from '../components/branch/BranchModal';

const BranchManagement = () => {
  // Lấy data & hàm xử lý từ Hook
  const { branches, loading, error, handleCreateBranch, handleUpdateBranch } = useBranchManager();

  // Quản lý trạng thái UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);

  const handleOpenModal = (branch = null) => {
    setEditingBranch(branch);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBranch(null);
  };

  // Nhận dữ liệu từ Modal và quyết định gọi API Thêm hay Sửa
  const handleSave = (formData) => {
    if (editingBranch) {
      const updatePayload = {
        branchName: formData.branchName,
        phone: formData.phone,
        city: formData.city,
        address: formData.address,
        type: formData.type,
        isActive: formData.isActive,
      };
      handleUpdateBranch(editingBranch.branchId, updatePayload, handleCloseModal);
    } else {
      handleCreateBranch(formData, handleCloseModal);
    }
  };

  return (
    <div className="animate-fade-in w-full space-y-4 text-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Chi nhánh</h1>
          <p className="mt-1 text-gray-600">Quản lý danh sách cơ sở, kho hàng và cửa hàng</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 rounded-lg bg-[#004785] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-black"
        >
          <Icon name="add" size={20} />
          <span>Tạo chi nhánh mới</span>
        </button>
      </div>

      {/* Báo lỗi API nếu có */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          <Icon name="error" className="mr-2 inline" /> {error}
        </div>
      )}

      {/* Tách Bảng Dữ Liệu ra file riêng */}
      <BranchTable branches={branches} loading={loading} onEdit={handleOpenModal} />

      {/* Tách Modal Form ra file riêng */}
      <BranchModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        branch={editingBranch}
        onSave={handleSave}
      />
    </div>
  );
};

export default BranchManagement;
