export function Button({ variant = 'default', className, children, ...props }) {
  const variantStyles = {
    default: 'bg-blue-600 hover:bg-blue-700 text-white',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700',
    destructive: 'bg-red-600 hover:bg-red-700 text-white',
    ghost: 'hover:bg-gray-100 text-gray-700',
    link: 'text-blue-600 hover:underline',
  };

  return (
    <button
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        variantStyles[variant]
      } ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
}
