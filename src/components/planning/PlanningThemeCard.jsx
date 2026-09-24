import { ChevronDown, ChevronUp, GraduationCap, Trash2 } from 'lucide-react'
import RichTextEditor from '../ui/RichTextEditor'

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
    const assignedFormIds = unit.form_ids || []

    const handleFormToggle = (formId) => {
        const nextForms = assignedFormIds.includes(formId)
            ? assignedFormIds.filter((id) => id !== formId)
            : [...assignedFormIds, formId]

        onFieldChange(unit.id, 'form_ids', nextForms)
    }

    return (
        <div className={`bg-white dark:bg-gray-900 border rounded-lg shadow-sm transition-all ${isDirty ? 'border-amber-400 dark:border-amber-600 ring-1 ring-amber-400/20' : 'border-gray-200 dark:border-gray-800'
            }`}>
            {/* Header / Accordion Title */}
            <div className="p-4 flex items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800/60">
                <div className="flex-1 min-w-0 flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onToggleExpand}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    <input
                        type="text"
                        value={unit.theme || ''}
                        onChange={(e) => onFieldChange(unit.id, 'theme', e.target.value)}
                        placeholder={t('theme_title') || 'Nome do Tema / Aprendizagem Essencial'}
                        className="w-full text-base font-semibold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none dark:text-gray-100"
                    />
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-full font-medium">
                        {assignedFormIds.length === 0
                            ? 'Sem Turma'
                            : `${assignedFormIds.length} Turma(s)`}
                    </span>

                    <button
                        type="button"
                        onClick={() => onDelete(unit.id)}
                        className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title={t('delete')}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Expanded Body */}
            {isExpanded && (
                <div className="p-4 space-y-5">
                    {/* Multi-Form Selection Pills */}
                    <div className="space-y-1.5 bg-gray-50 dark:bg-gray-800/40 p-3 rounded-md border border-gray-200/60 dark:border-gray-800">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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
                                            ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 text-blue-700 dark:text-blue-300'
                                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100'
                                            }`}
                                    >
                                        <GraduationCap size={13} />
                                        {form.year_level} - {form.class_section}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Compact Input for Manual Pages */}
                    <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('manual_pages') || 'Páginas do Manual / Livro'}
                        </label>
                        <input
                            type="text"
                            value={unit.manual_pages || ''}
                            onChange={(e) => onFieldChange(unit.id, 'manual_pages', e.target.value)}
                            placeholder="ex: págs. 42-48, pág. 50"
                            className="w-full text-xs p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:ring-1 focus:ring-blue-500 dark:text-gray-100"
                        />
                    </div>

                    {/* Rich Text Editors for Large Content Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t('activities') || 'Atividades Planeadas'}
                            </label>
                            <RichTextEditor
                                value={unit.activities || ''}
                                onChange={(val) => onFieldChange(unit.id, 'activities', val)}
                                className="min-h-[140px]"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t('registers') || 'Registos / Observações'}
                            </label>
                            <RichTextEditor
                                value={unit.registers || ''}
                                onChange={(val) => onFieldChange(unit.id, 'registers', val)}
                                className="min-h-[140px]"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t('resources_physical') || 'Recursos Físicos'}
                            </label>
                            <RichTextEditor
                                value={unit.resources_physical || ''}
                                onChange={(val) => onFieldChange(unit.id, 'resources_physical', val)}
                                className="min-h-[140px]"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t('resources_digital') || 'Recursos Digitais'}
                            </label>
                            <RichTextEditor
                                value={unit.resources_digital || ''}
                                onChange={(val) => onFieldChange(unit.id, 'resources_digital', val)}
                                className="min-h-[140px]"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t('exercises_physical') || 'Exercícios Físicos / Fichas'}
                            </label>
                            <RichTextEditor
                                value={unit.exercises_physical || ''}
                                onChange={(val) => onFieldChange(unit.id, 'exercises_physical', val)}
                                className="min-h-[140px]"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t('exercises_digital') || 'Exercícios Digitais / Quiz'}
                            </label>
                            <RichTextEditor
                                value={unit.exercises_digital || ''}
                                onChange={(val) => onFieldChange(unit.id, 'exercises_digital', val)}
                                className="min-h-[140px]"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}