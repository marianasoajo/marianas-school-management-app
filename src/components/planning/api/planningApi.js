import { supabase } from '../../../lib/supabase'

export const planningApi = {
    async fetchInitialData() {
        const [formsRes, planningRes] = await Promise.all([
            supabase.from('school_forms').select('*').order('year_level', { ascending: true }),
            supabase.from('planning_units').select('*').order('created_at', { ascending: true })
        ])

        if (formsRes.error) throw formsRes.error
        if (planningRes.error) throw planningRes.error

        return {
            schoolForms: formsRes.data || [],
            planningUnits: planningRes.data || []
        }
    },

    async createTheme(defaultFormId, defaultTitle) {
        const payload = {
            theme: defaultTitle,
            school_form_id: defaultFormId,
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
        return data
    },

    async saveThemes(dirtyUnits) {
        const updates = dirtyUnits.map((unit) => {
            const { id, created_at, ...fields } = unit
            return supabase.from('planning_units').update(fields).eq('id', id)
        })

        const results = await Promise.all(updates)
        const failed = results.find((r) => r.error)
        if (failed) throw failed.error
    },

    async deleteTheme(id) {
        const { error } = await supabase.from('planning_units').delete().eq('id', id)
        if (error) throw error
    }
}