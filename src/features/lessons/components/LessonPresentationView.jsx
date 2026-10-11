import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ConfirmDeletionModal from '../../../components/ui/ConfirmDeletionModal'
import OralEvaluationModal from '../../evaluation/components/OralEvaluationModal'
import { useGroupsManager } from '../../groups/hooks/useGroupsManager'
import { useLessons } from '../hooks/useLessons'
import LessonCard from './LessonCard'
import LessonFilterBar from './LessonFilterBar'
import LessonFormModal from './LessonFormModal'
import LessonImportModal from './LessonImportModal'
import StudentViewModal from './StudentViewModal'

export default function LessonPresentationView() {
    const { t } = useTranslation()
    const { years, forms } = useGroupsManager()

    const [selectedYear, setSelectedYear] = useState('')
    const [selectedForm, setSelectedForm] = useState('')
    const [editingLesson, setEditingLesson] = useState(null)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isImportOpen, setIsImportOpen] = useState(false)
    const [studentViewLesson, setStudentViewLesson] = useState(null)
    const [evalLesson, setEvalLesson] = useState(null)
    const [deletingId, setDeletingId] = useState(null)

    const { lessons, loading, error, createLesson, updateLesson, deleteLesson, refresh } = useLessons({
        yearId: selectedYear,
        formId: selectedForm
    })

    const handleCreateNew = () => {
        setEditingLesson(null)
        setIsFormOpen(true)
    }

    const handleEdit = (lesson) => {
        setEditingLesson(lesson)
        setIsFormOpen(true)
    }

    const handleSaveLesson = async (formData) => {
        if (editingLesson) {
            await updateLesson(editingLesson.id, formData)
        } else {
            await createLesson(formData)
        }
        setIsFormOpen(false)
    }

    const handleConfirmDelete = async () => {
        if (deletingId) {
            await deleteLesson(deletingId)
            setDeletingId(null)
        }
    }

    return (
        <div className="space-y-4">
            {/* Top Filter and Actions */}
            <LessonFilterBar
                years={years}
                forms={forms}
                selectedYear={selectedYear}
                selectedForm={selectedForm}
                onYearChange={setSelectedYear}
                onFormChange={setSelectedForm}
                onOpenCreateModal={handleCreateNew}
                onOpenImportModal={() => setIsImportOpen(true)}
            />

            {/* Main List State */}
            {loading ? (
                <div className="py-12 text-center text-content-muted animate-pulse">
                    {t('loading')}
                </div>
            ) : error ? (
                <div className="p-4 bg-red-50 dark:bg-red-950/30 text-red-600 rounded-xl text-center text-sm">
                    {error}
                </div>
            ) : lessons.length === 0 ? (
                <div className="py-12 text-center text-content-muted border border-dashed border-app-border rounded-xl">
                    {t('no_lessons')}
                </div>
            ) : (
                <div className="space-y-3">
                    {lessons.map((lesson) => (
                        <LessonCard
                            key={lesson.id}
                            lesson={lesson}
                            onStudentView={setStudentViewLesson}
                            onOpenEvaluation={setEvalLesson}
                            onEdit={handleEdit}
                            onDelete={setDeletingId}
                        />
                    ))}
                </div>
            )}

            {/* Modals */}
            {isFormOpen && (
                <LessonFormModal
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    onSave={handleSaveLesson}
                    lesson={editingLesson}
                    years={years}
                    forms={forms}
                    initialYearId={selectedYear}
                    initialFormId={selectedForm}
                />
            )}

            {isImportOpen && (
                <LessonImportModal
                    isOpen={isImportOpen}
                    onClose={() => setIsImportOpen(false)}
                    years={years}
                    forms={forms}
                    onSuccess={refresh}
                />
            )}

            {studentViewLesson && (
                <StudentViewModal
                    lesson={studentViewLesson}
                    onClose={() => setStudentViewLesson(null)}
                />
            )}

            {evalLesson && (
                <OralEvaluationModal
                    isOpen={Boolean(evalLesson)}
                    onClose={() => setEvalLesson(null)}
                    lesson={evalLesson}
                />
            )}

            {deletingId && (
                <ConfirmDeletionModal
                    isOpen={Boolean(deletingId)}
                    onClose={() => setDeletingId(null)}
                    onConfirm={handleConfirmDelete}
                    message={t('confirm_delete')}
                />
            )}
        </div>
    )
}