import { useState } from 'react';
import { Input } from '../../../../shared/components/Input';
import { Button } from '../../../../shared/components/Button';

export const ExportForm = ({ products, onSubmit, onCancel, onError }) => {
  const [form, setForm] = useState({
    productId: '',
    productName: '',
    quantity: '',
    date: '',
    reason: '',
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await onSubmit(form);
      setForm({ productId: '', productName: '', quantity: '', date: '', reason: '' });
    } catch (error) {
      if (onError) onError(error?.message || 'Không thể lưu phiếu xuất kho');
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Chọn sản phẩm</label>
        <select
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
          value={form.productId}
          onChange={(event) => {
            const selectedProduct = products.find(
              (product) => String(product.id || product.Id) === event.target.value
            );
            setForm((current) => ({
              ...current,
              productId: event.target.value,
              productName:
                selectedProduct?.productName || selectedProduct?.ProductName || current.productName,
            }));
          }}
        >
          <option value="">Chọn từ danh sách</option>
          {products.map((product) => (
            <option key={product.id || product.Id} value={product.id || product.Id}>
              {product.productName || product.ProductName || product.name || product.Name}
            </option>
          ))}
        </select>
      </div>
      <Input
        label="Tên sản phẩm"
        placeholder="Nhập tên nếu chưa có trong danh sách"
        value={form.productName}
        onChange={(e) => setForm((current) => ({ ...current, productName: e.target.value }))}
      />
      <Input
        label="Số lượng *"
        type="number"
        placeholder="0"
        min="1"
        value={form.quantity}
        onChange={(e) => setForm((current) => ({ ...current, quantity: e.target.value }))}
        required
      />
      <Input
        label="Ngày xuất *"
        type="date"
        value={form.date}
        onChange={(e) => setForm((current) => ({ ...current, date: e.target.value }))}
        required
      />
      <Input
        label="Lý do xuất"
        placeholder="VD: Bán hàng, hư hỏng, mất..."
        value={form.reason}
        onChange={(e) => setForm((current) => ({ ...current, reason: e.target.value }))}
      />
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
          onClick={onCancel}
        >
          Hủy
        </button>
        <Button type="submit" variant="primary">
          Lưu phiếu xuất
        </Button>
      </div>
    </form>
  );
};
