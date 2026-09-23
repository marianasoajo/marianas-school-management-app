export function DateInput({
    value,
    onChange,
    className = "w-full h-10 px-3 text-sm bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all",
    required = false,
    disabled = false,
    min,
    max
}) {
    return (
        <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={className}
            required={required}
            disabled={disabled}
            min={min}
            max={max}
        />
    )
}