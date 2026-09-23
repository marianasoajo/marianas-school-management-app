import { Loader2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { lessonApi } from '../api/lessonApi'

const QLL_MODULES = {
    toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link']
    ]
}
const QLL_FORMATS = ['bold', 'italic', 'underline', 'strike', 'list', 'ordered', 'link']

export default function LessonFormModal({
    editingLesson,
    filters,
    schoolYears,
    schoolForms,
    onClose,
    onSuccess,
    t
}) {
    const [formData, setFormData] = useState({
        school_year_id: editingLesson?.school_year_id || filters.yearId || '',
        school_form_id: editingLesson?.school_form_id || filters.formId || '',
        subject: editingLesson?.subject || '',
        lesson_number: editingLesson?.lesson_number || '',
        date: editingLesson?.date || filters.date || '',
        summary: editingLesson?.summary || '',
        attention_box: editingLesson?.attention_box || '',
        teacher_notes: editingLesson?.teacher_notes || ''
    })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)

    const availableSubjects = [t("hgp"), t("por"), t("eng")]

    useEffect(() => {
        if (!editingLesson && filters.yearId && filters.formId && !formData.lesson_number) {
            lessonApi.getNextLessonNumber(filters.yearId, filters.formId).then((nextNum) => {
                setFormData((prev) => ({ ...prev, lesson_number: nextNum }))
            })
        }
    }, [editingLesson, filters, formData.lesson_number])

    const handleSubmit = async () => {
        setSaving(true)
        setError(null)
        try {
            const result = await lessonApi.saveLesson(formData, editingLesson?.id)
            onSuccess(result)
        } catch (err) {
            setError(err.message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">
                        {editingLesson ? t('edit_lesson') : t('create_lesson')}
                    </h2>
                    <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700 rounded transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="px-6 py-4 space-y-4">
                    {error && <div className="p-3 text-sm text-red-700 bg-red-50 rounded">{error}</div>}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('academic_year')} *</label>
                            <select
                                value={formData.school_year_id}
                                onChange={(e) => setFormData({ ...formData, school_year_id: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">— {t('select_year')} —</option>
                                {schoolYears.map((year) => (
                                    <option key={year.id} value={year.id}>{year.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('group')} *</label>
                            <select
                                value={formData.school_form_id}
                                onChange={(e) => setFormData({ ...formData, school_form_id: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">— {t('select_group')} —</option>
                                {schoolForms.map((form) => (
                                    <option key={form.id} value={form.id}>{form.year_level} {form.class_section}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('subject')} *</label>
                            <select
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">— {t('select_subject')} —</option>
                                {availableSubjects.map((subject) => (
                                    <option key={subject} value={subject}>{subject}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('lesson_number')} *</label>
                            <input
                                type="text"
                                value={formData.lesson_number}
                                onChange={(e) => setFormData({ ...formData, lesson_number: e.target.value })}
                                placeholder="13 ou 13 e 14"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('date')} *</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('summary')}</label>
                        <ReactQuill
                            value={formData.summary}
                            onChange={(c) => setFormData({ ...formData, summary: c })}
                            modules={QLL_MODULES}
                            formats={QLL_FORMATS}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('attention')}</label>
                        <ReactQuill
                            value={formData.attention_box}
                            onChange={(c) => setFormData({ ...formData, attention_box: c })}
                            modules={QLL_MODULES}
                            formats={QLL_FORMATS}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('teacher_notes')}</label>
                        <ReactQuill
                            value={formData.teacher_notes}
                            onChange={(c) => setFormData({ ...formData, teacher_notes: c })}
                            modules={QLL_MODULES}
                            formats={QLL_FORMATS}
                        />
                    </div>
                </div>

                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                        {t('cancel')}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {saving && <Loader2 className="animate-spin" size={16} />}
                        {editingLesson ? t('update_lesson') : t('create_lesson')}
                    </button>
                </div>
            </div>
        </div>
    )
}