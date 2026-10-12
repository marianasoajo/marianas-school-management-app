import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import Select from '../../../components/ui/Select'

export default function StudentFormModal({
    isOpen,
    onClose,
    onSave,
    student = null,
    years = [],
    forms = [],
    initialYearId = '',
    initialFormId = ''
}) {
    const { t } = useTranslation()
    const [isSaving, setIsSaving] = useState(false)

    const [studentData, setStudentData] = useState({
        process_number: student?.process_number || '',
        name: student?.name || '',
        birthdate: student?.birthdate || ''
    })

    const [enrolmentData, setEnrolmentData] = useState({
        yearId: initialYearId || years[0]?.id || '',
        formId: initialFormId || forms[0]?.id || '',
        groupNumber: ''
    })

    const [guardianData, setGuardianData] = useState({
        name: '',
        phone_number: '',
        email: '',
        relationship: t('mother') || 'Mãe'
    })

    const [showGuardian, setShowGuardian] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            await onSave({
                studentData,
                yearId: enrolmentData.yearId,
                formId: enrolmentData.formId,
                groupNumber: enrolmentData.groupNumber,
                guardianData: showGuardian && guardianData.name ? guardianData : null
            })
            onClose()
        } finally {
            setIsSaving(false)
        }
    }

    const yearOptions = years.map((y) => ({ value: y.id, label: y.label }))
    const formOptions = forms.map((f) => ({ value: f.id, label: `${f.year_level} - ${f.class_section}` }))
    const relationshipOptions = [
        { value: 'Mãe', label: t('mother') || 'Mãe' },
        { value: 'Pai', label: t('father') || 'Pai' },
        { value: 'Tutor Legal', label: t('legal_guardian') || 'Tutor Legal' },
        { value: 'Outro', label: t('other') || 'Outro' }
    ]

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={student ? t('edit_student') : t('add_student_btn')}
            maxWidth="max-w-xl"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Student Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                        label={t('process_number')}
                        value={studentData.process_number}
                        onChange={(e) => setStudentData({ ...studentData, process_number: e.target.value })}
                        placeholder="e.g. 10245"
                        required
                    />
                    <Input
                        label={t('full_name')}
                        value={studentData.name}
                        onChange={(e) => setStudentData({ ...studentData, name: e.target.value })}
                        placeholder="e.g. Ana Silva"
                        required
                    />
                </div>

                <Input
                    type="date"
                    label={t('birthdate')}
                    value={studentData.birthdate}
                    onChange={(e) => setStudentData({ ...studentData, birthdate: e.target.value })}
                />

                {/* Mandatory Enrolment dropdowns for new student */}
                {!student && (
                    <div className="p-3 bg-app-hover/50 rounded-xl space-y-3 border border-app-border">
                        <h4 className="text-xs font-semibold uppercase text-brand-primary">
                            {t('current_enrolment')}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <Select
                                label={t('academic_year')}
                                value={enrolmentData.yearId}
                                onChange={(e) => setEnrolmentData({ ...enrolmentData, yearId: e.target.value })}
                                options={yearOptions}
                                required
                            />
                            <Select
                                label={t('school_form')}
                                value={enrolmentData.formId}
                                onChange={(e) => setEnrolmentData({ ...enrolmentData, formId: e.target.value })}
                                options={formOptions}
                                required
                            />
                            <Input
                                label={t('group_number')}
                                type="number"
                                value={enrolmentData.groupNumber}
                                onChange={(e) => setEnrolmentData({ ...enrolmentData, groupNumber: e.target.value })}
                                placeholder="Nº"
                            />
                        </div>
                    </div>
                )}

                {/* Optional Inline Guardian Information */}
                {!student && (
                    <div className="border-t border-app-border pt-3">
                        <button
                            type="button"
                            onClick={() => setShowGuardian(!showGuardian)}
                            className="text-xs font-semibold text-brand-primary hover:underline"
                        >
                            {showGuardian ? '- Remover Encarregado' : `+ ${t('guardian_optional')}`}
                        </button>

                        {showGuardian && (
                            <div className="mt-3 p-3 bg-app-hover/50 rounded-xl space-y-3 border border-app-border">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <Input
                                        label={t('guardian_name')}
                                        value={guardianData.name}
                                        onChange={(e) => setGuardianData({ ...guardianData, name: e.target.value })}
                                    />
                                    <Select
                                        label={t('relationship')}
                                        value={guardianData.relationship}
                                        onChange={(e) => setGuardianData({ ...guardianData, relationship: e.target.value })}
                                        options={relationshipOptions}
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <Input
                                        label={t('phone_number')}
                                        value={guardianData.phone_number}
                                        onChange={(e) => setGuardianData({ ...guardianData, phone_number: e.target.value })}
                                    />
                                    <Input
                                        type="email"
                                        label={t('email')}
                                        value={guardianData.email}
                                        onChange={(e) => setGuardianData({ ...guardianData, email: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-app-border">
                    <Button variant="secondary" onClick={onClose} disabled={isSaving}>
                        {t('cancel')}
                    </Button>
                    <Button type="submit" isLoading={isSaving}>
                        {student ? t('update_student') : t('create_student')}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}