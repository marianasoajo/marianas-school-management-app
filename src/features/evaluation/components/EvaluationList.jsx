import { AlertTriangle, Award, TrendingUp, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Badge from '../../../components/ui/Badge'
import Card from '../../../components/ui/Card'
import StarRating from '../../../components/ui/StarRating'
import Table from '../../../components/ui/Table'
import { studentService } from '../../../services/studentService'
import { useGroupsManager } from '../../groups/hooks/useGroupsManager'
import { useEvaluation } from '../hooks/useEvaluation'
import EvaluationFilterBar from './EvaluationFilterBar'

export default function EvaluationList() {
    const { t } = useTranslation()
    const { years, forms } = useGroupsManager()
    const { insights, loading, error, fetchInsights } = useEvaluation()

    const [students, setStudents] = useState([])
    const [filters, setFilters] = useState({
        yearId: '',
        level: '',
        formId: '',
        studentId: '',
        startDate: '',
        endDate: ''
    })

    // Load students for dropdown filter when group or year changes
    useEffect(() => {
        studentService.getStudents({ yearId: filters.yearId, formId: filters.formId })
            .then((data) => setStudents(data || []))
            .catch(() => { })
    }, [filters.yearId, filters.formId])

    // Fetch analytical insights whenever filters change
    useEffect(() => {
        fetchInsights(filters)
    }, [filters, fetchInsights])

    const handleResetFilters = () => {
        setFilters({
            yearId: '',
            level: '',
            formId: '',
            studentId: '',
            startDate: '',
            endDate: ''
        })
    }

    const { summary, students: studentMetrics = [] } = insights

    return (
        <div className="space-y-6">
            <EvaluationFilterBar
                years={years}
                forms={forms}
                students={students}
                filters={filters}
                onFilterChange={setFilters}
                onReset={handleResetFilters}
            />

            {/* Summary Analytics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-4 flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl shrink-0">
                        <Award className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xs uppercase font-semibold text-content-muted">
                            Média do Professor
                        </div>
                        <div className="text-2xl font-extrabold text-content-main">
                            {summary.class_teacher_average ? `${summary.class_teacher_average} / 5` : '-'}
                        </div>
                    </div>
                </Card>

                <Card className="p-4 flex items-center gap-3">
                    <div className="p-3 bg-amber-500/10 text-amber-600 rounded-2xl shrink-0">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xs uppercase font-semibold text-content-muted">
                            Autoavaliação Alunos
                        </div>
                        <div className="text-2xl font-extrabold text-content-main">
                            {summary.class_student_average ? `${summary.class_student_average} / 5` : '-'}
                        </div>
                    </div>
                </Card>

                <Card className="p-4 flex items-center gap-3">
                    <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-2xl shrink-0">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xs uppercase font-semibold text-content-muted">
                            Taxa de Presença
                        </div>
                        <div className="text-2xl font-extrabold text-content-main">
                            {summary.overall_attendance_rate !== undefined ? `${summary.overall_attendance_rate}%` : '-'}
                        </div>
                    </div>
                </Card>
            </div>

            {/* Analytics Data Table */}
            {loading ? (
                <div className="py-12 text-center text-content-muted animate-pulse">{t('loading')}</div>
            ) : error ? (
                <div className="p-4 bg-red-50 dark:bg-red-950/30 text-red-600 rounded-xl text-center text-sm">
                    {error}
                </div>
            ) : studentMetrics.length === 0 ? (
                <div className="py-12 text-center text-content-muted border border-dashed border-app-border rounded-xl">
                    {t('no_evaluations')}
                </div>
            ) : (
                <Table headers={[t('process_number'), t('full_name'), t('student_self'), t('teacher_verdict'), 'Perceção', t('attendance')]}>
                    {studentMetrics.map((item) => {
                        const hasHighGap = Math.abs(item.discrepancy) >= 1.0

                        return (
                            <tr key={item.student_id} className="hover:bg-app-hover/30 transition-colors">
                                <td className="p-3.5 font-mono text-xs font-semibold text-brand-primary">
                                    {item.process_number}
                                </td>
                                <td className="p-3.5 font-medium text-content-main">
                                    {item.name}
                                </td>
                                <td className="p-3.5">
                                    <StarRating value={Math.round(item.student_average || 0)} activeColor="text-amber-400" size="sm" readOnly />
                                </td>
                                <td className="p-3.5">
                                    <StarRating value={Math.round(item.teacher_average || 0)} activeColor="text-emerald-500" size="sm" readOnly />
                                </td>
                                <td className="p-3.5">
                                    {hasHighGap ? (
                                        <Badge variant="warning" className="gap-1">
                                            <AlertTriangle className="w-3 h-3" />
                                            <span>{item.discrepancy > 0 ? `+${item.discrepancy}` : item.discrepancy}</span>
                                        </Badge>
                                    ) : (
                                        <Badge variant="neutral">
                                            {item.discrepancy > 0 ? `+${item.discrepancy}` : item.discrepancy}
                                        </Badge>
                                    )}
                                </td>
                                <td className="p-3.5">
                                    <Badge variant={item.attendance_rate >= 85 ? 'success' : 'danger'}>
                                        {item.attendance_rate}%
                                    </Badge>
                                </td>
                            </tr>
                        )
                    })}
                </Table>
            )}
        </div>
    )
}