import { Calendar, Mail, Phone, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'

export default function StudentDetailsModal({ isOpen, onClose, student }) {
    const { t } = useTranslation()

    if (!student) return null

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('student_details')} maxWidth="max-w-md">
            <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-app-hover/50 rounded-2xl border border-app-border">
                    <div className="w-14 h-14 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-xl shrink-0">
                        {student.photo_url ? (
                            <img src={student.photo_url} alt={student.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <User className="w-7 h-7" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-content-main">{student.name}</h3>
                        <span className="text-xs text-content-muted font-mono">{t('process_number')}: {student.process_number}</span>
                    </div>
                </div>

                {student.birthdate && (
                    <div className="flex items-center gap-2 text-xs text-content-muted">
                        <Calendar className="w-4 h-4 text-brand-primary" />
                        <span>{t('birthdate')}: {student.birthdate}</span>
                    </div>
                )}

                {/* Enrolments */}
                <div className="space-y-1.5">
                    <h4 className="text-xs font-semibold uppercase text-content-muted">{t('current_enrolment')}</h4>
                    <div className="flex flex-wrap gap-1.5">
                        {student.student_enrolments?.map((e) => (
                            <Badge key={e.id} variant="primary">
                                {e.school_years?.label} — {e.school_forms?.year_level} {e.school_forms?.class_section} (#{e.group_number || '-'})
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Guardians */}
                <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase text-content-muted">{t('guardians')}</h4>
                    {student.student_guardians?.length === 0 ? (
                        <p className="text-xs text-content-muted italic">{t('no_guardians')}</p>
                    ) : (
                        student.student_guardians?.map((sg) => (
                            <div key={sg.guardian?.id} className="p-3 bg-app-hover/30 rounded-xl border border-app-border space-y-1 text-xs">
                                <div className="font-semibold text-content-main">
                                    {sg.guardian?.name} <span className="text-brand-primary">({sg.relationship})</span>
                                </div>
                                {sg.guardian?.phone_number && (
                                    <div className="flex items-center gap-2 text-content-muted">
                                        <Phone className="w-3.5 h-3.5" />
                                        <span>{sg.guardian.phone_number}</span>
                                    </div>
                                )}
                                {sg.guardian?.email && (
                                    <div className="flex items-center gap-2 text-content-muted">
                                        <Mail className="w-3.5 h-3.5" />
                                        <span>{sg.guardian.email}</span>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <div className="flex justify-end pt-2">
                    <Button variant="secondary" onClick={onClose}>
                        {t('close')}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}