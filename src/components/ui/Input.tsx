import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
}

function Input({
  className = '',
  label,
  error,
  required,
  ...props
}: InputProps) {
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

export default Input;
