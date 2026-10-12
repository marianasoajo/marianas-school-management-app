import { Edit2, Plus, Trash2, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import IconButton from '../../../components/ui/IconButton'

export default function SchoolFormsTab({
    forms = [],
    onOpenCreate,
    onEdit,
    onDelete
}) {
    const { t } = useTranslation()

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-content-main">{t('school_forms')}</h3>
                <Button variant="primary" onClick={onOpenCreate} className="gap-2">
                    <Plus className="w-4 h-4" />
                    <span>{t('add_school_form')}</span>
                </Button>
            </div>

            {forms.length === 0 ? (
                <div className="py-8 text-center text-content-muted border border-dashed border-app-border rounded-xl">
                    {t('no_forms')}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {forms.map((form) => (
                        <Card key={form.id} className="p-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-base text-content-main">{form.year_level}</h4>
                                    <Badge variant="primary">{form.class_section}</Badge>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                <IconButton variant="ghost" onClick={() => onEdit(form)} title={t('edit_school_form')}>
                                    <Edit2 className="w-4 h-4" />
                                </IconButton>
                                <IconButton
                                    variant="ghost"
                                    onClick={() => onDelete(form.id)}
                                    title={t('delete_school_form')}
                                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </IconButton>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}