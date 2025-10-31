import { ArrowRight } from 'lucide-react';

const CTAButton = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  className = '',
  icon: Icon = ArrowRight,
  disabled = false,
  ...props 
}) => {
  const baseClasses = `
    inline-flex items-center justify-center px-6 py-3 font-medium rounded-lg 
    transition-all duration-300 transform group relative overflow-hidden
    focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variants = {
    primary: `
      bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg
      hover:scale-105 hover:shadow-blue-500/25 focus:ring-blue-500
      before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-400 before:to-blue-600 
      before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100
    `,
    secondary: `
      border border-gray-300 text-gray-700 bg-white shadow-sm hover:bg-gray-50 
      hover:border-blue-300 hover:text-blue-600 hover:scale-105 hover:shadow-md
      focus:ring-blue-500 hover:shadow-blue-500/10
    `,
    outline: `
      border-2 border-blue-600 text-blue-600 bg-transparent hover:bg-blue-600 
      hover:text-white hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25
      focus:ring-blue-500
    `
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      <span className="relative z-10 flex items-center">
        {children}
        {Icon && (
          <Icon className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
        )}
      </span>
      
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-lg bg-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
    </button>
  );
};

export default CTAButton;