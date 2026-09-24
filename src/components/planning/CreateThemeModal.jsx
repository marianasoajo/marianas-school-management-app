import { GraduationCap, Loader2, Plus, X } from 'lucide-react'
import { useState } from 'react'

export function CreateThemeModal({ isOpen, onClose, schoolForms, onCreate, t }) {
    const [themeTitle, setThemeTitle] = useState('')
    const [selectedFormIds, setSelectedFormIds] = useState([])
    const [submitting, setSubmitting] = useState(false)

    if (!isOpen) return null

    const handleToggleForm = (formId) => {
        setSelectedFormIds((prev) =>
            prev.includes(formId) ? prev.filter((id) => id !== formId) : [...prev, formId]
        )
    }

    const handleSelectAllForms = () => {
        if (selectedFormIds.length === schoolForms.length) {
            setSelectedFormIds([])
        } else {
            setSelectedFormIds(schoolForms.map((f) => f.id))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!themeTitle.trim()) return

        setSubmitting(true)
        try {
            await onCreate({
                title: themeTitle.trim(),
                formIds: selectedFormIds
            })
            setThemeTitle('')
            setSelectedFormIds([])
            onClose()
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-lg w-full border border-gray-200 dark:border-gray-800 overflow-hidden">
                {/* Header */}
                <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Plus size={20} className="text-blue-600 dark:text-blue-400" />
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {t('create_new_theme') || 'Criar Novo Tema'}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Theme Title */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            {t('theme_title') || 'Nome / Aprendizagem Essencial'}{' '}
                            <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={themeTitle}
                            onChange={(e) => setThemeTitle(e.target.value)}
                            placeholder={t('enter_theme_title_placeholder') || 'Ex: Números Racionais e Operações'}
                            className="w-full h-10 px-3 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-1 focus:ring-blue-500 dark:text-gray-100"
                        />
                    </div>

                    {/* School Forms Multi-Selection */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                {t('assign_to_forms') || 'Atribuir a Turmas (Multi-seleção)'}
                            </label>
                            {schoolForms.length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleSelectAllForms}
                                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                >
                                    {selectedFormIds.length === schoolForms.length
                                        ? t('deselect_all') || 'Desmarcar Todas'
                                        : t('select_all') || 'Selecionar Todas'}
                                </button>
                            )}
                        </div>

                        {schoolForms.length === 0 ? (
                            <p className="text-xs text-gray-500 italic">
                                {t('no_forms_available') || 'Nenhuma turma registada.'}
                            </p>
                        ) : (
                            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                                {schoolForms.map((form) => {
                                    const isChecked = selectedFormIds.includes(form.id)
                                    return (
                                        <label
                                            key={form.id}
                                            className={`flex items-center gap-2.5 p-2.5 rounded-md border text-xs cursor-pointer transition-colors ${isChecked
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100'
                                                : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => handleToggleForm(form.id)}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                            <GraduationCap size={14} className="shrink-0 text-gray-500" />
                                            <span className="font-medium truncate">
                                                {form.year_level} - {form.class_section}
                                            </span>
                                        </label>
                                    )
                                })}
                            </div>
                        )}
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            {selectedFormIds.length > 0
                                ? `${selectedFormIds.length} turma(s) selecionada(s). Será criado um registo para cada turma.`
                                : 'Se nenhuma turma for selecionada, o tema será criado sem turma atribuída.'}
                        </p>
                    </div>

                    {/* Modal Actions */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-medium border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            {t('cancel') || 'Cancelar'}
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !themeTitle.trim()}
                            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                        >
                            {submitting && <Loader2 className="animate-spin" size={14} />}
                            {t('create_theme') || 'Criar Tema'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}