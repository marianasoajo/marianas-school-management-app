import { Moon, Sun } from 'lucide-react'
import IconButton from './IconButton'

export default function ThemeToggleHelper({ theme, onToggle }) {
    return (
        <IconButton
            variant="ghost"
            onClick={onToggle}
            aria-label="Toggle theme"
            title="Alternar Tema"
        >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </IconButton>
    )
}