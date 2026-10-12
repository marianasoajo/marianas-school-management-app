import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import RichTextEditor from '../../../components/ui/RichTextEditor'
import Select from '../../../components/ui/Select'

export default function CreateThemeModal({
    isOpen,
    onClose,
    onSave,
    unit = null,
    years = [],
    forms = [],
    initialYearId = ''
}) {
    const { t } = useTranslation()
    const [isSaving, setIsSaving] = useState(false)

    const initialFormIds = unit?.planning_unit_forms?.map(f => f.school_form_id) || []

    const [formData, setFormData] = useState({
        school_year_id: unit?.school_year_id || initialYearId || years[0]?.id || '',
        theme: unit?.theme || '',
        activities: unit?.activities || '',
        manual_pages: unit?.manual_pages || '',
        resources_physical: unit?.resources_physical || '',
        resources_digital: unit?.resources_digital || '',
        exercises_physical: unit?.exercises_physical || '',
        exercises_digital: unit?.exercises_digital || '',
        registers: unit?.registers || ''
    })

    const [selectedForms, setSelectedForms] = useState(initialFormIds)

    const toggleForm = (formId) => {
        setSelectedForms(prev =>
            prev.includes(formId) ? prev.filter(id => id !== formId) : [...prev, formId]
        )
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            await onSave(formData, selectedForms)
            onClose()
        } finally {
            setIsSaving(false)
        }
    }

    const yearOptions = years.map(y => ({ value: y.id, label: y.label }))

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={unit ? t('edit_theme') || 'Editar Tema' : t('add_theme')}
            maxWidth="max-w-3xl"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Select
                    label={t('academic_year')}
                    value={formData.school_year_id}
                    onChange={(e) => setFormData({ ...formData, school_year_id: e.target.value })}
                    options={yearOptions}
                    required
                />

                <Input
                    label={t('themes')}
                    value={formData.theme}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                    placeholder={t('new_theme_placeholder')}
                    required
                />

                <div>
                    <label className="block text-sm font-medium text-content-main mb-1">
                        {t('assign_to_forms')}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-app-hover/50 rounded-xl max-h-36 overflow-y-auto border border-app-border">
                        {forms.map(f => (
                            <label key={f.id} className="flex items-center gap-2 text-xs select-none cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedForms.includes(f.id)}
                                    onChange={() => toggleForm(f.id)}
                                    className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary"
                                />
                                <span>{f.year_level} - {f.class_section}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-content-main mb-1">
                            {t('activities')}
                        </label>
                        <RichTextEditor
                            value={formData.activities}
                            onChange={(val) => setFormData({ ...formData, activities: val })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-content-main mb-1">
                            {t('manual_pages')}
                        </label>
                        <Input
                            value={formData.manual_pages}
                            onChange={(e) => setFormData({ ...formData, manual_pages: e.target.value })}
                            placeholder="Ex: 42-45"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-content-main mb-1">
                            {t('resources_physical')}
                        </label>
                        <Input
                            value={formData.resources_physical}
                            onChange={(e) => setFormData({ ...formData, resources_physical: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-content-main mb-1">
                            {t('resources_digital')}
                        </label>
                        <Input
                            value={formData.resources_digital}
                            onChange={(e) => setFormData({ ...formData, resources_digital: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-content-main mb-1">
                            {t('exercises_physical')}
                        </label>
                        <Input
                            value={formData.exercises_physical}
                            onChange={(e) => setFormData({ ...formData, exercises_physical: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-content-main mb-1">
                            {t('exercises_digital')}
                        </label>
                        <Input
                            value={formData.exercises_digital}
                            onChange={(e) => setFormData({ ...formData, exercises_digital: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-content-main mb-1">
                        {t('registers')}
                    </label>
                    <RichTextEditor
                        value={formData.registers}
                        onChange={(val) => setFormData({ ...formData, registers: val })}
                    />
                </div>

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