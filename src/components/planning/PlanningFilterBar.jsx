import { Check, Filter, GraduationCap } from 'lucide-react'

export function PlanningFilterBar({ schoolForms, selectedFormIds, onToggleFilter, onClearFilter, t }) {
    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-lg shadow-sm space-y-2">
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
    )
}