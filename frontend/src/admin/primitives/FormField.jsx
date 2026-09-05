/**
 * FormField — the ONE input wrapper for every admin form.
 * Supports: text, email, number, textarea, select, toggle.
 * All fields have the same label / hint / error layout.
 *
 * Usage:
 *   <FormField label="Name" value={x} onChange={setX} error={err.name} />
 *   <FormField as="textarea" label="Long description" value={x} onChange={setX} rows={5} />
 *   <FormField as="select" label="Category" value={x} onChange={setX} options={[{value,label}...]} />
 *   <FormField as="number" label="SP" value={x} onChange={setX} min={0} />
 *   <FormField as="toggle" label="Enquire only" checked={x} onChange={setX} />
 */
export default function FormField({
  as = "text",
  label,
  value,
  checked,
  onChange,
  placeholder,
  hint,
  error,
  options,
  rows = 4,
  min,
  max,
  required,
  className = "",
  ...rest
}) {
  const id = rest.id || `ff-${label?.replace(/\s+/g, "-").toLowerCase()}`;
  const base = "w-full bg-transparent border-b border-[#2b2320]/25 focus:border-[#2b2320] outline-none py-2 text-base placeholder:text-[#2b2320]/25";

  const control = () => {
    switch (as) {
      case "textarea":
        return (
          <textarea id={id} value={value ?? ""} onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder} rows={rows}
            className={`${base} resize-none`} {...rest} />
        );
      case "select":
        return (
          <select id={id} value={value ?? ""} onChange={(e) => onChange?.(e.target.value)}
            className={base} {...rest}>
            {!value && <option value="">{placeholder || "Select…"}</option>}
            {options?.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        );
      case "number":
        return (
          <input id={id} type="number" value={value ?? ""} min={min} max={max}
            onChange={(e) => onChange?.(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder={placeholder} className={base} {...rest} />
        );
      case "toggle":
        return (
          <button type="button" role="switch" aria-checked={!!checked}
            onClick={() => onChange?.(!checked)}
            className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-[#395439]" : "bg-[#2b2320]/20"}`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        );
      default:
        return (
          <input id={id} type={as} value={value ?? ""} onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder} className={base} {...rest} />
        );
    }
  };

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="text-xs tracking-[0.14em] uppercase text-[#5c3e2b] flex items-center gap-1">
          {label}{required && <span className="text-[#9a3b2e]">*</span>}
        </label>
      )}
      <div className="mt-1.5">{control()}</div>
      {hint && !error && <p className="text-[11px] text-[#5c3e2b]/60 mt-1">{hint}</p>}
      {error && <p className="text-xs text-[#9a3b2e] mt-1">{error}</p>}
    </div>
  );
}
