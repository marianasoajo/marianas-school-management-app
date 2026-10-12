import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import StarRating from '../../../components/ui/StarRating'
import { studentService } from '../../../services/studentService'
import { useEvaluation } from '../hooks/useEvaluation'

export default function OralEvaluationModal({ isOpen, onClose, lesson }) {
    const { t } = useTranslation()
    const { getLessonEvaluations, saveEvaluations } = useEvaluation()

    const [students, setStudents] = useState([])
    const [evaluations, setEvaluations] = useState({})
    const [loading, setLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (lesson?.school_year_id && lesson?.school_form_id) {
            setLoading(true)
            Promise.all([
                studentService.getStudentsByGroup(lesson.school_year_id, lesson.school_form_id),
                getLessonEvaluations(lesson.id)
            ]).then(([studentsData, existingEvals]) => {
                setStudents(studentsData || [])

                const evalMap = {}
                existingEvals.forEach((item) => {
                    evalMap[item.student_id] = {
                        is_attending: item.is_attending ?? true,
                        student_rating: item.student_rating || 0,
                        teacher_rating: item.teacher_rating || 0,
                        notes: item.notes || ''
                    }
                })

                setEvaluations(evalMap)
            }).finally(() => setLoading(false))
        }
    }, [lesson, getLessonEvaluations])

    const updateStudentEval = (studentId, key, value) => {
        setEvaluations((prev) => ({
            ...prev,
            [studentId]: {
                is_attending: true,
                student_rating: 0,
                teacher_rating: 0,
                notes: '',
                ...prev[studentId],
                [key]: value
            }
        }))
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const payload = Object.entries(evaluations).map(([sId, data]) => ({
                lesson_id: lesson.id,
                student_id: sId,
                is_attending: data.is_attending,
                student_rating: data.student_rating || null,
                teacher_rating: data.teacher_rating || null,
                notes: data.notes || null
            }))

            await saveEvaluations(payload)
            onClose()
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`${t('daily_selfassessment')} — Lição nº ${lesson?.lesson_number}`}
            maxWidth="max-w-3xl"
        >
            <div className="space-y-4">
                {loading ? (
                    <div className="py-12 text-center text-content-muted">{t('loading')}</div>
                ) : students.length === 0 ? (
                    <div className="py-8 text-center text-content-muted">{t('no_students_enrolled')}</div>
                ) : (
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                        {students.map((student) => {
                            const current = evaluations[student.id] || {
                                is_attending: true,
                                student_rating: 0,
                                teacher_rating: 0,
                                notes: ''
                            }

                            return (
                                <div
                                    key={student.id}
                                    className={`p-3 sm:p-4 rounded-xl border transition-colors space-y-3 ${current.is_attending
                                        ? 'bg-app-hover/30 border-app-border'
                                        : 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40'
                                        }`}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="font-semibold text-sm text-content-main">
                                            #{student.group_number || '-'} {student.name}
                                        </div>

                                        <label className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={current.is_attending}
                                                onChange={(e) => updateStudentEval(student.id, 'is_attending', e.target.checked)}
                                                className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary"
                                            />
                                            <span>{current.is_attending ? t('attending') : t('absent')}</span>
                                        </label>
                                    </div>

                                    {current.is_attending && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-app-border/40">
                                            <div>
                                                <label className="block text-xs font-semibold uppercase text-amber-600 dark:text-amber-400 mb-1">
                                                    {t('student_self')}
                                                </label>
                                                <StarRating
                                                    value={current.student_rating}
                                                    onChange={(val) => updateStudentEval(student.id, 'student_rating', val)}
                                                    activeColor="text-amber-400"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold uppercase text-emerald-600 dark:text-emerald-400 mb-1">
                                                    {t('teacher_verdict')}
                                                </label>
                                                <StarRating
                                                    value={current.teacher_rating}
                                                    onChange={(val) => updateStudentEval(student.id, 'teacher_rating', val)}
                                                    activeColor="text-emerald-500"
                                                />
                                            </div>

                                            <div className="sm:col-span-2">
                                                <Input
                                                    placeholder={t('notes')}
                                                    value={current.notes}
                                                    onChange={(e) => updateStudentEval(student.id, 'notes', e.target.value)}
                                                    className="!py-1.5 text-xs"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-app-border">
                    <Button variant="secondary" onClick={onClose} disabled={isSaving}>
                        {t('cancel')}
                    </Button>
                    <Button onClick={handleSave} isLoading={isSaving} disabled={students.length === 0}>
                        {t('save')}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}