import { AlertCircle, X } from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import IconButton from '../../../components/ui/IconButton'

export default function StudentViewModal({ lesson, onClose }) {
    const { t } = useTranslation()

    useEffect(() => {
        const handleKeyDown = (e) => e.key === 'Escape' && onClose()
        document.body.style.overflow = 'hidden'
        window.addEventListener('keydown', handleKeyDown)
        return () => {
            document.body.style.overflow = 'unset'
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [onClose])

    if (!lesson) return null

    return (
        <div className="fixed inset-0 z-50 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col justify-between p-6 sm:p-12 overflow-y-auto">
            {/* Top Header Bar */}
            <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {lesson.date}
                </div>
                <IconButton
                    variant="ghost"
                    size="lg"
                    onClick={onClose}
                    aria-label={t('close')}
                    className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
                >
                    <X className="w-8 h-8" />
                </IconButton>
            </div>

            {/* Main Classroom Projection Display */}
            <div className="max-w-4xl mx-auto w-full my-auto text-center space-y-8 py-8">
                {/* Lesson Number Heading */}
                <div className="space-y-2">
                    <div className="text-sm font-semibold tracking-widest uppercase text-brand-primary">
                        {lesson.subject}
                    </div>
                    <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight">
                        {t('lesson_single')} {lesson.lesson_number}
                    </h1>
                </div>

                {/* Lesson Summary */}
                <div className="text-xl sm:text-3xl leading-relaxed text-gray-800 dark:text-gray-200 prose dark:prose-invert max-w-none mx-auto">
                    <div dangerouslySetInnerHTML={{ __html: lesson.summary }} />
                </div>

                {/* Attention Box (Highlighted if available) */}
                {lesson.attention_box && (
                    <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700 rounded-2xl flex items-center justify-center gap-4 text-left max-w-2xl mx-auto shadow-sm">
                        <AlertCircle className="w-8 h-8 text-amber-600 shrink-0" />
                        <div
                            className="text-lg sm:text-xl font-medium text-amber-900 dark:text-amber-100 prose dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: lesson.attention_box }}
                        />
                    </div>
                )}
            </div>

            {/* Footer Minimal Indicator */}
            <div className="text-center text-xs text-gray-400 dark:text-gray-600">
                Press ESC or click X to exit presentation mode
            </div>
        </div>
    )
}