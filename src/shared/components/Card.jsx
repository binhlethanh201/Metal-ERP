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
      className={`rounded-lg border border-gray-200 bg-white shadow-md ${className} `}
      {...props}
    >
      {header && (
        <div className="border-b border-gray-200 px-6 py-4">
          {typeof header === 'string' ? (
            <h2 className="text-lg font-semibold text-gray-900">{header}</h2>
          ) : (
            header
          )}
        </div>
      )}

      <div className={padding}>{children}</div>

      {footer && <div className="border-t border-gray-200 px-6 py-4">{footer}</div>}
    </div>
  );
};

export default Card;
