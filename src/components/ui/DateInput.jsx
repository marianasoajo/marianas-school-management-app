export function DateInput({
    value,
    onChange,
    className = "w-full h-10 px-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all [color-scheme:light] dark:[color-scheme:dark]",
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