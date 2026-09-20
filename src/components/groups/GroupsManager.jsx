import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Calendar,
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function GroupsManager({ session }) {
  const { t } = useTranslation()

  // Active tab state
  const [activeTab, setActiveTab] = useState('years')

  // Data state
  const [schoolYears, setSchoolYears] = useState([])
  const [schoolForms, setSchoolForms] = useState([])

  // UI state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showYearModal, setShowYearModal] = useState(false)
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingYear, setEditingYear] = useState(null)
  const [editingForm, setEditingForm] = useState(null)

  // Form state
  const [yearForm, setYearForm] = useState({
    label: '',
    start_date: '',
    end_date: '',
    is_active: false
  })

  const [formForm, setFormForm] = useState({
    year_level: '',
    class_section: ''
  })

  // Fetch data on mount and tab change
  useEffect(() => {
    if (!session) return
    if (activeTab === 'years') {
      fetchSchoolYears()
    } else {
      fetchSchoolForms()
    }
  }, [activeTab, session])

  // Fetch academic years
  const fetchSchoolYears = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('school_years')
        .select('*')
        .order('label', { ascending: false })

      if (fetchError) throw fetchError
      setSchoolYears(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Fetch school forms
  const fetchSchoolForms = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('school_forms')
        .select('*')
        .order('year_level, class_section')

      if (fetchError) throw fetchError
      setSchoolForms(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Open year modal (create/edit)
  const openYearModal = (year = null) => {
    if (year) {
      setEditingYear(year)
      setYearForm({
        label: year.label,
        start_date: year.start_date || '',
        end_date: year.end_date || '',
        is_active: year.is_active || false
      })
    } else {
      setEditingYear(null)
      setYearForm({
        label: '',
        start_date: '',
        end_date: '',
        is_active: false
      })
    }
    setShowYearModal(true)
  }

  // Save academic year
  const handleSaveYear = async () => {
    setError(null)

    if (!yearForm.label) {
      setError(t('required_field'))
      return
    }

    try {
      if (editingYear) {
        const { error: updateError } = await supabase
          .from('school_years')
          .update(yearForm)
          .eq('id', editingYear.id)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('school_years')
          .insert(yearForm)

        if (insertError) throw insertError
      }

      setShowYearModal(false)
      fetchSchoolYears()
    } catch (err) {
      setError(err.message)
    }
  }

  // Delete academic year
  const handleDeleteYear = async (yearId) => {
    if (!confirm(t('confirm_delete_year'))) return

    try {
      const { error: deleteError } = await supabase
        .from('school_years')
        .delete()
        .eq('id', yearId)

      if (deleteError) throw deleteError

      fetchSchoolYears()
    } catch (err) {
      setError(err.message)
    }
  }

  // Set active year
  const handleSetActiveYear = async (yearId) => {
    try {
      // Set all years to inactive
      await supabase
        .from('school_years')
        .update({ is_active: false })
        .neq('id', '00000000-0000-0000-0000-000000000000')

      // Set selected year to active
      const { error: updateError } = await supabase
        .from('school_years')
        .update({ is_active: true })
        .eq('id', yearId)

      if (updateError) throw updateError

      fetchSchoolYears()
    } catch (err) {
      setError(err.message)
    }
  }

  // Open form modal (create/edit)
  const openFormModal = (form = null) => {
    if (form) {
      setEditingForm(form)
      setFormForm({
        year_level: form.year_level,
        class_section: form.class_section
      })
    } else {
      setEditingForm(null)
      setFormForm({
        year_level: '',
        class_section: ''
      })
    }
    setShowFormModal(true)
  }

  // Save school form
  const handleSaveForm = async () => {
    setError(null)

    if (!formForm.year_level || !formForm.class_section) {
      setError(t('required_field'))
      return
    }

    try {
      if (editingForm) {
        const { error: updateError } = await supabase
          .from('school_forms')
          .update(formForm)
          .eq('id', editingForm.id)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('school_forms')
          .insert(formForm)

        if (insertError) throw insertError
      }

      setShowFormModal(false)
      fetchSchoolForms()
    } catch (err) {
      setError(err.message)
    }
  }

  // Delete school form
  const handleDeleteForm = async (formId) => {
    if (!confirm(t('confirm_delete_form'))) return

    try {
      const { error: deleteError } = await supabase
        .from('school_forms')
        .delete()
        .eq('id', formId)

      if (deleteError) throw deleteError

      fetchSchoolForms()
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

      {/* Tab Navigation */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('years')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'years'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Calendar size={18} />
            {t('academic_years')}
          </button>
          <button
            onClick={() => setActiveTab('forms')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'forms'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <GraduationCap size={18} />
            {t('school_forms')}
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {/* Academic Years Tab */}
          {activeTab === 'years' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">{t('academic_years')}</h2>
                <button
                  onClick={() => openYearModal()}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} />
                  {t('add_academic_year')}
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin mr-2" size={20} />
                  {t('loading')}
                </div>
              ) : schoolYears.length === 0 ? (
                <div className="text-center py-12 text-gray-500">{t('no_years')}</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {schoolYears.map((year) => (
                    <div
                      key={year.id}
                      className={`p-4 border rounded-lg ${
                        year.is_active
                          ? 'bg-green-50 border-green-300'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      } transition-colors`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{year.label}</h3>
                          {year.is_active && (
                            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                              <CheckCircle2 size={12} />
                              {t('active_year')}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => openYearModal(year)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title={t('edit_academic_year')}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteYear(year.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title={t('delete_academic_year')}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        {year.start_date && (
                          <p>
                            <span className="font-medium">{t('start_date')}:</span>{' '}
                            {new Date(year.start_date).toLocaleDateString()}
                          </p>
                        )}
                        {year.end_date && (
                          <p>
                            <span className="font-medium">{t('end_date')}:</span>{' '}
                            {new Date(year.end_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {!year.is_active && (
                        <button
                          onClick={() => handleSetActiveYear(year.id)}
                          className="mt-3 w-full px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-300 rounded-md hover:bg-green-100 transition-colors"
                        >
                          {t('set_active')}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* School Forms Tab */}
          {activeTab === 'forms' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">{t('school_forms')}</h2>
                <button
                  onClick={() => openFormModal()}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} />
                  {t('add_school_form')}
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin mr-2" size={20} />
                  {t('loading')}
                </div>
              ) : schoolForms.length === 0 ? (
                <div className="text-center py-12 text-gray-500">{t('no_forms')}</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {schoolForms.map((form) => (
                    <div
                      key={form.id}
                      className="p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-gray-900">
                            {form.year_level} {form.class_section}
                          </h3>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => openFormModal(form)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title={t('edit_school_form')}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteForm(form.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title={t('delete_school_form')}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>
                          <span className="font-medium">{t('year_level')}:</span> {form.year_level}
                        </p>
                        <p>
                          <span className="font-medium">{t('class_section')}:</span> {form.class_section}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Academic Year Modal */}
      {showYearModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingYear ? t('edit_academic_year') : t('create_academic_year')}
              </h2>
              <button onClick={() => setShowYearModal(false)} className="p-1 text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('year_label')} *
                </label>
                <input
                  type="text"
                  value={yearForm.label}
                  onChange={(e) => setYearForm({ ...yearForm, label: e.target.value })}
                  placeholder="2026/2027"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('start_date')}</label>
                <input
                  type="date"
                  value={yearForm.start_date}
                  onChange={(e) => setYearForm({ ...yearForm, start_date: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('end_date')}</label>
                <input
                  type="date"
                  value={yearForm.end_date}
                  onChange={(e) => setYearForm({ ...yearForm, end_date: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={yearForm.is_active}
                  onChange={(e) => setYearForm({ ...yearForm, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">
                  {t('active_year')}
                </label>
              </div>
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowYearModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSaveYear}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {editingYear ? t('update_academic_year') : t('create_academic_year')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* School Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingForm ? t('edit_school_form') : t('create_school_form')}
              </h2>
              <button onClick={() => setShowFormModal(false)} className="p-1 text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('year_level')} *
                </label>
                <input
                  type="text"
                  value={formForm.year_level}
                  onChange={(e) => setFormForm({ ...formForm, year_level: e.target.value })}
                  placeholder="9º Ano"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('class_section')} *
                </label>
                <input
                  type="text"
                  value={formForm.class_section}
                  onChange={(e) => setFormForm({ ...formForm, class_section: e.target.value })}
                  placeholder="Turma A"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowFormModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSaveForm}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {editingForm ? t('update_school_form') : t('create_school_form')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
