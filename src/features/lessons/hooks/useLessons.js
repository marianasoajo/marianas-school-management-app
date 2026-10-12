import { useCallback, useEffect, useState } from 'react'
import { lessonService } from '../../../services/lessonService'

export function useLessons(filters = {}) {
    const [lessons, setLessons] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchLessons = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await lessonService.getLessons(filters)
            setLessons(data || [])
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [filters])

    useEffect(() => {
        fetchLessons()
    }, [fetchLessons])

    const getNextNumber = async (yearId, formId) => {
        return await lessonService.getNextLessonNumber(yearId, formId)
    }

    const createLesson = async (lessonData) => {
        const created = await lessonService.createLesson(lessonData)
        await fetchLessons()
        return created
    }

    const updateLesson = async (id, updates) => {
        const updated = await lessonService.updateLesson(id, updates)
        await fetchLessons()
        return updated
    }

    const deleteLesson = async (id) => {
        await lessonService.deleteLesson(id)
        await fetchLessons()
    }

    const importSummaries = async (importPayload) => {
        const imported = await lessonService.importSummaries(importPayload)
        await fetchLessons()
        return imported
    }

    return {
        lessons,
        loading,
        error,
        refresh: fetchLessons,
        getNextNumber,
        createLesson,
        updateLesson,
        deleteLesson,
        importSummaries
    }
}