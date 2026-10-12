import { Download, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../components/ui/Button'
import ConfirmDeletionModal from '../../../components/ui/ConfirmDeletionModal'
import Input from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'
import { useGroupsManager } from '../../groups/hooks/useGroupsManager'
import { useStudents } from '../hooks/useStudents'
import BulkImportModal from './BulkImportModal'
import EnrolmentModal from './EnrolmentModal'
import GuardianModal from './GuardianModal'
import StudentDetailsModal from './StudentDetailsModal'
import StudentFormModal from './StudentFormModal'
import StudentTable from './StudentTable'

export default function StudentsManager() {
  const { t } = useTranslation()
  const { years, forms } = useGroupsManager()

  const [selectedYear, setSelectedYear] = useState('')
  const [selectedForm, setSelectedForm] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)

  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false)
  const [enrolmentStudent, setEnrolmentStudent] = useState(null)
  const [guardianStudent, setGuardianStudent] = useState(null)
  const [detailStudent, setDetailStudent] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const {
    students,
    loading,
    error,
    createStudent,
    updateStudent,
    deleteStudent,
    bulkImport,
    addEnrolment,
    deleteEnrolment,
    addGuardian,
    detachGuardian
  } = useStudents({
    yearId: selectedYear,
    formId: selectedForm,
    searchQuery
  })

  const handleSaveStudent = async (payload) => {
    if (editingStudent) {
      await updateStudent(editingStudent.id, payload.studentData)
    } else {
      await createStudent(payload)
    }
  }

  const handleConfirmDelete = async () => {
    if (deletingId) {
      await deleteStudent(deletingId)
      setDeletingId(null)
    }
  }

  const yearOptions = [
    { value: '', label: t('all_years') },
    ...years.map((y) => ({ value: y.id, label: y.label }))
  ]

  const formOptions = [
    { value: '', label: t('all_groups') },
    ...forms.map((f) => ({ value: f.id, label: `${f.year_level} - ${f.class_section}` }))
  ]

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-app-hover/50 p-3 sm:p-4 rounded-xl border border-app-border">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 max-w-2xl">
          <Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            options={yearOptions}
          />
          <Select
            value={selectedForm}
            onChange={(e) => setSelectedForm(e.target.value)}
            options={formOptions}
          />
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_students')}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => setIsBulkImportOpen(true)}
            className="flex-1 sm:flex-initial gap-2"
          >
            <Download className="w-4 h-4" />
            <span>{t('bulk_import')}</span>
          </Button>

          <Button
            variant="primary"
            onClick={() => {
              setEditingStudent(null)
              setIsFormOpen(true)
            }}
            className="flex-1 sm:flex-initial gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t('add_student_btn')}</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-content-muted animate-pulse">{t('loading')}</div>
      ) : error ? (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 text-red-600 rounded-xl text-center text-sm">
          {error}
        </div>
      ) : (
        <StudentTable
          students={students}
          onViewDetails={setDetailStudent}
          onEdit={(s) => {
            setEditingStudent(s)
            setIsFormOpen(true)
          }}
          onManageEnrolment={setEnrolmentStudent}
          onManageGuardians={setGuardianStudent}
          onDelete={setDeletingId}
        />
      )}

      {/* Modals */}
      {isFormOpen && (
        <StudentFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveStudent}
          student={editingStudent}
          years={years}
          forms={forms}
          initialYearId={selectedYear}
          initialFormId={selectedForm}
        />
      )}

      {isBulkImportOpen && (
        <BulkImportModal
          isOpen={isBulkImportOpen}
          onClose={() => setIsBulkImportOpen(false)}
          years={years}
          forms={forms}
          onImport={bulkImport}
        />
      )}

      {enrolmentStudent && (
        <EnrolmentModal
          isOpen={Boolean(enrolmentStudent)}
          onClose={() => setEnrolmentStudent(null)}
          student={enrolmentStudent}
          years={years}
          forms={forms}
          onAddEnrolment={addEnrolment}
          onDeleteEnrolment={deleteEnrolment}
        />
      )}

      {guardianStudent && (
        <GuardianModal
          isOpen={Boolean(guardianStudent)}
          onClose={() => setGuardianStudent(null)}
          student={guardianStudent}
          onAddGuardian={addGuardian}
          onDetachGuardian={detachGuardian}
        />
      )}

      {detailStudent && (
        <StudentDetailsModal
          isOpen={Boolean(detailStudent)}
          onClose={() => setDetailStudent(null)}
          student={detailStudent}
        />
      )}

      {deletingId && (
        <ConfirmDeletionModal
          isOpen={Boolean(deletingId)}
          onClose={() => setDeletingId(null)}
          onConfirm={handleConfirmDelete}
          message={t('confirm_delete_student')}
        />
      )}
    </div>
  )
}