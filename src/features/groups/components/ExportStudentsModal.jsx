import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import Select from '../../../components/ui/Select'
import { studentService } from '../../../services/studentService'

export default function ExportStudentsModal({ isOpen, onClose, years = [], forms = [], onSuccess }) {
    const { t } = useTranslation()

    const [sourceYear, setSourceYear] = useState(years[0]?.id || '')
    const [sourceForm, setSourceForm] = useState(forms[0]?.id || '')
    const [targetYear, setTargetYear] = useState(years[1]?.id || years[0]?.id || '')
    const [targetForm, setTargetForm] = useState(forms[0]?.id || '')

    const [students, setStudents] = useState([])
    const [selectedStudentIds, setSelectedStudentIds] = useState([])
    const [preserveNumbers, setPreserveNumbers] = useState(true)

    const [isLoadingStudents, setIsLoadingStudents] = useState(false)
    const [isExporting, setIsExporting] = useState(false)
    const [error, setError] = useState(null)

    // Load source students when source filters change
    useEffect(() => {
        if (sourceYear && sourceForm) {
            setIsLoadingStudents(true)
            studentService
                .getStudentsByGroup(sourceYear, sourceForm)
                .then((data) => {
                    setStudents(data || [])
                    setSelectedStudentIds((data || []).map((s) => s.id))
                })
                .catch((err) => setError(err.message))
                .finally(() => setIsLoadingStudents(false))
        }
    }, [sourceYear, sourceForm])

    const toggleStudent = (id) => {
        setSelectedStudentIds((prev) =>
            prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
        )
    }

    const toggleAll = () => {
        if (selectedStudentIds.length === students.length) {
            setSelectedStudentIds([])
        } else {
            setSelectedStudentIds(students.map((s) => s.id))
        }
    }

    const handleExport = async () => {
        if (selectedStudentIds.length === 0 || !targetYear || !targetForm) {
            setError(t('required_field'))
            return
        }

        setIsExporting(true)
        setError(null)
        try {
            await studentService.exportOrPromoteStudents({
                studentIds: selectedStudentIds,
                targetYearId: targetYear,
                targetFormId: targetForm,
                preserveNumbers
            })
            onSuccess?.()
            onClose()
        } catch (err) {
            setError(err.message)
        } finally {
            setIsExporting(false)
        }
    }

    const yearOptions = years.map((y) => ({ value: y.id, label: y.label }))
    const formOptions = forms.map((f) => ({ value: f.id, label: `${f.year_level} - ${f.class_section}` }))

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('export_promote_students')} maxWidth="max-w-lg">
            <div className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 rounded-lg text-xs">
                        {error}
                    </div>
                )}

                {/* Source Group */}
                <div className="p-3 bg-app-hover/50 rounded-xl space-y-3 border border-app-border">
                    <h4 className="text-xs font-semibold uppercase text-brand-primary">{t('source_group')}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Select
                            label={t('academic_year')}
                            value={sourceYear}
                            onChange={(e) => setSourceYear(e.target.value)}
                            options={yearOptions}
                        />
                        <Select
                            label={t('school_form')}
                            value={sourceForm}
                            onChange={(e) => setSourceForm(e.target.value)}
                            options={formOptions}
                        />
                    </div>
                </div>

                {/* Target Group */}
                <div className="p-3 bg-app-hover/50 rounded-xl space-y-3 border border-app-border">
                    <h4 className="text-xs font-semibold uppercase text-brand-primary">{t('target_group')}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Select
                            label={t('academic_year')}
                            value={targetYear}
                            onChange={(e) => setTargetYear(e.target.value)}
                            options={yearOptions}
                        />
                        <Select
                            label={t('school_form')}
                            value={targetForm}
                            onChange={(e) => setTargetForm(e.target.value)}
                            options={formOptions}
                        />
                    </div>
                </div>

                {/* Options */}
                <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={preserveNumbers}
                        onChange={(e) => setPreserveNumbers(e.target.checked)}
                        className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary"
                    />
                    <span>{t('preserve_group_numbers')}</span>
                </label>

                {/* Student Selection List */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase text-content-muted">
                            {t('students')} ({selectedStudentIds.length}/{students.length})
                        </span>
                        <button
                            type="button"
                            onClick={toggleAll}
                            className="text-xs text-brand-primary hover:underline font-medium"
                        >
                            {selectedStudentIds.length === students.length ? t('unselect_all') : t('select_all')}
                        </button>
                    </div>

                    <div className="p-3 bg-app-surface rounded-xl border border-app-border max-h-40 overflow-y-auto space-y-1.5">
                        {isLoadingStudents ? (
                            <p className="text-xs text-content-muted text-center py-4">{t('loading')}</p>
                        ) : students.length === 0 ? (
                            <p className="text-xs text-content-muted text-center py-4">{t('no_students_found')}</p>
                        ) : (
                            students.map((student) => (
                                <label key={student.id} className="flex items-center gap-2 text-xs select-none cursor-pointer hover:bg-app-hover p-1 rounded">
                                    <input
                                        type="checkbox"
                                        checked={selectedStudentIds.includes(student.id)}
                                        onChange={() => toggleStudent(student.id)}
                                        className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary"
                                    />
                                    <span>
                                        #{student.group_number || '-'} {student.name} ({student.process_number})
                                    </span>
                                </label>
                            ))
                        )}
                    </div>
                </div>

                {/* Action Controls */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-app-border">
                    <Button variant="secondary" onClick={onClose} disabled={isExporting}>
                        {t('cancel')}
                    </Button>
                    <Button onClick={handleExport} isLoading={isExporting} disabled={students.length === 0}>
                        {t('confirm_export')}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}