import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../components/ui/Button'
import IconButton from '../../../components/ui/IconButton'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import Select from '../../../components/ui/Select'

export default function EnrolmentModal({ isOpen, onClose, student, years = [], forms = [], onAddEnrolment, onDeleteEnrolment }) {
    const { t } = useTranslation()
    const [selectedYear, setSelectedYear] = useState(years[0]?.id || '')
    const [selectedForm, setSelectedForm] = useState(forms[0]?.id || '')
    const [groupNumber, setGroupNumber] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    const handleAdd = async (e) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            await onAddEnrolment({
                studentId: student.id,
                yearId: selectedYear,
                formId: selectedForm,
                groupNumber
            })
            setGroupNumber('')
        } finally {
            setIsSaving(false)
        }
    }

    const yearOptions = years.map((y) => ({ value: y.id, label: y.label }))
    const formOptions = forms.map((f) => ({ value: f.id, label: `${f.year_level} - ${f.class_section}` }))

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('enrolment_modal_title')} maxWidth="max-w-lg">
            <div className="space-y-4">
                <div className="font-medium text-sm text-content-main">
                    {student?.name} ({student?.process_number})
                </div>

                {/* Existing Enrolments List */}
                <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase text-content-muted">{t('current_enrolment')}</h4>
                    {student?.student_enrolments?.length === 0 ? (
                        <p className="text-xs text-content-muted italic">{t('not_enrolled')}</p>
                    ) : (
                        <div className="space-y-1.5">
                            {student?.student_enrolments?.map((enrol) => (
                                <div key={enrol.id} className="flex items-center justify-between p-2.5 bg-app-hover/50 rounded-xl border border-app-border text-xs">
                                    <div>
                                        <span className="font-semibold text-content-main">
                                            {enrol.school_years?.label} — {enrol.school_forms?.year_level} {enrol.school_forms?.class_section}
                                        </span>
                                        {enrol.group_number && <span className="ml-2 text-content-muted">Nº {enrol.group_number}</span>}
                                    </div>
                                    <IconButton
                                        variant="ghost"
                                        onClick={() => onDeleteEnrolment(enrol.id)}
                                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </IconButton>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Add New Enrolment Form */}
                <form onSubmit={handleAdd} className="p-3 bg-app-hover/30 rounded-xl space-y-3 border border-app-border">
                    <h4 className="text-xs font-semibold uppercase text-brand-primary">{t('enroll_in_year_group')}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Select
                            label={t('academic_year')}
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            options={yearOptions}
                        />
                        <Select
                            label={t('school_form')}
                            value={selectedForm}
                            onChange={(e) => setSelectedForm(e.target.value)}
                            options={formOptions}
                        />
                        <Input
                            label={t('group_number')}
                            value={groupNumber}
                            onChange={(e) => setGroupNumber(e.target.value)}
                            placeholder="Nº"
                        />
                    </div>
                    <Button type="submit" isLoading={isSaving} fullWidth className="!py-2">
                        {t('enroll_student')}
                    </Button>
                </form>

                <div className="flex justify-end pt-2">
                    <Button variant="secondary" onClick={onClose}>
                        {t('close')}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}