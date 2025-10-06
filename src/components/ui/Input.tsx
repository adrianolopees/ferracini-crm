import './Input.css';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, required, ...props }, ref) => {
    return (
      <div className="input-group">
        <label>
          {label}
          {required && (
            <span className="required" style={{ color: 'red' }}>
              *
            </span>
          )}
        </label>
        <input
          ref={ref}
          className={`${error ? 'input-erro' : ''} ${className}`}
          aria-invalid={!!error}
          {...props}
        />
        {error && (
          <div className="msg-erro" role="alert">
            <span className="bi bi-exclamation-triangle-fill"></span>
            {error}
          </div>
        )}
      </div>
    );
  }
);
export default Input;
