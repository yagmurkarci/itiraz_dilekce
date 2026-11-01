const VARIANTS = {
  primary: 'primary-button',
  secondary: 'secondary-button',
  danger: 'delete-btn',
};

export default function Button({ variant = 'primary', small = false, type = 'button', className = '', children, ...props }) {
  const classes = [VARIANTS[variant] || VARIANTS.primary, small ? 'small' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} type={type} {...props}>
      {children}
    </button>
  );
}
