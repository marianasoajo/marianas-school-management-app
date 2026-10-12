import { useCallback, useEffect, useState } from 'react'
import { groupService } from '../../../services/groupService'

export function useGroupsManager() {
    const [years, setYears] = useState([])
    const [forms, setForms] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchAll = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const [yearsData, formsData] = await Promise.all([
                groupService.getAcademicYears(),
                groupService.getSchoolForms()
            ])
            setYears(yearsData || [])
            setForms(formsData || [])
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchAll()
    }, [fetchAll])

    const createYear = async (yearData) => {
        const created = await groupService.createAcademicYear(yearData)
        await fetchAll()
        return created
    }

    const updateYear = async (id, updates) => {
        const updated = await groupService.updateAcademicYear(id, updates)
        await fetchAll()
        return updated
    }

    const deleteYear = async (id) => {
        await groupService.deleteAcademicYear(id)
        await fetchAll()
    }

    const setActiveYear = async (id) => {
        await groupService.setActiveYear(id)
        await fetchAll()
    }

    const createForm = async (formData) => {
        const created = await groupService.createSchoolForm(formData)
        await fetchAll()
        return created
    }

    const updateForm = async (id, updates) => {
        const updated = await groupService.updateSchoolForm(id, updates)
        await fetchAll()
        return updated
    }

    const deleteForm = async (id) => {
        await groupService.deleteSchoolForm(id)
        await fetchAll()
    }

    return {
        years,
        forms,
        activeYear: years.find((y) => y.is_active) || null,
        loading,
        error,
        refresh: fetchAll,
        createYear,
        updateYear,
        deleteYear,
        setActiveYear,
        createForm,
        updateForm,
        deleteForm
    }
}