/**
 * ForumImportSuggest - Trang "Gợi ý nhập hàng".
 * Tab-based: 3 nhóm riêng, dễ scan khi nhiều sản phẩm.
 */
import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import { trendsTopProducts } from '../data/forumPageData';
import { inventoryRows } from '../../inventory/data/inventoryMockData';
import ForumImportSuggestRightSidebar from '../components/importSuggest/ForumImportSuggestRightSidebar';
import AddToWarehouseModal from '../components/shared/AddToWarehouseModal';

const STOCK_MIN = {
  'Sơn và Hóa chất': 20,
  'Kim khí': 10,
  'Vật liệu thô': 100,
  'Thiết bị điện': 5,
  'Dụng cụ cầm tay': 6,
};

const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

const TABS = [
  {
    key: 'gap',
    label: 'Cần nhập gấp',
    icon: 'warning',
    color: 'bg-red-500',
    textColor: 'text-red-600',
    lightBg: 'bg-red-50',
    border: 'border-l-red-400',
  },
  {
    key: 'them',
    label: 'Nên nhập thêm',
    icon: 'trending_up',
    color: 'bg-[#004785]',
    textColor: 'text-[#004785]',
    lightBg: 'bg-blue-50',
    border: 'border-l-[#004785]',
  },
  {
    key: 'thu',
    label: 'Đáng thử',
    icon: 'lightbulb',
    color: 'bg-emerald-500',
    textColor: 'text-emerald-600',
    lightBg: 'bg-emerald-50',
    border: 'border-l-emerald-400',
  },
];

const fmtMoney = (n) => {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}tr`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}k`;
  return `${n}`;
};

const ForumImportSuggest = () => {
  const { setRightSidebar } = useOutletContext();
  const [activeTab, setActiveTab] = useState('gap');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalProducts, setAddModalProducts] = useState([]);

  useEffect(() => {
    setRightSidebar?.(<ForumImportSuggestRightSidebar />);
    return () => setRightSidebar?.(null);
  }, [setRightSidebar]);

  const { groups } = useMemo(() => {
    const gap = [];
    const them = [];
    const thu = [];

    inventoryRows.forEach((row) => {
      const trend = trendsTopProducts.find(
        (t) =>
          normalize(t.title).includes(normalize(row.name)) ||
          normalize(row.name).includes(normalize(t.title))
      );
      const minStock = STOCK_MIN[row.group] || 10;

      if (row.status === 'Sắp hết' || row.status === 'Hết hàng') {
        gap.push({
          id: row.id,
          name: row.name,
          brand: row.brand,
          group: row.group,
          stock: row.stock,
          unit: row.unit,
          status: row.status,
          supplier: row.supplier,
          salePrice: fmtMoney(row.salePrice),
          trendPercent: trend?.percent || null,
          goiYNhap:
            trend?.tip || `Nhập tối thiểu ${minStock - row.stock} ${row.unit.toLowerCase()}`,
          lyDo: row.stock === 0 ? 'Hết hàng' : `Còn ${row.stock} ${row.unit.toLowerCase()}`,
        });
      } else if (trend && row.stock > minStock) {
        them.push({
          id: row.id,
          name: row.name,
          brand: row.brand,
          group: row.group,
          stock: row.stock,
          unit: row.unit,
          status: row.status,
          supplier: row.supplier,
          salePrice: fmtMoney(row.salePrice),
          trendPercent: trend.percent,
          goiYNhap: trend.tip,
          lyDo: `Còn ${row.stock}, thị trường ${trend.percent}`,
        });
      }
    });

    trendsTopProducts.forEach((trend) => {
      const inKho = inventoryRows.find(
        (r) =>
          normalize(r.name).includes(normalize(trend.title)) ||
          normalize(trend.title).includes(normalize(r.name))
      );
      if (inKho) return;
      thu.push({
        id: `trend-${trend.title}`,
        name: trend.title,
        brand: '',
        group: '',
        stock: 0,
        unit: '',
        status: 'Chưa có',
        supplier: '',
        salePrice: trend.referencePrice,
        trendPercent: trend.percent,
        goiYNhap: trend.tip,
        lyDo: trend.market,
      });
    });

    const sapHet = inventoryRows.filter((r) => r.status === 'Sắp hết').length;
    const hetHang = inventoryRows.filter((r) => r.status === 'Hết hàng').length;
    const conHang = inventoryRows.filter((r) => r.status === 'Sẵn hàng').length;

    return {
      groups: { gap, them, thu },
      tongQuan: { tongSp: inventoryRows.length, conHang, sapHet, hetHang },
    };
  }, []);

  const currentTab = TABS.find((t) => t.key === activeTab);
  const currentItems = groups[activeTab] || [];

  return (
    <div className="space-y-4">
      <header className="px-1">
        <h2 className="mb-1 text-xl font-bold leading-tight text-gray-900">Gợi ý nhập hàng</h2>
        <p className="text-sm text-slate-500">Dựa trên tồn kho của bạn & tín hiệu thị trường.</p>
      </header>

      {/* Tabs */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = groups[tab.key].length;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-bold transition-all ${
                  isActive ? `${tab.color} text-white` : `text-slate-500 hover:bg-slate-50`
                }`}
              >
                <Icon name={tab.icon} size={15} />
                {tab.label}
                <span
                  className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-black ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Danh sách sản phẩm trong tab đang chọn */}
      {currentItems.length === 0 ? (
        <div className="py-10 text-center">
          <Icon name="check_circle" size={28} className="mx-auto mb-2 text-emerald-400" />
          <p className="text-sm font-semibold text-slate-500">
            Không có đề xuất nào trong nhóm này
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {currentItems.map((item) => (
            <article
              key={item.id}
              className={`flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-all hover:shadow-md ${currentTab.border}`}
            >
              {/* Tên + meta */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="truncate text-sm font-bold text-slate-800">{item.name}</h4>
                  {item.trendPercent && (
                    <span className="shrink-0 rounded-md bg-red-50 px-1.5 py-0.5 text-[9px] font-black text-red-600">
                      {item.trendPercent}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                  {item.brand && <span>{item.brand}</span>}
                  {item.group && <span>{item.group}</span>}
                  {item.supplier && <span>— {item.supplier}</span>}
                </div>
              </div>

              {/* Tồn */}
              <div className="hidden shrink-0 text-center sm:block">
                <p
                  className={`text-sm font-black ${item.stock === 0 ? 'text-red-600' : item.status === 'Sắp hết' ? 'text-amber-600' : 'text-slate-600'}`}
                >
                  {item.status === 'Chưa có' ? '---' : item.stock}
                </p>
                <p className="text-[9px] font-bold uppercase text-slate-400">tồn</p>
              </div>

              {/* Giá */}
              <div className="hidden shrink-0 text-right sm:block">
                <p className="text-sm font-bold text-[#004785]">{item.salePrice}</p>
                <p className="text-[9px] font-bold uppercase text-slate-400">giá</p>
              </div>

              {/* Gợi ý + Action */}
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`hidden rounded-md px-2 py-1 text-[10px] font-bold md:inline ${currentTab.lightBg} ${currentTab.textColor}`}
                >
                  {item.goiYNhap}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAddModalProducts([item]);
                    setAddModalOpen(true);
                  }}
                  className="rounded-lg bg-[#004785] px-3.5 py-1.5 text-xs font-bold text-white transition-all hover:bg-black active:scale-95"
                >
                  Thêm vào kho
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="text-center text-[11px] text-slate-400">
        Tự động cập nhật từ kho & thị trường.
      </p>

      <AddToWarehouseModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        products={addModalProducts.length > 0 ? addModalProducts : []}
      />
    </div>
  );
};

export default ForumImportSuggest;
