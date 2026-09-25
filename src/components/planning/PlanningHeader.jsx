import { Plus } from 'lucide-react'

export function PlanningHeader({ onSave, onCreateTheme, saving, dirtyCount, t }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    {t('general_planning') || 'Planeamento Geral'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {t('general_planning_subtitle') || 'Organize as aprendizagens essenciais por turma e tema'}
                </p>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={onCreateTheme}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                    <Plus size={16} />
                    {t('add_theme') || 'Novo Tema'}
                </button>
            </div>
        </div>
    )
}