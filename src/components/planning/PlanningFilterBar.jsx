import { Check, Filter, GraduationCap, Search, X } from 'lucide-react'

export function PlanningFilterBar({
    schoolForms,
    selectedFormIds,
    onToggleFilter,
    onClearFilter,
    searchTerm,
    onSearchChange,
    t
}) {
    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-lg shadow-sm space-y-3">
            {/* Theme Search Input */}
            <div className="relative max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={t('search_theme_placeholder') || 'Pesquisar por nome do tema...'}
                    className="w-full pl-9 pr-8 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-gray-100 placeholder-gray-400"
                />
                {searchTerm && (
                    <button
                        onClick={() => onSearchChange('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* School Form Pills */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <Filter size={14} />
                    <span>{t('filter_by_school_form') || 'Filtrar por Turma'}:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={onClearFilter}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedFormIds.length === 0
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        {t('all_forms') || 'Todas as Turmas'}
                    </button>
                    {schoolForms.map((form) => {
                        const isSelected = selectedFormIds.includes(form.id)
                        return (
                            <button
                                key={form.id}
                                onClick={() => onToggleFilter(form.id)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${isSelected
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {isSelected && <Check size={12} />}
                                <GraduationCap size={14} />
                                {form.year_level} - {form.class_section}
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}