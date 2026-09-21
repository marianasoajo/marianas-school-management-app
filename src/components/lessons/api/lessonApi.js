// src/features/lessons/api/lessonApi.js
import { supabase } from '../../../lib/supabase'

export const lessonApi = {
    async fetchFiltered({ yearId, formId, date }) {
        let query = supabase
            .from('lessons')
            .select('*, school_years(label), school_forms(year_level, class_section)')
            .order('date', { ascending: true })

        if (yearId) query = query.eq('school_year_id', yearId)
        if (formId) query = query.eq('school_form_id', formId)
        if (date) query = query.eq('date', date)

        const { data, error } = await query
        if (error) throw error
        return data
    },

    async deleteAndRenumber(lessonId, yearId, formId, deletedNumber) {
        const { error: deleteError } = await supabase.from('lessons').delete().eq('id', lessonId)
        if (deleteError) throw deleteError

        // Fetch subsequent lessons to update sequence
        const { data: subsequent } = await supabase
            .from('lessons')
            .select('id, lesson_number')
            .eq('school_year_id', yearId)
            .eq('school_form_id', formId)

        const updates = (subsequent || [])
            .map(lesson => {
                const match = lesson.lesson_number.match(/(\d+)/)
                if (!match) return null
                const num = parseInt(match[1])
                return num > deletedNumber ? { id: lesson.id, lesson_number: String(num - 1) } : null
            })
            .filter(Boolean)

        for (const update of updates) {
            await supabase.from('lessons').update({ lesson_number: update.lesson_number }).eq('id', update.id)
        }
    }
}