import { Globe, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Login from './components/auth/Login'
import EvaluationFilter from './components/evaluation/EvaluationFilter'
import GroupsManager from './components/groups/GroupsManager'
import LessonPresentation from './components/lessons/LessonPresentation'
import PlanningTable from './components/planning/PlanningTable'
import StudentsManager from './components/students/StudentsManager'
import { supabase } from './lib/supabase'

function App() {
  const { t, i18n } = useTranslation()
  const [activeTab, setActiveTab] = useState('summaries')
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'pt' : 'en'
    i18n.changeLanguage(newLang)
  }

  // Check auth session on mount and listen for changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  // Show login screen if not authenticated
  if (!session) {
    return <Login />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Navigation */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">EduPlanner</h1>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                aria-label="Toggle language"
              >
                <Globe size={16} />
                <span>{i18n.language.toUpperCase()}</span>
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                aria-label={t('logout')}
                title={t('logout')}
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">{t('logout')}</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex space-x-8 border-t border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('general')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'general'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              {t('general_planning')}
            </button>
            <button
              onClick={() => setActiveTab('summaries')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'summaries'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              {t('summaries')}
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'groups'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              {t('groups')}
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'students'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              {t('students')}
            </button>
            <button
              onClick={() => setActiveTab('evaluations')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'evaluations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              {t('evaluation')}
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        {activeTab === 'general' && (
          <div className="bg-white rounded-lg shadow p-6">
            <PlanningTable session={session} />
          </div>
        )}

        {activeTab === 'summaries' && (
          <div className="bg-white rounded-lg shadow p-6">
            <LessonPresentation session={session} />
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="bg-white rounded-lg shadow p-6">
            <GroupsManager session={session} />
          </div>
        )}

        {activeTab === 'students' && (
          <div className="bg-white rounded-lg shadow p-6">
            <StudentsManager session={session} />
          </div>
        )}

        {activeTab === 'evaluations' && (
          <div className="bg-white rounded-lg shadow p-6">
            <EvaluationFilter session={session} />
          </div>
        )}
      </main>
    </div>
  )
}

export default App
