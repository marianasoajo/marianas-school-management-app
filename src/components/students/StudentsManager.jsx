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
  AlertCircle,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { supabase } from '../../lib/supabase'

export default function StudentsManager({ session }) {
  const { t } = useTranslation()

  // Data state
  const [students, setStudents] = useState([])
  const [schoolYears, setSchoolYears] = useState([])
  const [schoolForms, setSchoolForms] = useState([])

  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [filterYearId, setFilterYearId] = useState('')
  const [filterFormId, setFilterFormId] = useState('')

  // UI state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false)
  const [showGuardianModal, setShowGuardianModal] = useState(false)
  const [showBulkImportModal, setShowBulkImportModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showGuardianSection, setShowGuardianSection] = useState(false)

  // Single Student Form state
  const [studentForm, setStudentForm] = useState({
    process_number: '',
    name: '',
    birthdate: '',
    school_year_id: '',
    school_form_id: '',
    group_number: '',
    guardian_name: '',
    guardian_phone: '',
    guardian_email: '',
    guardian_relationship: 'mother'
  })

  // Enrollment Form state
  const [enrollmentForm, setEnrollmentForm] = useState({
    school_year_id: '',
    school_form_id: ''
  })

  // Standalone Guardian Form state
  const [guardianForm, setGuardianForm] = useState({
    name: '',
    phone_number: '',
    email: '',
    relationship: 'mother'
  })

  // Bulk Import state
  const [bulkYearId, setBulkYearId] = useState('')
  const [bulkFormId, setBulkFormId] = useState('')
  const [parsedRows, setParsedRows] = useState([])
  const [rawText, setRawText] = useState('')
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importSummary, setImportSummary] = useState(null)

  // Fetch metadata on mount
  useEffect(() => {
    if (!session) return
    const fetchMetadata = async () => {
      const [yearsRes, formsRes] = await Promise.all([
        supabase.from('school_years').select('*').order('label', { ascending: false }),
        supabase.from('school_forms').select('*').order('year_level, class_section')
      ])

      if (yearsRes.data) {
        setSchoolYears(yearsRes.data)
        const activeYear = yearsRes.data.find((y) => y.is_active)
        if (activeYear) {
          setBulkYearId(activeYear.id)
        }
      }
      if (formsRes.data) {
        setSchoolForms(formsRes.data)
        if (formsRes.data.length > 0) {
          setBulkFormId(formsRes.data[0].id)
        }
      }
    }
    fetchMetadata()
  }, [session])

  // Fetch students with enrollments and guardians
  useEffect(() => {
    if (!session) return
    fetchStudents()
  }, [filterYearId, filterFormId, searchQuery, session])

  const fetchStudents = async () => {
    if (!session) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)

    try {
      // 1. Fetch all students with enrollments
      const { data: studentsData, error: studentsError } = await supabase
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

      if (studentsError) throw studentsError

      // 2. Fetch guardians for all students
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
        if (sg.guardians) {
          guardiansMap[sg.student_id].push({
            ...sg.guardians,
            relationship: sg.relationship
          })
        }
      })

      // Combine data
      let combined = (studentsData || []).map((student) => ({
        ...student,
        guardians: guardiansMap[student.id] || [],
        currentEnrollment: student.student_enrollments?.[0] || null
      }))

      // Apply year filter
      if (filterYearId) {
        combined = combined.filter((s) =>
          s.student_enrollments?.some((e) => e.school_year_id === filterYearId)
        )
      }

      // Apply form filter
      if (filterFormId) {
        combined = combined.filter((s) =>
          s.student_enrollments?.some((e) => e.school_form_id === filterFormId)
        )
      }

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        combined = combined.filter(
          (s) =>
            s.name?.toLowerCase().includes(query) ||
            s.process_number?.toLowerCase().includes(query)
        )
      }

      setStudents(combined)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Open student modal (create/edit)
  const openStudentModal = (student = null) => {
    setError(null)
    if (student) {
      setEditingStudent(student)
      setStudentForm({
        process_number: student.process_number || '',
        name: student.name || '',
        birthdate: student.birthdate || '',
        school_year_id: student.currentEnrollment?.school_year_id || '',
        school_form_id: student.currentEnrollment?.school_form_id || '',
        guardian_name: student.guardians?.[0]?.name || '',
        guardian_phone: student.guardians?.[0]?.phone_number || '',
        guardian_email: student.guardians?.[0]?.email || '',
        guardian_relationship: student.guardians?.[0]?.relationship || 'mother'
      })
      setShowGuardianSection(student.guardians?.length > 0)
    } else {
      setEditingStudent(null)
      setStudentForm({
        process_number: '',
        name: '',
        birthdate: '',
        school_year_id: filterYearId || (schoolYears.find((y) => y.is_active)?.id || ''),
        school_form_id: filterFormId || (schoolForms[0]?.id || ''),
        guardian_name: '',
        guardian_phone: '',
        guardian_email: '',
        guardian_relationship: 'mother'
      })
      setShowGuardianSection(false)
    }
    setShowStudentModal(true)
  }

  // Save student (create/update) with optional inline enrollment and guardian
  const handleSaveStudent = async () => {
    setError(null)

    if (!studentForm.process_number || !studentForm.name) {
      setError(t('required_field'))
      return
    }

    try {
      let studentId

      if (editingStudent) {
        studentId = editingStudent.id
        const { error: updateError } = await supabase
          .from('students')
          .update({
            process_number: studentForm.process_number,
            name: studentForm.name,
            birthdate: studentForm.birthdate || null
          })
          .eq('id', studentId)

        if (updateError) throw updateError
      } else {
        const { data: newStudent, error: insertError } = await supabase
          .from('students')
          .insert({
            process_number: studentForm.process_number,
            name: studentForm.name,
            birthdate: studentForm.birthdate || null
          })
          .select()
          .single()

        if (insertError) throw insertError
        studentId = newStudent.id
      }

      // Handle Enrollment if year and form are selected
      if (studentForm.school_year_id && studentForm.school_form_id) {
        await supabase
          .from('student_enrollments')
          .upsert(
            {
              student_id: studentId,
              school_year_id: studentForm.school_year_id,
              school_form_id: studentForm.school_form_id
            },
            { onConflict: 'student_id,school_year_id' }
          )
      }

      // Handle Guardian if guardian name is provided
      if (studentForm.guardian_name.trim()) {
        const { data: existingGuardian } = await supabase
          .from('guardians')
          .select('id')
          .eq('name', studentForm.guardian_name.trim())
          .eq('phone_number', studentForm.guardian_phone.trim() || '')
          .maybeSingle()

        let guardianId
        if (existingGuardian) {
          guardianId = existingGuardian.id
        } else {
          const { data: newGuardian, error: guardianError } = await supabase
            .from('guardians')
            .insert({
              name: studentForm.guardian_name.trim(),
              phone_number: studentForm.guardian_phone.trim() || null,
              email: studentForm.guardian_email.trim() || null
            })
            .select()
            .single()

          if (!guardianError && newGuardian) {
            guardianId = newGuardian.id
          }
        }

        if (guardianId) {
          await supabase
            .from('student_guardians')
            .upsert(
              {
                student_id: studentId,
                guardian_id: guardianId,
                relationship: studentForm.guardian_relationship
              },
              { onConflict: 'student_id,guardian_id' }
            )
        }
      }

      setShowStudentModal(false)
      setSuccessMessage(editingStudent ? t('student_updated') : t('student_created'))
      setTimeout(() => setSuccessMessage(null), 3000)
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

      setSuccessMessage(t('student_deleted'))
      setTimeout(() => setSuccessMessage(null), 3000)
      fetchStudents()
    } catch (err) {
      setError(err.message)
    }
  }

  // Open standalone enrollment modal
  const openEnrollmentModal = (student) => {
    setSelectedStudent(student)
    setEnrollmentForm({
      school_year_id: student.currentEnrollment?.school_year_id || filterYearId || '',
      school_form_id: student.currentEnrollment?.school_form_id || filterFormId || ''
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
      setSuccessMessage(t('enrollment_saved'))
      setTimeout(() => setSuccessMessage(null), 3000)
      fetchStudents()
    } catch (err) {
      setError(err.message)
    }
  }

  // Open standalone guardian modal
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

  // Add guardian standalone
  const handleAddGuardian = async () => {
    setError(null)
    if (!guardianForm.name) {
      setError(t('required_field'))
      return
    }

    try {
      const { data: newGuardian, error: insertError } = await supabase
        .from('guardians')
        .insert({
          name: guardianForm.name.trim(),
          phone_number: guardianForm.phone_number.trim() || null,
          email: guardianForm.email.trim() || null
        })
        .select()
        .single()

      if (insertError) throw insertError

      const { error: linkError } = await supabase
        .from('student_guardians')
        .insert({
          student_id: selectedStudent.id,
          guardian_id: newGuardian.id,
          relationship: guardianForm.relationship
        })

      if (linkError) throw linkError

      setGuardianForm({
        name: '',
        phone_number: '',
        email: '',
        relationship: 'mother'
      })
      setSuccessMessage(t('guardian_added'))
      setTimeout(() => setSuccessMessage(null), 3000)
      fetchStudents()
    } catch (err) {
      setError(err.message)
    }
  }

  // Detach guardian standalone
  const handleDetachGuardian = async (guardianId) => {
    if (!confirm(t('confirm_delete'))) return

    try {
      const { error: detachError } = await supabase
        .from('student_guardians')
        .delete()
        .eq('student_id', selectedStudent.id)
        .eq('guardian_id', guardianId)

      if (detachError) throw detachError

      setSuccessMessage(t('guardian_detached'))
      setTimeout(() => setSuccessMessage(null), 3000)
      fetchStudents()
    } catch (err) {
      setError(err.message)
    }
  }

  // -------------------------------------------------------------
  // Bulk Import Handlers (CSV / XLS / XLSX)
  // -------------------------------------------------------------
  const normalizeKey = (key) => {
    return key
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]/g, '_')
  }

  const parseRawObjects = (rawObjects) => {
    return rawObjects.map((item, index) => {
      const normalizedItem = {}
      Object.keys(item).forEach((k) => {
        normalizedItem[normalizeKey(k)] = String(item[k] ?? '').trim()
      })

      // Map variations of process number
      const process_number =
        normalizedItem.process_number ||
        normalizedItem.processo ||
        normalizedItem.n_processo ||
        normalizedItem.nr_processo ||
        normalizedItem.numero ||
        normalizedItem.id ||
        ''

      // Map variations of name
      const name =
        normalizedItem.name ||
        normalizedItem.nome ||
        normalizedItem.student_name ||
        normalizedItem.nome_completo ||
        normalizedItem.aluno ||
        ''

      // Map variations of birthdate
      let birthdate =
        normalizedItem.birthdate ||
        normalizedItem.data_nasc ||
        normalizedItem.data_nascimento ||
        normalizedItem.nascimento ||
        normalizedItem.birth_date ||
        ''

      // Standardize date format YYYY-MM-DD if in DD/MM/YYYY
      if (birthdate && birthdate.includes('/')) {
        const parts = birthdate.split('/')
        if (parts.length === 3) {
          if (parts[2].length === 4) {
            birthdate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
          }
        }
      }

      // Map guardian fields
      const guardian_name =
        normalizedItem.guardian_name ||
        normalizedItem.encarregado ||
        normalizedItem.nome_encarregado ||
        normalizedItem.ee ||
        normalizedItem.encarregado_educacao ||
        ''

      const guardian_phone =
        normalizedItem.guardian_phone ||
        normalizedItem.telefone ||
        normalizedItem.telemovel ||
        normalizedItem.telefone_encarregado ||
        normalizedItem.contacto ||
        ''

      const guardian_email =
        normalizedItem.guardian_email ||
        normalizedItem.email ||
        normalizedItem.email_encarregado ||
        ''

      const guardian_relationship =
        normalizedItem.relationship ||
        normalizedItem.parentesco ||
        normalizedItem.relacao ||
        'mother'

      const isValid = Boolean(process_number && name)

      return {
        id: index + 1,
        process_number,
        name,
        birthdate,
        guardian_name,
        guardian_phone,
        guardian_email,
        guardian_relationship,
        isValid,
        errors: [
          !process_number ? 'Processo em falta' : null,
          !name ? 'Nome em falta' : null
        ].filter(Boolean)
      }
    })
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    const extension = file.name.split('.').pop()?.toLowerCase()

    if (extension === 'csv' || extension === 'txt') {
      reader.onload = (evt) => {
        const text = evt.target?.result
        if (typeof text === 'string') {
          setRawText(text)
          const workbook = XLSX.read(text, { type: 'string' })
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
          const json = XLSX.utils.sheet_to_json(firstSheet)
          setParsedRows(parseRawObjects(json))
        }
      }
      reader.readAsText(file)
    } else if (['xls', 'xlsx'].includes(extension || '')) {
      reader.onload = (evt) => {
        const data = new Uint8Array(evt.target?.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json(firstSheet)
        setParsedRows(parseRawObjects(json))
      }
      reader.readAsArrayBuffer(file)
    } else {
      setError(t('invalid_file'))
    }
  }

  const handleRawTextChange = (text) => {
    setRawText(text)
    try {
      const workbook = XLSX.read(text, { type: 'string' })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json(firstSheet)
      setParsedRows(parseRawObjects(json))
    } catch {
      // ignore parse error while typing
    }
  }

  const handleConfirmImport = async () => {
    if (!bulkYearId || !bulkFormId) {
      setError(t('required_field'))
      return
    }

    const validRows = parsedRows.filter((r) => r.isValid)
    if (validRows.length === 0) {
      setError(t('validation_errors'))
      return
    }

    setImporting(true)
    setError(null)
    setImportProgress(0)

    let successCount = 0
    let failedCount = 0

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i]
      try {
        // 1. Insert or Upsert Student
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

        // 2. Insert Student Enrollment
        await supabase
          .from('student_enrollments')
          .upsert(
            {
              student_id: student.id,
              school_year_id: bulkYearId,
              school_form_id: bulkFormId
            },
            { onConflict: 'student_id,school_year_id' }
          )

        // 3. Handle Guardian if provided
        if (row.guardian_name) {
          const { data: existingGuardian } = await supabase
            .from('guardians')
            .select('id')
            .eq('name', row.guardian_name)
            .maybeSingle()

          let guardianId
          if (existingGuardian) {
            guardianId = existingGuardian.id
          } else {
            const { data: newGuardian, error: gError } = await supabase
              .from('guardians')
              .insert({
                name: row.guardian_name,
                phone_number: row.guardian_phone || null,
                email: row.guardian_email || null
              })
              .select()
              .single()

            if (!gError && newGuardian) {
              guardianId = newGuardian.id
            }
          }

          if (guardianId) {
            await supabase
              .from('student_guardians')
              .upsert(
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
      } catch (err) {
        console.error('Row import error:', err)
        failedCount++
      }

      setImportProgress(Math.round(((i + 1) / validRows.length) * 100))
    }

    setImporting(false)
    setImportSummary({ successCount, failedCount })
    fetchStudents()
  }

  const resetBulkModal = () => {
    setShowBulkImportModal(false)
    setParsedRows([])
    setRawText('')
    setImportProgress(0)
    setImportSummary(null)
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

      {/* Filter & Actions Toolbar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="relative md:col-span-2">
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

          <div className="flex gap-2">
            <button
              onClick={() => openStudentModal()}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              {t('add_student_btn')}
            </button>
            <button
              onClick={() => setShowBulkImportModal(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
              title={t('bulk_import')}
            >
              <Upload size={16} />
              <span className="hidden lg:inline">{t('bulk_import')}</span>
            </button>
          </div>
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
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.process_number}</td>
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
                      {student.guardians.length > 0 ? (
                        <div className="space-y-0.5">
                          {student.guardians.map((g, idx) => (
                            <div key={idx} className="text-xs">
                              <span className="font-medium text-gray-800">{g.name}</span>
                              {g.phone_number && <span className="text-gray-500"> ({g.phone_number})</span>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <div className="flex items-center justify-end gap-1.5">
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

      {/* Student Modal (Create/Edit with Inline Enrollment and Guardian) */}
      {showStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingStudent ? t('edit_student') : t('create_student')}
              </h2>
              <button onClick={() => setShowStudentModal(false)} className="p-1 text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              {/* Basic Details */}
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

              {/* Class & Year Assignment */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('current_enrollment')}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{t('academic_year')}</label>
                    <select
                      value={studentForm.school_year_id}
                      onChange={(e) => setStudentForm({ ...studentForm, school_year_id: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
                    <label className="block text-xs font-medium text-gray-600 mb-1">{t('group')}</label>
                    <select
                      value={studentForm.school_form_id}
                      onChange={(e) => setStudentForm({ ...studentForm, school_form_id: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
              </div>

              {/* Collapsible Guardian Section */}
              <div className="border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={() => setShowGuardianSection(!showGuardianSection)}
                  className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 mb-2 hover:text-blue-600"
                >
                  <span>{t('guardian_optional')}</span>
                  {showGuardianSection ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {showGuardianSection && (
                  <div className="space-y-3 bg-gray-50 p-3 rounded-md border border-gray-200 mt-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{t('guardian_name')}</label>
                      <input
                        type="text"
                        value={studentForm.guardian_name}
                        onChange={(e) => setStudentForm({ ...studentForm, guardian_name: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">{t('phone_number')}</label>
                        <input
                          type="tel"
                          value={studentForm.guardian_phone}
                          onChange={(e) => setStudentForm({ ...studentForm, guardian_phone: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">{t('email')}</label>
                        <input
                          type="email"
                          value={studentForm.guardian_email}
                          onChange={(e) => setStudentForm({ ...studentForm, guardian_email: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{t('relationship')}</label>
                      <select
                        value={studentForm.guardian_relationship}
                        onChange={(e) => setStudentForm({ ...studentForm, guardian_relationship: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="mother">{t('mother')}</option>
                        <option value="father">{t('father')}</option>
                        <option value="legal_guardian">{t('legal_guardian')}</option>
                        <option value="other">{t('other')}</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
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

      {/* Standalone Enrollment Modal */}
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
                <h3 className="text-sm font-semibold text-gray-700 mb-1">{selectedStudent.name}</h3>
                <p className="text-xs text-gray-500 mb-3">{t('process_number')}: {selectedStudent.process_number}</p>
                <div className="p-3 bg-gray-50 rounded border border-gray-200 text-sm text-gray-700">
                  <span className="font-medium">{t('current_enrollment')}: </span>
                  {selectedStudent.currentEnrollment
                    ? `${selectedStudent.currentEnrollment.school_forms.year_level} ${selectedStudent.currentEnrollment.school_forms.class_section} (${selectedStudent.currentEnrollment.school_years.label})`
                    : t('not_enrolled')}
                </div>
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

      {/* Standalone Guardian Modal */}
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

      {/* Bulk Import Modal */}
      {showBulkImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="text-blue-600" size={20} />
                <h2 className="text-xl font-bold text-gray-900">{t('bulk_import')}</h2>
              </div>
              <button onClick={resetBulkModal} className="p-1 text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-4 space-y-6">
              {/* Target Class & Year Selection */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-900 mb-3">{t('enroll_in_year_group')} *</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-blue-800 mb-1">{t('academic_year')}</label>
                    <select
                      value={bulkYearId}
                      onChange={(e) => setBulkYearId(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
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
                    <label className="block text-xs font-medium text-blue-800 mb-1">{t('group')}</label>
                    <select
                      value={bulkFormId}
                      onChange={(e) => setBulkFormId(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
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
              </div>

              {/* Upload Dropzone & Paste Area */}
              <div className="space-y-3">
                <div className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-lg p-6 text-center cursor-pointer transition-colors bg-gray-50">
                  <input
                    type="file"
                    id="bulk-file-input"
                    accept=".csv, .xls, .xlsx, .txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="bulk-file-input" className="cursor-pointer block">
                    <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-sm font-medium text-gray-700">{t('drop_file_here')}</p>
                    <p className="text-xs text-gray-500 mt-1">.CSV, .XLS, .XLSX</p>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t('or_paste_csv')}
                  </label>
                  <textarea
                    rows={3}
                    value={rawText}
                    onChange={(e) => handleRawTextChange(e.target.value)}
                    placeholder="process_number,name,birthdate,guardian_name,guardian_phone,guardian_email&#10;1001,Ana Silva,2012-05-14,Maria Silva,912345678,maria@email.pt"
                    className="w-full font-mono text-xs px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t('required_columns')} | {t('optional_columns')}
                  </p>
                </div>
              </div>

              {/* Parsed Preview Table */}
              {parsedRows.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {t('import_preview')} ({parsedRows.length} {t('students').toLowerCase()})
                    </h3>
                    <div className="text-xs text-gray-600">
                      <span className="text-green-600 font-medium">
                        {parsedRows.filter((r) => r.isValid).length} válidos
                      </span>{' '}
                      •{' '}
                      <span className="text-red-600 font-medium">
                        {parsedRows.filter((r) => !r.isValid).length} com erros
                      </span>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-xs">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left text-gray-600">Status</th>
                          <th className="px-3 py-2 text-left text-gray-600">{t('process_number')}</th>
                          <th className="px-3 py-2 text-left text-gray-600">{t('full_name')}</th>
                          <th className="px-3 py-2 text-left text-gray-600">{t('birthdate')}</th>
                          <th className="px-3 py-2 text-left text-gray-600">{t('guardian_name')}</th>
                          <th className="px-3 py-2 text-left text-gray-600">{t('phone_number')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {parsedRows.map((row) => (
                          <tr
                            key={row.id}
                            className={row.isValid ? 'hover:bg-gray-50' : 'bg-red-50 hover:bg-red-100'}
                          >
                            <td className="px-3 py-1.5 whitespace-nowrap">
                              {row.isValid ? (
                                <span className="text-green-600 font-medium">OK</span>
                              ) : (
                                <span className="text-red-600 font-medium" title={row.errors.join(', ')}>
                                  Erro
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-1.5 font-medium">{row.process_number || '—'}</td>
                            <td className="px-3 py-1.5">{row.name || '—'}</td>
                            <td className="px-3 py-1.5 text-gray-500">{row.birthdate || '—'}</td>
                            <td className="px-3 py-1.5 text-gray-500">{row.guardian_name || '—'}</td>
                            <td className="px-3 py-1.5 text-gray-500">{row.guardian_phone || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Progress & Summary Indicator */}
              {importing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{t('importing')}</span>
                    <span>{importProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-200"
                      style={{ width: `${importProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {importSummary && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-900 flex items-center gap-2">
                  <CheckCircle2 className="text-green-600" size={20} />
                  <div>
                    <p className="font-semibold">{t('import_complete')}</p>
                    <p className="text-xs text-green-800">
                      {t('students_imported', { count: importSummary.successCount })}
                      {importSummary.failedCount > 0 && ` (${importSummary.failedCount} com falhas)`}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={resetBulkModal}
                disabled={importing}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                {importSummary ? t('close') : t('cancel')}
              </button>
              {!importSummary && (
                <button
                  onClick={handleConfirmImport}
                  disabled={importing || parsedRows.filter((r) => r.isValid).length === 0 || !bulkYearId || !bulkFormId}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {importing ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                  {t('confirm_import')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
