import './Button.css';
import type { ReactNode } from 'react';
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

function Button({ children, className = '', ...props }: ButtonProps) {
  return (
    <button className={`btn ${className}`} {...props}>
      {children}
    </button>
  );
}

export default Button;
