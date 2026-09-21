import {
  AlertCircle,
  ClipboardCheck,
  Copy,
  Edit,
  Eye,
  Filter,
  Loader2,
  Plus,
  StickyNote,
  Trash2,
  X
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useFormatters } from '../../utils/formatters'
import OralEvaluation from '../evaluation/OralEvaluation'

export default function LessonPresentation({ session }) {
  const { formatLessonNumber, formatDate, t } = useFormatters()

  // Data state
  const [lessons, setLessons] = useState([])
  const [schoolYears, setSchoolYears] = useState([])
  const [schoolForms, setSchoolForms] = useState([])
  const [selectedLessonId, setSelectedLessonId] = useState(null)
  const [currentLesson, setCurrentLesson] = useState(null)
  const [showStudentView, setShowStudentView] = useState(false)

  // Filter state
  const [filterYearId, setFilterYearId] = useState('')
  const [filterFormId, setFilterFormId] = useState('')
  const [filterDate, setFilterDate] = useState('')

  // UI state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [showLessonModal, setShowLessonModal] = useState(false)
  const [showEvaluationModal, setShowEvaluationModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [evaluationLessonId, setEvaluationLessonId] = useState(null)
  const [editingLesson, setEditingLesson] = useState(null)

  // Import state
  const [importSourceYearId, setImportSourceYearId] = useState('')
  const [importSourceFormId, setImportSourceFormId] = useState('')
  const [importSourceLessonId, setImportSourceLessonId] = useState('')
  const [importSourceLesson, setImportSourceLesson] = useState(null)
  const [importTargetFormIds, setImportTargetFormIds] = useState([])
  const [importing, setImporting] = useState(false)
  const [importPreview, setImportPreview] = useState([])

  // Form state
  const [formData, setFormData] = useState({
    school_year_id: '',
    school_form_id: '',
    subject: '',
    lesson_number: '',
    date: '',
    summary: '',
    attention_box: '',
    teacher_notes: ''
  })

  // Fetch school years and forms on mount
  useEffect(() => {
    if (!session) return
    const fetchMetadata = async () => {
      const [yearsRes, formsRes] = await Promise.all([
        supabase.from('school_years').select('*').order('label', { ascending: false }),
        supabase.from('school_forms').select('*').order('year_level, class_section')
      ])

      if (yearsRes.data) setSchoolYears(yearsRes.data)
      if (formsRes.data) setSchoolForms(formsRes.data)
    }
    fetchMetadata()
  }, [session])

  // Fetch filtered lessons
  useEffect(() => {
    if (!session) return
    fetchLessons()
  }, [filterYearId, filterFormId, filterDate, session])

  // Fetch lessons for import source when year or form changes
  useEffect(() => {
    if (!importSourceYearId || !importSourceFormId) {
      setImportSourceLessonId('')
      setImportSourceLesson(null)
      return
    }

    const fetchImportSourceLessons = async () => {
      try {
        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .eq('school_year_id', importSourceYearId)
          .eq('school_form_id', importSourceFormId)
          .order('lesson_number', { ascending: true })

        if (error) throw error
        // Lessons are fetched in the main fetchLessons and stored in lessons state
        // We don't need to store them separately, just ensure we have the right lesson selected
        if (importSourceLessonId && lessons.length > 0) {
          const lesson = lessons.find(l => l.id === importSourceLessonId)
          if (lesson) {
            setImportSourceLesson(lesson)
          }
        }
      } catch (err) {
        console.error('Error fetching import source lessons:', err)
      }
    }

    fetchImportSourceLessons()
  }, [importSourceYearId, importSourceFormId, lessons])

  const fetchLessons = async () => {
    if (!session) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)

    let query = supabase
      .from('lessons')
      .select(`
        *,
        school_years (label),
        school_forms (year_level, class_section)
      `)
      .order('date', { ascending: true })

    if (filterYearId) query = query.eq('school_year_id', filterYearId)
    if (filterFormId) query = query.eq('school_form_id', filterFormId)
    if (filterDate) query = query.eq('date', filterDate)

    const { data, error: fetchError } = await query

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setLessons(data || [])
      if (data && data.length > 0 && !selectedLessonId) {
        setSelectedLessonId(data[0].id)
      }
    }
    setLoading(false)
  }

  // Fetch selected lesson details
  useEffect(() => {
    if (!selectedLessonId) return

    const fetchLessonDetails = async () => {
      const { data, error: fetchError } = await supabase
        .from('lessons')
        .select(`
          *,
          school_years (label),
          school_forms (year_level, class_section)
        `)
        .eq('id', selectedLessonId)
        .single()

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setCurrentLesson(data)
      }
    }
    fetchLessonDetails()
  }, [selectedLessonId])

  // Open create/edit modal
  const openLessonModal = async (lesson = null) => {
    if (lesson) {
      setEditingLesson(lesson)
      setFormData({
        school_year_id: lesson.school_year_id,
        school_form_id: lesson.school_form_id,
        subject: lesson.subject,
        lesson_number: lesson.lesson_number,
        date: lesson.date,
        summary: lesson.summary || '',
        attention_box: lesson.attention_box || '',
        teacher_notes: lesson.teacher_notes || ''
      })
    } else {
      // Auto-calculate next lesson number
      let nextLessonNumber = '1'
      if (filterYearId && filterFormId) {
        const { data } = await supabase
          .from('lessons')
          .select('lesson_number')
          .eq('school_year_id', filterYearId)
          .eq('school_form_id', filterFormId)
          .order('lesson_number', { ascending: false })
          .limit(1)

        if (data && data.length > 0) {
          const lastNumber = data[0].lesson_number
          const match = lastNumber.match(/(\d+)/)
          if (match) {
            nextLessonNumber = String(parseInt(match[1]) + 1)
          }
        }
      }

      setEditingLesson(null)
      setFormData({
        school_year_id: filterYearId || '',
        school_form_id: filterFormId || '',
        subject: '',
        lesson_number: nextLessonNumber,
        date: filterDate || '',
        summary: '',
        attention_box: '',
        teacher_notes: ''
      })
    }
    setShowLessonModal(true)
  }

  // Save lesson (create or update)
  const handleSaveLesson = async () => {
    setError(null)

    if (editingLesson) {
      const { error: updateError } = await supabase
        .from('lessons')
        .update(formData)
        .eq('id', editingLesson.id)

      if (updateError) {
        setError(updateError.message)
      } else {
        setShowLessonModal(false)
        fetchLessons()
      }
    } else {
      const { data, error: insertError } = await supabase
        .from('lessons')
        .insert(formData)
        .select()
        .single()

      if (insertError) {
        setError(insertError.message)
      } else {
        setShowLessonModal(false)
        setSelectedLessonId(data.id)
        fetchLessons()
      }
    }
  }

  // Delete lesson and renumber subsequent lessons
  const handleDeleteLesson = async (lessonId) => {
    if (!confirm(t('confirm_delete'))) return

    try {
      // Get the lesson being deleted to know which year/form/number
      const { data: lessonToDelete, error: fetchError } = await supabase
        .from('lessons')
        .select('lesson_number, school_year_id, school_form_id')
        .eq('id', lessonId)
        .single()

      if (fetchError) {
        setError(fetchError.message)
        return
      }

      // Extract the numeric lesson number
      const match = lessonToDelete.lesson_number.match(/(\d+)/)
      if (!match) {
        // If lesson number doesn't contain a number, just delete
        const { error: deleteError } = await supabase
          .from('lessons')
          .delete()
          .eq('id', lessonId)

        if (deleteError) {
          setError(deleteError.message)
        } else {
          if (selectedLessonId === lessonId) {
            setSelectedLessonId(null)
            setCurrentLesson(null)
          }
          fetchLessons()
        }
        return
      }

      const deletedNumber = parseInt(match[1])

      // Delete the lesson
      const { error: deleteError } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId)

      if (deleteError) {
        setError(deleteError.message)
        return
      }

      // Get all lessons with higher numbers in the same year/form
      const { data: subsequentLessons, error: fetchSubsequentError } = await supabase
        .from('lessons')
        .select('id, lesson_number')
        .eq('school_year_id', lessonToDelete.school_year_id)
        .eq('school_form_id', lessonToDelete.school_form_id)

      if (fetchSubsequentError) {
        setError(fetchSubsequentError.message)
        if (selectedLessonId === lessonId) {
          setSelectedLessonId(null)
          setCurrentLesson(null)
        }
        fetchLessons()
        return
      }

      // Renumber lessons that come after the deleted one
      const updates = subsequentLessons
        .map(lesson => {
          const lessonMatch = lesson.lesson_number.match(/(\d+)/)
          if (!lessonMatch) return null
          const lessonNum = parseInt(lessonMatch[1])
          if (lessonNum > deletedNumber) {
            return {
              id: lesson.id,
              new_number: String(lessonNum - 1)
            }
          }
          return null
        })
        .filter(Boolean)

      // Update each lesson's number
      for (const update of updates) {
        await supabase
          .from('lessons')
          .update({ lesson_number: update.new_number })
          .eq('id', update.id)
      }

      if (selectedLessonId === lessonId) {
        setSelectedLessonId(null)
        setCurrentLesson(null)
      }
      fetchLessons()
    } catch (err) {
      setError(err.message)
    }
  }

  // Open evaluation modal for a specific lesson
  const openEvaluationModal = (lessonId) => {
    setEvaluationLessonId(lessonId)
    setShowEvaluationModal(true)
  }

  // Close evaluation modal
  const closeEvaluationModal = () => {
    setShowEvaluationModal(false)
    setEvaluationLessonId(null)
  }

  const steps = currentLesson?.step_by_step || []
  const materials = currentLesson?.materials || []

  if (loading && lessons.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        <Loader2 className="animate-spin mr-2" size={20} />
        {t('loading')}
      </div>
    )
  }

  return (
    <div className="relative space-y-6">
      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={16} className="text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-700">{t('filter_by_date')}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            value={filterYearId}
            onChange={(e) => setFilterYearId(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{t('all_years')}</option>
            {schoolYears.map((year) => (
              <option key={year.id} value={year.id}>
                {year.label}
              </option>
            ))}
          </select>

          <select
            value={filterFormId}
            onChange={(e) => setFilterFormId(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{t('all_groups')}</option>
            {schoolForms.map((form) => (
              <option key={form.id} value={form.id}>
                {form.year_level} {form.class_section}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          <button
            onClick={() => openLessonModal()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            {t('add_lesson')}
          </button>
          <button
            onClick={() => {
              // Set import source to current filters
              setImportSourceYearId(filterYearId)
              setImportSourceFormId(filterFormId)
              // Set import source to selected lesson
              setImportSourceLessonId(selectedLessonId)
              setImportSourceLesson(currentLesson)
              // Reset target forms
              setImportTargetFormIds([])
              // Show import modal
              setShowImportModal(true)
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
          >
            <Copy size={16} />
            {t('import_summaries')}
          </button>
        </div>
      </div>

      {/* Teacher View - Lesson List (Default View) */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">{t('past_future_summary')}</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {lessons.length === 0 ? (
            <div className="p-8 text-center text-gray-500">{t('no_lessons')}</div>
          ) : (
            lessons.map((lesson) => {
              const yearLabel = lesson.school_years?.label || ''
              const formLabel = lesson.school_forms
                ? `${lesson.school_forms.year_level} ${lesson.school_forms.class_section}`
                : ''
              const hasNotes = lesson.teacher_notes && lesson.teacher_notes.trim().length > 0

              return (
                <div
                  key={lesson.id}
                  className={`border-b border-gray-200 last:border-0 transition-colors ${lesson.id === selectedLessonId ? 'bg-blue-50' : ''
                    }`}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      {/* Lesson Info - clickable to expand */}
                      <div
                        onClick={() => setSelectedLessonId(lesson.id === selectedLessonId ? null : lesson.id)}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-base font-bold text-gray-900">
                            {formatLessonNumber(lesson.lesson_number)}
                          </span>
                          <span className="text-sm text-gray-600">
                            {formatDate(lesson.date)}
                          </span>
                          <span className="text-xs text-gray-500">—</span>
                          {!yearLabel ? '' : <span className="text-xs text-gray-500">{yearLabel}</span>}
                          <span className="text-xs text-gray-500">•</span>
                          {!formLabel ? '' : <span className="text-xs text-gray-500">{formLabel}</span>}
                        </div>

                        {/* Summary - always visible */}
                        {lesson.summary && (
                          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed mb-2 line-clamp-2">
                            {lesson.summary}
                          </p>
                        )}

                        {/* Attention Box - always visible */}
                        {lesson.attention_box && (
                          <div className="mb-2 p-2 bg-yellow-50 border-l-3 border-yellow-400 rounded">
                            <p className="text-xs text-yellow-800 line-clamp-2">
                              ⚠️ {lesson.attention_box}
                            </p>
                          </div>
                        )}

                        {/* Notes - only for selected lesson */}
                        {lesson.id === selectedLessonId && hasNotes && (
                          <div className="flex items-start gap-2 mt-2 p-2 bg-purple-50 rounded text-sm">
                            <StickyNote size={14} className="text-purple-600 mt-0.5 flex-shrink-0" />
                            <p className="text-purple-800 whitespace-pre-wrap">{lesson.teacher_notes}</p>
                          </div>
                        )}
                        {lesson.id === selectedLessonId && !hasNotes && (
                          <div className="flex items-start gap-2 mt-2 p-2 bg-gray-50 rounded text-sm text-gray-500">
                            <StickyNote size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                            <p>{t('no_notes')}</p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <button
                          onClick={() => {
                            setCurrentLesson(lesson)
                            setShowStudentView(true)
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                          aria-label={t('student_view')}
                          title={t('student_view')}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => openEvaluationModal(lesson.id)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                          aria-label={t('evaluation')}
                          title={t('evaluation')}
                        >
                          <ClipboardCheck size={16} />
                        </button>
                        <button
                          onClick={() => openLessonModal(lesson)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          aria-label={t('edit_lesson')}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteLesson(lesson.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          aria-label={t('delete_lesson')}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Student Presentation Modal - Full Screen */}
      {showStudentView && currentLesson && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          {/* Close Button */}
          <button
            onClick={() => setShowStudentView(false)}
            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors z-10"
            aria-label={t('close')}
          >
            <X size={24} />
          </button>

          {/* Content - Centered for projection */}
          <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 space-y-8">
            {/* Lesson Number */}
            <div className="w-full max-w-3xl">
              <h1 className="text-5xl font-bold text-gray-900 text-left">
                {formatLessonNumber(currentLesson.lesson_number)}
              </h1>
            </div>

            {/* Date */}
            <div className="w-full max-w-3xl">
              <span className="text-2xl text-gray-600 text-left">
                {formatDate(currentLesson.date)}
              </span>
            </div>

            {/* Summary */}
            {currentLesson.summary && (
              <div className="w-full max-w-3xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-3 text-left">{t('summary')}</h2>
                <p className="text-xl text-gray-800 leading-relaxed whitespace-pre-wrap text-left">
                  {currentLesson.summary}
                </p>
              </div>
            )}

            {/* Attention Box */}
            {currentLesson.attention_box && (
              <div className="w-full max-w-3xl p-6 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <h2 className="text-xl font-bold text-yellow-900 mb-2 text-left">{t('attention')}</h2>
                <p className="text-lg text-yellow-800 whitespace-pre-wrap text-left">
                  {currentLesson.attention_box}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create/Edit Lesson Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingLesson ? t('edit_lesson') : t('create_lesson')}
              </h2>
              <button
                onClick={() => setShowLessonModal(false)}
                className="p-1 text-gray-500 hover:text-gray-700 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('academic_year')} *
                  </label>
                  <select
                    value={formData.school_year_id}
                    onChange={(e) => setFormData({ ...formData, school_year_id: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">— {t('select_lesson')} —</option>
                    {schoolYears.map((year) => (
                      <option key={year.id} value={year.id}>
                        {year.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('group')} *
                  </label>
                  <select
                    value={formData.school_form_id}
                    onChange={(e) => setFormData({ ...formData, school_form_id: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">— {t('select_lesson')} —</option>
                    {schoolForms.map((form) => (
                      <option key={form.id} value={form.id}>
                        {form.year_level} {form.class_section}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('subject')} *
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('lesson_number')} *
                  </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('date')} *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('summary')}
                </label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('attention')}
                </label>
                <textarea
                  value={formData.attention_box}
                  onChange={(e) => setFormData({ ...formData, attention_box: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('teacher_notes')}
                </label>
                <textarea
                  value={formData.teacher_notes}
                  onChange={(e) => setFormData({ ...formData, teacher_notes: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowLessonModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSaveLesson}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                {editingLesson ? t('update_lesson') : t('create_lesson')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Summaries Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{t('import_summaries')}</h2>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1 text-gray-500 hover:text-gray-700 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <p className="text-sm text-gray-600">
                {t('import_summaries_description')}
              </p>

              {/* Source Selection */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">{t('source_lesson')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select
                    value={importSourceYearId}
                    onChange={(e) => {
                      setImportSourceYearId(e.target.value)
                      // Reset form and lesson when year changes
                      setImportSourceFormId('')
                      setImportSourceLessonId('')
                      setImportSourceLesson(null)
                    }}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">{t('select_year')}</option>
                    {schoolYears.map((year) => (
                      <option key={year.id} value={year.id}>
                        {year.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={importSourceFormId}
                    onChange={(e) => {
                      setImportSourceFormId(e.target.value)
                      // Reset lesson when form changes
                      setImportSourceLessonId('')
                      setImportSourceLesson(null)
                    }}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">{t('select_group')}</option>
                    {schoolForms.map((form) => (
                      <option key={form.id} value={form.id}>
                        {form.year_level} {form.class_section}
                      </option>
                    ))}
                  </select>
                  <select
                    value={importSourceLessonId}
                    onChange={(e) => {
                      const lessonId = e.target.value
                      setImportSourceLessonId(lessonId)
                      // Find lesson in current lessons data
                      const lesson = lessons.find(l => l.id === lessonId)
                      setImportSourceLesson(lesson || null)
                    }}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                    disabled={!importSourceYearId || !importSourceFormId}
                  >
                    <option value="">{t('select_lesson')}</option>
                    {lessons
                      .filter(
                        (lesson) =>
                          lesson.school_year_id === importSourceYearId &&
                          lesson.school_form_id === importSourceFormId
                      )
                      .map((lesson) => (
                        <option
                          key={lesson.id}
                          value={lesson.id}
                        >
                          {formatLessonNumber(lesson.lesson_number)} - {lesson.subject}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Source Lesson */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">{t('source_lesson')}</h3>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                  {importSourceLesson ? (
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatLessonNumber(importSourceLesson.lesson_number)} - {importSourceLesson.subject}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(importSourceLesson.date)}</p>
                      <button
                        onClick={() => {
                          setImportSourceLessonId('')
                          setImportSourceLesson(null)
                        }}
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

              {/* Target Selection */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">{t('target_groups')}</h3>
                <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
                  {schoolForms
                    .filter((form) => form.id !== importSourceFormId)
                    .map((form) => (
                      <label key={form.id} className="flex items-center gap-2 py-1 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={importTargetFormIds.includes(form.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setImportTargetFormIds([...importTargetFormIds, form.id])
                            } else {
                              setImportTargetFormIds(importTargetFormIds.filter((id) => id !== form.id))
                            }
                          }}
                          className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">
                          {form.year_level} {form.class_section}
                        </span>
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
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={async () => {
                  if (!importSourceLessonId || importTargetFormIds.length === 0) {
                    setError(t('select_lesson_and_targets') || 'Please select a source lesson and at least one target group.')
                    return
                  }

                  setImporting(true)
                  setError(null)

                  try {
                    // Fetch specific source lesson
                    const { data: sourceLesson, error: fetchError } = await supabase
                      .from('lessons')
                      .select('*')
                      .eq('id', importSourceLessonId)
                      .single()

                    if (fetchError) throw fetchError
                    if (!sourceLesson) throw new Error('Source lesson not found')

                    // Create copies for each target group, using same lesson number
                    const copies = []
                    for (const targetFormId of importTargetFormIds) {
                      const { id, created_at, ...lessonData } = sourceLesson
                      copies.push({
                        ...lessonData,
                        school_form_id: targetFormId,
                        school_year_id: sourceLesson.school_year_id // Keep same year
                      })
                    }

                    // Insert all copies
                    const { error: insertError } = await supabase.from('lessons').insert(copies)

                    if (insertError) throw insertError

                    setShowImportModal(false)
                    setImportTargetFormIds([])
                    setImportSourceLessonId('')
                    setImportSourceLesson(null)
                    fetchLessons()
                  } catch (err) {
                    setError(err.message)
                  } finally {
                    setImporting(false)
                  }
                }}
                disabled={importing || !importSourceLessonId || importTargetFormIds.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {importing && <Loader2 className="animate-spin" size={16} />}
                {t('import')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Notes Modal */}
      {showNotesModal && currentLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{t('teacher_notes')}</h2>
              <button
                onClick={() => setShowNotesModal(false)}
                className="p-1 text-gray-500 hover:text-gray-700 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-4">
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">
                  {formatLessonNumber(currentLesson.lesson_number)}
                </h3>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">{t('date')}:</span>{' '}
                  {formatDate(currentLesson.date)}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">{t('summary')}:</span> {currentLesson.summary}
                </p>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-semibold text-gray-700 mb-2">{t('notes')}:</h4>
                <p className="text-gray-800 whitespace-pre-wrap">
                  {currentLesson.teacher_notes || '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student View FAB */}
      {currentLesson && (
        <button
          onClick={() => setShowStudentView(true)}
          className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 text-sm font-medium text-white bg-green-600 rounded-full shadow-lg hover:bg-green-700 transition-colors z-10"
        >
          <Eye size={18} />
          {t('student_view')}
        </button>
      )}

      {/* Evaluation Modal */}
      {showEvaluationModal && evaluationLessonId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <OralEvaluation
                lessonId={evaluationLessonId}
                onClose={closeEvaluationModal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
