/**
 * InventoryChart Component - Biểu đồ tồn kho
 * Hiển thị xu hướng tồn kho theo thời gian
 */

export const InventoryChart = ({ data = [] }) => {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-gray-500">Không có dữ liệu để hiển thị</p>
      </div>
    );
  }

  // Đây là placeholder cho biểu đồ thực tế (sẽ dùng thư viện chart như Chart.js hoặc Recharts)
  const maxStock = Math.max(...data.map((d) => d.stock || 0));

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 font-semibold text-gray-900">Xu hướng tồn kho</h3>

      <div className="space-y-4">
        {data.slice(0, 5).map((item, idx) => (
          <div key={idx}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium text-gray-700">{item.name}</span>
              <span className="text-gray-600">{item.stock}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-blue-600 transition-all"
                style={{ width: `${(item.stock / maxStock) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryChart;
