import { AlertCircle, Loader2, MessageSquare, Save, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useFormatters } from '../../utils/formatters'
import { RATING_LABELS, evaluationApi } from './api/evaluationApi'

function StarRating({ value, onChange, disabled, activeColorClass }) {
  return (
    <div className="flex justify-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange(star)}
          className={`p-1 transition-transform hover:scale-110 ${disabled ? 'opacity-40 cursor-not-allowed hover:scale-100' : ''
            }`}
        >
          <Star
            size={22}
            className={star <= value ? activeColorClass : 'text-gray-300 dark:text-gray-600'}
            fill={star <= value ? 'currentColor' : 'none'}
          />
        </button>
      ))}
    </div>
  )
}

export function OralEvaluation({ lessonId = null, onClose = null }) {
  const { formatLessonNumber, formatDate, t } = useFormatters()

  const [lessons, setLessons] = useState([])
  const [selectedLessonId, setSelectedLessonId] = useState(lessonId)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [studentEvaluations, setStudentEvaluations] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [dirtyIds, setDirtyIds] = useState(new Set())

  useEffect(() => {
    if (lessonId) setSelectedLessonId(lessonId)
  }, [lessonId])

  useEffect(() => {
    let isSubscribed = true
    const fetchLessons = async () => {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('lessons')
        .select(`
          id, lesson_number, date, subject, school_year_id, school_form_id,
          school_years (label), school_forms (year_level, class_section)
        `)
        .order('date', { ascending: false })

      if (!isSubscribed) return
      if (fetchError) setError(fetchError.message)
      else {
        setLessons(data || [])
        if (data && data.length > 0 && !lessonId) setSelectedLessonId(data[0].id)
      }
      setLoading(false)
    }
    fetchLessons()
    return () => { isSubscribed = false }
  }, [lessonId])

  useEffect(() => {
    if (!selectedLessonId) return
    let isSubscribed = true

    const fetchLessonAndStudents = async () => {
      setLoading(true)
      setError(null)

      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select(`*, school_years (label), school_forms (year_level, class_section)`)
        .eq('id', selectedLessonId)
        .single()

      if (!isSubscribed) return
      if (lessonError) {
        setError(lessonError.message)
        setLoading(false)
        return
      }

      setSelectedLesson(lessonData)

      const [enrollmentsRes, evaluationsRes] = await Promise.all([
        supabase
          .from('student_enrollments')
          .select(`group_number, student_id, students (id, process_number, name)`)
          .eq('school_year_id', lessonData.school_year_id)
          .eq('school_form_id', lessonData.school_form_id)
          .order('group_number', { ascending: true }),
        supabase
          .from('evaluations')
          .select('*')
          .eq('lesson_id', selectedLessonId)
      ])

      if (!isSubscribed) return
      if (enrollmentsRes.error || evaluationsRes.error) {
        setError(enrollmentsRes.error?.message || evaluationsRes.error?.message)
        setLoading(false)
        return
      }

      const evaluationsMap = new Map((evaluationsRes.data || []).map((e) => [e.student_id, e]))
      const combined = (enrollmentsRes.data || []).map((enrollment) => {
        const student = enrollment.students
        const existingEval = evaluationsMap.get(student.id)

        return {
          student_id: student.id,
          student_name: student.name,
          process_number: student.process_number,
          group_number: enrollment.group_number,
          evaluation_id: existingEval?.id || null,
          is_attending: existingEval?.is_attending ?? true,
          student_rating: existingEval?.student_rating || 3,
          teacher_rating: existingEval?.teacher_rating || 3,
          notes: existingEval?.notes || ''
        }
      })

      setStudentEvaluations(combined)
      setDirtyIds(new Set())
      setLoading(false)
    }

    fetchLessonAndStudents()
    return () => { isSubscribed = false }
  }, [selectedLessonId])

  const markDirty = (studentId) => setDirtyIds((prev) => new Set(prev).add(studentId))

  const handleAttendanceChange = (evalIndex, isAttending) => {
    setStudentEvaluations((prev) => {
      const updated = [...prev]
      updated[evalIndex] = { ...updated[evalIndex], is_attending: isAttending }
      return updated
    })
    markDirty(studentEvaluations[evalIndex]?.student_id)
  }

  const handleRatingChange = (evalIndex, field, value) => {
    setStudentEvaluations((prev) => {
      const updated = [...prev]
      updated[evalIndex] = { ...updated[evalIndex], [field]: Number(value) }
      return updated
    })
    markDirty(studentEvaluations[evalIndex]?.student_id)
  }

  const handleNotesChange = (evalIndex, text) => {
    setStudentEvaluations((prev) => {
      const updated = [...prev]
      updated[evalIndex] = { ...updated[evalIndex], notes: text }
      return updated
    })
    markDirty(studentEvaluations[evalIndex]?.student_id)
  }

  const handleSave = async () => {
    if (dirtyIds.size === 0) return
    setSaving(true)
    setError(null)

    try {
      const dirtyEvals = studentEvaluations.filter((e) => dirtyIds.has(e.student_id))
      const data = await evaluationApi.upsertEvaluations(dirtyEvals, selectedLessonId)

      const updatedMap = new Map(data.map((e) => [e.student_id, e.id]))
      setStudentEvaluations((prev) =>
        prev.map((e) => ({
          ...e,
          evaluation_id: updatedMap.get(e.student_id) || e.evaluation_id
        }))
      )
      setDirtyIds(new Set())
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4 text-gray-900 dark:text-gray-100">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <h2 className="text-xl font-semibold">{t('oral_evaluation')}</h2>
          {selectedLesson && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {formatLessonNumber(selectedLesson.lesson_number)} — {selectedLesson.subject} (
              {selectedLesson.school_forms?.year_level} {selectedLesson.school_forms?.class_section})
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving || dirtyIds.size === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {t('save')} {dirtyIds.size > 0 && `(${dirtyIds.size})`}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-2 text-sm font-medium border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {t('close')}
            </button>
          )}
        </div>
      </div>

      {!lessonId && lessons.length > 0 && (
        <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
          <label className="text-sm font-medium">{t('select_lesson')}:</label>
          <select
            value={selectedLessonId || ''}
            onChange={(e) => setSelectedLessonId(e.target.value)}
            className="flex-1 max-w-md px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            {lessons.map((lesson) => {
              const year = lesson.school_years?.label || ''
              const form = lesson.school_forms
                ? `${lesson.school_forms.year_level} ${lesson.school_forms.class_section}`
                : ''
              return (
                <option key={lesson.id} value={lesson.id}>
                  {formatLessonNumber(lesson.lesson_number)} - {lesson.subject} ({form}) - {year} - {formatDate(lesson.date)}
                </option>
              )
            })}
          </select>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-500">
            <Loader2 className="animate-spin mr-2" size={20} />
            {t('loading')}
          </div>
        ) : studentEvaluations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">{t('no_students_enrolled')}</div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {studentEvaluations.map((evaluation, evalIndex) => {
              const isAttending = evaluation.is_attending
              const isDirty = dirtyIds.has(evaluation.student_id)

              return (
                <div
                  key={evaluation.student_id}
                  className={`p-5 transition-colors ${isDirty ? 'bg-amber-50/70 dark:bg-amber-950/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/40'
                    } ${!isAttending ? 'opacity-60 bg-gray-50/80 dark:bg-gray-800/20' : ''}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {evaluation.group_number && (
                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 text-xs font-bold">
                          #{evaluation.group_number}
                        </span>
                      )}
                      <div>
                        <h3 className="text-base font-semibold">{evaluation.student_name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t('process_number')}: {evaluation.process_number}
                        </p>
                      </div>
                    </div>

                    <label className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
                      <input
                        type="checkbox"
                        checked={isAttending}
                        onChange={(e) => handleAttendanceChange(evalIndex, e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-xs font-medium">
                        {isAttending ? t('attending') : t('absent')}
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div className="space-y-2 p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900/40">
                      <h4 className="text-xs font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wider text-center">
                        {t('column_a')} — {t('student_self')}
                      </h4>
                      <StarRating
                        value={evaluation.student_rating}
                        onChange={(val) => handleRatingChange(evalIndex, 'student_rating', val)}
                        disabled={!isAttending}
                        activeColorClass="text-amber-400"
                      />
                      <div className="text-center">
                        <span className="text-lg font-bold text-blue-900 dark:text-blue-200">
                          {evaluation.student_rating}
                        </span>
                        <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">
                          {t(RATING_LABELS[evaluation.student_rating])}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                      <h4 className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider text-center">
                        {t('column_b')} — {t('teacher_verdict')}
                      </h4>
                      <StarRating
                        value={evaluation.teacher_rating}
                        onChange={(val) => handleRatingChange(evalIndex, 'teacher_rating', val)}
                        disabled={!isAttending}
                        activeColorClass="text-emerald-500"
                      />
                      <div className="text-center">
                        <span className="text-lg font-bold text-emerald-900 dark:text-emerald-200">
                          {evaluation.teacher_rating}
                        </span>
                        <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                          {t(RATING_LABELS[evaluation.teacher_rating])}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} className="text-gray-400 shrink-0" />
                    <input
                      type="text"
                      placeholder={t('add_notes_placeholder') || 'Observações / Notas...'}
                      value={evaluation.notes}
                      onChange={(e) => handleNotesChange(evalIndex, e.target.value)}
                      disabled={!isAttending}
                      className="w-full text-xs px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800/40 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 rounded-lg p-3">
        <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('scale')}:</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs text-gray-600 dark:text-gray-400">
          {[1, 2, 3, 4, 5].map((num) => (
            <div key={num} className="flex items-center gap-1">
              <span className="font-bold text-gray-900 dark:text-gray-200">{num}:</span>
              <span>{t(RATING_LABELS[num])}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default OralEvaluation