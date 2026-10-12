import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'

export default function YearModal({ isOpen, onClose, onSave, year = null }) {
    const { t } = useTranslation()
    const [isSaving, setIsSaving] = useState(false)

    const [formData, setFormData] = useState({
        label: year?.label || '2026/2027',
        start_date: year?.start_date || '',
        end_date: year?.end_date || '',
        is_active: year?.is_active || false
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
            title={year ? t('edit_academic_year') : t('add_academic_year')}
            maxWidth="max-w-md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label={t('year_label')}
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="e.g. 2026/2027"
                    required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                        type="date"
                        label={t('start_date')}
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                    <Input
                        type="date"
                        label={t('end_date')}
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                </div>

                <label className="flex items-center gap-2.5 pt-1 text-sm font-medium cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary"
                    />
                    <span>{t('active_year')}</span>
                </label>

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