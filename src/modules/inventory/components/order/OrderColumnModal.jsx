import React from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { ALL_COLS } from '../../data/orderPageData';

const OrderColumnModal = ({
  isOpen,
  onClose,
  editColConfig,
  setEditColConfig,
  editColOrder,
  setEditColOrder,
  selectedColKey,
  setSelectedColKey,
  onSave,
  onReset,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sửa mẫu"
      size="4xl"
      footer={
        <div className="flex w-full items-center justify-between">
          <button className="flex items-center gap-1 text-sm text-[#004785] hover:underline">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Trợ giúp
          </button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onReset}>
              Lấy mẫu ngầm định
            </Button>
            <Button variant="primary" onClick={onSave}>
              <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
              Lưu
            </Button>
            <Button variant="secondary" onClick={onClose}>
              Hủy bỏ
            </Button>
          </div>
        </div>
      }
    >
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-[#808080]">ĐƠN HÀNG</p>
      <div className="flex gap-4">
        {/* Main grid */}
        <div className="flex-1 overflow-auto" style={{ maxHeight: '50vh' }}>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left dark:border-[#333333] dark:bg-[#1a1a1a]">
                <th className="px-3 py-2 text-xs font-bold uppercase text-slate-500 dark:text-[#999999]">
                  Tên cột dữ liệu
                </th>
                <th className="px-3 py-2 text-xs font-bold uppercase text-slate-500 dark:text-[#999999]">
                  Tên cột hiển thị
                </th>
                <th className="px-3 py-2 text-center text-xs font-bold uppercase text-slate-500 dark:text-[#999999]">
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="checkbox"
                      checked={
                        editColConfig ? Object.values(editColConfig).every((c) => c.visible) : false
                      }
                      onChange={(e) => {
                        if (!editColConfig) return;
                        const updated = {};
                        Object.keys(editColConfig).forEach((k) => {
                          updated[k] = { ...editColConfig[k], visible: e.target.checked };
                        });
                        setEditColConfig(updated);
                      }}
                      className="h-4 w-4 rounded text-[#004785]"
                    />
                    <span>Hiển thị</span>
                  </div>
                </th>
                <th className="px-3 py-2 text-center text-xs font-bold uppercase text-slate-500 dark:text-[#999999]">
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="checkbox"
                      checked={
                        editColConfig
                          ? Object.values(editColConfig)
                              .filter((c) => c.visible)
                              .every((c) => c.pinned)
                          : false
                      }
                      onChange={(e) => {
                        if (!editColConfig) return;
                        const updated = {};
                        Object.keys(editColConfig).forEach((k) => {
                          if (editColConfig[k].visible) {
                            updated[k] = { ...editColConfig[k], pinned: e.target.checked };
                          } else {
                            updated[k] = { ...editColConfig[k] };
                          }
                        });
                        setEditColConfig(updated);
                      }}
                      className="h-4 w-4 rounded text-[#004785]"
                    />
                    <span>Cố định cột</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {editColOrder.map((colKey) => {
                const col = ALL_COLS.find((c) => c.key === colKey);
                if (!col) return null;
                const cfg = (editColConfig && editColConfig[colKey]) || {
                  visible: true,
                  pinned: false,
                  displayName: col.header,
                };
                return (
                  <tr
                    key={col.key}
                    onClick={() => setSelectedColKey(colKey)}
                    className={`cursor-pointer border-b border-slate-50 text-sm hover:bg-blue-50/30 dark:border-[#333333] dark:hover:bg-[#333333] ${
                      selectedColKey === colKey ? 'bg-blue-50/60 dark:bg-[#272727]' : ''
                    }`}
                  >
                    <td className="px-3 py-2 text-xs text-slate-600 dark:text-[#b3b3b3]">{col.header}</td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={cfg.displayName || ''}
                        onChange={(e) => {
                          if (!editColConfig) return;
                          setEditColConfig({
                            ...editColConfig,
                            [colKey]: { ...cfg, displayName: e.target.value },
                          });
                        }}
                        className="w-full rounded border border-slate-200 px-2 py-1 text-xs focus:border-[#004785] focus:outline-none dark:border-[#404040] dark:bg-[#272727] dark:text-[#e5e5e5]"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={cfg.visible}
                        onChange={(e) => {
                          if (!editColConfig) return;
                          setEditColConfig({
                            ...editColConfig,
                            [colKey]: { ...cfg, visible: e.target.checked },
                          });
                        }}
                        className="h-4 w-4 rounded text-[#004785]"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={cfg.pinned}
                        disabled={!cfg.visible}
                        onChange={(e) => {
                          if (!editColConfig) return;
                          setEditColConfig({
                            ...editColConfig,
                            [colKey]: { ...cfg, pinned: e.target.checked },
                          });
                        }}
                        className="h-4 w-4 rounded text-[#004785] disabled:opacity-30"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Up/Down buttons */}
        <div className="flex shrink-0 flex-col gap-2 pt-1">
          <button
            onClick={() => {
              if (!selectedColKey) return;
              const idx = editColOrder.indexOf(selectedColKey);
              if (idx <= 0) return;
              const next = [...editColOrder];
              [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
              setEditColOrder(next);
            }}
            disabled={!selectedColKey}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#b3b3b3] dark:hover:bg-[#333333]"
            title="Di chuyển lên"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          </button>
          <button
            onClick={() => {
              if (!selectedColKey) return;
              const idx = editColOrder.indexOf(selectedColKey);
              if (idx < 0 || idx >= editColOrder.length - 1) return;
              const next = [...editColOrder];
              [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
              setEditColOrder(next);
            }}
            disabled={!selectedColKey}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#b3b3b3] dark:hover:bg-[#333333]"
            title="Di chuyển xuống"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default OrderColumnModal;
