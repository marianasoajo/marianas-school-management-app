// src/features/lessons/components/LessonFormModal.jsx
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import RichTextEditor from '../../../components/ui/RichTextEditor'
import Select from '../../../components/ui/Select'
import { lessonService } from '../../../services/lessonService'

export default function LessonFormModal({
    isOpen,
    onClose,
    onSave,
    lesson = null,
    years = [],
    forms = [],
    initialYearId = '',
    initialFormId = ''
}) {
    const { t } = useTranslation()
    const [isSaving, setIsSaving] = useState(false)

    const [formData, setFormData] = useState({
        school_year_id: lesson?.school_year_id || initialYearId || (years[0]?.id || ''),
        school_form_id: lesson?.school_form_id || initialFormId || (forms[0]?.id || ''),
        subject: lesson?.subject || 'Português',
        lesson_number: lesson?.lesson_number || '1',
        date: lesson?.date || new Date().toISOString().split('T')[0],
        summary: lesson?.summary || '',
        attention_box: lesson?.attention_box || '',
        teacher_notes: lesson?.teacher_notes || ''
    })

    // Auto-suggest next number for preview when creating
    useEffect(() => {
        if (!lesson && formData.school_year_id && formData.school_form_id) {
            lessonService.getNextLessonNumber(formData.school_year_id, formData.school_form_id)
                .then((nextNum) => setFormData((prev) => ({ ...prev, lesson_number: nextNum })))
                .catch(() => { })
        }
    }, [lesson, formData.school_year_id, formData.school_form_id])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            await onSave(formData)
        } finally {
            setIsSaving(false)
        }
    }

    const subjectOptions = [
        { value: 'Português', label: t('por') || 'Português' },
        { value: 'H.G.P', label: t('hgp') || 'H.G.P' },
        { value: 'Inglês', label: t('eng') || 'Inglês' }
    ]

    const yearOptions = years.map((y) => ({ value: y.id, label: y.label }))
    const formOptions = forms.map((f) => ({ value: f.id, label: `${f.year_level} - ${f.class_section}` }))

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={lesson ? t('edit_lesson') : t('add_lesson')}
            maxWidth="max-w-2xl"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                        label={t('academic_year')}
                        value={formData.school_year_id}
                        onChange={(e) => setFormData({ ...formData, school_year_id: e.target.value })}
                        options={yearOptions}
                        required
                    />

                    <Select
                        label={t('school_form')}
                        value={formData.school_form_id}
                        onChange={(e) => setFormData({ ...formData, school_form_id: e.target.value })}
                        options={formOptions}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Select
                        label={t('subject')}
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        options={subjectOptions}
                        required
                    />

                    <Input
                        label={t('lesson_number')}
                        value={formData.lesson_number}
                        onChange={(e) => setFormData({ ...formData, lesson_number: e.target.value })}
                        placeholder="Auto"
                        required
                    />

                    <Input
                        type="date"
                        label={t('date')}
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-content-main mb-1">
                        {t('summary')}
                    </label>
                    <RichTextEditor
                        value={formData.summary}
                        onChange={(val) => setFormData({ ...formData, summary: val })}
                        placeholder={t('summary')}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-content-main mb-1">
                        {t('attention')}
                    </label>
                    <RichTextEditor
                        value={formData.attention_box}
                        onChange={(val) => setFormData({ ...formData, attention_box: val })}
                        placeholder={t('attention')}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-content-main mb-1">
                        {t('teacher_notes')}
                    </label>
                    <RichTextEditor
                        value={formData.teacher_notes}
                        onChange={(val) => setFormData({ ...formData, teacher_notes: val })}
                        placeholder={t('teacher_notes')}
                    />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-app-border">
                    <Button variant="secondary" onClick={onClose} disabled={isSaving}>
                        {t('cancel')}
                    </Button>
                    <Button type="submit" isLoading={isSaving}>
                        {lesson ? t('update_lesson') : t('create_lesson')}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}