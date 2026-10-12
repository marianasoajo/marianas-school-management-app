import { useEffect, useState } from 'react'
import { authService } from '../../../services/authService'

export function useAuth() {
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        authService.getSession()
            .then((session) => setSession(session))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))

        const { data: { subscription } } = authService.onAuthStateChange((_event, session) => {
            setSession(session)
        })

        return () => subscription.unsubscribe()
    }, [])

    const login = async (email, password) => {
        setError(null)
        try {
            const data = await authService.login({ email, password })
            return data
        } catch (err) {
            setError(err.message)
            throw err
        }
    }

    const logout = async () => {
        try {
            await authService.logout()
        } catch (err) {
            setError(err.message)
        }
    }

    return { session, loading, error, login, logout }
}