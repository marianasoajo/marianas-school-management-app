
export default function Input({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
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
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={`
          w-full bg-app-surface text-content-main border border-app-border rounded-xl px-3 py-2 text-sm
          placeholder:text-content-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary
          disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-touch ${className}
        `}
                {...props}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    )
}