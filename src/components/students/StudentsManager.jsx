import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Plus,
  Pencil,
  Trash2,
  UserCheck,
  Users,
  Search,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function StudentsManager() {
  const { t } = useTranslation()

  // Data state
  const [students, setStudents] = useState([])
  const [schoolYears, setSchoolYears] = useState([])
  const [schoolForms, setSchoolForms] = useState([])
  const [guardians, setGuardians] = useState([])

  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [filterYearId, setFilterYearId] = useState('')
  const [filterFormId, setFilterFormId] = useState('')

  // UI state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false)
  const [showGuardianModal, setShowGuardianModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)

  // Form state
  const [studentForm, setStudentForm] = useState({
    process_number: '',
    name: '',
    birthdate: ''
  })

  const [enrollmentForm, setEnrollmentForm] = useState({
    school_year_id: '',
    school_form_id: ''
  })

  const [guardianForm, setGuardianForm] = useState({
    name: '',
    phone_number: '',
    email: '',
    relationship: 'mother'
  })

  // Fetch metadata on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      const [yearsRes, formsRes] = await Promise.all([
        supabase.from('school_years').select('*').order('label', { ascending: false }),
        supabase.from('school_forms').select('*').order('year_level, class_section')
      ])

      if (yearsRes.data) setSchoolYears(yearsRes.data)
      if (formsRes.data) setSchoolForms(formsRes.data)
    }
    fetchMetadata()
  }, [])

  // Fetch students with enrollments and guardians
  useEffect(() => {
    fetchStudents()
  }, [filterYearId, filterFormId, searchQuery])

  const fetchStudents = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch all students
      let studentsQuery = supabase
        .from('students')
        .select(`
          *,
          student_enrollments (
            id,
            school_year_id,
            school_form_id,
            school_years (label),
            school_forms (year_level, class_section)
          )
        `)
        .order('name')

      const { data: studentsData, error: studentsError } = await studentsQuery

      if (studentsError) throw studentsError

      // Fetch guardians for all students
      const { data: guardiansData, error: guardiansError } = await supabase
        .from('student_guardians')
        .select(`
          student_id,
          relationship,
          guardians (id, name, phone_number, email)
        `)

      if (guardiansError) throw guardiansError

      // Map guardians to students
      const guardiansMap = {}
      guardiansData?.forEach((sg) => {
        if (!guardiansMap[sg.student_id]) {
          guardiansMap[sg.student_id] = []
        }
        guardiansMap[sg.student_id].push({
          ...sg.guardians,
          relationship: sg.relationship
        })
      })

      // Combine data and apply filters
      let filtered = (studentsData || []).map((student) => ({
        ...student,
        guardians: guardiansMap[student.id] || [],
        currentEnrollment: student.student_enrollments?.[0] || null
      }))

      // Apply year filter
      if (filterYearId) {
        filtered = filtered.filter(
          (s) => s.currentEnrollment?.school_year_id === filterYearId
        )
      }

      // Apply form filter
      if (filterFormId) {
        filtered = filtered.filter(
          (s) => s.currentEnrollment?.school_form_id === filterFormId
        )
      }

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        filtered = filtered.filter(
          (s) =>
            s.name.toLowerCase().includes(query) ||
            s.process_number.toLowerCase().includes(query)
        )
      }

      setStudents(filtered)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Open student modal (create/edit)
  const openStudentModal = (student = null) => {
    if (student) {
      setEditingStudent(student)
      setStudentForm({
        process_number: student.process_number,
        name: student.name,
        birthdate: student.birthdate || ''
      })
    } else {
      setEditingStudent(null)
      setStudentForm({
        process_number: '',
        name: '',
        birthdate: ''
      })
    }
    setShowStudentModal(true)
  }

  // Save student (create/update)
  const handleSaveStudent = async () => {
    setError(null)

    if (!studentForm.process_number || !studentForm.name) {
      setError(t('required_field'))
      return
    }

    try {
      if (editingStudent) {
        const { error: updateError } = await supabase
          .from('students')
          .update(studentForm)
          .eq('id', editingStudent.id)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('students')
          .insert(studentForm)

        if (insertError) throw insertError
      }

      setShowStudentModal(false)
      fetchStudents()
    } catch (err) {
      setError(err.message)
    }
  }

  // Delete student
  const handleDeleteStudent = async (studentId) => {
    if (!confirm(t('confirm_delete_student'))) return

    try {
      const { error: deleteError } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId)

      if (deleteError) throw deleteError

      fetchStudents()
    } catch (err) {
      setError(err.message)
    }
  }

  // Open enrollment modal
  const openEnrollmentModal = (student) => {
    setSelectedStudent(student)
    setEnrollmentForm({
      school_year_id: student.currentEnrollment?.school_year_id || '',
      school_form_id: student.currentEnrollment?.school_form_id || ''
    })
    setShowEnrollmentModal(true)
  }

  // Save enrollment
  const handleSaveEnrollment = async () => {
    setError(null)

    if (!enrollmentForm.school_year_id || !enrollmentForm.school_form_id) {
      setError(t('required_field'))
      return
    }

    try {
      const { error: upsertError } = await supabase
        .from('student_enrollments')
        .upsert(
          {
            student_id: selectedStudent.id,
            school_year_id: enrollmentForm.school_year_id,
            school_form_id: enrollmentForm.school_form_id
          },
          { onConflict: 'student_id,school_year_id' }
        )

      if (upsertError) throw upsertError

      setShowEnrollmentModal(false)
      fetchStudents()
    } catch (err) {
      setError(err.message)
    }
  }

  // Open guardian modal
  const openGuardianModal = (student) => {
    setSelectedStudent(student)
    setGuardianForm({
      name: '',
      phone_number: '',
      email: '',
      relationship: 'mother'
    })
    setShowGuardianModal(true)
  }

  // Add guardian
  const handleAddGuardian = async () => {
    setError(null)

    if (!guardianForm.name) {
      setError(t('required_field'))
      return
    }

    try {
      // Create or find guardian
      const { data: existingGuardian } = await supabase
        .from('guardians')
        .select('id')
        .eq('name', guardianForm.name)
        .eq('phone_number', guardianForm.phone_number || '')
        .single()

      let guardianId

      if (existingGuardian) {
        guardianId = existingGuardian.id
      } else {
        const { data: newGuardian, error: insertError } = await supabase
          .from('guardians')
          .insert({
            name: guardianForm.name,
            phone_number: guardianForm.phone_number,
            email: guardianForm.email
          })
          .select()
          .single()

        if (insertError) throw insertError
        guardianId = newGuardian.id
      }

      // Link guardian to student
      const { error: linkError } = await supabase
        .from('student_guardians')
        .insert({
          student_id: selectedStudent.id,
          guardian_id: guardianId,
          relationship: guardianForm.relationship
        })

      if (linkError) throw linkError

      setGuardianForm({
        name: '',
        phone_number: '',
        email: '',
        relationship: 'mother'
      })
      fetchStudents()
    } catch (err) {
      setError(err.message)
    }
  }

  // Detach guardian
  const handleDetachGuardian = async (guardianId) => {
    if (!confirm(t('confirm_delete'))) return

    try {
      const { error: detachError } = await supabase
        .from('student_guardians')
        .delete()
        .eq('student_id', selectedStudent.id)
        .eq('guardian_id', guardianId)

      if (detachError) throw detachError

      fetchStudents()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle size={16} />
          {error}
          <button onClick={() => setError(null)} className="ml-auto">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_students')}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={filterYearId}
            onChange={(e) => setFilterYearId(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{t('all_years')}</option>
            {schoolYears.map((year) => (
              <option key={year.id} value={year.id}>
                {year.label}
              </option>
            ))}
          </select>

          <select
            value={filterFormId}
            onChange={(e) => setFilterFormId(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{t('all_groups')}</option>
            {schoolForms.map((form) => (
              <option key={form.id} value={form.id}>
                {form.year_level} {form.class_section}
              </option>
            ))}
          </select>

          <button
            onClick={() => openStudentModal()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            {t('add_student_btn')}
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin mr-2" size={20} />
            {t('loading')}
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-12 text-gray-500">{t('no_students')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('process_number')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('full_name')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('birthdate')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('current_group')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('guardians')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{student.process_number}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {student.birthdate ? new Date(student.birthdate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {student.currentEnrollment
                        ? `${student.currentEnrollment.school_forms.year_level} ${student.currentEnrollment.school_forms.class_section} (${student.currentEnrollment.school_years.label})`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {student.guardians.length > 0
                        ? student.guardians.map((g) => g.name).join(', ')
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openStudentModal(student)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title={t('edit_student')}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => openEnrollmentModal(student)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                          title={t('enroll_student')}
                        >
                          <UserCheck size={14} />
                        </button>
                        <button
                          onClick={() => openGuardianModal(student)}
                          className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                          title={t('manage_guardians')}
                        >
                          <Users size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title={t('delete_student')}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Modal (Create/Edit) */}
      {showStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingStudent ? t('edit_student') : t('create_student')}
              </h2>
              <button onClick={() => setShowStudentModal(false)} className="p-1 text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('process_number')} *
                </label>
                <input
                  type="text"
                  value={studentForm.process_number}
                  onChange={(e) => setStudentForm({ ...studentForm, process_number: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('full_name')} *
                </label>
                <input
                  type="text"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('birthdate')}</label>
                <input
                  type="date"
                  value={studentForm.birthdate}
                  onChange={(e) => setStudentForm({ ...studentForm, birthdate: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowStudentModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSaveStudent}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {editingStudent ? t('update_student') : t('create_student')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enrollment Modal */}
      {showEnrollmentModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{t('enrollment_modal_title')}</h2>
              <button onClick={() => setShowEnrollmentModal(false)} className="p-1 text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('current_enrollment')}</h3>
                <p className="text-sm text-gray-600">
                  {selectedStudent.currentEnrollment
                    ? `${selectedStudent.currentEnrollment.school_forms.year_level} ${selectedStudent.currentEnrollment.school_forms.class_section} (${selectedStudent.currentEnrollment.school_years.label})`
                    : t('not_enrolled')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('academic_year')} *
                </label>
                <select
                  value={enrollmentForm.school_year_id}
                  onChange={(e) => setEnrollmentForm({ ...enrollmentForm, school_year_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">— {t('select_lesson')} —</option>
                  {schoolYears.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('group')} *</label>
                <select
                  value={enrollmentForm.school_form_id}
                  onChange={(e) => setEnrollmentForm({ ...enrollmentForm, school_form_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">— {t('select_lesson')} —</option>
                  {schoolForms.map((form) => (
                    <option key={form.id} value={form.id}>
                      {form.year_level} {form.class_section}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowEnrollmentModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSaveEnrollment}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guardian Modal */}
      {showGuardianModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{t('guardian_modal_title')}</h2>
              <button onClick={() => setShowGuardianModal(false)} className="p-1 text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-4 space-y-6">
              {/* Linked Guardians */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('linked_guardians')}</h3>
                {selectedStudent.guardians.length === 0 ? (
                  <p className="text-sm text-gray-500">{t('no_guardians')}</p>
                ) : (
                  <div className="space-y-2">
                    {selectedStudent.guardians.map((guardian) => (
                      <div
                        key={guardian.id}
                        className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{guardian.name}</p>
                          <p className="text-xs text-gray-600">
                            {guardian.relationship} • {guardian.phone_number || '—'} • {guardian.email || '—'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDetachGuardian(guardian.id)}
                          className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          {t('detach')}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Guardian Form */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('add_guardian')}</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('guardian_name')} *
                    </label>
                    <input
                      type="text"
                      value={guardianForm.name}
                      onChange={(e) => setGuardianForm({ ...guardianForm, name: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('phone_number')}</label>
                      <input
                        type="tel"
                        value={guardianForm.phone_number}
                        onChange={(e) => setGuardianForm({ ...guardianForm, phone_number: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
                      <input
                        type="email"
                        value={guardianForm.email}
                        onChange={(e) => setGuardianForm({ ...guardianForm, email: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('relationship')}</label>
                    <select
                      value={guardianForm.relationship}
                      onChange={(e) => setGuardianForm({ ...guardianForm, relationship: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="mother">{t('mother')}</option>
                      <option value="father">{t('father')}</option>
                      <option value="legal_guardian">{t('legal_guardian')}</option>
                      <option value="other">{t('other')}</option>
                    </select>
                  </div>
                  <button
                    onClick={handleAddGuardian}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
                  >
                    {t('add_guardian')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
