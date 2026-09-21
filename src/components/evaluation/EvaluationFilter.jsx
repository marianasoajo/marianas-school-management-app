import { AlertCircle, Loader2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useFormatters } from '../../utils/formatters'

export default function EvaluationFilter({ session }) {
  const { formatLessonNumber, formatDate, t } = useFormatters()

  // Data state
  const [schoolYears, setSchoolYears] = useState([])
  const [schoolForms, setSchoolForms] = useState([])
  const [lessons, setLessons] = useState([]) // lessons for the selected year/form and date range

  // Filter state
  const [selectedYearId, setSelectedYearId] = useState('')
  const [selectedFormId, setSelectedFormId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState('') // for student filter
  const [sortBy, setSortBy] = useState('group_number_asc') // options: group_number_asc, student_avg_asc, student_avg_desc, teacher_avg_asc, teacher_avg_desc

  // UI state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [studentOptions, setStudentOptions] = useState([]) // for student dropdown: { id, name, process_number }
  const [tableData, setTableData] = useState([]) // data to display in table

  // Fetch school years and forms on mount
  useEffect(() => {
    if (!session) return
    const fetchMetadata = async () => {
      const [yearsRes, formsRes] = await Promise.all([
        supabase.from('school_years').select('*').order('label', { ascending: false }),
        supabase.from('school_forms').select('*').order('year_level, class_section')
      ])

      if (yearsRes.data) setSchoolYears(yearsRes.data)
      if (formsRes.data) setSchoolForms(formsRes.data)
    }
    fetchMetadata()
  }, [session])

  // Fetch lessons for selected year, form, and date range
  useEffect(() => {
    if (!selectedYearId || !selectedFormId) {
      setLessons([])
      return
    }
    setLoading(true)
    setError(null)
    const fetchLessons = async () => {
      let query = supabase
        .from('lessons')
        .select('id, date, lesson_number')
        .eq('school_year_id', selectedYearId)
        .eq('school_form_id', selectedFormId)
        .order('date', { ascending: true })

      if (startDate) query = query.gte('date', startDate)
      if (endDate) query = query.lte('date', endDate)

      const { data, error } = await query
      if (error) {
        setError(error.message)
        setLessons([])
      } else {
        setLessons(data || [])
      }
      setLoading(false)
    }
    fetchLessons()
  }, [selectedYearId, selectedFormId, startDate, endDate])

  // Fetch evaluations for the lessons and process data
  useEffect(() => {
    if (lessons.length === 0) {
      setTableData([])
      setStudentOptions([])
      return
    }
    setLoading(true)
    setError(null)
    const fetchData = async () => {
      try {
        const lessonIds = lessons.map(l => l.id)

        // 1. Fetch evaluations for these lessons
        const { data: evalsData, error: evalsError } = await supabase
          .from('evaluations')
          .select('*')
          .in('lesson_id', lessonIds)

        if (evalsError) throw evalsError

        if (!evalsData || evalsData.length === 0) {
          setTableData([])
          setStudentOptions([])
          setLoading(false)
          return
        }

        // 2. Get unique student IDs from evaluations
        const studentIds = [...new Set(evalsData.map(e => e.student_id))]

        // 3. Fetch student info
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('id, name, process_number')
          .in('id', studentIds)

        if (studentsError) throw studentsError

        // 4. Fetch enrollments for these students in the selected year and form
        const { data: enrollmentsData, error: enrollmentsError } = await supabase
          .from('student_enrollments')
          .select('student_id, group_number')
          .eq('school_year_id', selectedYearId)
          .eq('school_form_id', selectedFormId)
          .in('student_id', studentIds)

        if (enrollmentsError) throw enrollmentsError

        // 5. Build maps for quick lookup
        const studentMap = new Map(studentsData.map(s => [s.id, s]))
        const enrollmentMap = new Map(enrollmentsData.map(e => [e.student_id, e]))

        // 6. Aggregate evaluations by student
        const aggMap = new Map()
        evalsData.forEach(evaluationItem => {
          const studentId = evaluationItem.student_id
          const current = aggMap.get(studentId) || {
            student_id: studentId,
            student_rating_sum: 0,
            student_rating_count: 0,
            teacher_rating_sum: 0,
            teacher_rating_count: 0
          }
          if (evaluationItem.student_rating !== null) {
            current.student_rating_sum += evaluationItem.student_rating
            current.student_rating_count += 1
          }
          if (evaluationItem.teacher_rating !== null) {
            current.teacher_rating_sum += evaluationItem.teacher_rating
            current.teacher_rating_count += 1
          }
          aggMap.set(studentId, current)
        })

        // 7. Build table data
        const tableRows = []
        aggMap.forEach((agg, studentId) => {
          const student = studentMap.get(studentId)
          const enrollment = enrollmentMap.get(studentId)
          if (!student || !enrollment) return

          const studentAvg = agg.student_rating_count > 0 ? (agg.student_rating_sum / agg.student_rating_count) : null
          const teacherAvg = agg.teacher_rating_count > 0 ? (agg.teacher_rating_sum / agg.teacher_rating_count) : null

          tableRows.push({
            student_id: studentId,
            student_name: student.name,
            process_number: student.process_number,
            group_number: enrollment.group_number,
            student_avg: studentAvg,
            teacher_avg: teacherAvg,
            eval_count: Math.max(agg.student_rating_count, agg.teacher_rating_count) // or just use one
          })
        })

        // 8. Apply student filter if selected
        let filteredData = tableRows
        if (selectedStudentId) {
          filteredData = tableRows.filter(row => row.student_id === selectedStudentId)
        }

        // 9. Sort data
        let sortedData = [...filteredData]
        switch (sortBy) {
          case 'group_number_asc':
            sortedData.sort((a, b) => a.group_number - b.group_number)
            break
          case 'group_number_desc':
            sortedData.sort((a, b) => b.group_number - a.group_number)
            break
          case 'student_avg_asc':
            sortedData.sort((a, b) => {
              if (a.student_avg === null && b.student_avg === null) return 0
              if (a.student_avg === null) return 1
              if (b.student_avg === null) return -1
              return a.student_avg - b.student_avg
            })
            break
          case 'student_avg_desc':
            sortedData.sort((a, b) => {
              if (a.student_avg === null && b.student_avg === null) return 0
              if (a.student_avg === null) return 1
              if (b.student_avg === null) return -1
              return b.student_avg - a.student_avg
            })
            break
          case 'teacher_avg_asc':
            sortedData.sort((a, b) => {
              if (a.teacher_avg === null && b.teacher_avg === null) return 0
              if (a.teacher_avg === null) return 1
              if (b.teacher_avg === null) return -1
              return a.teacher_avg - b.teacher_avg
            })
            break
          case 'teacher_avg_desc':
            sortedData.sort((a, b) => {
              if (a.teacher_avg === null && b.teacher_avg === null) return 0
              if (a.teacher_avg === null) return 1
              if (b.teacher_avg === null) return -1
              return b.teacher_avg - a.teacher_avg
            })
            break
          default:
            break
        }

        setTableData(sortedData)

        // 10. Populate student options (all students that have evaluations in the current set)
        const studentOptions = tableRows.map(row => ({
          id: row.student_id,
          name: `${row.student_name} (${row.process_number})`
        }))
        setStudentOptions(studentOptions)
      } catch (err) {
        setError(err.message)
        setTableData([])
        setStudentOptions([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [lessons, selectedStudentId, sortBy])

  if (loading && selectedYearId && selectedFormId && lessons.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        <Loader2 className="animate-spin mr-2" size={20} />
        {t('loading')}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {t('evaluation')} {t('filter')}
        </h2>
        <div className="flex items-center gap-2">
          {selectedYearId && selectedFormId && (
            <button
              onClick={() => {
                setSelectedYearId('')
                setSelectedFormId('')
                setStartDate('')
                setEndDate('')
                setSelectedStudentId('')
                setSortBy('group_number_asc')
              }}
              className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <X size={16} />
              <span className="ml-1">{t('clear_filters')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('academic_year')} *
            </label>
            <select
              value={selectedYearId}
              onChange={(e) => setSelectedYearId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus-ring-blue-500"
              required
            >
              <option value="">— {t('select_year')} —</option>
              {schoolYears.map(year => (
                <option key={year.id} value={year.id}>
                  {year.label}
                </option>
              ))}
            </select>
          </div>

          {/* Form */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('group')} *
            </label>
            <select
              value={selectedFormId}
              onChange={(e) => setSelectedFormId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus-ring-blue-500"
              required
            >
              <option value="">— {t('select_group')} —</option>
              {schoolForms.map(form => (
                <option key={form.id} value={form.id}>
                  {form.year_level} {form.class_section}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('start_date')}
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus-ring-blue-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('end_date')}
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus-ring-blue-500"
            />
          </div>
        </div>

        {/* Student Filter and Sorting */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Student Filter */}
          <div className="flex-1 min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('filter_by_student')}
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus-ring-blue-500"
            >
              <option value="">— {t('all_students')} —</option>
              {studentOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex-1 min-w-0 md:max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('sort_by')}
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus-ring-blue-500"
            >
              <option value="group_number_asc">
                {t('group_number')} {t('ascending')}
              </option>
              <option value="group_number_desc">
                {t('group_number')} {t('descending')}
              </option>
              <option value="student_avg_asc">
                {t('student_evaluation')} {t('average')} {t('ascending')}
              </option>
              <option value="student_avg_desc">
                {t('student_evaluation')} {t('average')} {t('descending')}
              </option>
              <option value="teacher_avg_asc">
                {t('teacher_evaluation')} {t('average')} {t('ascending')}
              </option>
              <option value="teacher_avg_desc">
                {t('teacher_evaluation')} {t('average')} {t('descending')}
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Results Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-500">
            <Loader2 className="animate-spin mr-2" size={20} />
            {t('loading')}
          </div>
        ) : tableData.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {t('no_evaluations')}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {/* Table Header */}
            <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="flex flex-1 items-center">
                <span className="w-20">{t('group_number')}</span>
                <span className="flex-1 min-w-0">{t('student_name')}</span>
                <span className="w-20">{t('process_number')}</span>
                <span className="w-20">{t('student_evaluation')} {t('average')}</span>
                <span className="w-20">{t('teacher_evaluation')} {t('average')}</span>
              </div>
            </div>

            {/* Table Body */}
            {tableData.map((row, index) => (
              <div key={row.student_id} className="px-6 py-4 text-left text-sm text-gray-700">
                <div className="flex flex-1 items-center">
                  <span className="w-20">
                    #{row.group_number}
                  </span>
                  <span className="flex-1 min-w-0">
                    {row.student_name}
                  </span>
                  <span className="w-20">
                    {row.process_number}
                  </span>
                  <span className="w-20">
                    {row.student_avg !== null ? row.student_avg.toFixed(2) : '—'}
                  </span>
                  <span className="w-20">
                    {row.teacher_avg !== null ? row.teacher_avg.toFixed(2) : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scale Legend Footer */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-4">
        <h3 className="text-xs font-semibold text-gray-700 mb-1.5">
          {t('scale')}:
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs text-gray-600">
          {[1, 2, 3, 4, 5].map((num) => (
            <div key={num} className="flex items-center gap-1">
              <span className="font-bold">{num}:</span>
              <span>{t(`rating_${num}`)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}