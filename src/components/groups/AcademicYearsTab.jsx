import { CheckCircle2, Loader2, Pencil, Plus, Trash2, Users } from 'lucide-react'
import { useState } from 'react'
import ConfirmModal from '../ui/ConfirmDeletionModal'

export function AcademicYearsTab({
    loading,
    schoolYears,
    onOpenYearModal,
    onOpenExportModal,
    onSetActiveYear,
    onDeleteYear,
    t
}) {
    // Helper to format ISO date strings safely without UTC timezone shift
    const formatDate = (dateStr) => {
        if (!dateStr) return ''
        const [year, month, day] = dateStr.split('T')[0].split('-')
        return `${day}/${month}/${year}`
    }

    const [deletingYearId, setDeletingYearId] = useState(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleConfirmDelete = async () => {
        if (!deletingYearId) return
        setIsDeleting(true)
        try {
            await onDeleteYear(deletingYearId)
            setDeletingYearId(null)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('academic_years')}</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onOpenExportModal}
                        className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                    >
                        <Users size={16} />
                        {t('export_promote_students') || 'Exportar Alunos'}
                    </button>
                    <button
                        onClick={() => onOpenYearModal()}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Plus size={16} />
                        {t('add_academic_year')}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                    <Loader2 className="animate-spin mr-2" size={20} />
                    {t('loading')}
                </div>
            ) : schoolYears.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-800 rounded-lg">
                    {t('no_years')}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {schoolYears.map((year) => (
                        <div
                            key={year.id}
                            className={`p-4 border rounded-lg transition-all shadow-sm ${year.is_active
                                ? 'bg-green-50/50 dark:bg-green-950/20 border-green-300 dark:border-green-800/80 ring-1 ring-green-500/20'
                                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{year.label}</h3>
                                    {year.is_active && (
                                        <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/40 rounded-full border border-green-200 dark:border-green-800">
                                            <CheckCircle2 size={12} />
                                            {t('active_year')}
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => onOpenYearModal(year)}
                                        className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded transition-colors"
                                        title={t('edit_academic_year')}
                                    >
                                        <Pencil size={15} />
                                    </button>
                                    <button
                                        onClick={() => { setDeletingYearId(year.id) }}
                                        className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-colors"
                                        title={t('delete_academic_year')}
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>

                            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                {year.start_date && (
                                    <p>
                                        <span className="font-medium text-gray-700 dark:text-gray-300">{t('start_date')}:</span>{' '}
                                        {formatDate(year.start_date)}
                                    </p>
                                )}
                                {year.end_date && (
                                    <p>
                                        <span className="font-medium text-gray-700 dark:text-gray-300">{t('end_date')}:</span>{' '}
                                        {formatDate(year.end_date)}
                                    </p>
                                )}
                            </div>

                            {!year.is_active && (
                                <button
                                    onClick={() => onSetActiveYear(year.id)}
                                    className="mt-4 w-full px-3 py-1.5 text-xs font-medium text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/30 border border-green-300 dark:border-green-800 rounded-md hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                                >
                                    {t('set_active')}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={Boolean(deletingYearId)}
                title={t('delete_academic_year') || 'Delete Academic Year'}
                message={t('confirm_delete_year') || 'Are you sure you want to delete this academic year? This action cannot be undone.'}
                confirmText={t('delete') || 'Delete'}
                cancelText={t('cancel') || 'Cancel'}
                isLoading={isDeleting}
                onConfirm={handleConfirmDelete}
                onClose={() => setDeletingYearId(null)}
            />
        </div>
    )
}
