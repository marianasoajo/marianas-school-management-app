import { X } from 'lucide-react'
import { useState } from 'react'
import { SchoolFormSelect } from '../../ui/SchoolFormSelect'
import { SchoolYearSelect } from '../../ui/SchoolYearSelect'

export function EnrolmentModal({
    isOpen,
    onClose,
    selectedStudent,
    schoolYears,
    schoolForms,
    onSave,
    t
}) {
    const [form, setForm] = useState({
        school_year_id: selectedStudent?.currentEnrollment?.school_year_id || '',
        school_form_id: selectedStudent?.currentEnrollment?.school_form_id || ''
    })

    if (!isOpen || !selectedStudent) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full text-gray-900 dark:text-gray-100 transition-colors">
                <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold">{t('enrollment_modal_title')}</h2>
                    <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <X size={20} />
                    </button>
                </div>

                <div className="px-6 py-4 space-y-4">
                    <div>
                        <h3 className="text-sm font-semibold mb-1">{selectedStudent.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                            {t('process_number')}: {selectedStudent.process_number}
                        </p>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700 text-sm">
                            <span className="font-medium">{t('current_enrollment')}: </span>
                            {selectedStudent.currentEnrollment
                                ? `${selectedStudent.currentEnrollment.school_forms.year_level} ${selectedStudent.currentEnrollment.school_forms.class_section} (${selectedStudent.currentEnrollment.school_years.label})`
                                : t('not_enrolled')}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">{t('academic_year')} *</label>
                        <SchoolYearSelect
                            value={form.school_year_id}
                            onChange={(val) => setForm({ ...form, school_year_id: val })}
                            schoolYears={schoolYears}
                            t={t}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">{t('group')} *</label>
                        <SchoolFormSelect
                            value={form.school_form_id}
                            onChange={(val) => setForm({ ...form, school_form_id: val })}
                            schoolForms={schoolForms}
                            t={t}
                            required
                        />
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        {t('cancel')}
                    </button>
                    <button
                        onClick={() => onSave(form)}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                        {t('save')}
                    </button>
                </div>
            </div>
        </div>
    )
}