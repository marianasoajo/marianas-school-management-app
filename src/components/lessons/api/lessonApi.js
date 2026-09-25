import { supabase } from '../../../lib/supabase'

export const lessonApi = {
    async fetchMetadata() {
        const [yearsRes, formsRes] = await Promise.all([
            supabase.from('school_years').select('*').order('label', { ascending: false }),
            supabase.from('school_forms').select('*').order('year_level, class_section')
        ])
        if (yearsRes.error) throw yearsRes.error
        if (formsRes.error) throw formsRes.error
        return { schoolYears: yearsRes.data || [], schoolForms: formsRes.data || [] }
    },

    async fetchFiltered({ yearId, formId, dateMode = 'single', date, startDate, endDate }) {
        let query = supabase
            .from('lessons')
            .select('*, school_years (label), school_forms (year_level, class_section)')
            .order('date', { ascending: true })

        if (yearId) query = query.eq('school_year_id', yearId)
        if (formId) query = query.eq('school_form_id', formId)

        if (dateMode === 'range') {
            if (startDate) query = query.gte('date', startDate)
            if (endDate) query = query.lte('date', endDate)
        } else {
            if (date) query = query.eq('date', date)
        }

        const { data, error } = await query
        if (error) throw error
        return data || []
    },

    async getNextLessonNumber(yearId, formId) {
        if (!yearId || !formId) return '1'
        const { data } = await supabase
            .from('lessons')
            .select('lesson_number')
            .eq('school_year_id', yearId)
            .eq('school_form_id', formId)
            .order('lesson_number', { ascending: false })
            .limit(1)

        if (data && data.length > 0) {
            const match = data[0].lesson_number.match(/(\d+)/)
            if (match) return String(parseInt(match[1]) + 1)
        }
        return '1'
    },

    async saveLesson(formData, editingId = null) {
        if (editingId) {
            const { data, error } = await supabase
                .from('lessons')
                .update(formData)
                .eq('id', editingId)
                .select()
                .single()
            if (error) throw error
            return data
        } else {
            const { data, error } = await supabase
                .from('lessons')
                .insert(formData)
                .select()
                .single()
            if (error) throw error
            return data
        }
    },

    async deleteAndRenumber(lessonId) {
        const { data: lessonToDelete, error: fetchError } = await supabase
            .from('lessons')
            .select('lesson_number, school_year_id, school_form_id')
            .eq('id', lessonId)
            .single()

        if (fetchError) throw fetchError

        const match = lessonToDelete.lesson_number.match(/(\d+)/)
        const { error: deleteError } = await supabase.from('lessons').delete().eq('id', lessonId)
        if (deleteError) throw deleteError

        if (!match) return

        const deletedNumber = parseInt(match[1])
        const { data: subsequent, error: fetchSubError } = await supabase
            .from('lessons')
            .select('id, lesson_number')
            .eq('school_year_id', lessonToDelete.school_year_id)
            .eq('school_form_id', lessonToDelete.school_form_id)

        if (fetchSubError) throw fetchSubError

        const updates = (subsequent || [])
            .map((l) => {
                const m = l.lesson_number.match(/(\d+)/)
                if (!m) return null
                const num = parseInt(m[1])
                return num > deletedNumber ? { id: l.id, new_number: String(num - 1) } : null
            })
            .filter(Boolean)

        for (const update of updates) {
            await supabase.from('lessons').update({ lesson_number: update.new_number }).eq('id', update.id)
        }
    },

    async importSummaries({ sourceLessonId, targetFormIds }) {
        const { data: sourceLesson, error: fetchError } = await supabase
            .from('lessons')
            .select('*')
            .eq('id', sourceLessonId)
            .single()

        if (fetchError) throw fetchError
        if (!sourceLesson) throw new Error('Source lesson not found')

        const copies = targetFormIds.map((targetFormId) => {
            const { id, created_at, ...lessonData } = sourceLesson
            return {
                ...lessonData,
                school_form_id: targetFormId,
                school_year_id: sourceLesson.school_year_id
            }
        })

        const { error: insertError } = await supabase.from('lessons').insert(copies)
        if (insertError) throw insertError
    },

    async fetchLessonsByForm(yearId, formId) {
        if (!yearId || !formId) return []
        const { data, error } = await supabase
            .from('lessons')
            .select('id, lesson_number, subject, date, summary, attention_box, teacher_notes')
            .eq('school_year_id', yearId)
            .eq('school_form_id', formId)
            .order('date', { ascending: true })

        if (error) throw error
        return data || []
    },

    async importToExistingLessons({ sourceLessonId, targetLessonIds, fields }) {
        if (!targetLessonIds || targetLessonIds.length === 0) {
            throw new Error('No target lessons selected.')
        }

        // 1. Fetch source lesson content
        const { data: source, error: fetchError } = await supabase
            .from('lessons')
            .select('*')
            .eq('id', sourceLessonId)
            .single()

        if (fetchError || !source) throw fetchError || new Error('Source lesson not found')

        // 2. Build payload dynamically based on selected fields
        const payload = {}
        if (fields.summary) payload.summary = source.summary
        if (fields.attention_box) payload.attention_box = source.attention_box
        if (fields.teacher_notes) payload.teacher_notes = source.teacher_notes
        if (fields.lesson_number) payload.lesson_number = source.lesson_number
        if (fields.subject) payload.subject = source.subject

        if (Object.keys(payload).length === 0) {
            throw new Error('Please select at least one field to import.')
        }

        // 3. Update existing target lessons
        const { error: updateError } = await supabase
            .from('lessons')
            .update(payload)
            .in('id', targetLessonIds)

        if (updateError) throw updateError
    }
}