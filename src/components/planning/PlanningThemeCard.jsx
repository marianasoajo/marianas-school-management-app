import { ChevronDown, ChevronRight, GraduationCap, Trash2 } from 'lucide-react'
import { RichTextEditor } from '../ui/RichTextEditor'
import { RICH_TEXT_FIELDS } from './constants/planningConstants.js'

export function PlanningThemeCard({
    unit,
    schoolForms,
    isExpanded,
    isDirty,
    onToggleExpand,
    onFieldChange,
    onDelete,
    t
}) {
    const assignedForm = schoolForms.find((f) => f.id === unit.school_form_id)

    return (
        <div
            className={`bg-white dark:bg-gray-900 border rounded-lg transition-all shadow-sm overflow-hidden ${isDirty
                ? 'border-yellow-400 dark:border-yellow-600/60 ring-1 ring-yellow-400/20'
                : 'border-gray-200 dark:border-gray-800'
                }`}
        >
            {/* Header - Collapsed View */}
            <div
                onClick={onToggleExpand}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors select-none"
            >
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
                    <button type="button" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 shrink-0">
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </button>

                    <div className="truncate flex-1">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {unit.theme || (
                                <span className="italic text-gray-400">{t('untitled_theme') || 'Sem título'}</span>
                            )}
                        </h3>
                    </div>

                    {assignedForm && (
                        <span className="inline-flex items-center gap-1 shrink-0 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 rounded-full border border-blue-200 dark:border-blue-800">
                            <GraduationCap size={12} />
                            {assignedForm.year_level} - {assignedForm.class_section}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation()
                            onDelete(unit.id)
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-colors"
                        title={t('delete_theme') || 'Eliminar Tema'}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Body - Expanded View */}
            {isExpanded && (
                <div className="p-5 border-t border-gray-200 dark:border-gray-800 space-y-5 bg-gray-50/50 dark:bg-gray-900/50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 space-y-1">
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                                {t('theme_title') || 'Nome / Aprendizagem Essencial'} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={unit.theme}
                                onChange={(e) => onFieldChange(unit.id, 'theme', e.target.value)}
                                className="w-full h-9 px-3 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-1 focus:ring-blue-500 dark:text-gray-100"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                                {t('school_form') || 'Turma Destino'}
                            </label>
                            <select
                                value={unit.school_form_id || ''}
                                onChange={(e) => onFieldChange(unit.id, 'school_form_id', e.target.value)}
                                className="w-full h-9 px-3 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-1 focus:ring-blue-500 dark:text-gray-100"
                            >
                                <option value="">{t('select_form') || 'Sem Turma'}</option>
                                {schoolForms.map((form) => (
                                    <option key={form.id} value={form.id}>
                                        {form.year_level} - {form.class_section}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {RICH_TEXT_FIELDS.map((field) => (
                            <div key={field.key} className="space-y-1.5">
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    {t(field.i18nKey) || field.key}
                                </label>
                                <RichTextEditor
                                    value={unit[field.key]}
                                    onChange={(val) => onFieldChange(unit.id, field.key, val)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}