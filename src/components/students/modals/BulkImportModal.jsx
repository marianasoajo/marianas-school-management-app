import { CheckCircle2, FileSpreadsheet, Loader2, Upload, X } from 'lucide-react'
import { useState } from 'react'
import { parseExcelOrCsv } from '../../../utils/excelParser'
import { SchoolFormSelect } from '../../ui/SchoolFormSelect'
import { SchoolYearSelect } from '../../ui/SchoolYearSelect'

export function BulkImportModal({
    isOpen,
    onClose,
    schoolYears,
    schoolForms,
    onConfirmImport,
    t
}) {
    const [bulkYearId, setBulkYearId] = useState(schoolYears.find((y) => y.is_active)?.id || '')
    const [bulkFormId, setBulkFormId] = useState(schoolForms[0]?.id || '')
    const [parsedRows, setParsedRows] = useState([])
    const [rawText, setRawText] = useState('')
    const [importing, setImporting] = useState(false)
    const [importProgress, setImportProgress] = useState(0)
    const [importSummary, setImportSummary] = useState(null)

    if (!isOpen) return null

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
                    setParsedRows(parseExcelOrCsv(text))
                }
            }
            reader.readAsText(file)
        } else if (['xls', 'xlsx'].includes(extension || '')) {
            reader.onload = (evt) => {
                setParsedRows(parseExcelOrCsv(evt.target?.result, true))
            }
            reader.readAsArrayBuffer(file)
        }
    }

    const handleRawTextChange = (text) => {
        setRawText(text)
        try {
            setParsedRows(parseExcelOrCsv(text))
        } catch {
            // ignore parse errors while typing
        }
    }

    const handleConfirm = async () => {
        setImporting(true)
        const validRows = parsedRows.filter((r) => r.isValid)

        const summary = await onConfirmImport({
            validRows,
            bulkYearId,
            bulkFormId,
            onProgress: (progress) => setImportProgress(progress)
        })

        setImporting(false)
        setImportSummary(summary)
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[92vh] overflow-y-auto text-gray-900 dark:text-gray-100 transition-colors">
                <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileSpreadsheet className="text-blue-600 dark:text-blue-400" size={20} />
                        <h2 className="text-xl font-bold">{t('bulk_import')}</h2>
                    </div>
                    <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <X size={20} />
                    </button>
                </div>

                <div className="px-6 py-4 space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-3">
                            {t('enroll_in_year_group')} *
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-blue-800 dark:text-blue-300 mb-1">
                                    {t('academic_year')}
                                </label>
                                <SchoolYearSelect
                                    value={bulkYearId}
                                    onChange={setBulkYearId}
                                    schoolYears={schoolYears}
                                    t={t}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-blue-800 dark:text-blue-300 mb-1">
                                    {t('group')}
                                </label>
                                <SchoolFormSelect
                                    value={bulkFormId}
                                    onChange={setBulkFormId}
                                    schoolForms={schoolForms}
                                    t={t}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 rounded-lg p-6 text-center cursor-pointer transition-colors bg-gray-50 dark:bg-gray-800/40">
                            <input
                                type="file"
                                id="bulk-file-input"
                                accept=".csv, .xls, .xlsx, .txt"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            <label htmlFor="bulk-file-input" className="cursor-pointer block">
                                <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                                <p className="text-sm font-medium">{t('drop_file_here')}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">.CSV, .XLS, .XLSX</p>
                            </label>
                        </div>

                        <div>
                            <label className="block text-xs font-medium mb-1">{t('or_paste_csv')}</label>
                            <textarea
                                rows={3}
                                value={rawText}
                                onChange={(e) => handleRawTextChange(e.target.value)}
                                placeholder="process_number,name,group_number,birthdate,guardian_name..."
                                className="w-full font-mono text-xs p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md"
                            />
                        </div>
                    </div>

                    {parsedRows.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-semibold">
                                    {t('import_preview')} ({parsedRows.length})
                                </h3>
                                <div className="text-xs">
                                    <span className="text-green-600 dark:text-green-400 font-medium">
                                        {parsedRows.filter((r) => r.isValid).length} válidos
                                    </span>{' '}
                                    •{' '}
                                    <span className="text-red-600 dark:text-red-400 font-medium">
                                        {parsedRows.filter((r) => !r.isValid).length} com erros
                                    </span>
                                </div>
                            </div>

                            <div className="border border-gray-200 dark:border-gray-800 rounded-lg max-h-60 overflow-y-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-xs">
                                    <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                                        <tr>
                                            <th className="px-3 py-2 text-left">Status</th>
                                            <th className="px-3 py-2 text-left">{t('process_number')}</th>
                                            <th className="px-3 py-2 text-left">{t('full_name')}</th>
                                            <th className="px-3 py-2 text-left">{t('group_number')}</th>
                                            <th className="px-3 py-2 text-left">{t('birthdate')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                        {parsedRows.map((row) => (
                                            <tr key={row.id} className={row.isValid ? '' : 'bg-red-50 dark:bg-red-950/30'}>
                                                <td className="px-3 py-1.5 font-medium">
                                                    {row.isValid ? (
                                                        <span className="text-green-600 dark:text-green-400">OK</span>
                                                    ) : (
                                                        <span className="text-red-600 dark:text-red-400" title={row.errors.join(', ')}>
                                                            Erro
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-1.5">{row.process_number || '—'}</td>
                                                <td className="px-3 py-1.5">{row.name || '—'}</td>
                                                <td className="px-3 py-1.5">{row.group_number || '—'}</td>
                                                <td className="px-3 py-1.5 text-gray-500">{row.birthdate || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {importing && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span>{t('importing')}</span>
                                <span>{importProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-200"
                                    style={{ width: `${importProgress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {importSummary && (
                        <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-900 dark:text-green-200 flex items-center gap-2">
                            <CheckCircle2 className="text-green-600 dark:text-green-400" size={20} />
                            <div>
                                <p className="font-semibold">{t('import_complete')}</p>
                                <p className="text-xs">
                                    {t('students_imported', { count: importSummary.successCount })}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                    <button
                        onClick={onClose}
                        disabled={importing}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                        {importSummary ? t('close') : t('cancel')}
                    </button>
                    {!importSummary && (
                        <button
                            onClick={handleConfirm}
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
    )
}