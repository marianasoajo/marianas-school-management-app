import { supabase } from '../lib/supabase'

export const groupService = {
    // --- Academic Years ---
    async getAcademicYears() {
        const { data, error } = await supabase
            .from('school_years')
            .select('*')
            .order('label', { ascending: false })

        if (error) throw error
        return data
    },

    async createAcademicYear(yearData) {
        const { data, error } = await supabase
            .from('school_years')
            .insert([yearData])
            .select()
            .single()

        if (error) throw error
        return data
    },

    async updateAcademicYear(id, updates) {
        const { data, error } = await supabase
            .from('school_years')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async deleteAcademicYear(id) {
        const { error } = await supabase
            .from('school_years')
            .delete()
            .eq('id', id)

        if (error) throw error
    },

    async setActiveYear(activeId) {
        // 1. Unset active status on all years
        const { error: resetError } = await supabase
            .from('school_years')
            .update({ is_active: false })
            .neq('id', '00000000-0000-0000-0000-000000000000')

        if (resetError) throw resetError

        // 2. Set active status for target year
        const { data, error } = await supabase
            .from('school_years')
            .update({ is_active: true })
            .eq('id', activeId)
            .select()
            .single()

        if (error) throw error
        return data
    },

    // --- School Forms / Classes ---
    async getSchoolForms() {
        const { data, error } = await supabase
            .from('school_forms')
            .select('*')
            .order('year_level', { ascending: true })
            .order('class_section', { ascending: true })

        if (error) throw error
        return data
    },

    async createSchoolForm(formData) {
        const { data, error } = await supabase
            .from('school_forms')
            .insert([formData])
            .select()
            .single()

        if (error) throw error
        return data
    },

    async updateSchoolForm(id, updates) {
        const { data, error } = await supabase
            .from('school_forms')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async deleteSchoolForm(id) {
        const { error } = await supabase
            .from('school_forms')
            .delete()
            .eq('id', id)

        if (error) throw error
    }
}