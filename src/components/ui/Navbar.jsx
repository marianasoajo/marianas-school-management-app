import { Globe, LogOut, Moon, Sun } from 'lucide-react'

export default function Navbar({
    activeTab,
    setActiveTab,
    language,
    onToggleLanguage,
    theme,
    onToggleTheme,
    onLogout,
    t
}) {
    const tabs = [
        { id: 'general', label: t('general_planning') },
        { id: 'summaries', label: t('summaries') },
        { id: 'groups', label: t('groups') },
        { id: 'students', label: t('students') },
        { id: 'evaluations', label: t('evaluation') }
    ]

    return (
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">EduPlanner</h1>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Theme Toggle */}
                        <button
                            onClick={onToggleTheme}
                            className="p-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            aria-label="Toggle theme"
                            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        {/* Language Toggle */}
                        <button
                            onClick={onToggleLanguage}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            aria-label="Toggle language"
                        >
                            <Globe size={16} />
                            <span>{language.toUpperCase()}</span>
                        </button>

                        {/* Logout Button */}
                        <button
                            onClick={onLogout}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                            aria-label={t('logout')}
                            title={t('logout')}
                        >
                            <LogOut size={16} />
                            <span className="hidden sm:inline">{t('logout')}</span>
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <nav className="flex space-x-8 border-t border-gray-100 dark:border-gray-800 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-3.5 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === tab.id
                                ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400 font-semibold'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
        </header>
    )
}