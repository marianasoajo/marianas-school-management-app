export function SchoolYearSelect({
    value,
    onChange,
    schoolYears = [],
    placeholder,
    className = "w-full h-10 px-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all",
    required = false,
    disabled = false,
    t
}) {
    return (
        <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={className}
            required={required}
            disabled={disabled}
        >
            <option value="" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                {placeholder || (t ? t('select_year') : 'Select Academic Year')}
            </option>
            {schoolYears.map((year) => (
                <option
                    key={year.id}
                    value={year.id}
                    className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                    {year.label}
                </option>
            ))}
        </select>
    )
}