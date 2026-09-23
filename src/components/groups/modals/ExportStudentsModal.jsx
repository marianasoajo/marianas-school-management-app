import { ArrowRight, Loader2, Users, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { SchoolFormSelect } from '../../ui/SchoolFormSelect'
import { SchoolYearSelect } from '../../ui/SchoolYearSelect'
import { groupsApi } from '../api/groupsApi'

export function ExportStudentsModal({ isOpen, onClose, schoolYears, schoolForms, onExport, t }) {
    // Source Selection
    const [sourceYearId, setSourceYearId] = useState('')
    const [sourceFormId, setSourceFormId] = useState('')

    // Target Selection
    const [targetYearId, setTargetYearId] = useState('')
    const [targetFormId, setTargetFormId] = useState('')

    // Students & Selection State
    const [students, setStudents] = useState([])
    const [selectedStudentIds, setSelectedStudentIds] = useState(new Set())
    const [preserveGroupNumbers, setPreserveGroupNumbers] = useState(true)

    const [loadingStudents, setLoadingStudents] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    // Initialize dropdown defaults
    useEffect(() => {
        if (schoolYears.length > 0 && !sourceYearId) {
            setSourceYearId(schoolYears[0].id)
            if (schoolYears.length > 1) setTargetYearId(schoolYears[1].id)
            else setTargetYearId(schoolYears[0].id)
        }
        if (schoolForms.length > 0 && !sourceFormId) {
            setSourceFormId(schoolForms[0].id)
            setTargetFormId(schoolForms[0].id)
        }
    }, [schoolYears, schoolForms, isOpen])

    // Fetch source students whenever Source Year or Form changes
    useEffect(() => {
        if (!sourceYearId || !sourceFormId || !isOpen) return

        setLoadingStudents(true)
        groupsApi
            .fetchStudentsInGroup(sourceYearId, sourceFormId)
            .then((data) => {
                setStudents(data)
                setSelectedStudentIds(new Set(data.map((item) => item.student_id)))
            })
            .catch((err) => console.error(err))
            .finally(() => setLoadingStudents(false))
    }, [sourceYearId, sourceFormId, isOpen])

    if (!isOpen) return null

    const handleToggleStudent = (studentId) => {
        setSelectedStudentIds((prev) => {
            const next = new Set(prev)
            if (next.has(studentId)) next.delete(studentId)
            else next.add(studentId)
            return next
        })
    }

    const handleToggleSelectAll = () => {
        if (selectedStudentIds.size === students.length) {
            setSelectedStudentIds(new Set())
        } else {
            setSelectedStudentIds(new Set(students.map((s) => s.student_id)))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (selectedStudentIds.size === 0) return

        const studentEnrollmentsToExport = students.filter((s) => selectedStudentIds.has(s.student_id))

        setSubmitting(true)
        try {
            await onExport({
                sourceYearId,
                sourceFormId,
                targetYearId,
                targetFormId,
                studentEnrollments: studentEnrollmentsToExport,
                preserveGroupNumbers
            })
        } finally {
            setSubmitting(false)
        }
    }

    const selectClassName = "w-full h-8 px-2 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-none focus:ring-1 focus:ring-blue-500"

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full border border-gray-200 dark:border-gray-800 max-h-[90vh] flex flex-col">
                {/* Modal Header */}
                <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users size={20} className="text-blue-600 dark:text-blue-400" />
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {t('export_promote_students') || 'Exportar / Promover Alunos de Turma'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X size={20} />
                    </button>
                </div>

                {/* Modal Form */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
                    {/* Source vs Target Mapping */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                        {/* Source Group */}
                        <div className="space-y-3">
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t('source_group') || 'Origem'}
                            </span>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {t('school_year') || 'Ano Letivo'}
                                </label>
                                <SchoolYearSelect
                                    value={sourceYearId}
                                    onChange={setSourceYearId}
                                    schoolYears={schoolYears}
                                    className={selectClassName}
                                    t={t}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {t('school_form') || 'Turma'}
                                </label>
                                <SchoolFormSelect
                                    value={sourceFormId}
                                    onChange={setSourceFormId}
                                    schoolForms={schoolForms}
                                    className={selectClassName}
                                    t={t}
                                />
                            </div>
                        </div>

                        {/* Target Group */}
                        <div className="space-y-3 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-800 pt-3 md:pt-0 md:pl-4">
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1">
                                <ArrowRight size={14} />
                                {t('target_group') || 'Destino'}
                            </span>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {t('school_year') || 'Ano Letivo'}
                                </label>
                                <SchoolYearSelect
                                    value={targetYearId}
                                    onChange={setTargetYearId}
                                    schoolYears={schoolYears}
                                    className={selectClassName}
                                    t={t}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {t('school_form') || 'Turma'}
                                </label>
                                <SchoolFormSelect
                                    value={targetFormId}
                                    onChange={setTargetFormId}
                                    schoolForms={schoolForms}
                                    className={selectClassName}
                                    t={t}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Options */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="preserveGroupNumbers"
                            checked={preserveGroupNumbers}
                            onChange={(e) => setPreserveGroupNumbers(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <label htmlFor="preserveGroupNumbers" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            {t('preserve_group_numbers') || 'Manter número de chamada dos alunos (#1, #2...)'}
                        </label>
                    </div>

                    {/* Student Selector Table */}
                    <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                        <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 flex items-center justify-between text-xs font-medium">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={students.length > 0 && selectedStudentIds.size === students.length}
                                    onChange={handleToggleSelectAll}
                                    className="w-4 h-4 text-blue-600 rounded"
                                />
                                <span>
                                    {t('select_all') || 'Selecionar Todos'} ({selectedStudentIds.size}/{students.length})
                                </span>
                            </label>
                        </div>

                        {loadingStudents ? (
                            <div className="flex items-center justify-center py-8 text-xs text-gray-500">
                                <Loader2 className="animate-spin mr-2" size={16} />
                                {t('loading') || 'A carregar...'}
                            </div>
                        ) : students.length === 0 ? (
                            <div className="text-center py-8 text-xs text-gray-500">
                                {t('no_students_found') || 'Nenhum aluno inscrito nesta turma de origem.'}
                            </div>
                        ) : (
                            <div className="max-h-56 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-800">
                                {students.map((item) => {
                                    const student = item.students
                                    const isChecked = selectedStudentIds.has(student.id)

                                    return (
                                        <label
                                            key={student.id}
                                            className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer text-xs"
                                        >
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => handleToggleStudent(student.id)}
                                                    className="w-4 h-4 text-blue-600 rounded"
                                                />
                                                {item.group_number && (
                                                    <span className="font-bold text-gray-500 dark:text-gray-400">
                                                        #{item.group_number}
                                                    </span>
                                                )}
                                                <span className="font-medium">{student.name}</span>
                                            </div>
                                            <span className="text-gray-400 font-mono text-[11px]">{student.process_number}</span>
                                        </label>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
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
                            disabled={submitting || selectedStudentIds.size === 0}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {submitting ? <Loader2 className="animate-spin" size={16} /> : <ArrowRight size={16} />}
                            {t('confirm_export') || `Exportar ${selectedStudentIds.size} Aluno(s)`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}