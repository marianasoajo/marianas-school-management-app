import { AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
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

    const [filters, setFilters] = useState({
        yearId: '',
        formId: '',
        subject: '',
        searchQuery: '',
        dateMode: 'single',
        date: '',
        startDate: '',
        endDate: ''
    })

    const [editingLesson, setEditingLesson] = useState(null)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isImportOpen, setIsImportOpen] = useState(false)
    const [studentViewLesson, setStudentViewLesson] = useState(null)
    const [evalLesson, setEvalLesson] = useState(null)
    const [deletingId, setDeletingId] = useState(null)
    const [copiedLessonId, setCopiedLessonId] = useState(null)
    const [exportingLesson, setExportingLesson] = useState(null)

    // Auto-default filter to the active school year once metadata loads
    useEffect(() => {
        if (years.length > 0 && !filters.yearId) {
            const activeYear = years.find((y) => y.is_active) || years[0]
            if (activeYear) {
                setFilters((prev) => ({ ...prev, yearId: activeYear.id }))
            }
        }
    }, [years, filters.yearId])

    const { lessons, loading, error, createLesson, updateLesson, deleteLesson, refresh } = useLessons(filters)

    // Clean HTML tags, copy plain text to clipboard, and open Inovar
    const handleExportInovar = async (lesson) => {
        if (!lesson) return

        const summaryDocument = new DOMParser().parseFromString(lesson.summary || '', 'text/html')
        summaryDocument.body.querySelectorAll('br').forEach((el) => el.replaceWith('\n'))
        summaryDocument.body.querySelectorAll('p, div, li').forEach((el) => el.append('\n'))
        const summaryText = summaryDocument.body.textContent.replace(/\n{3,}/g, '\n\n').trim()

        window.open('https://aemaximinos.inovarmais.com/Alunos/Inicial.wgx', '_blank', 'noopener,noreferrer')

        try {
            await navigator.clipboard.writeText(summaryText)
            setCopiedLessonId(lesson.id)
            setTimeout(() => setCopiedLessonId(null), 2500)
        } catch {
            // Fallback handling if clipboard access is denied
        }
    }

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

    const handleResetFilters = () => {
        const activeYear = years.find((y) => y.is_active) || years[0]
        setFilters({
            yearId: activeYear ? activeYear.id : '',
            formId: '',
            subject: '',
            searchQuery: '',
            dateMode: 'single',
            date: '',
            startDate: '',
            endDate: ''
        })
    }

    return (
        <div className="space-y-4">
            {/* Top Filters */}
            <LessonFilterBar
                years={years}
                forms={forms}
                filters={filters}
                onFilterChange={setFilters}
                onOpenCreateModal={handleCreateNew}
                onOpenImportModal={() => setIsImportOpen(true)}
                onResetFilters={handleResetFilters}
            />

            {/* Main List State */}
            {loading ? (
                <div className="py-12 text-center text-content-muted animate-pulse">
                    {t('loading')}
                </div>
            ) : error ? (
                <div className="p-4 bg-red-50 dark:bg-red-950/30 text-red-600 rounded-xl text-center text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            ) : lessons.length === 0 ? (
                <div className="py-12 text-center text-content-muted border border-dashed border-app-border rounded-xl">
                    {t('no_lessons')}
                </div>
            ) : (
                <div className="space-y-2">
                    {lessons.map((lesson) => (
                        <LessonCard
                            key={lesson.id}
                            lesson={lesson}
                            isCopied={copiedLessonId === lesson.id}
                            onExportInovar={handleExportInovar}
                            onStudentView={setStudentViewLesson}
                            onOpenEvaluation={setEvalLesson}
                            onExportLesson={(lesson) => {
                                setExportingLesson(lesson)
                                setIsImportOpen(true)
                            }}
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
                    initialYearId={filters.yearId}
                    initialFormId={filters.formId}
                />
            )}

            {isImportOpen && (
                <LessonImportModal
                    isOpen={isImportOpen}
                    onClose={() => {
                        setIsImportOpen(false)
                        setExportingLesson(null)
                    }}
                    sourceLesson={exportingLesson}
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