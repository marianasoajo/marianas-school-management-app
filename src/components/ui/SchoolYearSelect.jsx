export function SchoolYearSelect({
    value,
    onChange,
    schoolYears = [],
    placeholder,
    className = "w-full h-10 px-3 text-sm bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all",
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
            <option value="">{placeholder || (t ? t('select_year') : 'Select Academic Year')}</option>
            {schoolYears.map((year) => (
                <option key={year.id} value={year.id}>
                    {year.label}
                </option>
            ))}
        </select>
    )
}