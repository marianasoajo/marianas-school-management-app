import { X } from 'lucide-react'
import { useEffect } from 'react'
import IconButton from './IconButton'

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
    useEffect(() => {
        const handleKeyDown = (e) => e.key === 'Escape' && onClose()
        if (isOpen) document.body.style.overflow = 'hidden'
        window.addEventListener('keydown', handleKeyDown)
        return () => {
            document.body.style.overflow = 'unset'
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm transition-opacity">
            <div className={`w-full ${maxWidth} bg-app-surface text-content-main rounded-t-2xl sm:rounded-xl border border-app-border shadow-xl max-h-[90vh] flex flex-col transform transition-all duration-200`}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-app-border">
                    <h3 className="text-lg font-semibold text-content-main">{title}</h3>
                    <IconButton variant="ghost" onClick={onClose} aria-label="Close">
                        <X className="w-5 h-5" />
                    </IconButton>
                </div>

                {/* Content Body */}
                <div className="p-5 overflow-y-auto flex-1">
                    {children}
                </div>
            </div>
        </div>
    )
}