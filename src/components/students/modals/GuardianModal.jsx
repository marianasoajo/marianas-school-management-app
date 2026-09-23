import { X } from 'lucide-react'
import { useState } from 'react'

export function GuardianModal({
    isOpen,
    onClose,
    selectedStudent,
    onAddGuardian,
    onDetachGuardian,
    t
}) {
    const [form, setForm] = useState({
        name: '',
        phone_number: '',
        email: '',
        relationship: 'mother'
    })

    if (!isOpen || !selectedStudent) return null

    const handleAdd = async () => {
        await onAddGuardian(form)
        setForm({ name: '', phone_number: '', email: '', relationship: 'mother' })
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto text-gray-900 dark:text-gray-100 transition-colors">
                <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold">{t('guardian_modal_title')}</h2>
                    <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <X size={20} />
                    </button>
                </div>

                <div className="px-6 py-4 space-y-6">
                    <div>
                        <h3 className="text-sm font-semibold mb-3">{t('linked_guardians')}</h3>
                        {selectedStudent.guardians.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('no_guardians')}</p>
                        ) : (
                            <div className="space-y-2">
                                {selectedStudent.guardians.map((guardian) => (
                                    <div
                                        key={guardian.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-md"
                                    >
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{guardian.name}</p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                {guardian.relationship} • {guardian.phone_number || '—'} • {guardian.email || '—'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => onDetachGuardian(guardian.id)}
                                            className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                                        >
                                            {t('detach')}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-3">
                        <h3 className="text-sm font-semibold">{t('add_guardian')}</h3>
                        <div>
                            <label className="block text-sm font-medium mb-1">{t('guardian_name')} *</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full h-10 px-3 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium mb-1">{t('phone_number')}</label>
                                <input
                                    type="tel"
                                    value={form.phone_number}
                                    onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                                    className="w-full h-10 px-3 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">{t('email')}</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="w-full h-10 px-3 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">{t('relationship')}</label>
                            <select
                                value={form.relationship}
                                onChange={(e) => setForm({ ...form, relationship: e.target.value })}
                                className="w-full h-10 px-3 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
                            >
                                <option value="mother">{t('mother')}</option>
                                <option value="father">{t('father')}</option>
                                <option value="legal_guardian">{t('legal_guardian')}</option>
                                <option value="other">{t('other')}</option>
                            </select>
                        </div>
                        <button
                            onClick={handleAdd}
                            className="w-full px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors"
                        >
                            {t('add_guardian')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}