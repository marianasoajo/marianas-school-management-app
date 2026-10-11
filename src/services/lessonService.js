import { supabase } from '../lib/supabase'

export const lessonService = {
    async getLessons({ yearId, formId, startDate, endDate, subject } = {}) {
        let query = supabase
            .from('lessons')
            .select(`
        *,
        school_years (id, label),
        school_forms (id, year_level, class_section)
      `)
            .order('date', { ascending: false })

        if (yearId) query = query.eq('school_year_id', yearId)
        if (formId) query = query.eq('school_form_id', formId)
        if (subject) query = query.eq('subject', subject)
        if (startDate) query = query.gte('date', startDate)
        if (endDate) query = query.lte('date', endDate)

        const { data, error } = await query
        if (error) throw error
        return data
    },

    async getNextLessonNumber(yearId, formId) {
        const { data, error } = await supabase
            .from('lessons')
            .select('lesson_number')
            .eq('school_year_id', yearId)
            .eq('school_form_id', formId)

        if (error) throw error
        if (!data || data.length === 0) return '1'

        const numbers = data
            .map(l => parseInt(l.lesson_number, 10))
            .filter(n => !isNaN(n))

        if (numbers.length === 0) return '1'
        return String(Math.max(...numbers) + 1)
    },

    async createLesson(lessonData) {
        const { data, error } = await supabase
            .from('lessons')
            .insert([lessonData])
            .select()
            .single()

        if (error) throw error
        return data
    },

    async updateLesson(id, updates) {
        const { data, error } = await supabase
            .from('lessons')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async deleteLesson(id) {
        // 1. Fetch lesson details before deleting to check lesson_number, year, and form
        const { data: targetLesson, error: fetchErr } = await supabase
            .from('lessons')
            .select('school_year_id, school_form_id, lesson_number')
            .eq('id', id)
            .single()

        if (fetchErr) throw fetchErr

        // 2. Delete target lesson
        const { error: deleteErr } = await supabase
            .from('lessons')
            .delete()
            .eq('id', id)

        if (deleteErr) throw deleteErr

        // 3. Renumber subsequent lessons automatically if numerical
        const deletedNum = parseInt(targetLesson.lesson_number, 10)
        if (!isNaN(deletedNum)) {
            const { data: subsequent } = await supabase
                .from('lessons')
                .select('id, lesson_number')
                .eq('school_year_id', targetLesson.school_year_id)
                .eq('school_form_id', targetLesson.school_form_id)

            if (subsequent) {
                for (const lesson of subsequent) {
                    const currentNum = parseInt(lesson.lesson_number, 10)
                    if (!isNaN(currentNum) && currentNum > deletedNum) {
                        await supabase
                            .from('lessons')
                            .update({ lesson_number: String(currentNum - 1) })
                            .eq('id', lesson.id)
                    }
                }
            }
        }
    },

    async importSummaries({ sourceYearId, sourceFormId, targetYearId, targetFormIds }) {
        // Fetch source lessons
        const { data: sourceLessons, error: sourceErr } = await supabase
            .from('lessons')
            .select('*')
            .eq('school_year_id', sourceYearId)
            .eq('school_form_id', sourceFormId)

        if (sourceErr) throw sourceErr
        if (!sourceLessons || sourceLessons.length === 0) return []

        const newLessons = []
        for (const targetFormId of targetFormIds) {
            for (const lesson of sourceLessons) {
                const { id, created_at, ...lessonBody } = lesson
                newLessons.push({
                    ...lessonBody,
                    school_year_id: targetYearId,
                    school_form_id: targetFormId
                })
            }
        }

        const { data, error } = await supabase
            .from('lessons')
            .insert(newLessons)
            .select()

        if (error) throw error
        return data
    }
}