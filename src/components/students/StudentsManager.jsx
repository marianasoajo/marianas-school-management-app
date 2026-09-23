import { AlertCircle, CheckCircle2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import {
  addGuardian,
  deleteStudent,
  detachGuardian,
  fetchMetadata,
  fetchStudents,
  saveEnrolment,
  saveStudent
} from './api/studentApi'
import { BulkImportModal } from './modals/BulkImportModal'
import { EnrolmentModal } from './modals/EnrolmentModal'
import { GuardianModal } from './modals/GuardianModal'
import { StudentFormModal } from './modals/StudentFormModal'
import { StudentFilterBar } from './StudentFilterBar'
import { StudentTable } from './StudentTable'

export default function StudentsManager({ session }) {
  const { t } = useTranslation()

  // Metadata & Data State
  const [students, setStudents] = useState([])
  const [schoolYears, setSchoolYears] = useState([])
  const [schoolForms, setSchoolForms] = useState([])

  // Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [filterYearId, setFilterYearId] = useState('')
  const [filterFormId, setFilterFormId] = useState('')

  // UI Notification & Loading State
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  // Modal Triggers
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [showEnrolmentModal, setShowEnrolmentModal] = useState(false)
  const [showGuardianModal, setShowGuardianModal] = useState(false)
  const [showBulkImportModal, setShowBulkImportModal] = useState(false)

  // Selected Entities
  const [editingStudent, setEditingStudent] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)

  // Fetch Metadata
  useEffect(() => {
    if (!session) return
    fetchMetadata()
      .then(({ schoolYears, schoolForms }) => {
        setSchoolYears(schoolYears)
        setSchoolForms(schoolForms)
      })
      .catch((err) => setError(err.message))
  }, [session])

  // Fetch Students
  const loadStudents = async () => {
    if (!session) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchStudents({ filterYearId, filterFormId, searchQuery })
      setStudents(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStudents()
  }, [filterYearId, filterFormId, searchQuery, session])

  const notifySuccess = (msg) => {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  // Student Create / Edit Actions
  const handleOpenAddStudent = () => {
    setEditingStudent(null)
    setShowStudentModal(true)
  }

  const handleOpenEditStudent = (student) => {
    setEditingStudent(student)
    setShowStudentModal(true)
  }

  const handleSaveStudent = async (studentForm) => {
    try {
      await saveStudent(studentForm, editingStudent)
      setShowStudentModal(false)
      notifySuccess(editingStudent ? t('student_updated') : t('student_created'))
      loadStudents()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteStudent = async (studentId) => {
    if (!confirm(t('confirm_delete_student'))) return
    try {
      await deleteStudent(studentId)
      notifySuccess(t('student_deleted'))
      loadStudents()
    } catch (err) {
      setError(err.message)
    }
  }

  // Enrolment Actions
  const handleOpenEnrolment = (student) => {
    setSelectedStudent(student)
    setShowEnrolmentModal(true)
  }

  const handleSaveEnrolment = async (enrolmentForm) => {
    try {
      await saveEnrolment(selectedStudent.id, enrolmentForm)
      setShowEnrolmentModal(false)
      notifySuccess(t('enrolment_saved'))
      loadStudents()
    } catch (err) {
      setError(err.message)
    }
  }

  // Guardian Actions
  const handleOpenGuardians = (student) => {
    setSelectedStudent(student)
    setShowGuardianModal(true)
  }

  const handleAddGuardian = async (guardianForm) => {
    try {
      await addGuardian(selectedStudent.id, guardianForm)
      notifySuccess(t('guardian_added'))
      loadStudents()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDetachGuardian = async (guardianId) => {
    if (!confirm(t('confirm_delete'))) return
    try {
      await detachGuardian(selectedStudent.id, guardianId)
      notifySuccess(t('guardian_detached'))
      loadStudents()
    } catch (err) {
      setError(err.message)
    }
  }

  // Bulk Import Execution
  const handleConfirmImport = async ({ validRows, bulkYearId, bulkFormId, onProgress }) => {
    let successCount = 0
    let failedCount = 0

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i]
      try {
        const { data: student, error: studentError } = await supabase
          .from('students')
          .upsert(
            {
              process_number: row.process_number,
              name: row.name,
              birthdate: row.birthdate || null
            },
            { onConflict: 'process_number' }
          )
          .select()
          .single()

        if (studentError) throw studentError

        await supabase.from('student_enrolments').upsert(
          {
            student_id: student.id,
            school_year_id: bulkYearId,
            school_form_id: bulkFormId,
            group_number: Number(row.group_number)
          },
          { onConflict: 'student_id,school_year_id' }
        )

        if (row.guardian_name) {
          const { data: existingGuardian } = await supabase
            .from('guardians')
            .select('id')
            .eq('name', row.guardian_name)
            .maybeSingle()

          let guardianId = existingGuardian?.id

          if (!guardianId) {
            const { data: newGuardian } = await supabase
              .from('guardians')
              .insert({
                name: row.guardian_name,
                phone_number: row.guardian_phone || null,
                email: row.guardian_email || null
              })
              .select()
              .single()

            guardianId = newGuardian?.id
          }

          if (guardianId) {
            await supabase.from('student_guardians').upsert(
              {
                student_id: student.id,
                guardian_id: guardianId,
                relationship: row.guardian_relationship || 'mother'
              },
              { onConflict: 'student_id,guardian_id' }
            )
          }
        }

        successCount++
      } catch {
        failedCount++
      }
      onProgress(Math.round(((i + 1) / validRows.length) * 100))
    }

    loadStudents()
    return { successCount, failedCount }
  }

  const initialStudentFormData = editingStudent
    ? {
      process_number: editingStudent.process_number || '',
      name: editingStudent.name || '',
      birthdate: editingStudent.birthdate || '',
      school_year_id: editingStudent.currentEnrolment?.school_year_id || '',
      school_form_id: editingStudent.currentEnrolment?.school_form_id || '',
      group_number: editingStudent.currentEnrolment?.group_number || '',
      guardian_name: editingStudent.guardians?.[0]?.name || '',
      guardian_phone: editingStudent.guardians?.[0]?.phone_number || '',
      guardian_email: editingStudent.guardians?.[0]?.email || '',
      guardian_relationship: editingStudent.guardians?.[0]?.relationship || 'mother'
    }
    : {
      process_number: '',
      name: '',
      birthdate: '',
      school_year_id: filterYearId || schoolYears.find((y) => y.is_active)?.id || '',
      school_form_id: filterFormId || schoolForms[0]?.id || '',
      group_number: '',
      guardian_name: '',
      guardian_phone: '',
      guardian_email: '',
      guardian_relationship: 'mother'
    }

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">
            <X size={16} />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">
          <CheckCircle2 size={16} />
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="ml-auto">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <StudentFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterYearId={filterYearId}
        onYearChange={setFilterYearId}
        filterFormId={filterFormId}
        onFormChange={setFilterFormId}
        schoolYears={schoolYears}
        schoolForms={schoolForms}
        onOpenAddModal={handleOpenAddStudent}
        onOpenBulkImportModal={() => setShowBulkImportModal(true)}
        t={t}
      />

      {/* Table */}
      <StudentTable
        loading={loading}
        students={students}
        onEditStudent={handleOpenEditStudent}
        onEnrolStudent={handleOpenEnrolment}
        onManageGuardians={handleOpenGuardians}
        onDeleteStudent={handleDeleteStudent}
        t={t}
      />

      {/* Modals */}
      <StudentFormModal
        isOpen={showStudentModal}
        onClose={() => setShowStudentModal(false)}
        editingStudent={editingStudent}
        initialData={initialStudentFormData}
        schoolYears={schoolYears}
        schoolForms={schoolForms}
        onSave={handleSaveStudent}
        t={t}
      />

      <EnrolmentModal
        isOpen={showEnrolmentModal}
        onClose={() => setShowEnrolmentModal(false)}
        selectedStudent={selectedStudent}
        schoolYears={schoolYears}
        schoolForms={schoolForms}
        onSave={handleSaveEnrolment}
        t={t}
      />

      <GuardianModal
        isOpen={showGuardianModal}
        onClose={() => setShowGuardianModal(false)}
        selectedStudent={selectedStudent}
        onAddGuardian={handleAddGuardian}
        onDetachGuardian={handleDetachGuardian}
        t={t}
      />

      <BulkImportModal
        isOpen={showBulkImportModal}
        onClose={() => setShowBulkImportModal(false)}
        schoolYears={schoolYears}
        schoolForms={schoolForms}
        onConfirmImport={handleConfirmImport}
        t={t}
      />
    </div>
  )
}