import { BookOpen, Check, ChevronDown, ChevronUp, Edit3, GraduationCap, Trash2 } from 'lucide-react'
import { useState } from 'react'
import RichText from '../ui/RichText'
import RichTextEditor from '../ui/RichTextEditor'

export function PlanningThemeCard({
    unit,
    schoolForms,
    isExpanded,
    isDirty,
    onToggleExpand,
    onFieldChange,
    onSave,
    onDelete,
    t
}) {
    const [isEditing, setIsEditing] = useState(false)
    const assignedFormIds = unit.form_ids || []

    const handleFormToggle = (formId) => {
        const nextForms = assignedFormIds.includes(formId)
            ? assignedFormIds.filter((id) => id !== formId)
            : [...assignedFormIds, formId]

        onFieldChange(unit.id, 'form_ids', nextForms)
    }

    const handleStartEdit = (e) => {
        e.stopPropagation()
        if (!isExpanded) onToggleExpand()
        setIsEditing(true)
    }

    const handleDoneEdit = (e) => {
        e.stopPropagation()
        setIsEditing(false)
        if (onSave) onSave()
    }

    const getFormName = (formId) => {
        const form = schoolForms.find((f) => f.id === formId)
        return form ? `${form.year_level} ${form.class_section}` : null
    }

    const hasContent = (field) => Boolean(field && field.trim().length > 0 && field !== '<p><br></p>')

    return (
        <div className={`transition-colors border-b border-gray-200 dark:border-gray-800 last:border-b-0 ${isDirty
            ? 'bg-amber-50/30 dark:bg-amber-950/10 border-l-4 border-l-amber-500'
            : isEditing
                ? 'bg-blue-50/40 dark:bg-gray-800/50 border-l-4 border-l-blue-600'
                : 'bg-white dark:bg-gray-900 hover:bg-gray-50/60 dark:hover:bg-gray-800/40'
            }`}>
            {/* Header / Main Row */}
            <div className="p-4 flex items-center justify-between gap-4">
                <div onClick={onToggleExpand} className="flex-1 min-w-0 cursor-pointer flex items-center gap-3">
                    <button
                        type="button"
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0"
                    >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>

                    <div className="min-w-0 flex-1">
                        {isEditing ? (
                            <input
                                type="text"
                                value={unit.theme || ''}
                                onChange={(e) => onFieldChange(unit.id, 'theme', e.target.value)}
                                placeholder={t('theme_title') || 'Nome do Tema / Aprendizagem Essencial'}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full text-base font-bold bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2.5 py-1 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-gray-100"
                            />
                        ) : (
                            <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 truncate">
                                    {unit.theme || (t('new_theme_placeholder') || 'Novo Tema de Aprendizagem')}
                                </h4>
                                {unit.manual_pages && (
                                    <span className="inline-flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded font-medium">
                                        <BookOpen size={12} />
                                        {unit.manual_pages}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Assigned Forms Badges */}
                        <div className="flex items-center gap-1.5 flex-wrap mt-1">
                            {assignedFormIds.length === 0 ? (
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                    {t('no_forms') || 'Sem Turma'}
                                </span>
                            ) : (
                                assignedFormIds.map((fId) => {
                                    const formLabel = getFormName(fId)
                                    if (!formLabel) return null
                                    return (
                                        <span
                                            key={fId}
                                            className="inline-flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 px-2 py-0.5 rounded-md font-medium"
                                        >
                                            <GraduationCap size={12} />
                                            {formLabel}
                                        </span>
                                    )
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                    {isEditing ? (
                        <button
                            type="button"
                            onClick={handleDoneEdit}
                            className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                            title={t('done') || 'Concluir'}
                        >
                            <Check size={16} />
                            <span>{t('done') || 'Concluir'}</span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleStartEdit}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            title={t('edit') || 'Editar Tema'}
                        >
                            <Edit3 size={16} />
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => onDelete(unit.id)}
                        className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        title={t('delete')}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="px-4 pb-5 pt-2 space-y-5 border-t border-gray-100 dark:border-gray-800/60">
                    {/* EDITABLE VIEW */}
                    {isEditing ? (
                        <div className="space-y-5 pt-2">
                            {/* Multi-Form Assignment Pills */}
                            <div className="space-y-1.5 bg-gray-50 dark:bg-gray-800/40 p-3 rounded-lg border border-gray-200/80 dark:border-gray-800">
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    {t('assign_to_forms') || 'Turmas Associadas a este Tema'}:
                                </label>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {schoolForms.map((form) => {
                                        const isAssigned = assignedFormIds.includes(form.id)
                                        return (
                                            <button
                                                type="button"
                                                key={form.id}
                                                onClick={() => handleFormToggle(form.id)}
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors border ${isAssigned
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
                                                    }`}
                                            >
                                                <GraduationCap size={13} />
                                                {form.year_level} {form.class_section}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Manual Pages Input */}
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    {t('manual_pages') || 'Páginas do Manual / Livro'}
                                </label>
                                <input
                                    type="text"
                                    value={unit.manual_pages || ''}
                                    onChange={(e) => onFieldChange(unit.id, 'manual_pages', e.target.value)}
                                    placeholder="ex: págs. 42-48, pág. 50"
                                    className="w-full text-xs p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 dark:text-gray-100"
                                />
                            </div>

                            {/* Rich Text Editors */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        {t('activities') || 'Atividades Planeadas'}
                                    </label>
                                    <RichTextEditor
                                        value={unit.activities || ''}
                                        onChange={(val) => onFieldChange(unit.id, 'activities', val)}
                                        minHeight="180px"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        {t('registers') || 'Registos / Observações'}
                                    </label>
                                    <RichTextEditor
                                        value={unit.registers || ''}
                                        onChange={(val) => onFieldChange(unit.id, 'registers', val)}
                                        minHeight="180px"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        {t('resources_physical') || 'Recursos Físicos'}
                                    </label>
                                    <RichTextEditor
                                        value={unit.resources_physical || ''}
                                        onChange={(val) => onFieldChange(unit.id, 'resources_physical', val)}
                                        minHeight="180px"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        {t('resources_digital') || 'Recursos Digitais'}
                                    </label>
                                    <RichTextEditor
                                        value={unit.resources_digital || ''}
                                        onChange={(val) => onFieldChange(unit.id, 'resources_digital', val)}
                                        minHeight="180px"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        {t('exercises_physical') || 'Exercícios Físicos / Fichas'}
                                    </label>
                                    <RichTextEditor
                                        value={unit.exercises_physical || ''}
                                        onChange={(val) => onFieldChange(unit.id, 'exercises_physical', val)}
                                        minHeight="180px"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        {t('exercises_digital') || 'Exercícios Digitais / Quiz'}
                                    </label>
                                    <RichTextEditor
                                        value={unit.exercises_digital || ''}
                                        onChange={(val) => onFieldChange(unit.id, 'exercises_digital', val)}
                                        minHeight="180px"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* READ-ONLY VIEW */
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                            {/* Activities */}
                            <div className="p-3 bg-gray-50/70 dark:bg-gray-800/40 rounded-lg border border-gray-200/60 dark:border-gray-800">
                                <span className="block font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                    {t('activities') || 'Atividades Planeadas'}
                                </span>
                                {hasContent(unit.activities) ? (
                                    <RichText html={unit.activities} className="text-gray-800 dark:text-gray-200 leading-relaxed" />
                                ) : (
                                    <p className="text-gray-400 dark:text-gray-500 italic">—</p>
                                )}
                            </div>

                            {/* Registers / Notes */}
                            <div className="p-3 bg-gray-50/70 dark:bg-gray-800/40 rounded-lg border border-gray-200/60 dark:border-gray-800">
                                <span className="block font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                    {t('registers') || 'Registos / Observações'}
                                </span>
                                {hasContent(unit.registers) ? (
                                    <RichText html={unit.registers} className="text-gray-800 dark:text-gray-200 leading-relaxed" />
                                ) : (
                                    <p className="text-gray-400 dark:text-gray-500 italic">—</p>
                                )}
                            </div>

                            {/* Physical Resources */}
                            <div className="p-3 bg-gray-50/70 dark:bg-gray-800/40 rounded-lg border border-gray-200/60 dark:border-gray-800">
                                <span className="block font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                    {t('resources_physical') || 'Recursos Físicos'}
                                </span>
                                {hasContent(unit.resources_physical) ? (
                                    <RichText html={unit.resources_physical} className="text-gray-800 dark:text-gray-200 leading-relaxed" />
                                ) : (
                                    <p className="text-gray-400 dark:text-gray-500 italic">—</p>
                                )}
                            </div>

                            {/* Digital Resources */}
                            <div className="p-3 bg-gray-50/70 dark:bg-gray-800/40 rounded-lg border border-gray-200/60 dark:border-gray-800">
                                <span className="block font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                    {t('resources_digital') || 'Recursos Digitais'}
                                </span>
                                {hasContent(unit.resources_digital) ? (
                                    <RichText html={unit.resources_digital} className="text-gray-800 dark:text-gray-200 leading-relaxed" />
                                ) : (
                                    <p className="text-gray-400 dark:text-gray-500 italic">—</p>
                                )}
                            </div>

                            {/* Physical Exercises */}
                            <div className="p-3 bg-gray-50/70 dark:bg-gray-800/40 rounded-lg border border-gray-200/60 dark:border-gray-800">
                                <span className="block font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                    {t('exercises_physical') || 'Exercícios Físicos / Fichas'}
                                </span>
                                {hasContent(unit.exercises_physical) ? (
                                    <RichText html={unit.exercises_physical} className="text-gray-800 dark:text-gray-200 leading-relaxed" />
                                ) : (
                                    <p className="text-gray-400 dark:text-gray-500 italic">—</p>
                                )}
                            </div>

                            {/* Digital Exercises */}
                            <div className="p-3 bg-gray-50/70 dark:bg-gray-800/40 rounded-lg border border-gray-200/60 dark:border-gray-800">
                                <span className="block font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                    {t('exercises_digital') || 'Exercícios Digitais / Quiz'}
                                </span>
                                {hasContent(unit.exercises_digital) ? (
                                    <RichText html={unit.exercises_digital} className="text-gray-800 dark:text-gray-200 leading-relaxed" />
                                ) : (
                                    <p className="text-gray-400 dark:text-gray-500 italic">—</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}