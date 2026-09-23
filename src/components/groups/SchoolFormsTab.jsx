import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react'

export function SchoolFormsTab({ loading, schoolForms, onOpenFormModal, onDeleteForm, t }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('school_forms')}</h2>
                <button
                    onClick={() => onOpenFormModal()}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus size={16} />
                    {t('add_school_form')}
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                    <Loader2 className="animate-spin mr-2" size={20} />
                    {t('loading')}
                </div>
            ) : schoolForms.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-800 rounded-lg">
                    {t('no_forms')}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {schoolForms.map((form) => (
                        <div
                            key={form.id}
                            className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm hover:border-gray-300 dark:hover:border-gray-700 transition-all"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                        {form.year_level} {form.class_section}
                                    </h3>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => onOpenFormModal(form)}
                                        className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded transition-colors"
                                        title={t('edit_school_form')}
                                    >
                                        <Pencil size={15} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm(t('confirm_delete_form'))) onDeleteForm(form.id)
                                        }}
                                        className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-colors"
                                        title={t('delete_school_form')}
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-0.5">
                                <p>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{t('year_level')}:</span> {form.year_level}
                                </p>
                                <p>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{t('class_section')}:</span> {form.class_section}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}