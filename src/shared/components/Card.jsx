/**
 * Card Component - Container card tái sử dụng
 * Hỗ trợ header, footer, padding tùy chỉnh
 */

export const Card = ({
  children,
  header = null,
  footer = null,
  padding = 'p-6',
  className = '',
  ...props
}) => {
  return (
    <div
      className={`rounded-lg border border-slate-200 bg-white shadow-md dark:border-[#333333] dark:bg-[#0f0f0f] ${className} `}
      {...props}
    >
      {header && (
        <div className="border-b border-slate-200 px-6 py-4 dark:border-[#333333]">
          {typeof header === 'string' ? (
            <h2 className="text-lg font-bold text-slate-900 dark:text-[#e5e5e5]">{header}</h2>
          ) : (
            header
          )}
        </div>
      )}

      <div className={padding}>{children}</div>

      {footer && <div className="border-t border-slate-200 px-6 py-4 dark:border-[#333333]">{footer}</div>}
    </div>
  );
};

export default Card;
