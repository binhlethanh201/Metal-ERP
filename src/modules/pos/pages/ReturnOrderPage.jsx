/**
 * ReturnOrderPage - Trang đổi trả hàng POS
 * Route: /pos/returns
 * Dữ liệu từ API: GET /pos/returns
 */
import { useState } from 'react';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import ReturnList from '../components/return/ReturnList';
import ReturnDetail from '../components/return/ReturnDetail';
import ReturnForm from '../components/return/ReturnForm';

const ReturnOrderPage = () => {
  const [view, setView] = useState('list'); // 'list' | 'detail'
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSelect = (ret) => {
    setSelectedReturn(ret);
    setView('detail');
  };

  const handleBack = () => {
    setView('list');
    setSelectedReturn(null);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="h-full overflow-y-auto px-6 py-6">
      {view === 'list' && (
        <>
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Đổi trả hàng</h1>
              <p className="mt-1 text-sm text-slate-500">
                Quản lý yêu cầu đổi/trả hàng cho khách đã mua
              </p>
            </div>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              + Tạo đơn đổi trả mới
            </Button>
          </div>

          <Card padding="p-4">
            <ReturnList onSelect={handleSelect} refreshKey={refreshKey} />
          </Card>
        </>
      )}

      {view === 'detail' && selectedReturn && (
        <div>
          <ReturnDetail
            returnId={selectedReturn.returnId || selectedReturn.id}
            onBack={handleBack}
            onUpdated={handleBack}
          />
        </div>
      )}

      <ReturnForm
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default ReturnOrderPage;
