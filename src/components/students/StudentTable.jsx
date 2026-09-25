import { ArrowDown, ArrowUp, ArrowUpDown, Eye, Loader2, Pencil, Trash2, UserCheck, Users } from 'lucide-react'
import { useMemo, useState } from 'react'

export function StudentTable({
    loading,
    students,
    onEditStudent,
    onEnrolStudent,
    onManageGuardians,
    onDeleteStudent,
    onViewDetails,
    t
}) {
    // Sort State: default sort by student name ascending
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' })

    const handleSort = (key) => {
        setSortConfig((prev) => {
            if (prev.key === key) {
                return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
            }
            return { key, direction: 'asc' }
        })
    }

    const sortedStudents = useMemo(() => {
        if (!sortConfig.key) return students

        return [...students].sort((a, b) => {
            let aValue = ''
            let bValue = ''

            switch (sortConfig.key) {
                case 'current_group':
                    aValue = `${a.currentEnrolment?.school_forms?.year_level || ''} ${a.currentEnrolment?.school_forms?.class_section || ''}`.trim()
                    bValue = `${b.currentEnrolment?.school_forms?.year_level || ''} ${b.currentEnrolment?.school_forms?.class_section || ''}`.trim()
                    break

                case 'process_number':
                    aValue = a.process_number ?? ''
                    bValue = b.process_number ?? ''
                    return sortConfig.direction === 'asc'
                        ? String(aValue).localeCompare(String(bValue), undefined, { numeric: true })
                        : String(bValue).localeCompare(String(aValue), undefined, { numeric: true })

                case 'group_number':
                    aValue = a.currentEnrolment?.group_number ?? Infinity
                    bValue = b.currentEnrolment?.group_number ?? Infinity
                    return sortConfig.direction === 'asc'
                        ? (aValue > bValue ? 1 : aValue < bValue ? -1 : 0)
                        : (aValue < bValue ? 1 : aValue > bValue ? -1 : 0)

                case 'name':
                    aValue = a.name || ''
                    bValue = b.name || ''
                    break

                case 'birthdate':
                    aValue = a.birthdate ? new Date(a.birthdate).getTime() : 0
                    bValue = b.birthdate ? new Date(b.birthdate).getTime() : 0
                    return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue

                default:
                    return 0
            }

            const result = String(aValue).localeCompare(String(bValue), undefined, { sensitivity: 'base' })
            return sortConfig.direction === 'asc' ? result : -result
        })
    }, [students, sortConfig])

    const renderSortHeader = (key, label, alignment = 'left') => {
        const isActive = sortConfig.key === key

        return (
            <th
                onClick={() => handleSort(key)}
                className={`px-4 py-3 text-${alignment} text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-colors`}
            >
                <div className={`flex items-center gap-1.5 ${alignment === 'center' ? 'justify-center' : alignment === 'right' ? 'justify-end' : 'justify-start'}`}>
                    <span>{label}</span>
                    {isActive ? (
                        sortConfig.direction === 'asc' ? (
                            <ArrowUp size={14} className="text-blue-600 dark:text-blue-400" />
                        ) : (
                            <ArrowDown size={14} className="text-blue-600 dark:text-blue-400" />
                        )
                    ) : (
                        <ArrowUpDown size={14} className="text-gray-400 opacity-40 hover:opacity-100 transition-opacity" />
                    )}
                </div>
            </th>
        )
    }

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
                            {renderSortHeader('current_group', t('current_group'))}
                            {renderSortHeader('process_number', t('process_number'))}
                            {renderSortHeader('group_number', t('group_number') || 'N.º', 'center')}
                            {renderSortHeader('name', t('full_name'))}
                            {renderSortHeader('birthdate', t('birthdate'))}
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                {t('actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                        {sortedStudents.map((student) => (
                            <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                {/* Current Form / Year */}
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 font-medium">
                                    {student.currentEnrolment
                                        ? `${student.currentEnrolment.school_forms?.year_level} ${student.currentEnrolment.school_forms?.class_section} (${student.currentEnrolment.school_years?.label})`
                                        : '—'}
                                </td>

                                {/* Process Number */}
                                <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-gray-100">
                                    {student.process_number}
                                </td>

                                {/* Number in Group */}
                                <td className="px-4 py-3 text-sm text-center font-semibold text-gray-700 dark:text-gray-300">
                                    {student.currentEnrolment?.group_number || '—'}
                                </td>

                                {/* Full Name */}
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {student.name}
                                </td>

                                {/* Birthdate */}
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                    {student.birthdate ? new Date(student.birthdate).toLocaleDateString() : '—'}
                                </td>

                                {/* Actions */}
                                <td className="px-4 py-3 text-sm text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                        <button
                                            onClick={() => onViewDetails(student)}
                                            className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                                            title={t('student_details') || 'Ver Detalhes'}
                                        >
                                            <Eye size={15} />
                                        </button>
                                        <button
                                            onClick={() => onEditStudent(student)}
                                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                                            title={t('edit_student')}
                                        >
                                            <Pencil size={15} />
                                        </button>
                                        <button
                                            onClick={() => onEnrolStudent(student)}
                                            className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors"
                                            title={t('enrol_student')}
                                        >
                                            <UserCheck size={15} />
                                        </button>
                                        <button
                                            onClick={() => onManageGuardians(student)}
                                            className="p-1.5 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded transition-colors"
                                            title={t('manage_guardians')}
                                        >
                                            <Users size={15} />
                                        </button>
                                        <button
                                            onClick={() => onDeleteStudent(student.id)}
                                            className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                                            title={t('delete_student')}
                                        >
                                            <Trash2 size={15} />
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