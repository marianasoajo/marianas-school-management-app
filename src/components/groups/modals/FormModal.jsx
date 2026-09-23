import { X } from 'lucide-react'
import { useEffect, useState } from 'react'

export function FormModal({ isOpen, onClose, editingForm, onSave, t }) {
    const [formForm, setFormForm] = useState({ year_level: '', class_section: '' })

    useEffect(() => {
        if (editingForm) {
            setFormForm({
                year_level: editingForm.year_level || '',
                class_section: editingForm.class_section || ''
            })
        } else {
            setFormForm({ year_level: '', class_section: '' })
        }
    }, [editingForm, isOpen])

    if (!isOpen) return null

    const handleSubmit = (e) => {
        e.preventDefault()
        onSave(formForm)
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full border border-gray-200 dark:border-gray-800">
                <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {editingForm ? t('edit_school_form') : t('create_school_form')}
                    </h2>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('year_level')} *
                        </label>
                        <input
                            type="text"
                            required
                            value={formForm.year_level}
                            onChange={(e) => setFormForm({ ...formForm, year_level: e.target.value })}
                            placeholder="9º Ano"
                            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('class_section')} *
                        </label>
                        <input
                            type="text"
                            required
                            value={formForm.class_section}
                            onChange={(e) => setFormForm({ ...formForm, class_section: e.target.value })}
                            placeholder="Turma A"
                            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                            {editingForm ? t('update_school_form') : t('create_school_form')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}