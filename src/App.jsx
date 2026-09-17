import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import PlanningTable from './components/planning/PlanningTable'
import LessonPresentation from './components/classroom/LessonPresentation'

function App() {
  const { t, i18n } = useTranslation()
  const [activeTab, setActiveTab] = useState('general')

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'pt' : 'en'
    i18n.changeLanguage(newLang)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Navigation */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">EduPlanner</h1>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              aria-label="Toggle language"
            >
              <Globe size={16} />
              <span>{i18n.language.toUpperCase()}</span>
            </button>
          </div>

          {/* Tab Navigation */}
          <nav className="flex space-x-8 border-t border-gray-200">
            <button
              onClick={() => setActiveTab('general')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'general'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('general_planning')}
            </button>
            <button
              onClick={() => setActiveTab('presentation')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'presentation'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('presentation')}
            </button>
            <button
              onClick={() => setActiveTab('oral')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'oral'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('oral_evaluation')}
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'general' && (
          <div className="bg-white rounded-lg shadow p-6">
            <PlanningTable />
          </div>
        )}

        {activeTab === 'presentation' && (
          <div className="bg-white rounded-lg shadow p-6">
            <LessonPresentation />
          </div>
        )}

        {activeTab === 'oral' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">{t('oral_evaluation')}</h2>
            <p className="text-gray-600">Oral evaluation grid will be implemented here.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
