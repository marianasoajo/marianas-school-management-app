import { AlertCircle, Loader2, MessageSquare, Save } from 'lucide-react'
import { useFormatters } from '../../utils/formatters'
import { StarRating } from '../ui/StarRating'
import { RATING_LABELS } from './api/evaluationApi'
import { useOralEvaluation } from './hooks/useOralEvaluation'

export function OralEvaluation({ lessonId = null, onClose = null }) {
  const { formatLessonNumber, formatDate, t } = useFormatters()

  const {
    lessons,
    selectedLessonId,
    setSelectedLessonId,
    selectedLesson,
    studentEvaluations,
    loading,
    saving,
    error,
    dirtyCount,
    handleAttendanceChange,
    handleRatingChange,
    handleNotesChange,
    handleSave
  } = useOralEvaluation(lessonId)

  return (
    <div className="space-y-4 text-gray-900 dark:text-gray-100">
      {/* Header */}
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
            disabled={saving || dirtyCount === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {t('save')} {dirtyCount > 0 && `(${dirtyCount})`}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {t('close')}
            </button>
          )}
        </div>
      </div>

      {/* Optional Lesson Selector */}
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

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Student List & Ratings Grid */}
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

              return (
                <div
                  key={evaluation.student_id}
                  className={`p-5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40 ${!isAttending ? 'opacity-60 bg-gray-50/80 dark:bg-gray-800/20' : ''
                    }`}
                >
                  {/* Student Header */}
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

                  {/* Ratings Columns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    {/* Column A - Student Self Evaluation */}
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

                    {/* Column B - Teacher Evaluation */}
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

                  {/* Notes Field */}
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

      {/* Scale Legend Footer */}
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