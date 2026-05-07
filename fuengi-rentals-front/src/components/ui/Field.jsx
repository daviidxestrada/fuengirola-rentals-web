function Field({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  error,
  autoComplete,
  min,
  step,
  as = "input",
  rows = 4,
  children,
}) {
  const handleChange = (event) => {
    if (onChange) {
      onChange(event);
    }
  };

  return (
    <label className={`field${error ? " has-error" : ""}`}>
      <span className="field-label">{label}</span>
      {as === "textarea" ? (
        <textarea
          name={name}
          rows={rows}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
        />
      ) : as === "select" ? (
        <select name={name} value={value} onChange={handleChange}>
          {children}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          min={min}
          step={step}
        />
      )}
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
}

export default Field;
