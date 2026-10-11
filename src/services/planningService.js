import { supabase } from '../lib/supabase'

export const planningService = {
    async getPlanningUnits(yearId) {
        let query = supabase
            .from('planning_units')
            .select(`
        *,
        planning_unit_forms (
          school_forms (id, year_level, class_section)
        )
      `)
            .order('created_at', { ascending: true })

        if (yearId) query = query.eq('school_year_id', yearId)

        const { data, error } = await query
        if (error) throw error
        return data
    },

    async createPlanningUnit(unitData, formIds = []) {
        // 1. Insert Unit
        const { data: unit, error: unitError } = await supabase
            .from('planning_units')
            .insert([unitData])
            .select()
            .single()

        if (unitError) throw unitError

        // 2. Assign Forms in junction table
        if (formIds.length > 0) {
            const junctionRows = formIds.map(formId => ({
                planning_unit_id: unit.id,
                school_form_id: formId
            }))

            const { error: junctionError } = await supabase
                .from('planning_unit_forms')
                .insert(junctionRows)

            if (junctionError) throw junctionError
        }

        return unit
    },

    async updatePlanningUnit(id, unitUpdates, formIds = null) {
        // 1. Update Unit details
        const { data: unit, error: unitError } = await supabase
            .from('planning_units')
            .update(unitUpdates)
            .eq('id', id)
            .select()
            .single()

        if (unitError) throw unitError

        // 2. Update form assignments if provided
        if (formIds !== null) {
            await supabase.from('planning_unit_forms').delete().eq('planning_unit_id', id)

            if (formIds.length > 0) {
                const junctionRows = formIds.map(formId => ({
                    planning_unit_id: id,
                    school_form_id: formId
                }))
                await supabase.from('planning_unit_forms').insert(junctionRows)
            }
        }

        return unit
    },

    async deletePlanningUnit(id) {
        const { error } = await supabase
            .from('planning_units')
            .delete()
            .eq('id', id)

        if (error) throw error
    }
}