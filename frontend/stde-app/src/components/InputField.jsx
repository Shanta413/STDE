import '../css/InputField.css';

export default function InputField({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  error = '',
  icon = null,
  className = ''
}) {
  return (
    <div className={`input-field-container ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <div className="input-wrapper">
        {icon && <span className="input-icon">{icon}</span>}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`input-field ${icon ? 'has-icon' : ''} ${error ? 'has-error' : ''}`}
        />
      </div>
      {error && <span className="input-error">{error}</span>}
    </div>
  );
}
