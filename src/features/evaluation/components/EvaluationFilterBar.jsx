import { Calendar, Filter, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Input from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'

export default function EvaluationFilterBar({
    years = [],
    forms = [],
    students = [],
    filters,
    onFilterChange,
    onReset
}) {
    const { t } = useTranslation()
    const [useRange, setUseRange] = useState(false)

    // Extract unique Year Levels (e.g., '9º Ano', '8º Ano')
    const levels = Array.from(new Set(forms.map((f) => f.year_level).filter(Boolean)))

    const yearOptions = [{ value: '', label: t('all_years') }, ...years.map((y) => ({ value: y.id, label: y.label }))]
    const levelOptions = [{ value: '', label: 'Todos os Níveis' }, ...levels.map((l) => ({ value: l, label: l }))]

    const filteredForms = filters.level
        ? forms.filter((f) => f.year_level === filters.level)
        : forms

    const formOptions = [{ value: '', label: t('all_groups') }, ...filteredForms.map((f) => ({ value: f.id, label: `${f.year_level} - ${f.class_section}` }))]
    const studentOptions = [{ value: '', label: t('all_students') }, ...students.map((s) => ({ value: s.id, label: `${s.name} (${s.process_number})` }))]

    return (
        <div className="bg-app-hover/50 p-4 rounded-2xl border border-app-border space-y-3 mb-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase text-brand-primary">
                    <Filter className="w-4 h-4" />
                    <span>Filtros de Avaliação</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setUseRange(!useRange)}
                        className="text-xs text-brand-primary font-medium hover:underline flex items-center gap-1"
                    >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{useRange ? t('single_date') : t('date_range')}</span>
                    </button>
                    <button
                        type="button"
                        onClick={onReset}
                        className="text-xs text-content-muted hover:text-content-main flex items-center gap-1"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{t('clear_filters')}</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Select
                    label={t('academic_year')}
                    value={filters.yearId}
                    onChange={(e) => onFilterChange({ ...filters, yearId: e.target.value })}
                    options={yearOptions}
                />

                <Select
                    label={t('level')}
                    value={filters.level}
                    onChange={(e) => onFilterChange({ ...filters, level: e.target.value, formId: '' })}
                    options={levelOptions}
                />

                <Select
                    label={t('group')}
                    value={filters.formId}
                    onChange={(e) => onFilterChange({ ...filters, formId: e.target.value })}
                    options={formOptions}
                />

                <Select
                    label={t('students')}
                    value={filters.studentId}
                    onChange={(e) => onFilterChange({ ...filters, studentId: e.target.value })}
                    options={studentOptions}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-app-border/40">
                {!useRange ? (
                    <Input
                        type="date"
                        label={t('date')}
                        value={filters.startDate}
                        onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value, endDate: e.target.value })}
                    />
                ) : (
                    <>
                        <Input
                            type="date"
                            label={t('start_date')}
                            value={filters.startDate}
                            onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
                        />
                        <Input
                            type="date"
                            label={t('end_date')}
                            value={filters.endDate}
                            onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
                        />
                    </>
                )}
            </div>
        </div>
    )
}