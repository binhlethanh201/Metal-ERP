/**
 * BarcodeSearch Component - Tìm kiếm sản phẩm theo barcode
 */

import { useState } from 'react';
import { Input } from '../../../shared/components/Input';

export const BarcodeSearch = ({ onBarcodeFound, onError }) => {
  const [barcode, setBarcode] = useState('');

  const handleSearch = (value) => {
    setBarcode(value);

    // Tự động tìm kiếm khi nhập đủ 13 ký tự (chuẩn barcode)
    if (value.length === 13) {
      // Gọi API hoặc tìm kiếm từ mock data
      onBarcodeFound?.(value);
      setBarcode(''); // Reset input
    }
  };

  return (
    <div className="mb-4">
      <Input
        placeholder="Quét mã vạch hoặc nhập SKU..."
        value={barcode}
        onChange={(e) => handleSearch(e.target.value)}
        autoFocus
        icon={
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m4-4l-4 4m-4-4l4 4"
            />
          </svg>
        }
      />
    </div>
  );
};

export default BarcodeSearch;
