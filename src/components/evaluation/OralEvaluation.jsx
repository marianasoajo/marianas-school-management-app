import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, Save, Loader2, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'

// Rating scale mapping: 1-5 to Portuguese qualitative labels
const RATING_LABELS = {
  1: 'very_poor',    // Posso Fazer Muito Melhor
  2: 'poor',         // Posso Fazer Melhor
  3: 'fair',         // Fui Bom
  4: 'good',         // Fui Muito Bom
  5: 'excellent'     // Fui Excelente
}

export default function OralEvaluation() {
  const { t } = useTranslation()

  const [lessons, setLessons] = useState([])
  const [selectedLessonId, setSelectedLessonId] = useState(null)
  const [evaluations, setEvaluations] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [dirtyIds, setDirtyIds] = useState(new Set())

  // Fetch lessons on mount
  useEffect(() => {
    const fetchLessons = async () => {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('lessons')
        .select('id, lesson_number, date, subject, level_group')
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

  // Fetch evaluations for selected lesson
  useEffect(() => {
    if (!selectedLessonId) return

    const fetchEvaluations = async () => {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('evaluations')
        .select('*')
        .eq('lesson_id', selectedLessonId)
        .order('created_at', { ascending: true })

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setEvaluations(data || [])
      }
      setLoading(false)
    }
    fetchEvaluations()
    setDirtyIds(new Set()) // Reset dirty tracking when switching lessons
  }, [selectedLessonId])

  // Handle rating change
  const handleRatingChange = (evalIndex, field, value) => {
    setEvaluations((prev) => {
      const updated = [...prev]
      updated[evalIndex] = { ...updated[evalIndex], [field]: parseInt(value) }
      return updated
    })
    const evalId = evaluations[evalIndex]?.id
    if (evalId) {
      setDirtyIds((prev) => new Set(prev).add(evalId))
    }
  }

  // Handle student name change
  const handleNameChange = (evalIndex, value) => {
    setEvaluations((prev) => {
      const updated = [...prev]
      updated[evalIndex] = { ...updated[evalIndex], student_name: value }
      return updated
    })
    const evalId = evaluations[evalIndex]?.id
    if (evalId) {
      setDirtyIds((prev) => new Set(prev).add(evalId))
    }
  }

  // Add new student
  const handleAddStudent = async () => {
    if (!selectedLessonId) return
    setSaving(true)
    setError(null)

    const { data, error: insertError } = await supabase
      .from('evaluations')
      .insert({
        lesson_id: selectedLessonId,
        student_name: t('student_name'),
        student_rating: 3,
        teacher_rating: 3
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
    } else {
      setEvaluations((prev) => [...prev, data])
    }
    setSaving(false)
  }

  // Save dirty evaluations
  const handleSave = async () => {
    if (dirtyIds.size === 0) return
    setSaving(true)
    setError(null)

    const dirtyEvals = evaluations.filter((e) => dirtyIds.has(e.id))
    const updates = dirtyEvals.map((evaluation) => {
      const { id, created_at, ...fields } = evaluation
      return supabase
        .from('evaluations')
        .update(fields)
        .eq('id', id)
    })

    const results = await Promise.all(updates)
    const failed = results.find((r) => r.error)
    if (failed) {
      setError(failed.error.message)
    } else {
      setDirtyIds(new Set())
    }
    setSaving(false)
  }

  // Delete evaluation
  const handleDelete = async (evalIndex) => {
    const evaluation = evaluations[evalIndex]
    if (!evaluation?.id) return
    setSaving(true)
    setError(null)

    const { error: deleteError } = await supabase
      .from('evaluations')
      .delete()
      .eq('id', evaluation.id)

    if (deleteError) {
      setError(deleteError.message)
    } else {
      setEvaluations((prev) => prev.filter((_, i) => i !== evalIndex))
      setDirtyIds((prev) => {
        const next = new Set(prev)
        next.delete(evaluation.id)
        return next
      })
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
        <div className="flex gap-2">
          <button
            onClick={handleAddStudent}
            disabled={saving || !selectedLessonId}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Plus size={16} />
            {t('add_student')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || dirtyIds.size === 0}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {t('save')}
          </button>
        </div>
      </div>

      {/* Lesson Selector */}
      {lessons.length > 0 && (
        <div className="flex items-center gap-4">
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
                {lesson.lesson_number} - {lesson.subject} ({lesson.level_group}) - {new Date(lesson.date).toLocaleDateString()}
              </option>
            ))}
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
        ) : evaluations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {t('no_evaluations')}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {evaluations.map((evaluation, evalIndex) => (
              <div
                key={evaluation.id}
                className={`group p-6 ${dirtyIds.has(evaluation.id) ? 'bg-yellow-50' : 'hover:bg-gray-50'}`}
              >
                {/* Student Name */}
                <div className="flex items-center justify-between mb-4">
                  <input
                    type="text"
                    value={evaluation.student_name}
                    onChange={(e) => handleNameChange(evalIndex, e.target.value)}
                    className="flex-1 px-3 py-2 text-lg font-semibold text-gray-900 bg-transparent border border-transparent rounded hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder={t('student_name')}
                  />
                  <button
                    onClick={() => handleDelete(evalIndex)}
                    disabled={saving}
                    className="ml-4 p-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30"
                    aria-label={t('delete_row')}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Side-by-side Sliders */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Column A: Student Self-Evaluation */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide">
                      {t('column_a')} — {t('student_self')}
                    </h3>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        value={evaluation.student_rating || 3}
                        onChange={(e) => handleRatingChange(evalIndex, 'student_rating', e.target.value)}
                        className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>1</span>
                        <span>2</span>
                        <span>3</span>
                        <span>4</span>
                        <span>5</span>
                      </div>
                      <div className="mt-3 p-3 bg-blue-100 border border-blue-300 rounded-md text-center">
                        <p className="text-2xl font-bold text-blue-900">
                          {evaluation.student_rating || 3}
                        </p>
                        <p className="text-sm text-blue-800 mt-1">
                          {t(RATING_LABELS[evaluation.student_rating || 3])}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Column B: Teacher Evaluation */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-green-700 uppercase tracking-wide">
                      {t('column_b')} — {t('teacher_verdict')}
                    </h3>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        value={evaluation.teacher_rating || 3}
                        onChange={(e) => handleRatingChange(evalIndex, 'teacher_rating', e.target.value)}
                        className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>1</span>
                        <span>2</span>
                        <span>3</span>
                        <span>4</span>
                        <span>5</span>
                      </div>
                      <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded-md text-center">
                        <p className="text-2xl font-bold text-green-900">
                          {evaluation.teacher_rating || 3}
                        </p>
                        <p className="text-sm text-green-800 mt-1">
                          {t(RATING_LABELS[evaluation.teacher_rating || 3])}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
