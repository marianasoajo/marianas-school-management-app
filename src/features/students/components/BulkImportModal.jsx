import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import Select from '../../../components/ui/Select'
import { parseExcelOrCsv } from '../../../utils/excelParser'

export default function BulkImportModal({ isOpen, onClose, years = [], forms = [], onImport }) {
    const { t } = useTranslation()

    const [selectedYear, setSelectedYear] = useState(years[0]?.id || '')
    const [selectedForm, setSelectedForm] = useState(forms[0]?.id || '')
    const [rawText, setRawText] = useState('')
    const [parsedRows, setParsedRows] = useState([])
    const [isImporting, setIsImporting] = useState(false)
    const [error, setError] = useState(null)

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setError(null)
        try {
            const rows = await parseExcelOrCsv(file)
            setParsedRows(rows)
        } catch (err) {
            setError(t('invalid_file'))
        }
    }

    const handleParseText = () => {
        if (!rawText.trim()) return
        const lines = rawText.trim().split('\n')
        const rows = lines.map((line) => {
            const parts = line.split(/[,;\t]/)
            return {
                process_number: parts[0]?.trim() || '',
                name: parts[1]?.trim() || '',
                group_number: parts[2]?.trim() || '',
                guardian_name: parts[3]?.trim() || ''
            }
        }).filter((r) => r.process_number && r.name)

        setParsedRows(rows)
    }

    const handleConfirmImport = async () => {
        if (parsedRows.length === 0 || !selectedYear || !selectedForm) {
            setError(t('required_field'))
            return
        }

        setIsImporting(true)
        setError(null)
        try {
            await onImport({
                students: parsedRows,
                yearId: selectedYear,
                formId: selectedForm
            })
            onClose()
        } catch (err) {
            setError(err.message)
        } finally {
            setIsImporting(false)
        }
    }

    const yearOptions = years.map((y) => ({ value: y.id, label: y.label }))
    const formOptions = forms.map((f) => ({ value: f.id, label: `${f.year_level} - ${f.class_section}` }))

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('bulk_import')} maxWidth="max-w-xl">
            <div className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 rounded-lg text-xs">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-app-hover/50 rounded-xl border border-app-border">
                    <Select
                        label={t('academic_year')}
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        options={yearOptions}
                        required
                    />
                    <Select
                        label={t('school_form')}
                        value={selectedForm}
                        onChange={(e) => setSelectedForm(e.target.value)}
                        options={formOptions}
                        required
                    />
                </div>

                {/* File Upload Input */}
                <div className="p-4 border-2 border-dashed border-app-border rounded-xl text-center space-y-2">
                    <p className="text-xs text-content-muted">{t('drop_file_here')}</p>
                    <input
                        type="file"
                        accept=".csv,.xls,.xlsx"
                        onChange={handleFileUpload}
                        className="text-xs text-content-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-primary-light file:text-brand-primary hover:file:bg-brand-primary/20"
                    />
                </div>

                {/* CSV Text Area Option */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-content-muted">{t('or_paste_csv')}</label>
                    <textarea
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        rows={3}
                        placeholder="1001, Maria Santos, 1&#10;1002, João Silva, 2"
                        className="w-full text-xs p-3 rounded-xl border border-app-border bg-app-surface text-content-main focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                    <Button variant="secondary" onClick={handleParseText} className="!py-1.5 text-xs">
                        {t('preview')}
                    </Button>
                </div>

                {/* Parsed Rows Preview */}
                {parsedRows.length > 0 && (
                    <div className="space-y-1.5">
                        <span className="text-xs font-semibold uppercase text-brand-primary">
                            {t('import_preview')} ({parsedRows.length})
                        </span>
                        <div className="max-h-36 overflow-y-auto border border-app-border rounded-xl p-2 space-y-1 bg-app-hover/30 text-xs">
                            {parsedRows.map((row, idx) => (
                                <div key={idx} className="flex items-center justify-between py-1 px-2 border-b border-app-border/40 last:border-0">
                                    <span>#{row.group_number || '-'} {row.name}</span>
                                    <span className="text-content-muted font-mono">{row.process_number}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-app-border">
                    <Button variant="secondary" onClick={onClose} disabled={isImporting}>
                        {t('cancel')}
                    </Button>
                    <Button onClick={handleConfirmImport} isLoading={isImporting} disabled={parsedRows.length === 0}>
                        {t('confirm_import')}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}