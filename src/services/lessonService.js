import { supabase } from '../lib/supabase'

export const lessonService = {
    async getLessons({ yearId, formId, startDate, endDate, date, dateMode = 'single', subject, searchQuery } = {}) {
        let query = supabase
            .from('lessons')
            .select(`
        *,
        school_years (id, label),
        school_forms (id, year_level, class_section)
      `)
            .order('date', { ascending: true }) // DB-level chronological ascending ordering
            .order('lesson_number', { ascending: true })

        if (yearId) query = query.eq('school_year_id', yearId)
        if (formId) query = query.eq('school_form_id', formId)
        if (subject) query = query.eq('subject', subject)

        // Filter by single date or date range
        if (dateMode === 'single' && date) {
            query = query.eq('date', date)
        } else if (dateMode === 'range') {
            if (startDate) query = query.gte('date', startDate)
            if (endDate) query = query.lte('date', endDate)
        }

        // Full-text search across summary, attention box, and teacher notes
        if (searchQuery && searchQuery.trim()) {
            const q = searchQuery.trim()
            query = query.or(`summary.ilike.%${q}%,attention_box.ilike.%${q}%,teacher_notes.ilike.%${q}%`)
        }

        const { data, error } = await query
        if (error) throw error
        return data || []
    },

    async getNextLessonNumber(yearId, formId) {
        const { data, error } = await supabase
            .from('lessons')
            .select('lesson_single')
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
        const { error } = await supabase
            .from('lessons')
            .delete()
            .eq('id', id)

        if (error) throw error
    },

    async importSummaries({ sourceYearId, sourceFormId, targetYearId, targetFormIds }) {
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
                const lessonBody = { ...lesson }
                delete lessonBody.id
                delete lessonBody.created_at

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