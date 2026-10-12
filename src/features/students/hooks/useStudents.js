import { useCallback, useEffect, useState } from 'react'
import { studentService } from '../../../services/studentService'

export function useStudents(filters = {}) {
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchStudents = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await studentService.getStudents(filters)
            setStudents(data || [])
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [filters])

    useEffect(() => {
        fetchStudents()
    }, [fetchStudents])

    const createStudent = async (payload) => {
        const newStudent = await studentService.createStudentWithEnrolment(payload)
        await fetchStudents()
        return newStudent
    }

    const updateStudent = async (id, updates) => {
        const updated = await studentService.updateStudent(id, updates)
        await fetchStudents()
        return updated
    }

    const deleteStudent = async (id) => {
        await studentService.deleteStudent(id)
        await fetchStudents()
    }

    const bulkImport = async (importData) => {
        const result = await studentService.bulkImportStudents(importData)
        await fetchStudents()
        return result
    }

    const addEnrolment = async (payload) => {
        const result = await studentService.addEnrolment(payload)
        await fetchStudents()
        return result
    }

    const deleteEnrolment = async (enrolmentId) => {
        await studentService.deleteEnrolment(enrolmentId)
        await fetchStudents()
    }

    const addGuardian = async (payload) => {
        const result = await studentService.addGuardian(payload)
        await fetchStudents()
        return result
    }

    const detachGuardian = async (studentId, guardianId) => {
        await studentService.detachGuardian(studentId, guardianId)
        await fetchStudents()
    }

    return {
        students,
        loading,
        error,
        refresh: fetchStudents,
        createStudent,
        updateStudent,
        deleteStudent,
        bulkImport,
        addEnrolment,
        deleteEnrolment,
        addGuardian,
        detachGuardian
    }
}