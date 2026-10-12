import { GraduationCap } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import Input from '../../../components/ui/Input'
import { useAuth } from '../hooks/useAuth'

export default function LoginForm() {
    const { t } = useTranslation()
    const { login } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            await login(email, password)
        } catch (err) {
            setError(t('login_failed') || 'Invalid email or password. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-6 sm:p-8 space-y-6">
                <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center mx-auto">
                        <GraduationCap className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-content-main">EduPlanner</h2>
                    <p className="text-xs text-content-muted">{t('login_subtitle')}</p>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-xl text-xs text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        type="email"
                        label={t('email')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('email_placeholder')}
                        required
                    />

                    <Input
                        type="password"
                        label={t('password')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t('password_placeholder')}
                        required
                    />

                    <Button type="submit" isLoading={loading} fullWidth className="mt-2">
                        {t('login')}
                    </Button>
                </form>

                <p className="text-center text-[11px] text-content-muted pt-2 border-t border-app-border">
                    {t('login_footer')}
                </p>
            </Card>
        </div>
    )
}