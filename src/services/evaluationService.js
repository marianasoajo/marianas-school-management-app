import { supabase } from '../lib/supabase'

export const evaluationService = {
    async getEvaluationsByLesson(lessonId) {
        const { data, error } = await supabase
            .from('evaluations')
            .select('*')
            .eq('lesson_id', lessonId)

        if (error) throw error
        return data || []
    },

    async upsertEvaluations(evaluations) {
        const { data, error } = await supabase
            .from('evaluations')
            .upsert(evaluations, { onConflict: 'lesson_id,student_id' })
            .select()

        if (error) throw error
        return data
    },

    async getEvaluationInsights({ yearId, level, formId, studentId, startDate, endDate } = {}) {
        let query = supabase
            .from('evaluations')
            .select(`
        id,
        student_rating,
        teacher_rating,
        is_attending,
        notes,
        student_id,
        student:students (id, name, process_number),
        lesson:lessons!inner (
          id,
          date,
          school_year_id,
          school_form_id,
          school_forms!inner (id, year_level, class_section)
        )
      `)

        if (yearId) query = query.eq('lesson.school_year_id', yearId)
        if (formId) query = query.eq('lesson.school_form_id', formId)
        if (level) query = query.eq('lesson.school_forms.year_level', level)
        if (studentId) query = query.eq('student_id', studentId)
        if (startDate) query = query.gte('lesson.date', startDate)
        if (endDate) query = query.lte('lesson.date', endDate)

        const { data, error } = await query
        if (error) throw error

        const studentMap = {}
        let totalPresentCount = 0
        let totalRecordsCount = 0

        data.forEach((item) => {
            const s = item.student
            if (!s) return

            if (!studentMap[s.id]) {
                studentMap[s.id] = {
                    student_id: s.id,
                    name: s.name,
                    process_number: s.process_number,
                    student_ratings: [],
                    teacher_ratings: [],
                    attendance_count: 0,
                    total_evaluations: 0,
                    notes_list: []
                }
            }

            totalRecordsCount++
            if (item.is_attending) {
                studentMap[s.id].attendance_count++
                totalPresentCount++
            }

            if (item.student_rating) studentMap[s.id].student_ratings.push(item.student_rating)
            if (item.teacher_rating) studentMap[s.id].teacher_ratings.push(item.teacher_rating)
            if (item.notes) studentMap[s.id].notes_list.push(item.notes)
            studentMap[s.id].total_evaluations++
        })

        const studentMetrics = Object.values(studentMap).map((s) => {
            const sAvg = s.student_ratings.length
                ? s.student_ratings.reduce((a, b) => a + b, 0) / s.student_ratings.length
                : null
            const tAvg = s.teacher_ratings.length
                ? s.teacher_ratings.reduce((a, b) => a + b, 0) / s.teacher_ratings.length
                : null

            const discrepancy = sAvg !== null && tAvg !== null ? parseFloat((sAvg - tAvg).toFixed(2)) : 0
            const attendanceRate = s.total_evaluations > 0
                ? Math.round((s.attendance_count / s.total_evaluations) * 100)
                : 100

            return {
                student_id: s.student_id,
                name: s.name,
                process_number: s.process_number,
                student_average: sAvg ? parseFloat(sAvg.toFixed(1)) : null,
                teacher_average: tAvg ? parseFloat(tAvg.toFixed(1)) : null,
                discrepancy,
                attendance_rate: attendanceRate,
                total_evaluations: s.total_evaluations,
                notes: s.notes_list
            }
        })

        // Overall Class Aggregate Insights
        const validStudentAvgs = studentMetrics.map((m) => m.student_average).filter(Boolean)
        const validTeacherAvgs = studentMetrics.map((m) => m.teacher_average).filter(Boolean)

        const classStudentAverage = validStudentAvgs.length
            ? (validStudentAvgs.reduce((a, b) => a + b, 0) / validStudentAvgs.length).toFixed(1)
            : null

        const classTeacherAverage = validTeacherAvgs.length
            ? (validTeacherAvgs.reduce((a, b) => a + b, 0) / validTeacherAvgs.length).toFixed(1)
            : null

        const overallAttendance = totalRecordsCount > 0
            ? Math.round((totalPresentCount / totalRecordsCount) * 100)
            : 100

        return {
            students: studentMetrics,
            summary: {
                total_students: studentMetrics.length,
                total_evaluations_recorded: totalRecordsCount,
                class_student_average: classStudentAverage ? parseFloat(classStudentAverage) : null,
                class_teacher_average: classTeacherAverage ? parseFloat(classTeacherAverage) : null,
                overall_attendance_rate: overallAttendance
            }
        }
    }
}