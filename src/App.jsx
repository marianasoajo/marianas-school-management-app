import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Login from './components/auth/Login'
import EvaluationFilter from './components/evaluation/EvaluationFilter'
import GroupsManager from './components/groups/GroupsManager'
import LessonPresentation from './components/lessons/LessonPresentation'
import PlanningTable from './components/planning/PlanningTable'
import StudentsManager from './components/students/StudentsManager'
import Navbar from './components/ui/Navbar'
import { useTheme } from './hooks/useTheme'
import { supabase } from './lib/supabase'

function App() {
  const { t, i18n } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('summaries')
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'pt' : 'en'
    i18n.changeLanguage(newLang)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center text-gray-500 dark:text-gray-400">
        Loading...
      </div>
    )
  }

  if (!session) {
    return <Login />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={i18n.language}
        onToggleLanguage={toggleLanguage}
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
        t={t}
      />

      {/* Main Content Aligned to Match Navbar */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'general' && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <PlanningTable session={session} />
          </div>
        )}

        {activeTab === 'summaries' && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <LessonPresentation session={session} />
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <GroupsManager session={session} />
          </div>
        )}

        {activeTab === 'students' && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <StudentsManager session={session} />
          </div>
        )}

        {activeTab === 'evaluations' && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <EvaluationFilter session={session} />
          </div>
        )}
      </main>
    </div>
  )
}

export default App