import type { ReactNode } from 'react';
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?:
    | 'primary'
    | 'secondary'
    | 'danger'
    | 'outline'
    | 'blue'
    | 'purple'
    | 'green'
    | 'emerald'
    | 'red'
    | 'gray';
  size?: 'icon' | 'xs' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  fullWidth?: boolean;
  withRing?: boolean;
}

function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  withRing = true,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center font-semibold rounded-lg transition-all duration-200 ' +
    'focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const widthClass = fullWidth ? 'w-full' : '';
  const ringClass = withRing ? 'focus:ring-2 focus:ring-offset-2' : '';

  const variants = {
    primary:
      'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm hover:shadow-md',
    secondary:
      'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 shadow-sm hover:shadow-md',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow-md',
    outline:
      'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50 focus:ring-gray-500',

    blue: 'bg-blue-500 text-white hover:bg-blue-600',
    purple: 'bg-purple-500 text-white hover:bg-purple-600',
    green: 'bg-green-500 text-white hover:bg-green-600',
    emerald: 'bg-emerald-500 text-white hover:bg-emerald-600',
    red: 'bg-red-500 text-white hover:bg-red-600',
    gray: 'bg-gray-600 text-white hover:bg-gray-700',
  };

  const sizes = {
    icon: 'w-9 h-9 p-0 justify-center', // quadrado, ícone centralizado
    xs: 'px-3 py-1.5 text-xs', // extra pequeno
    sm: 'px-4 py-2 text-sm', // pequeno
    md: 'px-6 py-2.5 text-base', // médio (padrão)
    lg: 'px-8 py-3 text-lg', // grande
  };

  return (
    <button
      className={`${baseStyles} ${widthClass} ${ringClass} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
