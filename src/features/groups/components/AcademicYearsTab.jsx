import { CheckCircle2, Edit2, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import IconButton from '../../../components/ui/IconButton'

export default function AcademicYearsTab({
    years = [],
    onOpenCreate,
    onEdit,
    onDelete,
    onSetActive
}) {
    const { t } = useTranslation()

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-content-main">{t('academic_years')}</h3>
                <Button variant="primary" onClick={onOpenCreate} className="gap-2">
                    <Plus className="w-4 h-4" />
                    <span>{t('add_academic_year')}</span>
                </Button>
            </div>

            {years.length === 0 ? (
                <div className="py-8 text-center text-content-muted border border-dashed border-app-border rounded-xl">
                    {t('no_years')}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {years.map((year) => (
                        <Card key={year.id} className="p-4 flex flex-col justify-between gap-3">
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-lg text-content-main">{year.label}</h4>
                                    {year.is_active ? (
                                        <Badge variant="success">{t('active_year')}</Badge>
                                    ) : (
                                        <Badge variant="neutral">{t('year')}</Badge>
                                    )}
                                </div>

                                <div className="text-xs text-content-muted">
                                    {year.start_date && year.end_date ? (
                                        <span>{year.start_date} — {year.end_date}</span>
                                    ) : (
                                        <span className="italic">{t('no_dates') || 'Sem datas definidas'}</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-app-border">
                                {!year.is_active ? (
                                    <Button
                                        variant="ghost"
                                        onClick={() => onSetActive(year.id)}
                                        className="!p-1 text-xs gap-1 text-brand-primary"
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>{t('set_active')}</span>
                                    </Button>
                                ) : (
                                    <div />
                                )}

                                <div className="flex items-center gap-1">
                                    <IconButton variant="ghost" onClick={() => onEdit(year)} title={t('edit_academic_year')}>
                                        <Edit2 className="w-4 h-4" />
                                    </IconButton>
                                    <IconButton
                                        variant="ghost"
                                        onClick={() => onDelete(year.id)}
                                        title={t('delete_academic_year')}
                                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </IconButton>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}