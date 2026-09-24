import { Copy, Plus } from 'lucide-react'

export default function LessonFilterBar({
    filters,
    onFilterChange,
    schoolYears,
    schoolForms,
    onOpenAddModal,
    onOpenImportModal,
    t
}) {
    return (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 lg:max-w-3xl">
                {/* Academic Year Select */}
                <select
                    value={filters.yearId}
                    onChange={(e) => onFilterChange({ ...filters, yearId: e.target.value })}
                    className="w-full h-10 px-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                    <option value="" className="text-gray-900 bg-white dark:bg-gray-800 dark:text-gray-100">
                        {t('all_years')}
                    </option>
                    {schoolYears.map((year) => (
                        <option
                            key={year.id}
                            value={year.id}
                            className="text-gray-900 bg-white dark:bg-gray-800 dark:text-gray-100"
                        >
                            {year.label}
                        </option>
                    ))}
                </select>

                {/* School Form / Group Select */}
                <select
                    value={filters.formId}
                    onChange={(e) => onFilterChange({ ...filters, formId: e.target.value })}
                    className="w-full h-10 px-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                    <option value="" className="text-gray-900 bg-white dark:bg-gray-800 dark:text-gray-100">
                        {t('all_groups')}
                    </option>
                    {schoolForms.map((form) => (
                        <option
                            key={form.id}
                            value={form.id}
                            className="text-gray-900 bg-white dark:bg-gray-800 dark:text-gray-100"
                        >
                            {form.year_level} {form.class_section}
                        </option>
                    ))}
                </select>

                {/* Date Input */}
                <input
                    type="date"
                    value={filters.date}
                    onChange={(e) => onFilterChange({ ...filters, date: e.target.value })}
                    className="w-full h-10 px-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
            </div>

            <div className="flex items-center gap-2.5 sm:w-auto w-full pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100 dark:border-gray-800">
                <button
                    onClick={onOpenImportModal}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 h-10 px-4 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-gray-200 transition-all shadow-sm"
                >
                    <Copy size={16} className="text-gray-500 dark:text-gray-400" />
                    <span>{t('import_summaries')}</span>
                </button>

                <button
                    onClick={onOpenAddModal}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 h-10 px-4 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-sm"
                >
                    <Plus size={16} />
                    <span>{t('add_lesson')}</span>
                </button>
            </div>
        </div>
    )
}