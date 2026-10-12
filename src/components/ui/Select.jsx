
export default function Select({
    label,
    options = [],
    value,
    onChange,
    error,
    className = '',
    required = false,
    disabled = false,
    ...props
}) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-xs font-semibold uppercase text-content-muted mb-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <select
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`
          w-full bg-app-surface text-content-main border border-app-border rounded-xl px-3 py-2 text-sm
          focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary
          disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-touch ${className}
        `}
                {...props}
            >
                {options.map((opt, idx) => (
                    <option key={opt.value ?? idx} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    )
}