import React, { useState, useEffect } from 'react';
import Icon from '../../../shared/components/Icon';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import { useBranchManager } from '../hooks/useBranchManager';
import { useDiscountTiers } from '../hooks/useDiscountTiers';
import DiscountTierTable from '../components/settings/DiscountTierTable';
import DiscountTierModal from '../components/settings/DiscountTierModal';
import CategoryReturnPolicy from '../components/settings/CategoryReturnPolicy';

/**
 * Trang Cài đặt cửa hàng - Quản lý chiết khấu theo giá trị đơn hàng
 */
const StoreSettings = () => {
  // Lấy danh sách chi nhánh
  const { branches } = useBranchManager();

  // Chi nhánh được chọn - dùng branch đầu tiên
  const [selectedBranchId, setSelectedBranchId] = useState('');

  // Khi có branches thì chọn branch đầu tiên
  useEffect(() => {
    if (branches.length > 0 && !selectedBranchId) {
      setSelectedBranchId(branches[0].branchId);
    }
  }, [branches, selectedBranchId]);

  // Lấy discount tiers theo chi nhánh được chọn
  const { tiers, loading, error, handleCreateTier, handleUpdateTier, handleDeleteTier } =
    useDiscountTiers(selectedBranchId);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [saving, setSaving] = useState(false);

  // Xử lý mở modal thêm/sửa
  const handleOpenModal = (tier = null) => {
    setEditingTier(tier);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTier(null);
  };

  // Xử lý save (tạo mới hoặc cập nhật)
  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (editingTier) {
        await handleUpdateTier(editingTier.orderDiscountTierId, formData, handleCloseModal);
      } else {
        await handleCreateTier(formData, handleCloseModal);
      }
    } finally {
      setSaving(false);
    }
  };

  // Xử lý xóa
  const handleDelete = (tier) => {
    if (
      !window.confirm(
        `Bạn có chắc muốn xóa mức chiết khấu "${tier.discountPercent}%" cho đơn hàng từ ${new Intl.NumberFormat('vi-VN').format(tier.minOrderValue)}đ không?`
      )
    ) {
      return;
    }
    handleDeleteTier(tier.orderDiscountTierId);
  };

  return (
    <div className="animate-fade-in w-full space-y-4 text-slate-800 dark:text-[#e5e5e5]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e5e5e5]">Cài đặt cửa hàng</h1>
          <p className="mt-1 text-gray-600 dark:text-[#999999]">
            Quản lý chiết khấu và chính sách đổi trả hàng theo nhóm
          </p>
        </div>
      </div>

      {/* Chính sách đổi/trả theo nhóm hàng */}
      {selectedBranchId && <CategoryReturnPolicy branchId={selectedBranchId} />}

      {/* Nội dung chiết khấu */}
      {selectedBranchId ? (
        <>
          {/* Error message */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              <Icon name="error" className="mr-2 inline" /> {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-[#e5e5e5]">Mức chiết khấu</h2>
              <p className="text-sm text-slate-500 dark:text-[#999999]">
                Thiết lập phần trăm chiết khấu tự động theo tổng giá trị đơn hàng
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2"
            >
              <Icon name="add" size={18} />
              Thêm mức chiết khấu
            </Button>
          </div>

          {/* Table */}
          <Card className="overflow-hidden !p-0">
            <DiscountTierTable
              tiers={tiers}
              loading={loading}
              onClickRow={(row) => handleOpenModal(row)}
            />
          </Card>

          {/* Info box */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-[#333333] dark:bg-[#1a1a1a]">
            <h3 className="mb-2 flex items-center gap-2 font-semibold text-slate-700 dark:text-[#b3b3b3]">
              <Icon name="info" size={18} />
              Cách hoạt động
            </h3>
            <ul className="space-y-1 text-sm text-slate-600 dark:text-[#999999]">
              <li>
                • Khi khách hàng thanh toán, hệ thống sẽ tự động áp dụng chiết khấu cao nhất phù hợp
                với tổng giá trị đơn hàng
              </li>
              <li>
                • Ví dụ: Đơn hàng 1.500.000đ sẽ được áp dụng chiết khấu của mức "Từ 1.000.000đ" (5%)
              </li>
              <li>• Chiết khấu được tính trên tổng giá trị sản phẩm, chưa bao gồm VAT</li>
            </ul>
          </div>
        </>
      ) : (
        /* Empty state - chưa chọn chi nhánh */
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-full bg-slate-100 p-4 dark:bg-[#1a1a1a]">
            <Icon name="store" size={48} className="text-slate-400 dark:text-[#808080]" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-slate-700 dark:text-[#b3b3b3]">
            Chọn chi nhánh để quản lý chiết khấu
          </h3>
          <p className="max-w-sm text-sm text-slate-500 dark:text-[#999999]">
            Vui lòng chọn chi nhánh từ danh sách bên trên để xem và thiết lập mức chiết khấu cho cửa
            hàng
          </p>
        </Card>
      )}

      {/* Modal thêm/sửa */}
      <DiscountTierModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        tier={editingTier}
        onSave={handleSave}
        loading={saving}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default StoreSettings;
