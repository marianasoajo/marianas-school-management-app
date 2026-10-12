import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../components/ui/Button'
import IconButton from '../../../components/ui/IconButton'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import Select from '../../../components/ui/Select'

export default function GuardianModal({ isOpen, onClose, student, onAddGuardian, onDetachGuardian }) {
    const { t } = useTranslation()
    const [isSaving, setIsSaving] = useState(false)

    const [guardianData, setGuardianData] = useState({
        name: '',
        phone_number: '',
        email: '',
        relationship: 'Mãe'
    })

    const handleAdd = async (e) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            await onAddGuardian({
                studentId: student.id,
                guardianData
            })
            setGuardianData({ name: '', phone_number: '', email: '', relationship: 'Mãe' })
        } finally {
            setIsSaving(false)
        }
    }

    const relationshipOptions = [
        { value: 'Mãe', label: t('mother') || 'Mãe' },
        { value: 'Pai', label: t('father') || 'Pai' },
        { value: 'Tutor Legal', label: t('legal_guardian') || 'Tutor Legal' },
        { value: 'Outro', label: t('other') || 'Outro' }
    ]

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('guardian_modal_title')} maxWidth="max-w-lg">
            <div className="space-y-4">
                <div className="font-medium text-sm text-content-main">
                    {student?.name}
                </div>

                {/* Existing Guardians */}
                <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase text-content-muted">{t('linked_guardians')}</h4>
                    {student?.student_guardians?.length === 0 ? (
                        <p className="text-xs text-content-muted italic">{t('no_guardians')}</p>
                    ) : (
                        <div className="space-y-1.5">
                            {student?.student_guardians?.map((sg) => (
                                <div key={sg.guardian?.id} className="flex items-center justify-between p-2.5 bg-app-hover/50 rounded-xl border border-app-border text-xs">
                                    <div>
                                        <span className="font-semibold text-content-main">{sg.guardian?.name}</span>
                                        <span className="ml-2 text-brand-primary">({sg.relationship})</span>
                                        {sg.guardian?.phone_number && <div className="text-content-muted">{sg.guardian?.phone_number}</div>}
                                    </div>
                                    <IconButton
                                        variant="ghost"
                                        onClick={() => onDetachGuardian(student.id, sg.guardian?.id)}
                                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </IconButton>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Add Guardian Form */}
                <form onSubmit={handleAdd} className="p-3 bg-app-hover/30 rounded-xl space-y-3 border border-app-border">
                    <h4 className="text-xs font-semibold uppercase text-brand-primary">{t('add_guardian')}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                            label={t('guardian_name')}
                            value={guardianData.name}
                            onChange={(e) => setGuardianData({ ...guardianData, name: e.target.value })}
                            required
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
                    <Button type="submit" isLoading={isSaving} fullWidth className="!py-2">
                        {t('add_guardian')}
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