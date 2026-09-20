import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, Save, Loader2, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const EMPTY_ROW = {
  theme: '',
  activities: '',
  manual_pages: '',
  resources_physical: '',
  resources_digital: '',
  exercises_physical: '',
  exercises_digital: '',
  registers: '',
}

// Column definitions mapped to planning_units fields
const COLUMNS = [
  { key: 'theme',              i18nKey: 'themes',             required: true },
  { key: 'activities',         i18nKey: 'activities'          },
  { key: 'manual_pages',       i18nKey: 'manual_pages'        },
  { key: 'resources_physical', i18nKey: 'resources_physical'  },
  { key: 'resources_digital',  i18nKey: 'resources_digital'   },
  { key: 'exercises_physical', i18nKey: 'exercises_physical'  },
  { key: 'exercises_digital',  i18nKey: 'exercises_digital'   },
  { key: 'registers',          i18nKey: 'registers'           },
]

export default function PlanningTable({ session }) {
  const { t } = useTranslation()

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [dirtyIds, setDirtyIds] = useState(new Set())

  // ---- Fetch rows on mount ----
  const fetchRows = useCallback(async () => {
    if (!session) return
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('planning_units')
      .select('*')
      .order('created_at', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setRows(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { if (session) fetchRows() }, [fetchRows, session])

  // ---- Cell editing ----
  const handleCellChange = (rowIndex, field, value) => {
    setRows((prev) => {
      const updated = [...prev]
      updated[rowIndex] = { ...updated[rowIndex], [field]: value }
      return updated
    })
    const rowId = rows[rowIndex]?.id
    if (rowId) {
      setDirtyIds((prev) => new Set(prev).add(rowId))
    }
  }

  // ---- Add new row ----
  const handleAddRow = async () => {
    setSaving(true)
    setError(null)
    const { data, error: insertError } = await supabase
      .from('planning_units')
      .insert({ ...EMPTY_ROW, theme: t('new_theme_placeholder') })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
    } else {
      setRows((prev) => [...prev, data])
    }
    setSaving(false)
  }

  // ---- Save dirty rows ----
  const handleSave = async () => {
    if (dirtyIds.size === 0) return
    setSaving(true)
    setError(null)

    const dirtyRows = rows.filter((r) => dirtyIds.has(r.id))
    const updates = dirtyRows.map((row) => {
      const { id, created_at, ...fields } = row
      return supabase
        .from('planning_units')
        .update(fields)
        .eq('id', id)
    })

    const results = await Promise.all(updates)
    const failed = results.find((r) => r.error)
    if (failed) {
      setError(failed.error.message)
    } else {
      setDirtyIds(new Set())
    }
    setSaving(false)
  }

  // ---- Delete row ----
  const handleDeleteRow = async (rowIndex) => {
    const row = rows[rowIndex]
    if (!row?.id) return
    setSaving(true)
    setError(null)

    const { error: deleteError } = await supabase
      .from('planning_units')
      .delete()
      .eq('id', row.id)

    if (deleteError) {
      setError(deleteError.message)
    } else {
      setRows((prev) => prev.filter((_, i) => i !== rowIndex))
      setDirtyIds((prev) => {
        const next = new Set(prev)
        next.delete(row.id)
        return next
      })
    }
    setSaving(false)
  }

  // ---- Render ----
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        <Loader2 className="animate-spin mr-2" size={20} />
        {t('loading')}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {t('general_planning')}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleAddRow}
            disabled={saving}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Plus size={16} />
            {t('add_row')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || dirtyIds.size === 0}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {t('save')}
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap"
                >
                  {t(col.i18nKey)}
                  {col.required && <span className="text-red-500 ml-0.5">*</span>}
                </th>
              ))}
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUMNS.length + 1}
                  className="px-4 py-8 text-center text-sm text-gray-500"
                >
                  {t('no_units')}
                </td>
              </tr>
            ) : (
              rows.map((row, rowIndex) => (
                <tr
                  key={row.id}
                  className={`group ${dirtyIds.has(row.id) ? 'bg-yellow-50' : 'hover:bg-gray-50'}`}
                >
                  {COLUMNS.map((col) => (
                    <td key={col.key} className="px-2 py-1">
                      <textarea
                        value={row[col.key] ?? ''}
                        onChange={(e) => handleCellChange(rowIndex, col.key, e.target.value)}
                        rows={2}
                        className="w-full min-w-[120px] px-2 py-1.5 text-sm text-gray-900 bg-transparent border border-transparent rounded focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none resize-y"
                      />
                    </td>
                  ))}
                  <td className="px-2 py-1 align-top">
                    <button
                      onClick={() => handleDeleteRow(rowIndex)}
                      disabled={saving}
                      className="mt-1.5 p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30"
                      aria-label={t('delete_row')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
