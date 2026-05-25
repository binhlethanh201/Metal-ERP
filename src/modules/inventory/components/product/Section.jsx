/**
 * Section - Khối form có thể đóng/mở (accordion).
 * Dùng trong EditProductModal để nhóm các trường form.
 * Props: title, subtitle, defaultOpen, children.
 */
import { useState } from 'react';
import MaterialIcon from '../shared/MaterialIcon';

const Section = ({ title, subtitle, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(!!defaultOpen);

  return (
    <section className="mb-6 overflow-hidden rounded-[10px] border border-outline-variant bg-surface-container-lowest shadow-sm">
      <div className="px-5 pb-4 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="mb-2 text-[20px] font-semibold leading-tight text-on-surface">
              {title}
            </h3>
            {subtitle && (
              <p className="text-body-md mb-0 leading-relaxed text-on-surface-variant">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((s) => !s)}
            className="ml-4 flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-surface-container-high"
          >
            <MaterialIcon
              name="expand_more"
              className={`text-on-surface-variant transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`}
            />
          </button>
        </div>
      </div>
      {open && <div className="px-5 pb-5">{children}</div>}
    </section>
  );
};

export default Section;
