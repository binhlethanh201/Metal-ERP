import React from 'react';
import { Button } from '../../../../shared/components/Button';

const OrderToolbar = ({ onReconciliation, onProductStats, onOrderStats }) => {
  return (
    <div className="flex flex-wrap items-center gap-2 px-3 pt-3">
      <Button variant="primary" size="sm" onClick={onProductStats}>
        + Thống kê hàng hóa
      </Button>
      <Button variant="outline" size="sm" onClick={onOrderStats}>
        + Thống kê theo đơn hàng
      </Button>
      <Button variant="outline" size="sm" onClick={onReconciliation}>
        &#8646; Đối soát
      </Button>
      <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
        &#8635; Nạp
      </Button>
    </div>
  );
};

export default OrderToolbar;
