import { AlertCircle, Loader2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ConfirmModal from '../ui/ConfirmDeletionModal'
import { planningApi } from './api/planningApi'
import { PlanningFilterBar } from './PlanningFilterBar'
import { PlanningHeader } from './PlanningHeader'
import { PlanningThemeCard } from './PlanningThemeCard'

export default function PlanningTable({ session }) {
  const { t } = useTranslation()

  const [themes, setThemes] = useState([])
  const [schoolForms, setSchoolForms] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [expandedThemeIds, setExpandedThemeIds] = useState(new Set())
  const [selectedFormFilters, setSelectedFormFilters] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [dirtyIds, setDirtyIds] = useState(new Set())
  const [deletingThemeId, setDeletingThemeId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadData = useCallback(async () => {
    if (!session) return
    setLoading(true)
    setError(null)
    try {
      const { schoolForms, planningUnits } = await planningApi.fetchInitialData()
      setSchoolForms(schoolForms)
      setThemes(planningUnits)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleToggleExpand = (id) => {
    setExpandedThemeIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleToggleFormFilter = (formId) => {
    setSelectedFormFilters((prev) =>
      prev.includes(formId) ? prev.filter((id) => id !== formId) : [...prev, formId]
    )
  }

  const handleFieldChange = (themeId, field, value) => {
    setThemes((prev) =>
      prev.map((item) => (item.id === themeId ? { ...item, [field]: value } : item))
    )
    setDirtyIds((prev) => new Set(prev).add(themeId))
  }

  // Direct inline theme creation
  const handleCreateTheme = async () => {
    setSaving(true)
    setError(null)
    try {
      const defaultTitle = t('new_theme_placeholder') || 'Novo Tema de Aprendizagem'
      const newTheme = await planningApi.createTheme(defaultTitle)

      setThemes((prev) => [...prev, newTheme])
      setExpandedThemeIds((prev) => new Set(prev).add(newTheme.id))
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    if (dirtyIds.size === 0) return
    setSaving(true)
    setError(null)
    try {
      const dirtyUnits = themes.filter((t) => dirtyIds.has(t.id))
      await planningApi.saveThemes(dirtyUnits)
      setDirtyIds(new Set())
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // 1. Called by the Trash Icon: ONLY sets the ID in state to open the modal
  const handleRequestDelete = (themeId) => {
    setDeletingThemeId(themeId)
  }

  // 2. Called by the Modal "Delete" Button: Executes the actual API call
  const handleConfirmDelete = async () => {
    if (!deletingThemeId) return

    setIsDeleting(true)
    setSaving(true)
    setError(null)
    try {
      await planningApi.deleteTheme(deletingThemeId)
      setThemes((prev) => prev.filter((item) => item.id !== deletingThemeId))
      setDirtyIds((prev) => {
        const next = new Set(prev)
        next.delete(deletingThemeId)
        return next
      })
      setDeletingThemeId(null) // Close modal after successful deletion
    } catch (err) {
      setError(err.message)
    } finally {
      setIsDeleting(false)
      setSaving(false)
    }
  }


  // Filter Logic: Form Filter + Theme Title Search Filter
  const filteredThemes = themes.filter((theme) => {
    const matchesForm =
      selectedFormFilters.length === 0 ||
      (theme.form_ids && theme.form_ids.some((fId) => selectedFormFilters.includes(fId)))

    const matchesSearch =
      !searchTerm.trim() ||
      (theme.theme && theme.theme.toLowerCase().includes(searchTerm.toLowerCase().trim()))

    return matchesForm && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400">
        <Loader2 className="animate-spin mr-2" size={20} />
        {t('loading')}
      </div>
    )
  }

  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-100">
      <PlanningHeader
        onSave={handleSave}
        onCreateTheme={handleCreateTheme}
        saving={saving}
        dirtyCount={dirtyIds.size}
        t={t}
      />

      {error && (
        <div className="flex items-center gap-2 p-3.5 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md shadow-sm">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <PlanningFilterBar
        schoolForms={schoolForms}
        selectedFormIds={selectedFormFilters}
        onToggleFilter={handleToggleFormFilter}
        onClearFilter={() => setSelectedFormFilters([])}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        t={t}
      />

      <div className="space-y-3">
        {filteredThemes.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-800 rounded-lg">
            {t('no_units') || 'Nenhum tema de planeamento encontrado.'}
          </div>
        ) : (
          filteredThemes.map((unit) => (
            <PlanningThemeCard
              key={unit.id}
              unit={unit}
              schoolForms={schoolForms}
              isExpanded={expandedThemeIds.has(unit.id)}
              isDirty={dirtyIds.has(unit.id)}
              onToggleExpand={() => handleToggleExpand(unit.id)}
              onFieldChange={handleFieldChange}
              onDelete={handleRequestDelete}
              t={t}
            />
          ))
        )}
      </div>
      <ConfirmModal
        isOpen={Boolean(deletingThemeId)}
        title={t('delete_theme') || 'Delete Theme'}
        message={t('confirm_delete_theme') || 'Are you sure you want to delete this theme? This action cannot be undone.'}
        confirmText={t('delete') || 'Delete'}
        cancelText={t('cancel') || 'Cancel'}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingThemeId(null)}
      />
    </div>
  )
}