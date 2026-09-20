import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ChevronRight,
  Eye,
  EyeOff,
  FileText,
  Link as LinkIcon,
  Paperclip,
  StickyNote,
  X,
  Loader2,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Filter,
  ClipboardCheck
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import OralEvaluation from '../evaluation/OralEvaluation'

export default function LessonPresentation({ session }) {
  const { t, i18n } = useTranslation()

  // Data state
  const [lessons, setLessons] = useState([])
  const [schoolYears, setSchoolYears] = useState([])
  const [schoolForms, setSchoolForms] = useState([])
  const [selectedLessonId, setSelectedLessonId] = useState(null)
  const [currentLesson, setCurrentLesson] = useState(null)

  // Filter state
  const [filterYearId, setFilterYearId] = useState('')
  const [filterFormId, setFilterFormId] = useState('')
  const [filterDate, setFilterDate] = useState('')

  // UI state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showTeacherPanel, setShowTeacherPanel] = useState(false)
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [showLessonModal, setShowLessonModal] = useState(false)
  const [showEvaluationModal, setShowEvaluationModal] = useState(false)
  const [evaluationLessonId, setEvaluationLessonId] = useState(null)
  const [editingLesson, setEditingLesson] = useState(null)

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
      .order('date', { ascending: false })

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
  const openLessonModal = (lesson = null) => {
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
      setEditingLesson(null)
      setFormData({
        school_year_id: filterYearId || '',
        school_form_id: filterFormId || '',
        subject: '',
        lesson_number: '',
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

  // Delete lesson
  const handleDeleteLesson = async (lessonId) => {
    if (!confirm(t('confirm_delete'))) return

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
  }

  // Format lesson number
  const formatLessonNumber = (lessonNumber) => {
    if (!lessonNumber) return ''
    const parts = lessonNumber.split(/\s+e\s+/i)
    if (parts.length === 2) {
      return t('lesson_double', { first: parts[0], second: parts[1] })
    }
    return `${t('lesson_single')} ${lessonNumber}`
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
            onClick={()=> openLessonModal()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            {t('add_lesson')}
          </button>
        </div>
      </div>

      {/* Lesson List (Teacher Panel) */}
      {showTeacherPanel && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">{t('past_future_summary')}</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {lessons.map((lesson) => {
              const yearLabel = lesson.school_years?.label || ''
              const formLabel = lesson.school_forms
                ? `${lesson.school_forms.year_level} ${lesson.school_forms.class_section}`
                : ''
              return (
                <div
                  key={lesson.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    lesson.id === selectedLessonId
                      ? 'bg-blue-100 border-blue-300'
                      : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div
                      onClick={() => setSelectedLessonId(lesson.id)}
                      className="flex-1 cursor-pointer"
                    >
                      <p className="text-sm font-semibold text-gray-900">
                        {formatLessonNumber(lesson.lesson_number)} - {lesson.subject}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(lesson.date).toLocaleDateString(i18n.language)} • {formLabel} • {yearLabel}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEvaluationModal(lesson.id)}
                        className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                        aria-label={t('evaluation')}
                        title={t('evaluation')}
                      >
                        <ClipboardCheck size={14} />
                      </button>
                      <button
                        onClick={() => openLessonModal(lesson)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        aria-label={t('edit_lesson')}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        aria-label={t('delete_lesson')}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Public Presentation View */}
      {currentLesson ? (
        <div className="bg-white border-2 border-gray-200 rounded-lg p-8 shadow-lg">
          {/* Lesson Header Info */}
          <div className="grid grid-cols-2 gap-6 mb-8 text-lg">
            <div>
              <span className="font-semibold text-gray-700">{t('group')}:</span>
              <span className="ml-2 text-gray-900">
                {currentLesson.school_forms
                  ? `${currentLesson.school_forms.year_level} ${currentLesson.school_forms.class_section}`
                  : '—'}
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">{t('subject')}:</span>
              <span className="ml-2 text-gray-900">{currentLesson.subject}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">{formatLessonNumber(currentLesson.lesson_number)}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">{t('date')}:</span>
              <span className="ml-2 text-gray-900">
                {new Date(currentLesson.date).toLocaleDateString(i18n.language, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>

          {/* Summary */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">{t('summary')}:</h3>
            <p className="text-lg text-gray-800 leading-relaxed whitespace-pre-wrap">
              {currentLesson.summary || '—'}
            </p>
          </div>

          {/* Attention Box */}
          {currentLesson.attention_box && (
            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <h3 className="text-lg font-bold text-yellow-900 mb-2">{t('attention')}:</h3>
              <p className="text-base text-yellow-800 whitespace-pre-wrap">
                {currentLesson.attention_box}
              </p>
            </div>
          )}

          {/* Step-by-Step Guide */}
          {showTeacherPanel && steps.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                <ChevronRight size={20} />
                {t('step_by_step')}
              </h3>
              <ol className="space-y-2 list-decimal list-inside">
                {steps.map((item, idx) => (
                  <li key={idx} className="text-base text-blue-800">
                    {item.step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Materials & Attachments */}
          {showTeacherPanel && materials.length > 0 && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-bold text-green-900 mb-3 flex items-center gap-2">
                <Paperclip size={20} />
                {t('materials')}
              </h3>
              <ul className="space-y-2">
                {materials.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    {item.type === 'upload' ? (
                      <FileText size={16} className="text-green-700" />
                    ) : (
                      <LinkIcon size={16} className="text-green-700" />
                    )}
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base text-green-700 hover:text-green-900 underline"
                    >
                      {item.description || item.url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 bg-white border border-gray-200 rounded-lg">
          {t('no_lessons')}
        </div>
      )}

      {/* Floating Teacher Panel Toggle */}
      <button
        onClick={() => setShowTeacherPanel(!showTeacherPanel)}
        className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 text-sm font-medium text-white bg-indigo-600 rounded-full shadow-lg hover:bg-indigo-700 transition-colors z-10"
      >
        {showTeacherPanel ? <EyeOff size={18} /> : <Eye size={18} />}
        {showTeacherPanel ? t('close') : t('open_teacher_panel')}
      </button>

      {/* Teacher Notes Button */}
      {currentLesson && (
        <button
          onClick={() => setShowNotesModal(true)}
          className="fixed bottom-6 left-6 flex items-center gap-2 px-4 py-3 text-sm font-medium text-white bg-purple-600 rounded-full shadow-lg hover:bg-purple-700 transition-colors z-10"
        >
          <StickyNote size={18} />
          {t('teacher_notes')}
        </button>
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
                  {new Date(currentLesson.date).toLocaleDateString(i18n.language)}
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
