import { ArrowUpRight } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../components/ui/Button'
import ConfirmDeletionModal from '../../../components/ui/ConfirmDeletionModal'
import { useGroupsManager } from '../hooks/useGroupsManager'
import AcademicYearsTab from './AcademicYearsTab'
import ExportStudentsModal from './ExportStudentsModal'
import FormModal from './FormModal'
import SchoolFormsTab from './SchoolFormsTab'
import YearModal from './YearModal'

export default function GroupsManager() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('years')

  const {
    years,
    forms,
    loading,
    error,
    createYear,
    updateYear,
    deleteYear,
    setActiveYear,
    createForm,
    updateForm,
    deleteForm,
    refresh
  } = useGroupsManager()

  const [editingYear, setEditingYear] = useState(null)
  const [isYearModalOpen, setIsYearModalOpen] = useState(false)

  const [editingForm, setEditingForm] = useState(null)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)

  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  const [deletingYearId, setDeletingYearId] = useState(null)
  const [deletingFormId, setDeletingFormId] = useState(null)

  const handleSaveYear = async (formData) => {
    if (editingYear) {
      await updateYear(editingYear.id, formData)
    } else {
      await createYear(formData)
    }
  }

  const handleSaveForm = async (formData) => {
    if (editingForm) {
      await updateForm(editingForm.id, formData)
    } else {
      await createForm(formData)
    }
  }

  const handleConfirmDeleteYear = async () => {
    if (deletingYearId) {
      await deleteYear(deletingYearId)
      setDeletingYearId(null)
    }
  }

  const handleConfirmDeleteForm = async () => {
    if (deletingFormId) {
      await deleteForm(deletingFormId)
      setDeletingFormId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-app-border pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('years')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'years'
              ? 'bg-brand-primary text-white'
              : 'bg-app-hover text-content-muted hover:text-content-main'
              }`}
          >
            {t('academic_years')}
          </button>
          <button
            onClick={() => setActiveTab('forms')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'forms'
              ? 'bg-brand-primary text-white'
              : 'bg-app-hover text-content-muted hover:text-content-main'
              }`}
          >
            {t('school_forms')}
          </button>
        </div>

        <Button
          variant="secondary"
          onClick={() => setIsExportModalOpen(true)}
          className="gap-2"
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>{t('export_promote_students')}</span>
        </Button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-content-muted animate-pulse">{t('loading')}</div>
      ) : error ? (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 text-red-600 rounded-xl text-center text-sm">
          {error}
        </div>
      ) : (
        <>
          {activeTab === 'years' && (
            <AcademicYearsTab
              years={years}
              onOpenCreate={() => {
                setEditingYear(null)
                setIsYearModalOpen(true)
              }}
              onEdit={(year) => {
                setEditingYear(year)
                setIsYearModalOpen(true)
              }}
              onDelete={setDeletingYearId}
              onSetActive={setActiveYear}
            />
          )}

          {activeTab === 'forms' && (
            <SchoolFormsTab
              forms={forms}
              onOpenCreate={() => {
                setEditingForm(null)
                setIsFormModalOpen(true)
              }}
              onEdit={(form) => {
                setEditingForm(form)
                setIsFormModalOpen(true)
              }}
              onDelete={setDeletingFormId}
            />
          )}
        </>
      )}

      {/* Modals */}
      {isYearModalOpen && (
        <YearModal
          isOpen={isYearModalOpen}
          onClose={() => setIsYearModalOpen(false)}
          onSave={handleSaveYear}
          year={editingYear}
        />
      )}

      {isFormModalOpen && (
        <FormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSave={handleSaveForm}
          form={editingForm}
        />
      )}

      {isExportModalOpen && (
        <ExportStudentsModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          years={years}
          forms={forms}
          onSuccess={refresh}
        />
      )}

      {deletingYearId && (
        <ConfirmDeletionModal
          isOpen={Boolean(deletingYearId)}
          onClose={() => setDeletingYearId(null)}
          onConfirm={handleConfirmDeleteYear}
          message={t('confirm_delete_year')}
        />
      )}

      {deletingFormId && (
        <ConfirmDeletionModal
          isOpen={Boolean(deletingFormId)}
          onClose={() => setDeletingFormId(null)}
          onConfirm={handleConfirmDeleteForm}
          message={t('confirm_delete_form')}
        />
      )}
    </div>
  )
}