import { Plus, Search, Upload } from 'lucide-react'
import { SchoolFormSelect } from '../ui/SchoolFormSelect'
import { SchoolYearSelect } from '../ui/SchoolYearSelect'
import { StudentFilterInput } from '../ui/StudentFilterInput'

export function StudentFilterBar({
    searchQuery,
    onSearchChange,
    filterYearId,
    onYearChange,
    filterFormId,
    onFormChange,
    schoolYears,
    schoolForms,
    onOpenAddModal,
    onOpenBulkImportModal,
    t
}) {
    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 shadow-sm transition-colors">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                <div className="relative md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('search_students')}
                    </label>
                    <Search className="absolute left-3 top-8 text-gray-400" size={16} />
                    <StudentFilterInput value={searchQuery} onChange={onSearchChange} t={t} />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('academic_year')}
                    </label>
                    <SchoolYearSelect
                        value={filterYearId}
                        onChange={onYearChange}
                        schoolYears={schoolYears}
                        placeholder={t('all_years') || 'All Years'}
                        t={t}
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('group')}
                    </label>
                    <SchoolFormSelect
                        value={filterFormId}
                        onChange={onFormChange}
                        schoolForms={schoolForms}
                        placeholder={t('all_groups') || 'All Groups'}
                        t={t}
                    />
                </div>

                <div className="flex gap-2 md:col-span-2">
                    <button
                        onClick={onOpenAddModal}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap shadow-sm"
                    >
                        <Plus size={16} />
                        <span>{t('add_student_btn')}</span>
                    </button>
                    <button
                        onClick={onOpenBulkImportModal}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors whitespace-nowrap shadow-sm"
                        title={t('bulk_import')}
                    >
                        <Upload size={16} />
                        <span className="hidden lg:inline">{t('bulk_import')}</span>
                    </button>
                </div>
            </div>
        </div>
    )
}