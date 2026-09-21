import { AlertCircle, Loader2, X } from 'lucide-react'
import { useState } from 'react'
import { lessonApi } from '../api/lessonApi'

export default function ImportModal({
    lessons,
    schoolYears,
    schoolForms,
    currentFilters,
    currentLesson,
    onClose,
    onSuccess,
    formatters
}) {
    const { formatLessonNumber, formatDate, t } = formatters

    const [sourceYearId, setSourceYearId] = useState(currentFilters.yearId || '')
    const [sourceFormId, setSourceFormId] = useState(currentFilters.formId || '')
    const [sourceLessonId, setSourceLessonId] = useState(currentLesson?.id || '')
    const [targetFormIds, setTargetFormIds] = useState([])
    const [importing, setImporting] = useState(false)
    const [error, setError] = useState(null)

    const selectedSourceLesson = lessons.find((l) => l.id === sourceLessonId) || (currentLesson?.id === sourceLessonId ? currentLesson : null)

    const handleImport = async () => {
        if (!sourceLessonId || targetFormIds.length === 0) {
            setError(t('select_lesson_and_targets') || 'Please select a source lesson and target groups.')
            return
        }

        setImporting(true)
        setError(null)

        try {
            await lessonApi.importSummaries({ sourceLessonId, targetFormIds })
            onSuccess()
        } catch (err) {
            setError(err.message)
        } finally {
            setImporting(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">{t('import_summaries')}</h2>
                    <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700 rounded transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="px-6 py-4 space-y-4">
                    <p className="text-sm text-gray-600">{t('import_summaries_description')}</p>

                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-700">{t('source_lesson')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <select
                                value={sourceYearId}
                                onChange={(e) => {
                                    setSourceYearId(e.target.value)
                                    setSourceFormId('')
                                    setSourceLessonId('')
                                }}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">{t('select_year')}</option>
                                {schoolYears.map((year) => (
                                    <option key={year.id} value={year.id}>{year.label}</option>
                                ))}
                            </select>

                            <select
                                value={sourceFormId}
                                onChange={(e) => {
                                    setSourceFormId(e.target.value)
                                    setSourceLessonId('')
                                }}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">{t('select_group')}</option>
                                {schoolForms.map((form) => (
                                    <option key={form.id} value={form.id}>{form.year_level} {form.class_section}</option>
                                ))}
                            </select>

                            <select
                                value={sourceLessonId}
                                onChange={(e) => setSourceLessonId(e.target.value)}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                                disabled={!sourceYearId || !sourceFormId}
                            >
                                <option value="">{t('select_lesson')}</option>
                                {lessons
                                    .filter((l) => l.school_year_id === sourceYearId && l.school_form_id === sourceFormId)
                                    .map((l) => (
                                        <option key={l.id} value={l.id}>
                                            {formatLessonNumber(l.lesson_number)} - {l.subject}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                            {selectedSourceLesson ? (
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {formatLessonNumber(selectedSourceLesson.lesson_number)} - {selectedSourceLesson.subject}
                                    </p>
                                    <p className="text-xs text-gray-500">{formatDate(selectedSourceLesson.date)}</p>
                                    <button
                                        onClick={() => setSourceLessonId('')}
                                        className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                                    >
                                        {t('clear') || 'Clear'}
                                    </button>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">{t('no_source_lesson') || 'Select a source group and lesson above'}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-700">{t('target_groups')}</h3>
                        <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
                            {schoolForms
                                .filter((form) => form.id !== sourceFormId)
                                .map((form) => (
                                    <label key={form.id} className="flex items-center gap-2 py-1 hover:bg-gray-50 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={targetFormIds.includes(form.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setTargetFormIds([...targetFormIds, form.id])
                                                } else {
                                                    setTargetFormIds(targetFormIds.filter((id) => id !== form.id))
                                                }
                                            }}
                                            className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm text-gray-700">{form.year_level} {form.class_section}</span>
                                    </label>
                                ))}
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}
                </div>

                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                        {t('cancel')}
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={importing || !sourceLessonId || targetFormIds.length === 0}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                        {importing && <Loader2 className="animate-spin" size={16} />}
                        {t('import')}
                    </button>
                </div>
            </div>
        </div>
    )
}