import React from 'react';

const IconButton = ({
  icon: Icon,
  variant = 'outline',
  space = 'customer',
  size = 'md',
  className = '',
  disabled = false,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center transition-all focus:outline-none shrink-0';

  let sizeStyles = '';
  let iconSize = 18;
  switch (size) {
    case 'sm':
      sizeStyles = 'w-6 h-6';
      iconSize = 14;
      break;
    case 'lg':
      sizeStyles = 'w-10 h-10';
      iconSize = 20;
      break;
    case 'md':
    default:
      sizeStyles = 'w-8 h-8';
      iconSize = 18;
      break;
  }

  const radiusStyles = space === 'admin' ? 'rounded-admin' : 'rounded-customer';

  let variantStyles = '';
  switch (variant) {
    case 'outline':
      variantStyles =
        space === 'admin'
          ? 'bg-surface border border-borderLight text-textAdmin hover:bg-bodyAdmin'
          : 'bg-surface border border-borderLight text-textMain hover:bg-bodyCustomer';
      break;

    case 'ghost':
      variantStyles = 'bg-transparent text-placeholder hover:text-danger hover:bg-dangerBorder';
      break;

    case 'primary':
      variantStyles =
        space === 'admin'
          ? 'bg-admin text-surface hover:brightness-90'
          : 'bg-primary text-surface hover:brightness-90';
      break;

    case 'danger':
      variantStyles =
        space === 'admin'
          ? 'bg-dangerBorder text-dangerAdmin hover:brightness-90'
          : 'bg-dangerBorder text-danger hover:brightness-90';
      break;

    default:
      variantStyles = 'bg-surface border border-borderLight text-textMain hover:bg-bodyCustomer';
  }

  const stateStyles = disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95 cursor-pointer';

  const combinedClasses =
    `${baseStyles} ${sizeStyles} ${radiusStyles} ${variantStyles} ${stateStyles} ${className}`.trim();

  return (
    <button type="button" className={combinedClasses} disabled={disabled} {...props}>
      {Icon && <Icon size={iconSize} strokeWidth={2} />}
    </button>
  );
};

export default IconButton;
