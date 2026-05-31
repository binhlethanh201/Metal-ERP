/**
 * Panel chi tiet san pham - Tabbed interface: Thong tin, Mo ta ghi chu, The kho, Ton kho.
 * Gom: summary bar, 4 tabs, bottom toolbar co dinh. Ho tro responsive.
 */
import { useState } from 'react';
import Icon from '../../../../../shared/components/Icon';

const formatMoney = (v) => {
  const n = Number(v);
  if (Number.isNaN(n)) return '0';
  return new Intl.NumberFormat('vi-VN').format(n);
};

const TABS = [
  { key: 'info', label: 'ThÃ´ng tin' },
  { key: 'desc', label: 'MÃ´ táº£, ghi chÃº' },
  { key: 'stock-card', label: 'Tháº» kho' },
  { key: 'inventory', label: 'Tá»“n kho' },
];

/* ---------- Summary Bar ---------- */
const SummaryBar = ({ row }) => {
  const items = [
    { label: 'MÃ£ SP', value: row.productCode || row.id },
    { label: 'TÃªn SP', value: row.name },
    { label: 'GiÃ¡ bÃ¡n', value: `${formatMoney(row.salePrice)} Ä‘` },
    { label: 'GiÃ¡ vá»‘n', value: `${formatMoney(row.costPrice)} Ä‘` },
    { label: 'Tá»“n kho', value: row.stock },
    { label: 'NgÃ y táº¡o', value: row.createdAt },
  ];
  return (
    <div className="flex flex-wrap gap-x-8 gap-y-2 border-b border-slate-200 pb-4">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-2 text-sm">
          <span className="font-medium text-slate-500">{it.label}:</span>
          <span className="font-bold text-slate-800">{it.value || '-'}</span>
        </div>
      ))}
    </div>
  );
};

/* ---------- Tab Thong tin ---------- */
const InfoTab = ({ row }) => (
  <div>
    <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:gap-8">
      <div className="h-36 w-36 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <img
          src={
            row.image ||
            'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=300&auto=format&fit=crop'
          }
          alt={row.name}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex-1">
        <h3 className="mb-1 text-xl font-bold text-slate-900">{row.name}</h3>
        <p className="mb-3 text-xs text-slate-500">
          NhÃ³m hÃ ng:{' '}
          <span className="font-bold uppercase text-slate-700">{row.group || 'ChÆ°a cÃ³'}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
            HÃ ng hÃ³a thÆ°á»ng
          </span>
          <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
            {row.directSale ? 'BÃ¡n trá»±c tiáº¿p' : 'KhÃ´ng bÃ¡n trá»±c tiáº¿p'}
          </span>
          <span className="rounded border border-orange-100 bg-orange-50 px-2 py-1 text-[10px] font-bold text-orange-600">
            KhÃ´ng tÃ­ch Ä‘iá»ƒm
          </span>
        </div>
      </div>
    </div>

    <div className="mb-6 grid grid-cols-1 gap-x-12 gap-y-6 sm:grid-cols-2 xl:grid-cols-4">
      {[
        ['MÃ£ hÃ ng', row.productCode || row.id],
        ['MÃ£ váº¡ch', row.barcode],
        ['Tá»“n kho', row.stock],
        ['Äá»‹nh má»©c tá»“n', row.stockLevel],
        ['GiÃ¡ vá»‘n', `${formatMoney(row.costPrice)} Ä‘`],
        ['GiÃ¡ bÃ¡n', `${formatMoney(row.salePrice)} Ä‘`],
        ['ThÆ°Æ¡ng hiá»‡u', row.brand || 'ChÆ°a cÃ³'],
        ['Vá»‹ trÃ­', row.location || 'ChÆ°a cÃ³'],
        ['Trá»ng lÆ°á»£ng', row.weight || 'ChÆ°a cÃ³'],
        ['KÃ­ch thÆ°á»›c', row.dimension || 'ChÆ°a cÃ³'],
      ].map(([label, value]) => (
        <div key={label} className="space-y-1 border-b border-slate-100 pb-3">
          <p className="text-[11px] font-bold uppercase tracking-tighter text-slate-400">{label}</p>
          <p
            className={`text-sm font-bold ${value === 'ChÆ°a cÃ³' ? 'text-slate-400' : 'text-slate-800'}`}
          >
            {value}
          </p>
        </div>
      ))}
    </div>
  </div>
);

/* ---------- Tab Mo ta, ghi chu ---------- */
const DescTab = ({ row, onEdit }) => (
  <div className="space-y-6">
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">MÃ´ táº£</h4>
      <div className="flex min-h-[120px] items-center justify-center text-sm text-slate-400">
        {row.description || 'ChÆ°a cÃ³ mÃ´ táº£'}
      </div>
    </div>
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">
        Ghi chÃº Ä‘áº·t hÃ ng
      </h4>
      <div className="flex min-h-[120px] items-center justify-center text-sm text-slate-400">
        {row.notes || 'ChÆ°a cÃ³ ghi chÃº'}
      </div>
    </div>
    <div className="flex justify-end">
      <button
        type="button"
        onClick={() => onEdit?.(row, 'description')}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
      >
        <Icon name="edit" size={16} />
        Chá»‰nh sá»­a
      </button>
    </div>
  </div>
);

/* ---------- Placeholder Tabs ---------- */
const PlaceholderTab = ({ title }) => (
  <div className="flex min-h-[200px] items-center justify-center text-sm text-slate-400">
    {title} - Äang phÃ¡t triá»ƒn
  </div>
);

/* ---------- Popup Xac nhan Ngung kinh doanh ---------- */
const StopBusinessModal = ({ open, onClose, onConfirm, productName }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4">
      <div
        className="w-full max-w-md rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-800">Ngung kinh doanh san pham</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-gray-100 hover:text-slate-600"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0 text-amber-500">
                <Icon name="warning" size={22} />
              </span>
              <div className="text-sm text-amber-800">
                <p className="font-bold">Ban co chac chan muon ngung kinh doanh san pham nay?</p>
                <p className="mt-1">{productName || 'San pham'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 p-4 text-[13px] leading-relaxed text-blue-800">
            <p className="mb-2 font-bold">Luu y:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>
                Thong tin <strong>ton kho</strong> va <strong>lich su giao dich</strong> van duoc
                giu nguyen.
              </li>
              <li>San pham se bi an khoi kenh ban, khong the ban hang.</li>
              <li>
                Cac <strong>hang hoa quy doi</strong> lien quan cung se ngung kinh doanh.
              </li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-[40px] rounded-lg border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Huy
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm?.();
              onClose?.();
            }}
            className="h-[40px] rounded-lg bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700"
          >
            Xac nhan ngung kinh doanh
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------- Bottom Toolbar ---------- */
const BottomToolbar = ({ row, onEdit, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [stopModalOpen, setStopModalOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-between border-t border-slate-200 pt-4">
      <div className="flex gap-4">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(row);
          }}
          className="flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-red-600"
        >
          <Icon name="delete" size={18} />
          XÃ³a
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-blue-600"
        >
          <Icon name="copy" size={18} />
          Sao chÃ©p
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(row);
          }}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-6 py-2 text-sm font-bold text-white hover:bg-blue-700"
        >
          <Icon name="edit" size={18} />
          Chá»‰nh sá»­a
        </button>

        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          <Icon name="barcode_scanner" size={18} />
          In tem mÃ£
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((p) => !p);
            }}
            className="rounded-lg border border-slate-300 p-2 text-slate-500 hover:bg-slate-50"
          >
            <Icon name="more_horiz" size={20} />
          </button>
          {menuOpen && (
            <div className="absolute bottom-full right-0 z-30 mb-1 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
              <button
                type="button"
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => setMenuOpen(false)}
              >
                Nháº­p hÃ ng
              </button>
              <button
                type="button"
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => {
                  setMenuOpen(false);
                  setStopModalOpen(true);
                }}
              >
                Ngá»«ng kinh doanh
              </button>
            </div>
          )}
        </div>
      </div>

      <StopBusinessModal
        open={stopModalOpen}
        onClose={() => setStopModalOpen(false)}
        onConfirm={() => {
          onEdit?.(row);
        }}
        productName={row.name}
      />
    </div>
  );
};

/* ---------- Main Component ---------- */
const ProductDetailPanel = ({ row, onEdit, onDelete }) => {
  const [activeTab, setActiveTab] = useState('info');

  return (
    <div className="overflow-hidden border-l-4 border-blue-500 bg-[#f8fbff] p-4 sm:p-6">
      <SummaryBar row={row} />

      <div className="mt-4 flex gap-0 border-b border-slate-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === 'info' && <InfoTab row={row} />}
        {activeTab === 'desc' && <DescTab row={row} onEdit={onEdit} />}
        {activeTab === 'stock-card' && <PlaceholderTab title="The kho" />}
        {activeTab === 'inventory' && <PlaceholderTab title="Ton kho" />}
      </div>

      {activeTab === 'info' && <BottomToolbar row={row} onEdit={onEdit} onDelete={onDelete} />}
    </div>
  );
};

export default ProductDetailPanel;
