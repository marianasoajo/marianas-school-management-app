import { AlertCircle, Loader2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFormatters } from '../../utils/formatters'
import { SchoolFormSelect } from '../ui/SchoolFormSelect'
import { SchoolYearSelect } from '../ui/SchoolYearSelect'
import { RATING_LABELS, evaluationApi } from './api/evaluationApi'

export function EvaluationFilter({ session }) {
  const { t } = useFormatters()

  // Data state
  const [schoolYears, setSchoolYears] = useState([])
  const [schoolForms, setSchoolForms] = useState([])
  const [lessons, setLessons] = useState([])

  // Filter state
  const [selectedYearId, setSelectedYearId] = useState('')
  const [selectedFormId, setSelectedFormId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [sortBy, setSortBy] = useState('group_number_asc')

  // UI state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [studentOptions, setStudentOptions] = useState([])
  const [tableData, setTableData] = useState([])

  // Fetch school years and forms on mount
  useEffect(() => {
    if (!session) return
    const loadMetadata = async () => {
      try {
        const { schoolYears: years, schoolForms: forms } = await evaluationApi.fetchMetadata()
        setSchoolYears(years)
        setSchoolForms(forms)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadMetadata()
  }, [session])

  // Fetch lessons for selected parameters
  useEffect(() => {
    if (!selectedYearId || !selectedFormId) {
      setLessons([])
      return
    }
    setLoading(true)
    setError(null)
    const loadLessons = async () => {
      try {
        const data = await evaluationApi.fetchFilteredLessons({
          selectedYearId,
          selectedFormId,
          startDate,
          endDate
        })
        setLessons(data)
      } catch (err) {
        setError(err.message)
        setLessons([])
      } finally {
        setLoading(false)
      }
    }
    loadLessons()
  }, [selectedYearId, selectedFormId, startDate, endDate])

  // Process evaluation metrics
  useEffect(() => {
    if (lessons.length === 0) {
      setTableData([])
      setStudentOptions([])
      return
    }
    setLoading(true)
    setError(null)

    const loadEvaluations = async () => {
      try {
        const lessonIds = lessons.map((l) => l.id)
        const tableRows = await evaluationApi.fetchEvaluationsSummary({
          lessonIds,
          selectedYearId,
          selectedFormId
        })

        // Apply student filter
        let filteredData = tableRows
        if (selectedStudentId) {
          filteredData = tableRows.filter((row) => row.student_id === selectedStudentId)
        }

        // Sorting
        const sortedData = [...filteredData].sort((a, b) => {
          switch (sortBy) {
            case 'group_number_asc':
              return a.group_number - b.group_number
            case 'group_number_desc':
              return b.group_number - a.group_number
            case 'student_avg_asc':
              return (a.student_avg ?? Infinity) - (b.student_avg ?? Infinity)
            case 'student_avg_desc':
              return (b.student_avg ?? -Infinity) - (a.student_avg ?? -Infinity)
            case 'teacher_avg_asc':
              return (a.teacher_avg ?? Infinity) - (b.teacher_avg ?? Infinity)
            case 'teacher_avg_desc':
              return (a.teacher_avg ?? -Infinity) - (b.teacher_avg ?? -Infinity)
            default:
              return 0
          }
        })

        setTableData(sortedData)
        setStudentOptions(
          tableRows.map((row) => ({
            id: row.student_id,
            name: `${row.student_name} (${row.process_number})`
          }))
        )
      } catch (err) {
        setError(err.message)
        setTableData([])
        setStudentOptions([])
      } finally {
        setLoading(false)
      }
    }
    loadEvaluations()
  }, [lessons, selectedStudentId, sortBy, selectedYearId, selectedFormId])

  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
        <h2 className="text-xl font-semibold">
          {t('evaluation')} {t('filter')}
        </h2>
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
            className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={16} />
            <span>{t('clear_filters')}</span>
          </button>
        )}
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('academic_year')} *</label>
            <SchoolYearSelect
              value={selectedYearId}
              onChange={setSelectedYearId}
              schoolYears={schoolYears}
              t={t}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('group')} *</label>
            <SchoolFormSelect
              value={selectedFormId}
              onChange={setSelectedFormId}
              schoolForms={schoolForms}
              t={t}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('start_date')}</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('end_date')}</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t border-gray-100 dark:border-gray-800 pt-4">
          <div className="flex-1 min-w-0">
            <label className="block text-sm font-medium mb-1">{t('filter_by_student')}</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— {t('all_students')} —</option>
              {studentOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-0 md:max-w-xs">
            <label className="block text-sm font-medium mb-1">{t('sort_by')}</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="group_number_asc">{t('group_number')} {t('ascending')}</option>
              <option value="group_number_desc">{t('group_number')} {t('descending')}</option>
              <option value="student_avg_asc">{t('student_evaluation')} {t('average')} {t('ascending')}</option>
              <option value="student_avg_desc">{t('student_evaluation')} {t('average')} {t('descending')}</option>
              <option value="teacher_avg_asc">{t('teacher_evaluation')} {t('average')} {t('ascending')}</option>
              <option value="teacher_avg_desc">{t('teacher_evaluation')} {t('average')} {t('descending')}</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Results Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-500">
            <Loader2 className="animate-spin mr-2" size={20} />
            {t('loading')}
          </div>
        ) : tableData.length === 0 ? (
          <div className="text-center py-12 text-gray-500">{t('no_evaluations')}</div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center">
              <span className="w-20">{t('group_number')}</span>
              <span className="flex-1 min-w-0">{t('student_name')}</span>
              <span className="w-28">{t('process_number')}</span>
              <span className="w-32">{t('student_evaluation')} {t('average')}</span>
              <span className="w-32">{t('teacher_evaluation')} {t('average')}</span>
            </div>

            {tableData.map((row) => (
              <div key={row.student_id} className="px-6 py-4 text-sm flex items-center hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                <span className="w-20 font-medium">#{row.group_number}</span>
                <span className="flex-1 min-w-0 font-medium">{row.student_name}</span>
                <span className="w-28 text-gray-500 dark:text-gray-400">{row.process_number}</span>
                <span className="w-32 font-semibold text-blue-600 dark:text-blue-400">
                  {row.student_avg !== null ? row.student_avg.toFixed(2) : '—'}
                </span>
                <span className="w-32 font-semibold text-emerald-600 dark:text-emerald-400">
                  {row.teacher_avg !== null ? row.teacher_avg.toFixed(2) : '—'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scale Legend Footer */}
      <div className="bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 rounded-lg p-3">
        <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('scale')}:</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs text-gray-600 dark:text-gray-400">
          {[1, 2, 3, 4, 5].map((num) => (
            <div key={num} className="flex items-center gap-1">
              <span className="font-bold text-gray-900 dark:text-gray-200">{num}:</span>
              <span>{t(RATING_LABELS[num])}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}