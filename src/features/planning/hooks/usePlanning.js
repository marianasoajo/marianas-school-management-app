import { useCallback, useEffect, useState } from 'react'
import { planningService } from '../../../services/planningService'

export function usePlanning(yearId = null) {
    const [planningUnits, setPlanningUnits] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchUnits = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await planningService.getPlanningUnits(yearId)
            setPlanningUnits(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [yearId])

    useEffect(() => {
        fetchUnits()
    }, [fetchUnits])

    const createUnit = async (unitData, formIds) => {
        const created = await planningService.createPlanningUnit(unitData, formIds)
        await fetchUnits()
        return created
    }

    const updateUnit = async (id, unitUpdates, formIds) => {
        const updated = await planningService.updatePlanningUnit(id, unitUpdates, formIds)
        await fetchUnits()
        return updated
    }

    const deleteUnit = async (id) => {
        await planningService.deletePlanningUnit(id)
        await fetchUnits()
    }

    const exportToLesson = async (exportPayload) => {
        return await planningService.exportToLesson(exportPayload)
    }

    return {
        planningUnits,
        loading,
        error,
        refresh: fetchUnits,
        createUnit,
        updateUnit,
        deleteUnit,
        exportToLesson
    }
}