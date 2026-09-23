import { useEffect, useState } from 'react'
import { groupsApi } from '../api/groupsApi'

export function useGroupsManager(session) {
    const [activeTab, setActiveTab] = useState('years')
    const [schoolYears, setSchoolYears] = useState([])
    const [schoolForms, setSchoolForms] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [successMessage, setSuccessMessage] = useState(null)

    // Modal states
    const [showYearModal, setShowYearModal] = useState(false)
    const [showFormModal, setShowFormModal] = useState(false)
    const [showExportModal, setShowExportModal] = useState(false)

    const [editingYear, setEditingYear] = useState(null)
    const [editingForm, setEditingForm] = useState(null)

    const notifySuccess = (msg) => {
        setSuccessMessage(msg)
        setTimeout(() => setSuccessMessage(null), 3500)
    }

    // Load Metadata
    const loadData = async () => {
        if (!session) return
        setLoading(true)
        setError(null)

        try {
            const [years, forms] = await Promise.all([
                groupsApi.fetchSchoolYears(),
                groupsApi.fetchSchoolForms()
            ])
            setSchoolYears(years)
            setSchoolForms(forms)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [session])

    // Academic Year Actions
    const handleOpenYearModal = (year = null) => {
        setEditingYear(year)
        setShowYearModal(true)
    }

    const handleSaveYear = async (yearForm) => {
        try {
            await groupsApi.saveSchoolYear(yearForm, editingYear)
            setShowYearModal(false)
            notifySuccess(editingYear ? 'Ano letivo atualizado' : 'Ano letivo criado')
            loadData()
        } catch (err) {
            setError(err.message)
        }
    }

    const handleDeleteYear = async (yearId) => {
        try {
            await groupsApi.deleteSchoolYear(yearId)
            notifySuccess('Ano letivo eliminado')
            loadData()
        } catch (err) {
            setError(err.message)
        }
    }

    const handleSetActiveYear = async (yearId) => {
        try {
            await groupsApi.setActiveSchoolYear(yearId)
            notifySuccess('Ano letivo ativo atualizado')
            loadData()
        } catch (err) {
            setError(err.message)
        }
    }

    // School Form Actions
    const handleOpenFormModal = (form = null) => {
        setEditingForm(form)
        setShowFormModal(true)
    }

    const handleSaveForm = async (formForm) => {
        try {
            await groupsApi.saveSchoolForm(formForm, editingForm)
            setShowFormModal(false)
            notifySuccess(editingForm ? 'Turma atualizada' : 'Turma criada')
            loadData()
        } catch (err) {
            setError(err.message)
        }
    }

    const handleDeleteForm = async (formId) => {
        try {
            await groupsApi.deleteSchoolForm(formId)
            notifySuccess('Turma eliminada')
            loadData()
        } catch (err) {
            setError(err.message)
        }
    }

    // Export / Promotion Execution
    const handleExportStudents = async (exportData) => {
        try {
            await groupsApi.exportStudents(exportData)
            setShowExportModal(false)
            notifySuccess('Alunos exportados / promovidos com sucesso!')
            loadData()
        } catch (err) {
            setError(err.message)
        }
    }

    return {
        activeTab,
        setActiveTab,
        schoolYears,
        schoolForms,
        loading,
        error,
        setError,
        successMessage,
        setSuccessMessage,

        // Modals
        showYearModal,
        setShowYearModal,
        showFormModal,
        setShowFormModal,
        showExportModal,
        setShowExportModal,
        editingYear,
        editingForm,

        // Actions
        handleOpenYearModal,
        handleSaveYear,
        handleDeleteYear,
        handleSetActiveYear,
        handleOpenFormModal,
        handleSaveForm,
        handleDeleteForm,
        handleExportStudents
    }
}