import { supabase } from '../lib/supabase'

export const evaluationService = {
    async getEvaluationsByLesson(lessonId) {
        const { data, error } = await supabase
            .from('evaluations')
            .select('*')
            .eq('lesson_id', lessonId)

        if (error) throw error
        return data
    },

    async upsertEvaluations(evaluations) {
        const { data, error } = await supabase
            .from('evaluations')
            .upsert(evaluations, { onConflict: 'lesson_id,student_id' })
            .select()

        if (error) throw error
        return data
    },

    async getEvaluationAverages({ yearId, formId, studentId, startDate, endDate } = {}) {
        let query = supabase
            .from('evaluations')
            .select(`
        id,
        student_rating,
        teacher_rating,
        is_attending,
        notes,
        student:students (id, name, process_number),
        lesson:lessons!inner (
          id,
          date,
          school_year_id,
          school_form_id
        )
      `)

        if (yearId) query = query.eq('lesson.school_year_id', yearId)
        if (formId) query = query.eq('lesson.school_form_id', formId)
        if (studentId) query = query.eq('student_id', studentId)
        if (startDate) query = query.gte('lesson.date', startDate)
        if (endDate) query = query.lte('lesson.date', endDate)

        const { data, error } = await query
        if (error) throw error

        // Aggregate statistics per student
        const studentMap = {}

        data.forEach(item => {
            const s = item.student
            if (!s) return

            if (!studentMap[s.id]) {
                studentMap[s.id] = {
                    student_id: s.id,
                    name: s.name,
                    process_number: s.process_number,
                    student_ratings: [],
                    teacher_ratings: [],
                    total_evaluations: 0
                }
            }

            if (item.student_rating) studentMap[s.id].student_ratings.push(item.student_rating)
            if (item.teacher_rating) studentMap[s.id].teacher_ratings.push(item.teacher_rating)
            studentMap[s.id].total_evaluations++
        })

        return Object.values(studentMap).map(s => {
            const sAvg = s.student_ratings.length
                ? (s.student_ratings.reduce((a, b) => a + b, 0) / s.student_ratings.length).toFixed(1)
                : null
            const tAvg = s.teacher_ratings.length
                ? (s.teacher_ratings.reduce((a, b) => a + b, 0) / s.teacher_ratings.length).toFixed(1)
                : null

            return {
                student_id: s.student_id,
                name: s.name,
                process_number: s.process_number,
                student_average: sAvg ? parseFloat(sAvg) : null,
                teacher_average: tAvg ? parseFloat(tAvg) : null,
                total_evaluations: s.total_evaluations
            }
        })
    }
}