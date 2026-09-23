import { AlertCircle, CheckSquare, Loader2, PlusCircle, RefreshCw, Square, X } from 'lucide-react'
import { useEffect, useState } from 'react'
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

    // Source selection state
    const [sourceYearId, setSourceYearId] = useState(currentFilters.yearId || '')
    const [sourceFormId, setSourceFormId] = useState(currentFilters.formId || '')
    const [sourceLessonId, setSourceLessonId] = useState(currentLesson?.id || '')

    // Field selection state
    const [fields, setFields] = useState({
        summary: true,
        attention_box: true,
        teacher_notes: false,
        lesson_number: false
    })

    // Import Mode: 'existing' | 'create'
    const [importMode, setImportMode] = useState('existing')

    // Target selection state - Existing mode
    const [targetYearId, setTargetYearId] = useState(currentFilters.yearId || '')
    const [targetFormId, setTargetFormId] = useState('')
    const [targetLessons, setTargetLessons] = useState([])
    const [selectedTargetIds, setSelectedTargetIds] = useState([])

    // Target selection state - Create New mode
    const [newLessonDate, setNewLessonDate] = useState(new Date().toISOString().split('T')[0])
    const [newLessonNumber, setNewLessonNumber] = useState('1')
    const [newLessonSubject, setNewLessonSubject] = useState('')

    const [loadingTargets, setLoadingTargets] = useState(false)
    const [importing, setImporting] = useState(false)
    const [error, setError] = useState(null)

    const selectedSourceLesson =
        lessons.find((l) => l.id === sourceLessonId) ||
        (currentLesson?.id === sourceLessonId ? currentLesson : null)

    const isEverythingSelected =
        fields.summary && fields.attention_box && fields.teacher_notes && fields.lesson_number

    // Toggle all fields ("Import Everything")
    const handleToggleEverything = () => {
        const nextState = !isEverythingSelected
        setFields({
            summary: nextState,
            attention_box: nextState,
            teacher_notes: nextState,
            lesson_number: nextState
        })
    }

    // Fetch target lessons when updating existing lessons
    useEffect(() => {
        if (importMode === 'existing' && targetYearId && targetFormId) {
            setLoadingTargets(true)
            lessonApi
                .fetchLessonsByForm(targetYearId, targetFormId)
                .then((data) => {
                    setTargetLessons(data.filter((l) => l.id !== sourceLessonId))
                    setSelectedTargetIds([])
                })
                .catch((err) => setError(err.message))
                .finally(() => setLoadingTargets(false))
        } else {
            setTargetLessons([])
            setSelectedTargetIds([])
        }
    }, [importMode, targetYearId, targetFormId, sourceLessonId])

    // Auto-fetch next lesson number when creating a new lesson
    useEffect(() => {
        if (importMode === 'create' && targetYearId && targetFormId) {
            lessonApi
                .getNextLessonNumber(targetYearId, targetFormId)
                .then((nextNum) => setNewLessonNumber(nextNum))
                .catch(() => setNewLessonNumber('1'))
        }
    }, [importMode, targetYearId, targetFormId])

    // Sync subject with selected source lesson
    useEffect(() => {
        if (selectedSourceLesson?.subject) {
            setNewLessonSubject(selectedSourceLesson.subject)
        }
    }, [selectedSourceLesson])

    const handleTargetCheck = (id) => {
        setSelectedTargetIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        )
    }

    const handleSelectAllTargets = () => {
        if (selectedTargetIds.length === targetLessons.length) {
            setSelectedTargetIds([])
        } else {
            setSelectedTargetIds(targetLessons.map((l) => l.id))
        }
    }

    const handleImport = async () => {
        if (!sourceLessonId || !selectedSourceLesson) {
            setError(t('select_source_lesson') || 'Please select a source lesson.')
            return
        }

        if (!fields.summary && !fields.attention_box && !fields.teacher_notes && !fields.lesson_number) {
            setError(t('select_at_least_one_field') || 'Please select at least one item to import.')
            return
        }

        setImporting(true)
        setError(null)

        try {
            if (importMode === 'existing') {
                if (selectedTargetIds.length === 0) {
                    setError(t('select_target_lessons') || 'Please select at least one target lesson to update.')
                    setImporting(false)
                    return
                }

                await lessonApi.importToExistingLessons({
                    sourceLessonId,
                    targetLessonIds: selectedTargetIds,
                    fields
                })
            } else {
                // Mode: Create New Lesson
                if (!targetYearId || !targetFormId || !newLessonDate) {
                    setError(t('fill_required_target_fields') || 'Please fill in target year, group, and date.')
                    setImporting(false)
                    return
                }

                const newLessonPayload = {
                    school_year_id: targetYearId,
                    school_form_id: targetFormId,
                    date: newLessonDate,
                    lesson_number: fields.lesson_number
                        ? selectedSourceLesson.lesson_number
                        : newLessonNumber,
                    subject: fields.lesson_number
                        ? selectedSourceLesson.subject
                        : (newLessonSubject || selectedSourceLesson.subject || ''),
                    summary: fields.summary ? (selectedSourceLesson.summary || '') : '',
                    attention_box: fields.attention_box ? (selectedSourceLesson.attention_box || '') : '',
                    teacher_notes: fields.teacher_notes ? (selectedSourceLesson.teacher_notes || '') : ''
                }

                await lessonApi.saveLesson(newLessonPayload)
            }

            onSuccess()
        } catch (err) {
            setError(err.message)
        } finally {
            setImporting(false)
        }
    }

    const isSubmitDisabled =
        importing ||
        !sourceLessonId ||
        (importMode === 'existing' && selectedTargetIds.length === 0) ||
        (importMode === 'create' && (!targetYearId || !targetFormId || !newLessonDate))

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
                    <h2 className="text-xl font-bold text-gray-900">
                        {t('import_summaries') || 'Import Lesson Content'}
                    </h2>
                    <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="px-6 py-5 space-y-6 overflow-y-auto flex-1">
                    {error && (
                        <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                            <AlertCircle size={16} className="flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* SECTION 1: SOURCE LESSON */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            1. {t('source_lesson') || 'Select Source Lesson'}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <select
                                value={sourceYearId}
                                onChange={(e) => {
                                    setSourceYearId(e.target.value)
                                    setSourceFormId('')
                                    setSourceLessonId('')
                                }}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">{t('select_year') || 'Select Year'}</option>
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
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">{t('select_group') || 'Select Group'}</option>
                                {schoolForms.map((form) => (
                                    <option key={form.id} value={form.id}>{form.year_level} {form.class_section}</option>
                                ))}
                            </select>

                            <select
                                value={sourceLessonId}
                                onChange={(e) => setSourceLessonId(e.target.value)}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                disabled={!sourceYearId || !sourceFormId}
                            >
                                <option value="">{t('select_lesson') || 'Select Lesson'}</option>
                                {lessons
                                    .filter((l) => l.school_year_id === sourceYearId && l.school_form_id === sourceFormId)
                                    .map((l) => (
                                        <option key={l.id} value={l.id}>
                                            {formatLessonNumber(l.lesson_number)} - {l.subject} ({formatDate(l.date)})
                                        </option>
                                    ))}
                            </select>
                        </div>

                        {selectedSourceLesson && (
                            <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg text-xs text-blue-900 space-y-1">
                                <p className="font-semibold">{formatLessonNumber(selectedSourceLesson.lesson_number)} - {selectedSourceLesson.subject}</p>
                                <p className="text-blue-700">{formatDate(selectedSourceLesson.date)}</p>
                            </div>
                        )}
                    </div>

                    {/* SECTION 2: WHAT TO IMPORT */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                2. {t('what_to_import') || 'Select Content to Copy'}
                            </h3>
                            <button
                                type="button"
                                onClick={handleToggleEverything}
                                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                {isEverythingSelected ? (t('unselect_all') || 'Deselect All') : (t('import_everything') || 'Import Everything')}
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={fields.summary}
                                    onChange={(e) => setFields({ ...fields, summary: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span>{t('summary') || 'Summary'}</span>
                            </label>

                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={fields.attention_box}
                                    onChange={(e) => setFields({ ...fields, attention_box: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span>{t('attention') || 'Attention Box'}</span>
                            </label>

                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={fields.teacher_notes}
                                    onChange={(e) => setFields({ ...fields, teacher_notes: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span>{t('teacher_notes') || 'Teacher Notes'}</span>
                            </label>

                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={fields.lesson_number}
                                    onChange={(e) => setFields({ ...fields, lesson_number: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span>{t('lesson_number') || 'Lesson Number & Subject'}</span>
                            </label>
                        </div>
                    </div>

                    {/* SECTION 3: TARGET ACTION (UPDATE OR CREATE) */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            3. {t('target_destination') || 'Select Target Destination'}
                        </h3>

                        {/* Mode Selector Tabs */}
                        <div className="flex border-b border-gray-200">
                            <button
                                type="button"
                                onClick={() => setImportMode('existing')}
                                className={`flex items-center gap-2 py-2 px-4 text-xs font-bold border-b-2 transition-colors ${importMode === 'existing'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <RefreshCw size={14} />
                                <span>{t('update_existing_lessons') || 'Update Existing Lesson(s)'}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setImportMode('create')}
                                className={`flex items-center gap-2 py-2 px-4 text-xs font-bold border-b-2 transition-colors ${importMode === 'create'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <PlusCircle size={14} />
                                <span>{t('create_new_lesson') || 'Create New Lesson'}</span>
                            </button>
                        </div>

                        {/* Common Target Year and Group Dropdowns */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <select
                                value={targetYearId}
                                onChange={(e) => {
                                    setTargetYearId(e.target.value)
                                    setTargetFormId('')
                                }}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">{t('select_target_year') || 'Select Target Year'}</option>
                                {schoolYears.map((year) => (
                                    <option key={year.id} value={year.id}>{year.label}</option>
                                ))}
                            </select>

                            <select
                                value={targetFormId}
                                onChange={(e) => setTargetFormId(e.target.value)}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                disabled={!targetYearId}
                            >
                                <option value="">{t('select_target_group') || 'Select Target Group'}</option>
                                {schoolForms.map((form) => (
                                    <option key={form.id} value={form.id}>{form.year_level} {form.class_section}</option>
                                ))}
                            </select>
                        </div>

                        {/* MODE A: UPDATE EXISTING LESSONS */}
                        {importMode === 'existing' && targetFormId && (
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="p-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-xs text-gray-600">
                                    <span>{targetLessons.length} {t('existing_lessons_found') || 'existing lessons found'}</span>
                                    {targetLessons.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={handleSelectAllTargets}
                                            className="font-semibold text-blue-600 hover:text-blue-800"
                                        >
                                            {selectedTargetIds.length === targetLessons.length
                                                ? (t('deselect_all') || 'Deselect All')
                                                : (t('select_all') || 'Select All')}
                                        </button>
                                    )}
                                </div>

                                <div className="max-h-40 overflow-y-auto divide-y divide-gray-100 p-1">
                                    {loadingTargets ? (
                                        <div className="p-4 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                                            <Loader2 size={16} className="animate-spin" />
                                            {t('loading')}
                                        </div>
                                    ) : targetLessons.length === 0 ? (
                                        <div className="p-4 text-center text-xs text-gray-400">
                                            {t('no_lessons_in_target') || 'No existing lessons found in this group.'}
                                        </div>
                                    ) : (
                                        targetLessons.map((lesson) => {
                                            const isChecked = selectedTargetIds.includes(lesson.id)
                                            return (
                                                <div
                                                    key={lesson.id}
                                                    onClick={() => handleTargetCheck(lesson.id)}
                                                    className={`flex items-center gap-3 p-2.5 rounded-md cursor-pointer transition-colors ${isChecked ? 'bg-blue-50' : 'hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {isChecked ? (
                                                        <CheckSquare size={16} className="text-blue-600 flex-shrink-0" />
                                                    ) : (
                                                        <Square size={16} className="text-gray-400 flex-shrink-0" />
                                                    )}
                                                    <div className="min-w-0 flex-1 text-xs">
                                                        <span className="font-bold text-gray-900 mr-2">
                                                            {formatLessonNumber(lesson.lesson_number)}
                                                        </span>
                                                        <span className="text-gray-600 mr-2">{lesson.subject}</span>
                                                        <span className="text-gray-400">({formatDate(lesson.date)})</span>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                            </div>
                        )}

                        {/* MODE B: CREATE NEW LESSON */}
                        {importMode === 'create' && targetFormId && (
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                                            {t('date') || 'Lesson Date'}
                                        </label>
                                        <input
                                            type="date"
                                            value={newLessonDate}
                                            onChange={(e) => setNewLessonDate(e.target.value)}
                                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                                            {t('lesson_number') || 'Lesson Number'}
                                        </label>
                                        <input
                                            type="text"
                                            value={fields.lesson_number ? (selectedSourceLesson?.lesson_number || '') : newLessonNumber}
                                            onChange={(e) => setNewLessonNumber(e.target.value)}
                                            disabled={fields.lesson_number}
                                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:text-gray-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                                        {t('subject') || 'Subject / Title'}
                                    </label>
                                    <input
                                        type="text"
                                        value={fields.lesson_number ? (selectedSourceLesson?.subject || '') : newLessonSubject}
                                        onChange={(e) => setNewLessonSubject(e.target.value)}
                                        disabled={fields.lesson_number}
                                        placeholder={t('enter_subject') || 'Enter subject or title'}
                                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:text-gray-500"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        {t('cancel') || 'Cancel'}
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={isSubmitDisabled}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                    >
                        {importing && <Loader2 className="animate-spin" size={16} />}
                        {importMode === 'create'
                            ? (t('create_and_import') || 'Create & Import')
                            : (t('import') || 'Import Content')}
                    </button>
                </div>
            </div>
        </div>
    )
}