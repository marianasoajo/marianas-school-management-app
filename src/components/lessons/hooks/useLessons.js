// src/features/lessons/hooks/useLessons.js
import { useCallback, useEffect, useState } from 'react'
import { lessonApi } from '../api/lessonApi'

export function useLessons(session, filters) {
    const [lessons, setLessons] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedLessonId, setSelectedLessonId] = useState(null)

    const loadLessons = useCallback(async () => {
        if (!session) return
        setLoading(true)
        try {
            const data = await lessonApi.fetchFiltered(filters)
            setLessons(data || [])
            if (data?.length && !selectedLessonId) setSelectedLessonId(data[0].id)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [session, filters, selectedLessonId])

    useEffect(() => {
        loadLessons()
    }, [loadLessons])

    const deleteLesson = async (lesson) => {
        try {
            const match = lesson.lesson_number.match(/(\d+)/)
            const num = match ? parseInt(match[1]) : null

            if (num) {
                await lessonApi.deleteAndRenumber(lesson.id, lesson.school_year_id, lesson.school_form_id, num)
            } else {
                await lessonApi.deleteAndRenumber(lesson.id)
            }
            await loadLessons()
        } catch (err) {
            setError(err.message)
        }
    }

    return { lessons, loading, error, selectedLessonId, setSelectedLessonId, deleteLesson, refresh: loadLessons }
}