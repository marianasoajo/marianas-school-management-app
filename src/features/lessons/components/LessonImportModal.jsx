import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import Select from '../../../components/ui/Select'
import { lessonService } from '../../../services/lessonService'

export default function LessonImportModal({ isOpen, onClose, years = [], forms = [], onSuccess }) {
    const { t } = useTranslation()
    const [sourceYear, setSourceYear] = useState(years[0]?.id || '')
    const [sourceForm, setSourceForm] = useState(forms[0]?.id || '')
    const [targetYear, setTargetYear] = useState(years[0]?.id || '')
    const [selectedTargetForms, setSelectedTargetForms] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    const toggleTargetForm = (formId) => {
        setSelectedTargetForms((prev) =>
            prev.includes(formId) ? prev.filter((id) => id !== formId) : [...prev, formId]
        )
    }

    const handleImport = async () => {
        if (!sourceYear || !sourceForm || selectedTargetForms.length === 0) {
            setError(t('select_source_and_targets'))
            return
        }

        setIsLoading(true)
        setError(null)
        try {
            await lessonService.importSummaries({
                sourceYearId: sourceYear,
                sourceFormId: sourceForm,
                targetYearId: targetYear,
                targetFormIds: selectedTargetForms
            })
            onSuccess?.()
            onClose()
        } catch (err) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    const yearOptions = years.map((y) => ({ value: y.id, label: y.label }))
    const formOptions = forms.map((f) => ({ value: f.id, label: `${f.year_level} - ${f.class_section}` }))

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('import_summaries')} maxWidth="max-w-md">
            <div className="space-y-4">
                <p className="text-xs text-content-muted">{t('import_summaries_description')}</p>

                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 rounded-lg text-xs">
                        {error}
                    </div>
                )}

                <div className="p-3 bg-app-hover/50 rounded-xl space-y-3">
                    <h4 className="text-xs font-semibold uppercase text-brand-primary">{t('source_group')}</h4>
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

                <div className="p-3 bg-app-hover/50 rounded-xl space-y-3">
                    <h4 className="text-xs font-semibold uppercase text-brand-primary">{t('target_groups')}</h4>
                    <Select
                        label={t('academic_year')}
                        value={targetYear}
                        onChange={(e) => setTargetYear(e.target.value)}
                        options={yearOptions}
                    />

                    <div className="space-y-2 max-h-40 overflow-y-auto pt-1">
                        {forms
                            .filter((f) => f.id !== sourceForm)
                            .map((f) => (
                                <label key={f.id} className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={selectedTargetForms.includes(f.id)}
                                        onChange={() => toggleTargetForm(f.id)}
                                        className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary"
                                    />
                                    <span>{f.year_level} - {f.class_section}</span>
                                </label>
                            ))}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-app-border">
                    <Button variant="secondary" onClick={onClose} disabled={isLoading}>
                        {t('cancel')}
                    </Button>
                    <Button onClick={handleImport} isLoading={isLoading}>
                        {t('import')}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}