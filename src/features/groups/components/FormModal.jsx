import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'

export default function FormModal({ isOpen, onClose, onSave, form = null }) {
    const { t } = useTranslation()
    const [isSaving, setIsSaving] = useState(false)

    const [formData, setFormData] = useState({
        year_level: form?.year_level || '',
        class_section: form?.class_section || ''
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            await onSave(formData)
            onClose()
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={form ? t('edit_school_form') : t('add_school_form')}
            maxWidth="max-w-md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label={t('year_level')}
                    value={formData.year_level}
                    onChange={(e) => setFormData({ ...formData, year_level: e.target.value })}
                    placeholder="e.g. 9º Ano"
                    required
                />

                <Input
                    label={t('class_section')}
                    value={formData.class_section}
                    onChange={(e) => setFormData({ ...formData, class_section: e.target.value })}
                    placeholder="e.g. Turma A or 5"
                    required
                />

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-app-border">
                    <Button variant="secondary" onClick={onClose} disabled={isSaving}>
                        {t('cancel')}
                    </Button>
                    <Button type="submit" isLoading={isSaving}>
                        {t('save')}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}