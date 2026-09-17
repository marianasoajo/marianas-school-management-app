import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
  FileText,
  Link as LinkIcon,
  Paperclip,
  StickyNote,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

const SCHOOL_LOGO_URL = 'https://www.esmax.pt/images/logoaemax.png'

export default function LessonPresentation() {
  const { t, i18n } = useTranslation()

  // State
  const [lessons, setLessons] = useState([])
  const [selectedLessonId, setSelectedLessonId] = useState(null)
  const [currentLesson, setCurrentLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // UI state
  const [showTeacherPanel, setShowTeacherPanel] = useState(false)
  const [showNotesModal, setShowNotesModal] = useState(false)

  // Fetch all lessons
  useEffect(() => {
    const fetchLessons = async () => {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('lessons')
        .select('id, lesson_number, date, level_group, subject')
        .order('date', { ascending: false })

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setLessons(data || [])
        if (data && data.length > 0) {
          setSelectedLessonId(data[0].id)
        }
      }
      setLoading(false)
    }
    fetchLessons()
  }, [])

  // Fetch selected lesson details
  useEffect(() => {
    if (!selectedLessonId) return

    const fetchLessonDetails = async () => {
      const { data, error: fetchError } = await supabase
        .from('lessons')
        .select('*')
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

  // Parse step_by_step JSONB (array of {step: string})
  const steps = currentLesson?.step_by_step || []

  // Parse materials JSONB (array of {type: 'upload'|'link', url: string, description: string})
  const materials = currentLesson?.materials || []

  // Format lesson number for display (handles single or double lessons like "13 e 14")
  const formatLessonNumber = (lessonNumber) => {
    if (!lessonNumber) return ''
    const parts = lessonNumber.split(/\s+e\s+/i)
    if (parts.length === 2) {
      return t('lesson_double', { first: parts[0], second: parts[1] })
    }
    return `${t('lesson_single')} ${lessonNumber}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        <Loader2 className="animate-spin mr-2" size={20} />
        {t('loading')}
      </div>
    )
  }

  if (!currentLesson) {
    return (
      <div className="text-center py-12 text-gray-500">
        {t('no_lessons')}
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Error banner */}
      {error && (
        <div className="mb-4 flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Lesson Selector */}
      <div className="mb-6 flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">
          {t('select_lesson')}:
        </label>
        <select
          value={selectedLessonId || ''}
          onChange={(e) => setSelectedLessonId(e.target.value)}
          className="flex-1 max-w-md px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {lessons.map((lesson) => (
            <option key={lesson.id} value={lesson.id}>
              {formatLessonNumber(lesson.lesson_number)} - {lesson.subject} ({lesson.level_group}) - {new Date(lesson.date).toLocaleDateString(i18n.language)}
            </option>
          ))}
        </select>
      </div>

      {/* Public Presentation View (designed for projection) */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-8 shadow-lg">
        {/* School Logo Header */}
        <div className="flex items-center justify-center mb-8">
          <img
            src={SCHOOL_LOGO_URL}
            alt="School Logo"
            className="h-20 object-contain"
          />
        </div>

        {/* Lesson Header Info */}
        <div className="grid grid-cols-2 gap-6 mb-8 text-lg">
          <div>
            <span className="font-semibold text-gray-700">{t('level')}:</span>
            <span className="ml-2 text-gray-900">{currentLesson.level_group}</span>
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

        {/* Step-by-Step Guide (visible when teacher panel is open) */}
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

        {/* Materials & Attachments (visible when teacher panel is open) */}
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

      {/* Floating Teacher Panel Toggle */}
      <button
        onClick={() => setShowTeacherPanel(!showTeacherPanel)}
        className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 text-sm font-medium text-white bg-indigo-600 rounded-full shadow-lg hover:bg-indigo-700 transition-colors z-10"
        aria-label={t('open_teacher_panel')}
      >
        {showTeacherPanel ? <EyeOff size={18} /> : <Eye size={18} />}
        {showTeacherPanel ? t('close') : t('open_teacher_panel')}
      </button>

      {/* Teacher Notes Modal */}
      <button
        onClick={() => setShowNotesModal(true)}
        className="fixed bottom-6 left-6 flex items-center gap-2 px-4 py-3 text-sm font-medium text-white bg-purple-600 rounded-full shadow-lg hover:bg-purple-700 transition-colors z-10"
        aria-label={t('teacher_notes')}
      >
        <StickyNote size={18} />
        {t('teacher_notes')}
      </button>

      {/* Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{t('teacher_notes')}</h2>
              <button
                onClick={() => setShowNotesModal(false)}
                className="p-1 text-gray-500 hover:text-gray-700 rounded transition-colors"
                aria-label={t('close')}
              >
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-4">
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">{formatLessonNumber(currentLesson.lesson_number)}</h3>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">{t('date')}:</span> {new Date(currentLesson.date).toLocaleDateString(i18n.language)}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">{t('summary')}:</span> {currentLesson.summary}
                </p>
                {currentLesson.attention_box && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">{t('attention')}:</span> {currentLesson.attention_box}
                  </p>
                )}
              </div>
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-semibold text-gray-700 mb-2">{t('notes')}:</h4>
                <p className="text-gray-800 whitespace-pre-wrap">
                  {currentLesson.teacher_notes || t('no_units')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Teacher Drawer - Past/Future Summary (overlay when panel is open) */}
      {showTeacherPanel && (
        <div className="fixed top-0 left-0 w-80 h-full bg-white shadow-2xl border-r border-gray-200 overflow-y-auto z-40 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">{t('past_future_summary')}</h3>
            <button
              onClick={() => setShowTeacherPanel(false)}
              className="p-1 text-gray-500 hover:text-gray-700 rounded transition-colors"
              aria-label={t('close')}
            >
              <ChevronLeft size={20} />
            </button>
          </div>
          <div className="space-y-4">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                onClick={() => setSelectedLessonId(lesson.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  lesson.id === selectedLessonId
                    ? 'bg-blue-100 border border-blue-300'
                    : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <p className="text-sm font-semibold text-gray-900">
                  {formatLessonNumber(lesson.lesson_number)}
                </p>
                <p className="text-xs text-gray-600">
                  {new Date(lesson.date).toLocaleDateString(i18n.language)}
                </p>
                <p className="text-xs text-gray-500 mt-1">{lesson.subject}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
