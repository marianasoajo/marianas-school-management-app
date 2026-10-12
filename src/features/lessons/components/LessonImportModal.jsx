import { Copy, Layers } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import Select from '../../../components/ui/Select'
import { lessonService } from '../../../services/lessonService'

export default function LessonImportModal({
    isOpen,
    onClose,
    years = [],
    forms = [],
    sourceLesson = null, // Passed when opened directly from a lesson row
    onSuccess
}) {
    const { t } = useTranslation()

    // Origin state
    const [sourceYear, setSourceYear] = useState(sourceLesson?.school_year_id || years[0]?.id || '')
    const [sourceForm, setSourceForm] = useState(sourceLesson?.school_form_id || forms[0]?.id || '')
    const [sourceLessonId, setSourceLessonId] = useState(sourceLesson?.id || '')
    const [sourceLessons, setSourceLessons] = useState([])
    const [loadingSourceLessons, setLoadingSourceLessons] = useState(false)

    // Exportable content field flags
    const [exportContent, setExportContent] = useState({
        summary: true,
        attention_box: true,
        subject: true
    })

    // Destination state
    const [targetYear, setTargetYear] = useState(years[0]?.id || '')
    const [targetForm, setTargetForm] = useState('')
    const [targetMode, setTargetMode] = useState('new') // 'new' | 'existing'
    const [targetLessonId, setTargetLessonId] = useState('')
    const [targetLessons, setTargetLessons] = useState([])
    const [loadingTargetLessons, setLoadingTargetLessons] = useState(false)

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    // Fetch lessons for origin group when source year/form changes
    useEffect(() => {
        if (!sourceForm) return
        if (sourceLesson && sourceLesson.school_form_id === sourceForm) {
            setSourceLessons([sourceLesson])
            setSourceLessonId(sourceLesson.id)
            return
        }

        const fetchSourceLessons = async () => {
            setLoadingSourceLessons(true)
            try {
                const lessons = await lessonService.getLessons({ formId: sourceForm, yearId: sourceYear })
                setSourceLessons(lessons || [])
                if (lessons?.length > 0) {
                    setSourceLessonId((prev) => prev || lessons[0].id)
                }
            } catch (err) {
                console.error('Failed to load source lessons', err)
            } finally {
                setLoadingSourceLessons(false)
            }
        }
        fetchSourceLessons()
    }, [sourceYear, sourceForm, sourceLesson])

    // Fetch lessons for target group when target year/form changes
    useEffect(() => {
        if (!targetForm || targetMode !== 'existing') return

        const fetchTargetLessons = async () => {
            setLoadingTargetLessons(true)
            try {
                const lessons = await lessonService.getLessons({ formId: targetForm, yearId: targetYear })
                setTargetLessons(lessons || [])
            } catch (err) {
                console.error('Failed to load target lessons', err)
            } finally {
                setLoadingTargetLessons(false)
            }
        }
        fetchTargetLessons()
    }, [targetYear, targetForm, targetMode])

    const selectedLessonObj = sourceLessons.find((l) => l.id === sourceLessonId) || sourceLesson

    const toggleField = (field) => {
        setExportContent((prev) => ({ ...prev, [field]: !prev[field] }))
    }

    const handleExport = async () => {
        if (!sourceLessonId) {
            setError(t('select_source_lesson') || 'Please select an origin lesson.')
            return
        }
        if (!targetForm) {
            setError(t('select_target_group') || 'Please select a target group.')
            return
        }
        if (targetMode === 'existing' && !targetLessonId) {
            setError(t('select_target_lesson') || 'Please select a target lesson to update.')
            return
        }
        if (!exportContent.summary && !exportContent.attention_box && !exportContent.subject) {
            setError(t('select_at_least_one_field') || 'Please select at least one content item to export.')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const payload = {
                sourceLessonId,
                targetFormId: targetForm,
                targetYearId: targetYear,
                targetMode, // 'new' or 'existing'
                targetLessonId: targetMode === 'existing' ? targetLessonId : null,
                fields: exportContent
            }

            await lessonService.exportLessonContent(payload)
            onSuccess?.()
            onClose()
        } catch (err) {
            setError(err.message || 'Export failed')
        } finally {
            setIsLoading(false)
        }
    }

    const yearOptions = years.map((y) => ({ value: y.id, label: y.label }))
    const formOptions = forms.map((f) => ({ value: f.id, label: `${f.year_level} - ${f.class_section}` }))
    const sourceLessonOptions = sourceLessons.map((l) => ({
        value: l.id,
        label: `${t('lesson_single')} ${l.lesson_number} (${l.date || t('no_date')}) - ${l.subject || t('no_subject')}`
    }))

    const targetLessonOptions = targetLessons.map((l) => ({
        value: l.id,
        label: `${t('lesson_single')} ${l.lesson_number} (${l.date || t('no_date')})`
    }))

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={sourceLesson ? t('export_lesson_content') || 'Export Lesson Content' : t('import_export_lessons') || 'Lesson Content Transfer'}
            maxWidth="max-w-2xl"
        >
            <div className="space-y-5 text-content-main">
                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl text-xs font-medium">
                        {error}
                    </div>
                )}

                {/* STEP 1: ORIGIN SELECTION */}
                <div className="p-4 bg-app-surface border border-app-border rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase text-brand-primary">
                        <Layers size={16} />
                        <span>1. {t('origin_lesson') || 'Origin Lesson'}</span>
                    </div>

                    {!sourceLesson && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Select
                                label={t('academic_year') || 'Academic Year'}
                                value={sourceYear}
                                onChange={(e) => setSourceYear(e.target.value)}
                                options={yearOptions}
                            />
                            <Select
                                label={t('school_form') || 'Group / Class'}
                                value={sourceForm}
                                onChange={(e) => setSourceForm(e.target.value)}
                                options={formOptions}
                            />
                        </div>
                    )}

                    <Select
                        label={t('select_lesson') || 'Select Lesson'}
                        value={sourceLessonId}
                        onChange={(e) => setSourceLessonId(e.target.value)}
                        options={sourceLessonOptions}
                        disabled={loadingSourceLessons || sourceLessons.length === 0}
                    />

                    {/* Content Preview & Selection */}
                    {selectedLessonObj && (
                        <div className="mt-3 p-3 bg-app-hover/50 rounded-lg space-y-2 text-xs">
                            <span className="font-semibold text-content-muted block uppercase">
                                {t('content_to_export') || 'Content to Export:'}
                            </span>
                            <div className="flex flex-wrap gap-4 pt-1">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={exportContent.subject}
                                        onChange={() => toggleField('subject')}
                                        className="rounded border-app-border text-brand-primary focus:ring-brand-primary"
                                    />
                                    <span>{t('subject') || 'Subject'}</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={exportContent.summary}
                                        onChange={() => toggleField('summary')}
                                        className="rounded border-app-border text-brand-primary focus:ring-brand-primary"
                                    />
                                    <span>{t('summary') || 'Summary'}</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={exportContent.attention_box}
                                        onChange={() => toggleField('attention_box')}
                                        className="rounded border-app-border text-brand-primary focus:ring-brand-primary"
                                    />
                                    <span>{t('attention') || 'Attention Box'}</span>
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                {/* STEP 2: DESTINATION SELECTION */}
                <div className="p-4 bg-app-surface border border-app-border rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase text-brand-primary">
                        <Copy size={16} />
                        <span>2. {t('destination_target') || 'Destination Target'}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Select
                            label={t('target_year') || 'Target Academic Year'}
                            value={targetYear}
                            onChange={(e) => setTargetYear(e.target.value)}
                            options={yearOptions}
                        />
                        <Select
                            label={t('target_group') || 'Target Group / Class'}
                            value={targetForm}
                            onChange={(e) => setTargetForm(e.target.value)}
                            options={[{ value: '', label: t('select_target_year') }, ...formOptions]}
                        />
                    </div>

                    {targetForm && (
                        <div className="space-y-3 pt-2">
                            <div className="flex items-center gap-6 text-sm">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="radio"
                                        name="targetMode"
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
                                        name="targetMode"
                                        value="existing"
                                        checked={targetMode === 'existing'}
                                        onChange={() => setTargetMode('existing')}
                                        className="text-brand-primary focus:ring-brand-primary"
                                    />
                                    <span>{t('update_existing_lesson') || 'Update Existing Lesson'}</span>
                                </label>
                            </div>

                            {targetMode === 'existing' && (
                                <Select
                                    label={t('target_lesson') || 'Select Target Lesson to Overwrite'}
                                    value={targetLessonId}
                                    onChange={(e) => setTargetLessonId(e.target.value)}
                                    options={[{ value: '', label: t('select_target_lesson_placeholder') }, ...targetLessonOptions]}
                                    disabled={loadingTargetLessons}
                                />
                            )}
                        </div>
                    )}
                </div>

                {/* MODAL ACTIONS */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-app-border">
                    <Button variant="secondary" onClick={onClose} disabled={isLoading}>
                        {t('cancel') || 'Cancel'}
                    </Button>
                    <Button onClick={handleExport} isLoading={isLoading}>
                        {t('export') || 'Export Content'}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}