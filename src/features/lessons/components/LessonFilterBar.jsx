import { Download, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Button from '../../../components/ui/Button'
import Select from '../../../components/ui/Select'

export default function LessonFilterBar({
    years = [],
    forms = [],
    selectedYear,
    selectedForm,
    onYearChange,
    onFormChange,
    onOpenCreateModal,
    onOpenImportModal
}) {
    const { t } = useTranslation()

    const yearOptions = [
        { value: '', label: t('all_years') },
        ...years.map(y => ({ value: y.id, label: y.label }))
    ]

    const formOptions = [
        { value: '', label: t('all_groups') },
        ...forms.map(f => ({ value: f.id, label: `${f.year_level} - ${f.class_section}` }))
    ]

    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 bg-app-hover/50 p-3 sm:p-4 rounded-xl border border-app-border">
            {/* Dropdown Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 max-w-xl">
                <Select
                    value={selectedYear}
                    onChange={(e) => onYearChange(e.target.value)}
                    options={yearOptions}
                />
                <Select
                    value={selectedForm}
                    onChange={(e) => onFormChange(e.target.value)}
                    options={formOptions}
                />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
                <Button
                    variant="secondary"
                    onClick={onOpenImportModal}
                    className="flex-1 sm:flex-initial gap-2"
                >
                    <Download className="w-4 h-4" />
                    <span>{t('import_summaries')}</span>
                </Button>

                <Button
                    variant="primary"
                    onClick={onOpenCreateModal}
                    className="flex-1 sm:flex-initial gap-2"
                >
                    <Plus className="w-4 h-4" />
                    <span>{t('add_lesson')}</span>
                </Button>
            </div>
        </div>
    )
}