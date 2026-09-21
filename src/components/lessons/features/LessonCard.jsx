import { ClipboardCheck, Edit, Eye, StickyNote, Trash2 } from 'lucide-react'
import RichText from './RichText'

export default function LessonCard({
    lesson,
    isSelected,
    onSelect,
    onOpenStudentView,
    onOpenEvaluation,
    onEdit,
    onDelete,
    formatters
}) {
    const { formatLessonNumber, formatDate, t } = formatters
    const yearLabel = lesson.school_years?.label || ''
    const formLabel = lesson.school_forms
        ? `${lesson.school_forms.year_level} ${lesson.school_forms.class_section}`
        : ''
    const hasNotes = lesson.teacher_notes && lesson.teacher_notes.trim().length > 0

    return (
        <div className={`border-b border-gray-200 last:border-0 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}>
            <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div onClick={onSelect} className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-base font-bold text-gray-900">{formatLessonNumber(lesson.lesson_number)}</span>
                            <span className="text-sm text-gray-600">{formatDate(lesson.date)}</span>
                            {yearLabel && (
                                <>
                                    <span className="text-xs text-gray-500">—</span>
                                    <span className="text-xs text-gray-500">{yearLabel}</span>
                                </>
                            )}
                            {formLabel && (
                                <>
                                    <span className="text-xs text-gray-500">•</span>
                                    <span className="text-xs text-gray-500">{formLabel}</span>
                                </>
                            )}
                        </div>

                        {lesson.summary && (
                            <RichText html={lesson.summary} className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed mb-2 line-clamp-2" />
                        )}

                        {lesson.attention_box && (
                            <div className="mb-2 p-2 bg-yellow-50 border-l-2 border-yellow-400 rounded">
                                <RichText html={lesson.attention_box} className="text-xs text-yellow-800 line-clamp-2" />
                            </div>
                        )}

                        {isSelected && hasNotes && (
                            <div className="flex items-start gap-2 mt-2 p-2 bg-purple-50 rounded text-sm">
                                <StickyNote size={14} className="text-purple-600 mt-0.5 flex-shrink-0" />
                                <RichText html={lesson.teacher_notes} className="text-purple-800 whitespace-pre-wrap" />
                            </div>
                        )}
                        {isSelected && !hasNotes && (
                            <div className="flex items-start gap-2 mt-2 p-2 bg-gray-50 rounded text-sm text-gray-500">
                                <StickyNote size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                <p>{t('no_notes')}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-1 flex-shrink-0">
                        <button
                            onClick={onOpenStudentView}
                            className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title={t('student_view')}
                        >
                            <Eye size={16} />
                        </button>
                        <button
                            onClick={onOpenEvaluation}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                            title={t('evaluation')}
                        >
                            <ClipboardCheck size={16} />
                        </button>
                        <button
                            onClick={onEdit}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title={t('edit_lesson')}
                        >
                            <Edit size={16} />
                        </button>
                        <button
                            onClick={onDelete}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title={t('delete_lesson')}
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}