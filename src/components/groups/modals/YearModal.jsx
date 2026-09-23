import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { DateInput } from './DateInput'

export function YearModal({ isOpen, onClose, editingYear, onSave, t }) {
    const [yearForm, setYearForm] = useState({
        label: '',
        start_date: '',
        end_date: '',
        is_active: false
    })

    useEffect(() => {
        if (editingYear) {
            setYearForm({
                label: editingYear.label || '',
                start_date: editingYear.start_date || '',
                end_date: editingYear.end_date || '',
                is_active: editingYear.is_active || false
            })
        } else {
            setYearForm({ label: '', start_date: '', end_date: '', is_active: false })
        }
    }, [editingYear, isOpen])

    if (!isOpen) return null

    const handleSubmit = (e) => {
        e.preventDefault()
        onSave(yearForm)
    }

    const dateInputStyle = "w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 h-9"

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full border border-gray-200 dark:border-gray-800">
                <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {editingYear ? t('edit_academic_year') : t('create_academic_year')}
                    </h2>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('year_label')} *
                        </label>
                        <input
                            type="text"
                            required
                            value={yearForm.label}
                            onChange={(e) => setYearForm({ ...yearForm, label: e.target.value })}
                            placeholder="2026/2027"
                            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('start_date')}
                        </label>
                        <DateInput
                            value={yearForm.start_date}
                            onChange={(val) => setYearForm({ ...yearForm, start_date: val })}
                            className={dateInputStyle}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('end_date')}
                        </label>
                        <DateInput
                            value={yearForm.end_date}
                            onChange={(val) => setYearForm({ ...yearForm, end_date: val })}
                            className={dateInputStyle}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={yearForm.is_active}
                            onChange={(e) => setYearForm({ ...yearForm, is_active: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('active_year')}
                        </label>
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
                            {editingYear ? t('update_academic_year') : t('create_academic_year')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}