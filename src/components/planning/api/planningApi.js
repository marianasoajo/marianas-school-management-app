import { supabase } from '../../../lib/supabase'

export const planningApi = {
    async fetchInitialData() {
        const [formsRes, planningRes] = await Promise.all([
            supabase.from('school_forms').select('*').order('year_level', { ascending: true }),
            supabase.from('planning_units').select('*, planning_unit_forms(school_form_id)').order('created_at', { ascending: true })
        ])

        if (formsRes.error) throw formsRes.error
        if (planningRes.error) throw planningRes.error

        const planningUnits = (planningRes.data || []).map((unit) => ({
            ...unit,
            form_ids: unit.planning_unit_forms ? unit.planning_unit_forms.map((f) => f.school_form_id) : []
        }))

        return {
            schoolForms: formsRes.data || [],
            planningUnits
        }
    },

    async createTheme(defaultTitle) {
        const payload = {
            theme: defaultTitle,
            activities: '',
            manual_pages: '',
            resources_physical: '',
            resources_digital: '',
            exercises_physical: '',
            exercises_digital: '',
            registers: ''
        }

        const { data, error } = await supabase
            .from('planning_units')
            .insert(payload)
            .select()
            .single()

        if (error) throw error
        return { ...data, form_ids: [] }
    },

    async saveThemes(dirtyUnits) {
        for (const unit of dirtyUnits) {
            const { id, created_at, form_ids, planning_unit_forms, ...fields } = unit

            // Update theme content
            const { error: updateErr } = await supabase.from('planning_units').update(fields).eq('id', id)
            if (updateErr) throw updateErr

            // Sync junction table
            const { error: delErr } = await supabase.from('planning_unit_forms').delete().eq('planning_unit_id', id)
            if (delErr) throw delErr

            if (form_ids && form_ids.length > 0) {
                const junctionRows = form_ids.map((formId) => ({
                    planning_unit_id: id,
                    school_form_id: formId
                }))
                const { error: insErr } = await supabase.from('planning_unit_forms').insert(junctionRows)
                if (insErr) throw insErr
            }
        }
    },

    async deleteTheme(id) {
        const { error } = await supabase.from('planning_units').delete().eq('id', id)
        if (error) throw error
    }
}