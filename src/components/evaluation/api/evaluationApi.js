import { supabase } from '../../../lib/supabase'

export const RATING_LABELS = {
    1: 'very_poor',
    2: 'poor',
    3: 'fair',
    4: 'good',
    5: 'excellent'
}

export const evaluationApi = {
    async fetchMetadata() {
        const [yearsRes, formsRes] = await Promise.all([
            supabase.from('school_years').select('*').order('label', { ascending: false }),
            supabase.from('school_forms').select('*').order('year_level, class_section')
        ])

        if (yearsRes.error) throw yearsRes.error
        if (formsRes.error) throw formsRes.error

        return {
            schoolYears: yearsRes.data || [],
            schoolForms: formsRes.data || []
        }
    },

    async fetchFilteredLessons({ selectedYearId, selectedFormId, startDate, endDate }) {
        let query = supabase
            .from('lessons')
            .select('id, date, lesson_number')
            .eq('school_year_id', selectedYearId)
            .eq('school_form_id', selectedFormId)
            .order('date', { ascending: true })

        if (startDate) query = query.gte('date', startDate)
        if (endDate) query = query.lte('date', endDate)

        const { data, error } = await query
        if (error) throw error
        return data || []
    },

    async fetchEvaluationsSummary({ lessonIds, selectedYearId, selectedFormId }) {
        const { data: evalsData, error: evalsError } = await supabase
            .from('evaluations')
            .select('*')
            .in('lesson_id', lessonIds)

        if (evalsError) throw evalsError
        if (!evalsData || evalsData.length === 0) return []

        const studentIds = [...new Set(evalsData.map((e) => e.student_id))]

        const [{ data: studentsData, error: studentsError }, { data: enrolmentsData, error: enrolmentsError }] =
            await Promise.all([
                supabase.from('students').select('id, name, process_number').in('id', studentIds),
                supabase
                    .from('student_enrolments')
                    .select('student_id, group_number')
                    .eq('school_year_id', selectedYearId)
                    .eq('school_form_id', selectedFormId)
                    .in('student_id', studentIds)
            ])

        if (studentsError) throw studentsError
        if (enrolmentsError) throw enrolmentsError

        const studentMap = new Map(studentsData.map((s) => [s.id, s]))
        const enrolmentMap = new Map(enrolmentsData.map((e) => [e.student_id, e]))

        const aggMap = new Map()
        evalsData.forEach((item) => {
            const current = aggMap.get(item.student_id) || {
                student_id: item.student_id,
                student_rating_sum: 0,
                student_rating_count: 0,
                teacher_rating_sum: 0,
                teacher_rating_count: 0
            }
            if (item.student_rating !== null) {
                current.student_rating_sum += item.student_rating
                current.student_rating_count += 1
            }
            if (item.teacher_rating !== null) {
                current.teacher_rating_sum += item.teacher_rating
                current.teacher_rating_count += 1
            }
            aggMap.set(item.student_id, current)
        })

        const rows = []
        aggMap.forEach((agg, studentId) => {
            const student = studentMap.get(studentId)
            const enrolment = enrolmentMap.get(studentId)
            if (!student || !enrolment) return

            rows.push({
                student_id: studentId,
                student_name: student.name,
                process_number: student.process_number,
                group_number: enrolment.group_number,
                student_avg: agg.student_rating_count > 0 ? agg.student_rating_sum / agg.student_rating_count : null,
                teacher_avg: agg.teacher_rating_count > 0 ? agg.teacher_rating_sum / agg.teacher_rating_count : null,
                eval_count: Math.max(agg.student_rating_count, agg.teacher_rating_count)
            })
        })

        return rows
    },

    async upsertEvaluations(evaluations, lessonId) {
        const upserts = evaluations.map((e) => ({
            ...(e.evaluation_id ? { id: e.evaluation_id } : {}),
            lesson_id: lessonId,
            student_id: e.student_id,
            is_attending: e.is_attending,
            student_rating: e.student_rating,
            teacher_rating: e.teacher_rating,
            notes: e.notes
        }))

        const { data, error } = await supabase
            .from('evaluations')
            .upsert(upserts, { onConflict: 'lesson_id,student_id' })
            .select()

        if (error) throw error
        return data || []
    }
}