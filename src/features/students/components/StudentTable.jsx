import { Calendar, Edit2, Eye, Shield, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Badge from '../../../components/ui/Badge'
import Card from '../../../components/ui/Card'
import IconButton from '../../../components/ui/IconButton'

export default function StudentTable({
    students = [],
    onViewDetails,
    onEdit,
    onManageEnrolment,
    onManageGuardians,
    onDelete
}) {
    const { t } = useTranslation()

    if (students.length === 0) {
        return (
            <div className="py-12 text-center text-content-muted border border-dashed border-app-border rounded-xl">
                {t('no_students')}
            </div>
        )
    }

    return (
        <Card className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-app-hover/60 border-b border-app-border text-xs uppercase text-content-muted font-semibold">
                    <tr>
                        <th className="p-3.5">{t('process_number')}</th>
                        <th className="p-3.5">{t('full_name')}</th>
                        <th className="p-3.5">{t('current_group')}</th>
                        <th className="p-3.5">{t('guardians')}</th>
                        <th className="p-3.5 text-right">{t('actions')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-app-border">
                    {students.map((student) => {
                        const currentEnrolment = student.student_enrolments?.[0]
                        const guardianCount = student.student_guardians?.length || 0

                        return (
                            <tr key={student.id} className="hover:bg-app-hover/30 transition-colors">
                                <td className="p-3.5 font-mono text-xs font-semibold text-brand-primary">
                                    {student.process_number}
                                </td>
                                <td className="p-3.5 font-medium text-content-main">
                                    {student.name}
                                </td>
                                <td className="p-3.5">
                                    {currentEnrolment ? (
                                        <Badge variant="primary">
                                            {currentEnrolment.school_forms?.year_level} {currentEnrolment.school_forms?.class_section}
                                            {currentEnrolment.group_number ? ` (#${currentEnrolment.group_number})` : ''}
                                        </Badge>
                                    ) : (
                                        <span className="text-xs text-content-muted italic">{t('not_enrolled')}</span>
                                    )}
                                </td>
                                <td className="p-3.5 text-xs text-content-muted">
                                    {guardianCount > 0 ? (
                                        <span>{student.student_guardians[0]?.guardian?.name} {guardianCount > 1 ? `(+${guardianCount - 1})` : ''}</span>
                                    ) : (
                                        <span className="italic">{t('no_guardians')}</span>
                                    )}
                                </td>
                                <td className="p-3.5 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <IconButton
                                            variant="ghost"
                                            onClick={() => onViewDetails(student)}
                                            title={t('student_details')}
                                        >
                                            <Eye className="w-4 h-4" />
                                        </IconButton>

                                        <IconButton
                                            variant="ghost"
                                            onClick={() => onManageEnrolment(student)}
                                            title={t('enrolment_modal_title')}
                                            className="text-brand-primary"
                                        >
                                            <Calendar className="w-4 h-4" />
                                        </IconButton>

                                        <IconButton
                                            variant="ghost"
                                            onClick={() => onManageGuardians(student)}
                                            title={t('guardian_modal_title')}
                                            className="text-emerald-600"
                                        >
                                            <Shield className="w-4 h-4" />
                                        </IconButton>

                                        <IconButton
                                            variant="ghost"
                                            onClick={() => onEdit(student)}
                                            title={t('edit_student')}
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </IconButton>

                                        <IconButton
                                            variant="ghost"
                                            onClick={() => onDelete(student.id)}
                                            title={t('delete_student')}
                                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </IconButton>
                                    </div>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </Card>
    )
}