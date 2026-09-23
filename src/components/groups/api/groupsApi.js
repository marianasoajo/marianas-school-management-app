import { supabase } from '../../../lib/supabase'

export const groupsApi = {
    // Fetch all academic years
    async fetchSchoolYears() {
        const { data, error } = await supabase
            .from('school_years')
            .select('*')
            .order('label', { ascending: false })

        if (error) throw error
        return data || []
    },

    // Fetch all school forms
    async fetchSchoolForms() {
        const { data, error } = await supabase
            .from('school_forms')
            .select('*')
            .order('year_level, class_section')

        if (error) throw error
        return data || []
    },

    // Save or update academic year
    async saveSchoolYear(yearForm, editingYear = null) {
        if (editingYear) {
            const { data, error } = await supabase
                .from('school_years')
                .update(yearForm)
                .eq('id', editingYear.id)
                .select()
                .single()

            if (error) throw error
            return data
        } else {
            const { data, error } = await supabase
                .from('school_years')
                .insert(yearForm)
                .select()
                .single()

            if (error) throw error
            return data
        }
    },

    // Delete academic year
    async deleteSchoolYear(yearId) {
        const { error } = await supabase
            .from('school_years')
            .delete()
            .eq('id', yearId)

        if (error) throw error
    },

    // Set active academic year
    async setActiveSchoolYear(yearId) {
        // 1. Deactivate all
        const { error: resetError } = await supabase
            .from('school_years')
            .update({ is_active: false })
            .neq('id', '00000000-0000-0000-0000-000000000000')

        if (resetError) throw resetError

        // 2. Activate target year
        const { error: activeError } = await supabase
            .from('school_years')
            .update({ is_active: true })
            .eq('id', yearId)

        if (activeError) throw activeError
    },

    // Save or update school form
    async saveSchoolForm(formForm, editingForm = null) {
        if (editingForm) {
            const { data, error } = await supabase
                .from('school_forms')
                .update(formForm)
                .eq('id', editingForm.id)
                .select()
                .single()

            if (error) throw error
            return data
        } else {
            const { data, error } = await supabase
                .from('school_forms')
                .insert(formForm)
                .select()
                .single()

            if (error) throw error
            return data
        }
    },

    // Delete school form
    async deleteSchoolForm(formId) {
        const { error } = await supabase
            .from('school_forms')
            .delete()
            .eq('id', formId)

        if (error) throw error
    },

    // Fetch students enrolled in a specific year + form combination
    async fetchStudentsInGroup(schoolYearId, schoolFormId) {
        const { data, error } = await supabase
            .from('student_enrollments')
            .select(`
        id,
        group_number,
        student_id,
        students ( id, process_number, name )
      `)
            .eq('school_year_id', schoolYearId)
            .eq('school_form_id', schoolFormId)
            .order('group_number', { ascending: true })

        if (error) throw error
        return data || []
    },

    // Export/Promote students from source group to target group
    async exportStudents({ targetYearId, targetFormId, studentEnrollments, preserveGroupNumbers }) {
        const recordsToUpsert = studentEnrollments.map((item) => ({
            student_id: item.student_id,
            school_year_id: targetYearId,
            school_form_id: targetFormId,
            group_number: preserveGroupNumbers ? item.group_number : null
        }))

        const { data, error } = await supabase
            .from('student_enrollments')
            .upsert(recordsToUpsert, { onConflict: 'student_id,school_year_id' })
            .select()

        if (error) throw error
        return data
    }
}