import { ChevronDown, ChevronUp, X } from 'lucide-react'
import { useState } from 'react'
import { DateInput } from '../../ui/DateInput'
import { SchoolFormSelect } from '../../ui/SchoolFormSelect'
import { SchoolYearSelect } from '../../ui/SchoolYearSelect'

export function StudentFormModal({
    isOpen,
    onClose,
    editingStudent,
    initialData,
    schoolYears,
    schoolForms,
    onSave,
    t
}) {
    const [form, setForm] = useState(initialData)
    const [showGuardianSection, setShowGuardianSection] = useState(
        Boolean(editingStudent?.guardians?.length > 0)
    )

    if (!isOpen) return null

    const handleSubmit = (e) => {
        e.preventDefault()
        onSave(form)
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto text-gray-900 dark:text-gray-100 transition-colors">
                <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold">
                        {editingStudent ? t('edit_student') : t('create_student')}
                    </h2>
                    <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('process_number')} *</label>
                        <input
                            type="text"
                            value={form.process_number}
                            onChange={(e) => setForm({ ...form, process_number: e.target.value })}
                            className="w-full h-10 px-3 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">{t('full_name')} *</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full h-10 px-3 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">{t('birthdate')}</label>
                        <DateInput
                            value={form.birthdate}
                            onChange={(val) => setForm({ ...form, birthdate: val })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">{t('group_number')} *</label>
                        <input
                            type="text"
                            value={form.group_number}
                            onChange={(e) => setForm({ ...form, group_number: e.target.value })}
                            className="w-full h-10 px-3 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
                            required
                        />
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                        <h3 className="text-sm font-semibold mb-3">{t('current_enrolment')}</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium mb-1">{t('academic_year')}</label>
                                <SchoolYearSelect
                                    value={form.school_year_id}
                                    onChange={(val) => setForm({ ...form, school_year_id: val })}
                                    schoolYears={schoolYears}
                                    t={t}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1">{t('group')}</label>
                                <SchoolFormSelect
                                    value={form.school_form_id}
                                    onChange={(val) => setForm({ ...form, school_form_id: val })}
                                    schoolForms={schoolForms}
                                    t={t}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowGuardianSection(!showGuardianSection)}
                            className="w-full flex items-center justify-between text-sm font-semibold hover:text-blue-600 dark:hover:text-blue-400"
                        >
                            <span>{t('guardian_optional')}</span>
                            {showGuardianSection ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        {showGuardianSection && (
                            <div className="space-y-3 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md border border-gray-200 dark:border-gray-700 mt-2">
                                <div>
                                    <label className="block text-xs font-medium mb-1">{t('guardian_name')}</label>
                                    <input
                                        type="text"
                                        value={form.guardian_name}
                                        onChange={(e) => setForm({ ...form, guardian_name: e.target.value })}
                                        className="w-full h-9 px-3 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium mb-1">{t('phone_number')}</label>
                                        <input
                                            type="tel"
                                            value={form.guardian_phone}
                                            onChange={(e) => setForm({ ...form, guardian_phone: e.target.value })}
                                            className="w-full h-9 px-3 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium mb-1">{t('email')}</label>
                                        <input
                                            type="email"
                                            value={form.guardian_email}
                                            onChange={(e) => setForm({ ...form, guardian_email: e.target.value })}
                                            className="w-full h-9 px-3 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1">{t('relationship')}</label>
                                    <select
                                        value={form.guardian_relationship}
                                        onChange={(e) => setForm({ ...form, guardian_relationship: e.target.value })}
                                        className="w-full h-9 px-3 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md"
                                    >
                                        <option value="mother">{t('mother')}</option>
                                        <option value="father">{t('father')}</option>
                                        <option value="legal_guardian">{t('legal_guardian')}</option>
                                        <option value="other">{t('other')}</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 -mx-6 -mb-4 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                            {editingStudent ? t('update_student') : t('create_student')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}