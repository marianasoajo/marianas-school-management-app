import { AlertCircle, Check, ChevronDown, ChevronUp, ClipboardCheck, ClipboardCopy, Edit2, Eye, FileText, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'

export default function LessonCard({
    lesson,
    onStudentView,
    onOpenEvaluation,
    onExportInovar,
    isCopied = false,
    onEdit,
    onDelete
}) {
    const { t } = useTranslation()
    const [isExpanded, setIsExpanded] = useState(false)

    const groupLabel = lesson.school_forms
        ? `${lesson.school_forms.year_level} ${lesson.school_forms.class_section}`
        : ''

    return (
        <Card className="mb-3 transition-all duration-150 hover:border-brand-primary/40">
            <div className="p-4">
                {/* Card Header / Summary Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                        <div className="bg-brand-primary/10 text-brand-primary font-bold px-3 py-2 rounded-xl text-center min-w-[54px] shrink-0">
                            <div className="text-[10px] uppercase text-content-muted">{t('lesson_single')}</div>
                            <div className="text-lg leading-none">{lesson.lesson_number}</div>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-content-main">{lesson.subject}</span>
                                {groupLabel && <Badge variant="neutral">{groupLabel}</Badge>}
                                <span className="text-xs text-content-muted">{lesson.date}</span>
                            </div>

                            {/* Summary Preview */}
                            <div
                                className="mt-1 text-sm text-content-main line-clamp-2 prose dark:prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ __html: lesson.summary || t('no_notes') }}
                            />
                        </div>
                    </div>

                    {/* Action Toolbar directly on the row */}
                    <div className="flex items-center justify-end gap-1 pt-2 sm:pt-0 border-t sm:border-t-0 border-app-border shrink-0">
                        {/* Export to Inovar Button */}
                        <Button
                            variant="ghost"
                            onClick={() => onExportInovar(lesson)}
                            title={t('copy_summary_open_site')}
                            className={`!p-2 transition-colors ${isCopied
                                ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
                                : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30'
                                }`}
                        >
                            {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <ClipboardCopy className="w-4 h-4" />}
                        </Button>

                        {/* Student View Button */}
                        <Button
                            variant="ghost"
                            onClick={() => onStudentView(lesson)}
                            title={t('student_view')}
                            className="!p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                        >
                            <Eye className="w-4 h-4" />
                        </Button>

                        {/* Evaluation Button */}
                        <Button
                            variant="ghost"
                            onClick={() => onOpenEvaluation(lesson)}
                            title={t('daily_selfassessment')}
                            className="!p-2 text-brand-primary hover:bg-brand-primary-light"
                        >
                            <ClipboardCheck className="w-4 h-4" />
                        </Button>

                        {/* Edit Button */}
                        <Button
                            variant="ghost"
                            onClick={() => onEdit(lesson)}
                            title={t('edit_lesson')}
                            className="!p-2"
                        >
                            <Edit2 className="w-4 h-4" />
                        </Button>

                        {/* Delete Button */}
                        <Button
                            variant="ghost"
                            onClick={() => onDelete(lesson.id)}
                            title={t('delete_lesson')}
                            className="!p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>

                        {/* Expand / Collapse Button */}
                        <Button
                            variant="ghost"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="!p-2"
                        >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>

                {/* Attention Box */}
                {lesson.attention_box && (
                    <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-lg flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div dangerouslySetInnerHTML={{ __html: lesson.attention_box }} />
                    </div>
                )}

                {/* Collapsible Teacher Notes */}
                {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-app-border space-y-3 text-sm">
                        <div>
                            <div className="flex items-center gap-1.5 font-medium text-content-muted text-xs uppercase mb-1">
                                <FileText className="w-3.5 h-3.5" />
                                <span>{t('teacher_notes')}</span>
                            </div>
                            {lesson.teacher_notes ? (
                                <div
                                    className="p-3 bg-app-hover/50 rounded-lg text-content-main prose dark:prose-invert max-w-none text-sm"
                                    dangerouslySetInnerHTML={{ __html: lesson.teacher_notes }}
                                />
                            ) : (
                                <p className="text-content-muted italic text-xs">{t('no_notes')}</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    )
}