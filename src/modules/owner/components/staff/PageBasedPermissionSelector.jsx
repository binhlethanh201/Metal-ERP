import React from 'react';
import { PAGE_PERMISSION_GROUPS, getAllCodesForPage } from '../../config/pagePermissionMapping';

/**
 * Giao diện phân quyền theo Trang (Page-based).
 * Gom nhóm permission thành từng trang, có Toggle On/Off cho từng trang.
 *
 * Quy tắc:
 * - Chọn bất kỳ Checkbox con -> Tự động BẬT và KHÓA BẬT Switch chính (VIEW).
 * - Tắt Switch chính -> Tự động BỎ TÍCH TOÀN BỘ Checkbox con bên trong.
 */
const PageBasedPermissionSelector = ({ selectedCodes, onTogglePage, onTogglePermission }) => {
  const grouped = PAGE_PERMISSION_GROUPS.reduce((acc, page) => {
    const cat = page.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(page);
    return acc;
  }, {});

  const isViewOn = (page) => selectedCodes.includes(page.viewPermission);

  const hasAnySubSelected = (page) =>
    page.subPermissions.some((sub) => selectedCodes.includes(sub.code));

  const isPageFullyOn = (page) => {
    const allCodes = getAllCodesForPage(page);
    return allCodes.length > 0 && allCodes.every((c) => selectedCodes.includes(c));
  };

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([category, pages]) => (
        <div key={category}>
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#999999]">
            {category}
          </h4>
          <div className="space-y-3">
            {pages.map((page) => {
              const viewOn = isViewOn(page);
              const anySub = hasAnySubSelected(page);
              const fullyOn = isPageFullyOn(page);
              const partial = viewOn && !fullyOn;

              return (
                <div
                  key={page.id}
                  className={`overflow-hidden rounded-xl border transition-colors ${
                    fullyOn
                      ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-800 dark:bg-emerald-900/20'
                      : partial
                        ? 'border-amber-200 bg-amber-50/40 dark:border-amber-800 dark:bg-amber-900/20'
                        : 'border-slate-200 bg-white dark:border-[#333333] dark:bg-[#0f0f0f]'
                  }`}
                >
                  {/* Page header with master toggle */}
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* Toggle switch - hiển thị trạng thái, chỉ bấm được với trang không có quyền con */}
                      <button
                        type="button"
                        disabled={page.subPermissions.length > 0}
                        onClick={() => onTogglePage(page, viewOn)}
                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                          page.subPermissions.length > 0 ? 'cursor-not-allowed' : ''
                        } ${
                          viewOn || anySub ? 'bg-[#004785]' : 'bg-slate-300 dark:bg-[#404040]'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                            viewOn || anySub ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                      <div>
                        <h5 className="text-sm font-bold text-slate-800 dark:text-[#e5e5e5]">
                          {page.pageName}
                        </h5>
                        <p className="text-[11px] text-slate-400 dark:text-[#808080]">
                          {page.subPermissions.length > 0 &&
                            `${page.subPermissions.length} quyền`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {anySub && !fullyOn && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          Một phần
                        </span>
                      )}
                      {fullyOn && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          Đầy đủ
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Sub-permission checkboxes */}
                  {page.subPermissions.length > 0 && (
                    <div className="border-t border-slate-100 px-4 py-3 dark:border-[#333333]">
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {page.subPermissions.map((sub) => {
                          const isChecked = selectedCodes.includes(sub.code);
                          return (
                            <label
                              key={sub.code}
                              className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                                isChecked
                                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                  : 'text-slate-600 hover:bg-slate-50 dark:text-[#999999] dark:hover:bg-[#272727]'
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-[#404040]"
                                checked={isChecked}
                                onChange={() => onTogglePermission(sub.code)}
                              />
                              <span className="flex-1">{sub.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PageBasedPermissionSelector;
