import { useCallback, useEffect, useState } from 'react'
import { lessonApi } from '../api/lessonApi'

export function useLessons(session, filters) {
    const [lessons, setLessons] = useState([])
    const [schoolYears, setSchoolYears] = useState([])
    const [schoolForms, setSchoolForms] = useState([])
    const [selectedLessonId, setSelectedLessonId] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!session) return
        lessonApi
            .fetchMetadata()
            .then(({ schoolYears, schoolForms }) => {
                setSchoolYears(schoolYears)
                setSchoolForms(schoolForms)
            })
            .catch((err) => setError(err.message))
    }, [session])

    const loadLessons = useCallback(async () => {
        if (!session) return
        setLoading(true)
        setError(null)
        try {
            const data = await lessonApi.fetchFiltered(filters)
            setLessons(data)
            if (data.length > 0 && !selectedLessonId) {
                setSelectedLessonId(data[0].id)
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [session, filters, selectedLessonId])

    useEffect(() => {
        loadLessons()
    }, [loadLessons])

    const deleteLesson = async (lessonId) => {
        try {
            await lessonApi.deleteAndRenumber(lessonId)
            if (selectedLessonId === lessonId) setSelectedLessonId(null)
            await loadLessons()
        } catch (err) {
            setError(err.message)
        }
    }

    return {
        lessons,
        schoolYears,
        schoolForms,
        loading,
        error,
        setError,
        selectedLessonId,
        setSelectedLessonId,
        deleteLesson,
        refresh: loadLessons
    }
}