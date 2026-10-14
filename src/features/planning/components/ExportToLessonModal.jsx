import { Copy, Layers } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import Select from '../../../components/ui/Select'
import { lessonService } from '../../../services/lessonService'

export default function ExportToLessonModal({
    isOpen,
    onClose,
    unit,
    years = [],
    forms = [],
    onExport
}) {
    const { t } = useTranslation()
    const [isExporting, setIsExporting] = useState(false)
    const [error, setError] = useState(null)

    // Available non-empty planning unit fields
    const availableFields = [
        { id: 'theme', label: t('themes') || 'Themes' },
        { id: 'activities', label: t('activities') || 'Activities' },
        { id: 'manual_pages', label: t('manual_pages') || 'Manual Pages' },
        { id: 'resources_physical', label: t('resources_physical') || 'Physical Resources' },
        { id: 'resources_digital', label: t('resources_digital') || 'Digital Resources' },
        { id: 'exercises_physical', label: t('exercises_physical') || 'Physical Exercises' },
        { id: 'exercises_digital', label: t('exercises_digital') || 'Digital Exercises' },
        { id: 'registers', label: t('registers') || 'Registers' }
    ].filter((f) => Boolean(unit?.[f.id]))

    // Field selection state
    const [selectedFields, setSelectedFields] = useState(availableFields.map((f) => f.id))

    // Destination state
    const [targetYear, setTargetYear] = useState(unit?.school_year_id || years[0]?.id || '')
    const [targetForm, setTargetForm] = useState(forms[0]?.id || '')
    const [targetMode, setTargetMode] = useState('new') // 'new' | 'existing'
    const [targetLessonId, setTargetLessonId] = useState('')
    const [targetLessons, setTargetLessons] = useState([])
    const [loadingTargetLessons, setLoadingTargetLessons] = useState(false)

    // New lesson details
    const [subject, setSubject] = useState('Português')
    const [lessonDate, setLessonDate] = useState(new Date().toISOString().split('T')[0])

    // Fetch existing target lessons when group changes in 'existing' mode
    useEffect(() => {
        if (!targetForm || targetMode !== 'existing') return

        let isMounted = true
        const fetchTargetLessons = async () => {
            setLoadingTargetLessons(true)
            try {
                const lessons = await lessonService.getLessons({ formId: targetForm, yearId: targetYear })
                if (isMounted) {
                    setTargetLessons(lessons || [])
                }
            } catch (err) {
                console.error('Failed to load target lessons', err)
            } finally {
                if (isMounted) setLoadingTargetLessons(false)
            }
        }

        fetchTargetLessons()
        return () => {
            isMounted = false
        }
    }, [targetYear, targetForm, targetMode])

    const toggleField = (fieldId) => {
        setSelectedFields((prev) =>
            prev.includes(fieldId) ? prev.filter((f) => f !== fieldId) : [...prev, fieldId]
        )
    }

    const handleConfirmExport = async () => {
        if (!targetYear || !targetForm) {
            setError(t('select_target_group') || 'Please select a target group.')
            return
        }
        if (selectedFields.length === 0) {
            setError(t('select_at_least_one_field') || 'Please select at least one field to export.')
            return
        }
        if (targetMode === 'existing' && !targetLessonId) {
            setError(t('select_target_lesson') || 'Please select a target lesson to update.')
            return
        }

        setIsExporting(true)
        setError(null)
        try {
            await onExport({
                unit,
                selectedFields,
                targetYearId: targetYear,
                targetFormId: targetForm,
                targetMode,
                targetLessonId: targetMode === 'existing' ? targetLessonId : null,
                subject: targetMode === 'new' ? subject : undefined,
                date: targetMode === 'new' ? lessonDate : undefined
            })
            onClose()
        } catch (err) {
            setError(err.message || 'Export failed')
        } finally {
            setIsExporting(false)
        }
    }

    const yearOptions = years.map((y) => ({ value: y.id, label: y.label }))
    const formOptions = forms.map((f) => ({ value: f.id, label: `${f.year_level} - ${f.class_section}` }))
    const subjectOptions = [
        { value: 'Português', label: t('por') || 'Português' },
        { value: 'H.G.P', label: t('hgp') || 'H.G.P' },
        { value: 'Inglês', label: t('eng') || 'Inglês' }
    ]
    const targetLessonOptions = targetLessons.map((l) => ({
        value: l.id,
        label: `${t('lesson_single')} ${l.lesson_number} (${l.date || t('no_date')}) - ${l.subject || t('no_subject')}`
    }))

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t('export_planning_unit') || 'Export Planning Unit to Lesson'}
            maxWidth="max-w-2xl"
        >
            <div className="space-y-5 text-content-main">
                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl text-xs font-medium">
                        {error}
                    </div>
                )}

                {/* STEP 1: CONTENT & FIELDS SELECTION */}
                <div className="p-4 bg-app-surface border border-app-border rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase text-brand-primary">
                        <Layers size={16} />
                        <span>1. {t('content_to_export') || 'Content to Export'}</span>
                    </div>

                    {/* Unit Theme Tag */}
                    <div className="p-2.5 bg-brand-primary-light text-brand-primary rounded-lg text-xs font-semibold">
                        {unit?.theme}
                    </div>

                    {/* Fields Checklist */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold uppercase text-content-muted">
                                {t('fields_to_include') || 'Fields to include:'}
                            </span>
                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedFields(
                                        selectedFields.length === availableFields.length
                                            ? []
                                            : availableFields.map((f) => f.id)
                                    )
                                }
                                className="text-brand-primary hover:underline font-medium"
                            >
                                {selectedFields.length === availableFields.length
                                    ? t('unselect_all') || 'Unselect All'
                                    : t('select_all') || 'Select All'}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-app-hover/50 rounded-xl border border-app-border max-h-40 overflow-y-auto">
                            {availableFields.map((field) => (
                                <label key={field.id} className="flex items-center gap-2 text-xs cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={selectedFields.includes(field.id)}
                                        onChange={() => toggleField(field.id)}
                                        className="w-4 h-4 rounded border-app-border text-brand-primary focus:ring-brand-primary"
                                    />
                                    <span>{field.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* STEP 2: DESTINATION SELECTION */}
                <div className="p-4 bg-app-surface border border-app-border rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase text-brand-primary">
                        <Copy size={16} />
                        <span>2. {t('destination_target') || 'Destination Target'}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Select
                            label={t('academic_year')}
                            value={targetYear}
                            onChange={(e) => setTargetYear(e.target.value)}
                            options={yearOptions}
                            required
                        />
                        <Select
                            label={t('school_form')}
                            value={targetForm}
                            onChange={(e) => setTargetForm(e.target.value)}
                            options={[{ value: '', label: t('select_group_placeholder') || '-- Select Group --' }, ...formOptions]}
                            required
                        />
                    </div>

                    {targetForm && (
                        <div className="space-y-3 pt-2">
                            {/* Destination Mode */}
                            <div className="flex items-center gap-6 text-sm">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="radio"
                                        name="planningTargetMode"
                                        value="new"
                                        checked={targetMode === 'new'}
                                        onChange={() => setTargetMode('new')}
                                        className="text-brand-primary focus:ring-brand-primary"
                                    />
                                    <span>{t('create_new_lesson') || 'Create as New Lesson'}</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="radio"
                                        name="planningTargetMode"
                                        value="existing"
                                        checked={targetMode === 'existing'}
                                        onChange={() => setTargetMode('existing')}
                                        className="text-brand-primary focus:ring-brand-primary"
                                    />
                                    <span>{t('update_existing_lesson') || 'Update Existing Lesson'}</span>
                                </label>
                            </div>

                            {/* Mode Specific Inputs */}
                            {targetMode === 'new' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                    <Select
                                        label={t('subject')}
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        options={subjectOptions}
                                        required
                                    />
                                    <Input
                                        type="date"
                                        label={t('date')}
                                        value={lessonDate}
                                        onChange={(e) => setLessonDate(e.target.value)}
                                        required
                                    />
                                </div>
                            ) : (
                                <Select
                                    label={t('target_lesson') || 'Select Target Lesson to Overwrite'}
                                    value={targetLessonId}
                                    onChange={(e) => setTargetLessonId(e.target.value)}
                                    options={[
                                        { value: '', label: t('select_target_lesson_placeholder') || '-- Select Target Lesson --' },
                                        ...targetLessonOptions
                                    ]}
                                    disabled={loadingTargetLessons}
                                />
                            )}
                        </div>
                    )}
                </div>

                {/* MODAL ACTIONS */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-app-border">
                    <Button variant="secondary" onClick={onClose} disabled={isExporting}>
                        {t('cancel')}
                    </Button>
                    <Button onClick={handleConfirmExport} isLoading={isExporting}>
                        {t('export') || 'Export Content'}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}