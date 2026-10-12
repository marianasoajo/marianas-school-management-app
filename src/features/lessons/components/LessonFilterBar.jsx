import { Calendar, Download, Plus, RotateCcw, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'

export default function LessonFilterBar({
    years = [],
    forms = [],
    filters,
    onFilterChange,
    onOpenCreateModal,
    onOpenImportModal,
    onResetFilters
}) {
    const { t } = useTranslation()

    const yearOptions = [
        { value: '', label: t('all_years') },
        ...years.map((y) => ({ value: y.id, label: y.label }))
    ]

    const formOptions = [
        { value: '', label: t('all_groups') },
        ...forms.map((f) => ({ value: f.id, label: `${f.year_level} - ${f.class_section}` }))
    ]

    const toggleDateMode = () => {
        onFilterChange({
            ...filters,
            dateMode: filters.dateMode === 'single' ? 'range' : 'single',
            date: '',
            startDate: '',
            endDate: ''
        })
    }

    return (
        <div className="bg-app-hover/50 p-4 rounded-2xl border border-app-border space-y-3 mb-6">
            {/* Top Bar Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Dropdowns & Search */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
                        <Input
                            value={filters.searchQuery || ''}
                            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
                            placeholder={t('search')}
                            className="pl-9"
                        />
                    </div>
                    <Select
                        value={filters.yearId}
                        onChange={(e) => onFilterChange({ ...filters, yearId: e.target.value })}
                        options={yearOptions}
                    />
                    <Select
                        value={filters.formId}
                        onChange={(e) => onFilterChange({ ...filters, formId: e.target.value })}
                        options={formOptions}
                    />
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
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

            {/* Date Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-app-border/50">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={toggleDateMode}
                        className="text-xs text-brand-primary font-medium hover:underline flex items-center gap-1.5"
                    >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{filters.dateMode === 'single' ? t('single_date') : t('date_range')}</span>
                    </button>

                    {(filters.date || filters.startDate || filters.endDate || filters.searchQuery) && (
                        <button
                            type="button"
                            onClick={onResetFilters}
                            className="text-xs text-content-muted hover:text-content-main flex items-center gap-1 ml-2"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>{t('clear_filters')}</span>
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {filters.dateMode === 'single' ? (
                        <div className="w-full sm:w-48">
                            <Input
                                type="date"
                                value={filters.date || ''}
                                onChange={(e) => onFilterChange({ ...filters, date: e.target.value })}
                                className="!py-1 text-xs"
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
                            <Input
                                type="date"
                                value={filters.startDate || ''}
                                onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
                                className="!py-1 text-xs"
                                placeholder={t('start_date')}
                            />
                            <Input
                                type="date"
                                value={filters.endDate || ''}
                                onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
                                className="!py-1 text-xs"
                                placeholder={t('end_date')}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}