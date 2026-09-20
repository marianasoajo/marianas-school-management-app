import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Save, Loader2, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'

// Rating scale mapping: 1-5 to Portuguese qualitative labels
const RATING_LABELS = {
  1: 'very_poor',    // Posso Fazer Muito Melhor
  2: 'poor',         // Posso Fazer Melhor
  3: 'fair',         // Fui Bom
  4: 'good',         // Fui Muito Bom
  5: 'excellent'     // Fui Excelente
}

export default function OralEvaluation({ lessonId = null, onClose = null }) {
  const { t } = useTranslation()

  const [lessons, setLessons] = useState([])
  const [selectedLessonId, setSelectedLessonId] = useState(lessonId)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [studentEvaluations, setStudentEvaluations] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [dirtyIds, setDirtyIds] = useState(new Set())

  // Fetch lessons on mount (with school_year and school_form joins)
  useEffect(() => {
    const fetchLessons = async () => {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('lessons')
        .select(`
          id,
          lesson_number,
          date,
          subject,
          school_year_id,
          school_form_id,
          school_years (label),
          school_forms (year_level, class_section)
        `)
        .order('date', { ascending: false })

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setLessons(data || [])
        if (data && data.length > 0 && !lessonId) {
          setSelectedLessonId(data[0].id)
        }
      }
      setLoading(false)
    }
    fetchLessons()
  }, [lessonId])

  // Fetch selected lesson details and enrolled students
  useEffect(() => {
    if (!selectedLessonId) return

    const fetchLessonAndStudents = async () => {
      setLoading(true)
      setError(null)

      // 1. Get lesson details
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select(`
          *,
          school_years (label),
          school_forms (year_level, class_section)
        `)
        .eq('id', selectedLessonId)
        .single()

      if (lessonError) {
        setError(lessonError.message)
        setLoading(false)
        return
      }

      setSelectedLesson(lessonData)

      // 2. Get enrolled students for this lesson's school_year_id and school_form_id
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('student_enrollments')
        .select(`
          student_id,
          students (
            id,
            process_number,
            name,
            birthdate
          )
        `)
        .eq('school_year_id', lessonData.school_year_id)
        .eq('school_form_id', lessonData.school_form_id)

      if (enrollmentsError) {
        setError(enrollmentsError.message)
        setLoading(false)
        return
      }

      // 3. Get existing evaluations for this lesson
      const { data: evaluationsData, error: evaluationsError } = await supabase
        .from('evaluations')
        .select('*')
        .eq('lesson_id', selectedLessonId)

      if (evaluationsError) {
        setError(evaluationsError.message)
        setLoading(false)
        return
      }

      // 4. Build combined student evaluation list
      const evaluationsMap = new Map(
        (evaluationsData || []).map((e) => [e.student_id, e])
      )

      const combined = (enrollmentsData || []).map((enrollment) => {
        const student = enrollment.students
        const existingEval = evaluationsMap.get(student.id)

        return {
          student_id: student.id,
          student_name: student.name,
          process_number: student.process_number,
          birthdate: student.birthdate,
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
  }, [selectedLessonId])

  // Handle attendance toggle
  const handleAttendanceChange = (evalIndex, isAttending) => {
    setStudentEvaluations((prev) => {
      const updated = [...prev]
      updated[evalIndex] = { ...updated[evalIndex], is_attending: isAttending }
      return updated
    })
    const studentId = studentEvaluations[evalIndex]?.student_id
    if (studentId) {
      setDirtyIds((prev) => new Set(prev).add(studentId))
    }
  }

  // Handle rating change
  const handleRatingChange = (evalIndex, field, value) => {
    setStudentEvaluations((prev) => {
      const updated = [...prev]
      updated[evalIndex] = { ...updated[evalIndex], [field]: parseInt(value) }
      return updated
    })
    const studentId = studentEvaluations[evalIndex]?.student_id
    if (studentId) {
      setDirtyIds((prev) => new Set(prev).add(studentId))
    }
  }

  // Save all dirty evaluations (upsert)
  const handleSave = async () => {
    if (dirtyIds.size === 0) return
    setSaving(true)
    setError(null)

    const dirtyEvals = studentEvaluations.filter((e) => dirtyIds.has(e.student_id))
    const upserts = dirtyEvals.map((evaluation) => ({
      id: evaluation.evaluation_id || undefined,
      lesson_id: selectedLessonId,
      student_id: evaluation.student_id,
      is_attending: evaluation.is_attending,
      student_rating: evaluation.student_rating,
      teacher_rating: evaluation.teacher_rating,
      notes: evaluation.notes
    }))

    const { data, error: upsertError } = await supabase
      .from('evaluations')
      .upsert(upserts, { onConflict: 'lesson_id,student_id' })
      .select()

    if (upsertError) {
      setError(upsertError.message)
    } else {
      // Update evaluation_id for newly created records
      const updatedMap = new Map((data || []).map((e) => [e.student_id, e.id]))
      setStudentEvaluations((prev) =>
        prev.map((e) => ({
          ...e,
          evaluation_id: updatedMap.get(e.student_id) || e.evaluation_id
        }))
      )
      setDirtyIds(new Set())
    }
    setSaving(false)
  }

  if (loading && lessons.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        <Loader2 className="animate-spin mr-2" size={20} />
        {t('loading')}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {t('oral_evaluation')}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving || dirtyIds.size === 0}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {t('save')}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              {t('close')}
            </button>
          )}
        </div>
      </div>

      {/* Lesson Selector */}
      {!lessonId && lessons.length > 0 && (
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">
            {t('select_lesson')}:
          </label>
          <select
            value={selectedLessonId || ''}
            onChange={(e) => setSelectedLessonId(e.target.value)}
            className="flex-1 max-w-md px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {lessons.map((lesson) => {
              const schoolYear = lesson.school_years?.label || ''
              const form = lesson.school_forms
                ? `${lesson.school_forms.year_level} ${lesson.school_forms.class_section}`
                : ''
              return (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.lesson_number} - {lesson.subject} ({form}) - {schoolYear} - {new Date(lesson.date).toLocaleDateString()}
                </option>
              )
            })}
          </select>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Evaluation Grid */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-500">
            <Loader2 className="animate-spin mr-2" size={20} />
            {t('loading')}
          </div>
        ) : studentEvaluations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {t('no_students_enrolled')}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {studentEvaluations.map((evaluation, evalIndex) => {
              const isAttending = evaluation.is_attending
              const isDirty = dirtyIds.has(evaluation.student_id)

              return (
                <div
                  key={evaluation.student_id}
                  className={`p-6 ${isDirty ? 'bg-yellow-50' : 'hover:bg-gray-50'} ${!isAttending ? 'opacity-60' : ''}`}
                >
                  {/* Student Name and Attendance */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {evaluation.student_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {t('process_number')}: {evaluation.process_number}
                      </p>
                    </div>
                    <label className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 transition-colors">
                      <input
                        type="checkbox"
                        checked={isAttending}
                        onChange={(e) => handleAttendanceChange(evalIndex, e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {t('attendance')}: {isAttending ? t('attending') : t('absent')}
                      </span>
                    </label>
                  </div>

                  {/* Side-by-side Sliders */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Column A: Student Self-Evaluation */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-blue-700 uppercase tracking-wide">
                        {t('column_a')} — {t('student_self')}
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => handleRatingChange(evalIndex, 'student_rating', star)}
                              disabled={!isAttending}
                              className={`w-8 h-8 flex items-center justify-center text-yellow-400 hover:text-yellow-500 transition-colors ${
                                !isAttending ? 'opacity-50 cursor-not-allowed' : ''
                              } ${evaluation.student_rating >= star ? 'text-yellow-500' : 'text-yellow-300'}`}
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.88-1.874a1 1 0 00-1.175 0l-2.88 1.874c-.784.57-1.838-.197-1.539-1.118l1.07-3.292c-.3-.921-.755-1.688-1.54-1.118l-2.8 2.034a1 1 0 00-.588-1.81l3.462-.969c.969 0 1.371-.24.95-.69z"></path>
                              </svg>
                            </button>
                          ))}
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>1</span>
                          <span>2</span>
                          <span>3</span>
                          <span>4</span>
                          <span>5</span>
                        </div>
                        <div className={`mt-3 p-3 border rounded-md text-center ${!isAttending ? 'bg-gray-100 border-gray-300' : 'bg-blue-100 border-blue-300'}`}>
                          <p className={`text-2xl font-bold ${!isAttending ? 'text-gray-500' : 'text-blue-900'}`}>
                            {evaluation.student_rating || 3}
                          </p>
                          <p className={`text-sm mt-1 ${!isAttending ? 'text-gray-600' : 'text-blue-800'}`}>
                            {t(RATING_LABELS[evaluation.student_rating || 3])}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Column B: Teacher Evaluation */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-green-700 uppercase tracking-wide">
                        {t('column_b')} — {t('teacher_verdict')}
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => handleRatingChange(evalIndex, 'teacher_rating', star)}
                              disabled={!isAttending}
                              className={`w-8 h-8 flex items-center justify-center text-green-400 hover:text-green-500 transition-colors ${
                                !isAttending ? 'opacity-50 cursor-not-allowed' : ''
                              } ${evaluation.teacher_rating >= star ? 'text-green-500' : 'text-green-300'}`}
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.88-1.874a1 1 0 00-1.175 0l-2.88 1.874c-.784.57-1.838-.197-1.539-1.118l1.07-3.292c-.3-.921-.755-1.688-1.54-1.118l-2.8 2.034a1 1 0 00-.588-1.81l3.462-.969c.969 0 1.371-.24.95-.69z"></path>
                              </svg>
                            </button>
                          ))}
                        </div>
                        <div className={`mt-3 p-3 border rounded-md text-center ${!isAttending ? 'bg-gray-100 border-gray-300' : 'bg-green-100 border-green-300'}`}>
                          <p className={`text-2xl font-bold ${!isAttending ? 'text-gray-500' : 'text-green-900'}`}>
                            {evaluation.teacher_rating || 3}
                          </p>
                          <p className={`text-sm mt-1 ${!isAttending ? 'text-gray-600' : 'text-green-800'}`}>
                            {t(RATING_LABELS[evaluation.teacher_rating || 3])}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          {t('scale')}:
        </h3>
        <div className="grid grid-cols-5 gap-2 text-xs text-gray-600">
          <div>
            <span className="font-semibold">1:</span> {t('very_poor')}
          </div>
          <div>
            <span className="font-semibold">2:</span> {t('poor')}
          </div>
          <div>
            <span className="font-semibold">3:</span> {t('fair')}
          </div>
          <div>
            <span className="font-semibold">4:</span> {t('good')}
          </div>
          <div>
            <span className="font-semibold">5:</span> {t('excellent')}
          </div>
        </div>
      </div>
    </div>
  )
}
