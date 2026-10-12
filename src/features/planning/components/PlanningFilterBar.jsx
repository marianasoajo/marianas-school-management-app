import { Plus, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'

export default function PlanningFilterBar({
    years = [],
    selectedYear,
    onYearChange,
    searchQuery,
    onSearchChange,
    onOpenCreateModal
}) {
    const { t } = useTranslation()

    const yearOptions = [
        { value: '', label: t('all_years') },
        ...years.map(y => ({ value: y.id, label: y.label }))
    ]

    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 bg-app-hover/50 p-3 sm:p-4 rounded-xl border border-app-border">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 max-w-xl">
                <Select
                    value={selectedYear}
                    onChange={(e) => onYearChange(e.target.value)}
                    options={yearOptions}
                />
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder={t('search_theme_placeholder')}
                        className="pl-9"
                    />
                </div>
            </div>

            <Button
                variant="primary"
                onClick={onOpenCreateModal}
                className="gap-2"
            >
                <Plus className="w-4 h-4" />
                <span>{t('add_theme')}</span>
            </Button>
        </div>
    )
}