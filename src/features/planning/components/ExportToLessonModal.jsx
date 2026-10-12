import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import Select from '../../../components/ui/Select'

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

    const availableFields = [
        { id: 'theme', label: t('themes') },
        { id: 'activities', label: t('activities') },
        { id: 'manual_pages', label: t('manual_pages') },
        { id: 'resources_physical', label: t('resources_physical') },
        { id: 'resources_digital', label: t('resources_digital') },
        { id: 'exercises_physical', label: t('exercises_physical') },
        { id: 'exercises_digital', label: t('exercises_digital') },
        { id: 'registers', label: t('registers') }
    ].filter(f => Boolean(unit?.[f.id]))

    const [selectedFields, setSelectedFields] = useState(availableFields.map(f => f.id))
    const [targetYear, setTargetYear] = useState(unit?.school_year_id || years[0]?.id || '')
    const [targetForm, setTargetForm] = useState(forms[0]?.id || '')
    const [subject, setSubject] = useState('Português')
    const [lessonDate, setLessonDate] = useState(new Date().toISOString().split('T')[0])

    const toggleField = (fieldId) => {
        setSelectedFields(prev =>
            prev.includes(fieldId) ? prev.filter(f => f !== fieldId) : [...prev, fieldId]
        )
    }

    const handleConfirmExport = async () => {
        if (!targetYear || !targetForm || selectedFields.length === 0) {
            setError(t('required_field'))
            return
        }

        setIsExporting(true)
        setError(null)
        try {
            await onExport({
                unit,
                selectedFields,
                yearId: targetYear,
                formId: targetForm,
                subject,
                date: lessonDate
            })
            onClose()
        } catch (err) {
            setError(err.message)
        } finally {
            setIsExporting(false)
        }
    }

    const yearOptions = years.map(y => ({ value: y.id, label: y.label }))
    const formOptions = forms.map(f => ({ value: f.id, label: `${f.year_level} - ${f.class_section}` }))
    const subjectOptions = [
        { value: 'Português', label: t('por') || 'Português' },
        { value: 'H.G.P', label: t('hgp') || 'H.G.P' },
        { value: 'Inglês', label: t('eng') || 'Inglês' }
    ]

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Exportar para Sumário da Lição" maxWidth="max-w-lg">
            <div className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 rounded-lg text-xs">
                        {error}
                    </div>
                )}

                {/* Selected Unit Theme Preview */}
                <div className="p-3 bg-brand-primary-light text-brand-primary rounded-xl text-xs font-semibold">
                    {unit?.theme}
                </div>

                {/* Select Fields to Include */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase text-content-muted">
                            Campos a incluir no Sumário
                        </span>
                        <button
                            type="button"
                            onClick={() => setSelectedFields(
                                selectedFields.length === availableFields.length ? [] : availableFields.map(f => f.id)
                            )}
                            className="text-xs text-brand-primary hover:underline font-medium"
                        >
                            {selectedFields.length === availableFields.length ? t('unselect_all') : t('select_all')}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-app-hover/50 rounded-xl border border-app-border max-h-40 overflow-y-auto">
                        {availableFields.map(field => (
                            <label key={field.id} className="flex items-center gap-2 text-xs cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={selectedFields.includes(field.id)}
                                    onChange={() => toggleField(field.id)}
                                    className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary"
                                />
                                <span>{field.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Target Lesson Details */}
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
                        options={formOptions}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-app-border">
                    <Button variant="secondary" onClick={onClose} disabled={isExporting}>
                        {t('cancel')}
                    </Button>
                    <Button onClick={handleConfirmExport} isLoading={isExporting}>
                        Exportar Lição
                    </Button>
                </div>
            </div>
        </Modal>
    )
}