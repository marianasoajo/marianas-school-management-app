import { BookOpen, Calendar, ClipboardList, Globe, LogOut, Moon, Sun, UserCheck, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import LoginForm from './features/auth/components/LoginForm'
import EvaluationList from './features/evaluation/components/EvaluationList'
import GroupsManager from './features/groups/components/GroupsManager'
import LessonPresentationView from './features/lessons/components/LessonPresentationView'
import PlanningTable from './features/planning/components/PlanningTable'
import StudentsManager from './features/students/components/StudentsManager'
import { useTheme } from './hooks/useTheme'
import { supabase } from './lib/supabase'

export default function App() {
  const { t, i18n } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('summaries')
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'pt' : 'en')
  }

  const handleLogout = () => supabase.auth.signOut()

  if (loading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center text-content-muted">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">{t('loading')}</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <LoginForm />
  }

  const NAV_ITEMS = [
    { id: 'summaries', label: t('summaries'), icon: BookOpen },
    { id: 'general', label: t('general_planning'), icon: Calendar },
    { id: 'groups', label: t('groups'), icon: Users },
    { id: 'students', label: t('students'), icon: UserCheck },
    { id: 'evaluations', label: t('daily_selfassessment'), icon: ClipboardList },
  ]

  return (
    <div className="min-h-screen bg-app-bg text-content-main pb-20 md:pb-8 transition-colors duration-200">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-app-surface border-b border-app-border backdrop-blur-md bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-lg text-brand-primary">EduPlanner</h1>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? 'bg-brand-primary-light text-brand-primary font-semibold'
                    : 'text-content-muted hover:text-content-main hover:bg-app-hover'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Action Tools */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={toggleLanguage}
              className="p-2 min-h-touch min-w-touch flex items-center gap-1 rounded-lg text-content-muted hover:text-content-main hover:bg-app-hover text-xs font-semibold uppercase"
              aria-label="Toggle language"
            >
              <Globe className="w-4 h-4" />
              <span>{i18n.language}</span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 min-h-touch min-w-touch flex items-center justify-center rounded-lg text-content-muted hover:text-content-main hover:bg-app-hover"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={handleLogout}
              className="p-2 min-h-touch min-w-touch flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
              aria-label={t('logout')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main View Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="bg-app-surface rounded-2xl shadow-sm border border-app-border p-4 sm:p-6">
          {activeTab === 'summaries' && <LessonPresentationView />}
          {activeTab === 'general' && <PlanningTable />}
          {activeTab === 'groups' && <GroupsManager />}
          {activeTab === 'students' && <StudentsManager />}
          {activeTab === 'evaluations' && <EvaluationList />}
        </div>
      </main>

      {/* Mobile Sticky Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-app-surface border-t border-app-border px-2 py-1 flex items-center justify-around shadow-lg">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg min-h-touch text-xs font-medium transition-colors ${isActive ? 'text-brand-primary' : 'text-content-muted'
                }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="mt-1 text-[10px]">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}