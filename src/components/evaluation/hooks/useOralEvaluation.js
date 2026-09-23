import { useEffect, useState } from 'react'
import { evaluationApi } from '../api/evaluationApi'

export function useOralEvaluation(initialLessonId = null) {
    const [lessons, setLessons] = useState([])
    const [selectedLessonId, setSelectedLessonId] = useState(initialLessonId)
    const [selectedLesson, setSelectedLesson] = useState(null)
    const [studentEvaluations, setStudentEvaluations] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    const [dirtyIds, setDirtyIds] = useState(new Set())

    useEffect(() => {
        if (initialLessonId) setSelectedLessonId(initialLessonId)
    }, [initialLessonId])

    // Fetch available lessons list
    useEffect(() => {
        let isSubscribed = true
        setLoading(true)
        evaluationApi.fetchLessonsList()
            .then((data) => {
                if (!isSubscribed) return
                setLessons(data)
                if (data.length > 0 && !initialLessonId) setSelectedLessonId(data[0].id)
            })
            .catch((err) => isSubscribed && setError(err.message))
            .finally(() => isSubscribed && setLoading(false))

        return () => { isSubscribed = false }
    }, [initialLessonId])

    // Fetch student evaluations for selected lesson
    useEffect(() => {
        if (!selectedLessonId) return
        let isSubscribed = true
        setLoading(true)
        setError(null)

        evaluationApi.fetchLessonAndStudents(selectedLessonId)
            .then(({ lesson, studentEvaluations }) => {
                if (!isSubscribed) return
                setSelectedLesson(lesson)
                setStudentEvaluations(studentEvaluations)
                setDirtyIds(new Set())
            })
            .catch((err) => isSubscribed && setError(err.message))
            .finally(() => isSubscribed && setLoading(false))

        return () => { isSubscribed = false }
    }, [selectedLessonId])

    const markDirty = (studentId) => setDirtyIds((prev) => new Set(prev).add(studentId))

    const handleAttendanceChange = (index, isAttending) => {
        setStudentEvaluations((prev) => {
            const updated = [...prev]
            updated[index] = { ...updated[index], is_attending: isAttending }
            return updated
        })
        markDirty(studentEvaluations[index]?.student_id)
    }

    const handleRatingChange = (index, field, value) => {
        setStudentEvaluations((prev) => {
            const updated = [...prev]
            updated[index] = { ...updated[index], [field]: Number(value) }
            return updated
        })
        markDirty(studentEvaluations[index]?.student_id)
    }

    const handleNotesChange = (index, text) => {
        setStudentEvaluations((prev) => {
            const updated = [...prev]
            updated[index] = { ...updated[index], notes: text }
            return updated
        })
        markDirty(studentEvaluations[index]?.student_id)
    }

    const handleSave = async () => {
        if (dirtyIds.size === 0) return
        setSaving(true)
        setError(null)

        try {
            const dirtyEvals = studentEvaluations.filter((e) => dirtyIds.has(e.student_id))
            const data = await evaluationApi.upsertEvaluations(dirtyEvals, selectedLessonId)

            const updatedMap = new Map(data.map((e) => [e.student_id, e.id]))
            setStudentEvaluations((prev) =>
                prev.map((e) => ({ ...e, evaluation_id: updatedMap.get(e.student_id) || e.evaluation_id }))
            )
            setDirtyIds(new Set())
        } catch (err) {
            setError(err.message)
        } finally {
            setSaving(false)
        }
    }

    return {
        lessons,
        selectedLessonId,
        setSelectedLessonId,
        selectedLesson,
        studentEvaluations,
        loading,
        saving,
        error,
        dirtyCount: dirtyIds.size,
        handleAttendanceChange,
        handleRatingChange,
        handleNotesChange,
        handleSave
    }
}