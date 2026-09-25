import { AlertCircle, Eye, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFormatters } from '../../utils/formatters'
import ConfirmModal from '../ui/ConfirmDeletionModal'
import { useLessons } from './hooks/useLessons'

import OralEvaluation from '../evaluation/OralEvaluation'
import ImportModal from './features/ImportModal'
import LessonCard from './features/LessonCard'
import LessonFilterBar from './features/LessonFilterBar'
import LessonFormModal from './features/LessonFormModal'
import StudentViewModal from './features/StudentViewModal'

export default function LessonPresentation({ session }) {
  const formatters = useFormatters()
  const { t } = formatters

  const [filters, setFilters] = useState({
    yearId: '',
    formId: '',
    dateMode: 'single', // 'single' | 'range'
    date: '',
    startDate: '',
    endDate: ''
  })
  const [studentViewLesson, setStudentViewLesson] = useState(null)
  const [editingLessonModal, setEditingLessonModal] = useState({ open: false, lesson: null })
  const [showImportModal, setShowImportModal] = useState(false)
  const [evaluationLessonId, setEvaluationLessonId] = useState(null)
  const [deletingLessonId, setDeletingLessonId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    lessons,
    schoolYears,
    schoolForms,
    loading,
    error,
    selectedLessonId,
    setSelectedLessonId,
    deleteLesson,
    refresh
  } = useLessons(session, filters)

  // Automatically default filter to the active school year once metadata loads
  useEffect(() => {
    if (schoolYears.length > 0 && !filters.yearId) {
      const activeYear = schoolYears.find((y) => y.is_active) || schoolYears[0]
      if (activeYear) {
        setFilters((prev) => ({ ...prev, yearId: activeYear.id }))
      }
    }
  }, [schoolYears, filters.yearId])

  const selectedLesson = lessons.find((l) => l.id === selectedLessonId) || null

  const handleConfirmDelete = async () => {
    if (!deletingLessonId) return
    setIsDeleting(true)
    try {
      await deleteLesson(deletingLessonId)
      setDeletingLessonId(null)
    } finally {
      setIsDeleting(false)
    }
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
    <div className="relative space-y-6">
      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Filter Toolbar */}
      <LessonFilterBar
        filters={filters}
        onFilterChange={setFilters}
        schoolYears={schoolYears}
        schoolForms={schoolForms}
        onOpenAddModal={() => setEditingLessonModal({ open: true, lesson: null })}
        onOpenImportModal={() => setShowImportModal(true)}
        t={t}
      />

      {/* Main List */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('past_future_summary')}
          </h3>
        </div>

        {/* Card Content */}
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {lessons.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              {t('no_lessons')}
            </div>
          ) : (
            lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                isSelected={lesson.id === selectedLessonId}
                onSelect={() => setSelectedLessonId(lesson.id === selectedLessonId ? null : lesson.id)}
                onOpenStudentView={() => setStudentViewLesson(lesson)}
                onOpenEvaluation={() => setEvaluationLessonId(lesson.id)}
                onEdit={() => setEditingLessonModal({ open: true, lesson })}
                onDelete={() => setDeletingLessonId(lesson.id)}
                formatters={formatters}
              />
            ))
          )}
        </div>
      </div>

      {/* Student View Floating Action Button */}
      {selectedLesson && (
        <button
          onClick={() => setStudentViewLesson(selectedLesson)}
          className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 text-sm font-medium text-white bg-green-600 rounded-full shadow-lg hover:bg-green-700 transition-colors z-10"
        >
          <Eye size={18} />
          {t('student_view')}
        </button>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingLessonId)}
        title={t('delete_lesson') || 'Delete Lesson'}
        message={t('confirm_delete') || 'Are you sure you want to delete this lesson? This action cannot be undone.'}
        confirmText={t('delete') || 'Delete'}
        cancelText={t('cancel') || 'Cancel'}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingLessonId(null)}
      />

      {/* Overlays / Modals */}
      {studentViewLesson && (
        <StudentViewModal
          lesson={studentViewLesson}
          onClose={() => setStudentViewLesson(null)}
          formatters={formatters}
        />
      )}

      {editingLessonModal.open && (
        <LessonFormModal
          editingLesson={editingLessonModal.lesson}
          filters={filters}
          schoolYears={schoolYears}
          schoolForms={schoolForms}
          onClose={() => setEditingLessonModal({ open: false, lesson: null })}
          onSuccess={(savedLesson) => {
            setEditingLessonModal({ open: false, lesson: null })
            if (savedLesson?.id) setSelectedLessonId(savedLesson.id)
            refresh()
          }}
          t={t}
        />
      )}

      {showImportModal && (
        <ImportModal
          lessons={lessons}
          schoolYears={schoolYears}
          schoolForms={schoolForms}
          currentFilters={filters}
          currentLesson={selectedLesson}
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            setShowImportModal(false)
            refresh()
          }}
          formatters={formatters}
        />
      )}

      {evaluationLessonId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <OralEvaluation
                lessonId={evaluationLessonId}
                onClose={() => setEvaluationLessonId(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}