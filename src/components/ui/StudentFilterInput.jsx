export function StudentFilterInput({ value, onChange, t }) {
    return (
        <input
            id="filter-search"
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t('search_students')}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
    )
}