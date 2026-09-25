import { ClipboardCheck, Edit, Eye, StickyNote, Trash2 } from 'lucide-react'
import RichText from '../../ui/RichText'

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
        <div
            className={`border-b border-gray-200 dark:border-gray-800/80 last:border-0 transition-colors ${isSelected
                ? 'bg-blue-50/80 dark:bg-gray-800/80 border-l-4 border-l-blue-600 dark:border-l-blue-500'
                : 'bg-white dark:bg-gray-900 hover:bg-gray-50/60 dark:hover:bg-gray-800/40 border-l-4 border-l-transparent'
                }`}
        >
            <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div onClick={onSelect} className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-base font-bold text-gray-900 dark:text-gray-100">
                                {formatLessonNumber(lesson.lesson_number)}
                            </span>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                {formatDate(lesson.date)}
                            </span>
                            {yearLabel && (
                                <>
                                    <span className="text-xs text-gray-300 dark:text-gray-700">—</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{yearLabel}</span>
                                </>
                            )}
                            {formLabel && (
                                <>
                                    <span className="text-xs text-gray-300 dark:text-gray-700">•</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{formLabel}</span>
                                </>
                            )}
                        </div>

                        {lesson.summary && (
                            <RichText
                                html={lesson.summary}
                                className="text-sm text-gray-700 dark:text-gray-300 [&_*]:text-inherit whitespace-pre-wrap leading-relaxed mb-2 line-clamp-2"
                            />
                        )}

                        {lesson.attention_box && (
                            <div className="mb-2 p-2.5 bg-amber-500/10 dark:bg-amber-500/15 border-l-2 border-amber-500 dark:border-amber-400 rounded-r">
                                <RichText
                                    html={lesson.attention_box}
                                    className="text-xs text-amber-900 dark:text-amber-200 [&_*]:text-inherit line-clamp-2 font-medium"
                                />
                            </div>
                        )}

                        {isSelected && hasNotes && (
                            <div className="flex items-start gap-2 mt-2 p-2.5 bg-purple-500/10 dark:bg-purple-500/15 border-l-2 border-purple-500 dark:border-purple-400 rounded-r text-sm">
                                <StickyNote size={15} className="text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                                <RichText
                                    html={lesson.teacher_notes}
                                    className="text-purple-900 dark:text-purple-200 [&_*]:text-inherit whitespace-pre-wrap"
                                />
                            </div>
                        )}

                        {isSelected && !hasNotes && (
                            <div className="flex items-start gap-2 mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm text-gray-500 dark:text-gray-400">
                                <StickyNote size={14} className="text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                                <p>{t('no_notes')}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-1 flex-shrink-0">
                        <button
                            onClick={onOpenStudentView}
                            className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            title={t('student_view')}
                        >
                            <Eye size={16} />
                        </button>
                        <button
                            onClick={onOpenEvaluation}
                            className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            title={t('evaluation')}
                        >
                            <ClipboardCheck size={16} />
                        </button>
                        <button
                            onClick={onEdit}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            title={t('edit_lesson')}
                        >
                            <Edit size={16} />
                        </button>
                        <button
                            onClick={onDelete}
                            className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
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