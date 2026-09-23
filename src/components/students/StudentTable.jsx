import { Loader2, Pencil, Trash2, UserCheck, Users } from 'lucide-react'

export function StudentTable({
    loading,
    students,
    onEditStudent,
    onEnrollStudent,
    onManageGuardians,
    onDeleteStudent,
    t
}) {
    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-12 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <Loader2 className="animate-spin mr-2" size={20} />
                {t('loading')}
            </div>
        )
    }

    if (students.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-12 text-center text-gray-500 dark:text-gray-400">
                {t('no_students')}
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm overflow-hidden transition-colors">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                {t('process_number')}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                {t('full_name')}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                {t('birthdate')}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                {t('current_group')}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                {t('guardians')}
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                {t('actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                        {students.map((student) => (
                            <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {student.process_number}
                                </td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {student.name}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                    {student.birthdate ? new Date(student.birthdate).toLocaleDateString() : '—'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                    {student.currentEnrollment
                                        ? `${student.currentEnrollment.school_forms.year_level} ${student.currentEnrollment.school_forms.class_section} (${student.currentEnrollment.school_years.label})`
                                        : '—'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                    {student.guardians.length > 0 ? (
                                        <div className="space-y-0.5">
                                            {student.guardians.map((g, idx) => (
                                                <div key={idx} className="text-xs">
                                                    <span className="font-medium text-gray-800 dark:text-gray-200">{g.name}</span>
                                                    {g.phone_number && <span className="text-gray-500 dark:text-gray-400"> ({g.phone_number})</span>}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        '—'
                                    )}
                                </td>
                                <td className="px-4 py-3 text-sm text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                        <button
                                            onClick={() => onEditStudent(student)}
                                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                                            title={t('edit_student')}
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button
                                            onClick={() => onEnrollStudent(student)}
                                            className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors"
                                            title={t('enroll_student')}
                                        >
                                            <UserCheck size={14} />
                                        </button>
                                        <button
                                            onClick={() => onManageGuardians(student)}
                                            className="p-1.5 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded transition-colors"
                                            title={t('manage_guardians')}
                                        >
                                            <Users size={14} />
                                        </button>
                                        <button
                                            onClick={() => onDeleteStudent(student.id)}
                                            className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                                            title={t('delete_student')}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}