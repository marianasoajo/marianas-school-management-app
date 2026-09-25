export function StudentFilterInput({ value, onChange, t }) {
    return (
        <input
            id="filter-search"
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t('search_students')}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-md placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
    )
}