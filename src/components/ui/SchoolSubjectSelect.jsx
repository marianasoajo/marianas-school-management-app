export function SchoolSubjectSelect({
    value,
    onChange,
    subjects = [t("hgp"), t("por"), t("eng")],
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
            <option value="">{placeholder || (t ? t('select_subject') : 'Select Subject')}</option>
            {subjects.map((subject) => (
                <option key={subject} value={subject}>
                    {subject}
                </option>
            ))}
        </select>
    )
}