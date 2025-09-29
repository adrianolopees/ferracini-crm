import './Input.css';

function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  className = '',
  ...props
}) {
  return (
    <div className="input-group">
      <label>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`${error ? 'input-erro' : ''} ${className}`}
        {...props}
      />
      {error && (
        <div className="msg-erro">
          <span className="bi bi-exclamation-triangle-fill"></span>
          {error}
        </div>
      )}
    </div>
  );
}

export default Input;
