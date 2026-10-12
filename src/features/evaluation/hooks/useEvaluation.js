import { useCallback, useState } from 'react'
import { evaluationService } from '../../../services/evaluationService'

export function useEvaluation() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [insights, setInsights] = useState({ students: [], summary: {} })

    const fetchInsights = useCallback(async (filters = {}) => {
        setLoading(true)
        setError(null)
        try {
            const data = await evaluationService.getEvaluationInsights(filters)
            setInsights(data)
            return data
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    const getLessonEvaluations = useCallback(async (lessonId) => {
        setLoading(true)
        setError(null)
        try {
            return await evaluationService.getEvaluationsByLesson(lessonId)
        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    const saveEvaluations = (async (evaluations) => {
        setLoading(true)
        setError(null)
        try {
            return await evaluationService.upsertEvaluations(evaluations)
        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    return {
        insights,
        loading,
        error,
        fetchInsights,
        getLessonEvaluations,
        saveEvaluations
    }
}