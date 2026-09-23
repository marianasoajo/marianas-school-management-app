import { AlertCircle, Calendar, CheckCircle2, GraduationCap, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AcademicYearsTab } from './AcademicYearsTab'
import { useGroupsManager } from './hooks/useGroupsManager'
import { ExportStudentsModal } from './modals/ExportStudentsModal'
import { FormModal } from './modals/FormModal'
import { YearModal } from './modals/YearModal'
import { SchoolFormsTab } from './SchoolFormsTab'

export default function GroupsManager({ session }) {
  const { t } = useTranslation()

  const {
    activeTab,
    setActiveTab,
    schoolYears,
    schoolForms,
    loading,
    error,
    setError,
    successMessage,
    setSuccessMessage,

    showYearModal,
    setShowYearModal,
    showFormModal,
    setShowFormModal,
    showExportModal,
    setShowExportModal,
    editingYear,
    editingForm,

    handleOpenYearModal,
    handleSaveYear,
    handleDeleteYear,
    handleSetActiveYear,
    handleOpenFormModal,
    handleSaveForm,
    handleDeleteForm,
    handleExportStudents
  } = useGroupsManager(session)

  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-100">
      {/* Notifications */}
      {error && (
        <div className="flex items-center gap-2 p-3.5 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md shadow-sm">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto p-1 hover:opacity-75">
            <X size={16} />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 p-3.5 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-md shadow-sm">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="ml-auto p-1 hover:opacity-75">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Tab Navigation Container */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('years')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-colors ${activeTab === 'years'
              ? 'bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
          >
            <Calendar size={18} />
            {t('academic_years')}
          </button>
          <button
            onClick={() => setActiveTab('forms')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-colors ${activeTab === 'forms'
              ? 'bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
          >
            <GraduationCap size={18} />
            {t('school_forms')}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'years' ? (
            <AcademicYearsTab
              loading={loading}
              schoolYears={schoolYears}
              onOpenYearModal={handleOpenYearModal}
              onOpenExportModal={() => setShowExportModal(true)}
              onSetActiveYear={handleSetActiveYear}
              onDeleteYear={handleDeleteYear}
              t={t}
            />
          ) : (
            <SchoolFormsTab
              loading={loading}
              schoolForms={schoolForms}
              onOpenFormModal={handleOpenFormModal}
              onDeleteForm={handleDeleteForm}
              t={t}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <YearModal
        isOpen={showYearModal}
        onClose={() => setShowYearModal(false)}
        editingYear={editingYear}
        onSave={handleSaveYear}
        t={t}
      />

      <FormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        editingForm={editingForm}
        onSave={handleSaveForm}
        t={t}
      />

      <ExportStudentsModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        schoolYears={schoolYears}
        schoolForms={schoolForms}
        onExport={handleExportStudents}
        t={t}
      />
    </div>
  )
}