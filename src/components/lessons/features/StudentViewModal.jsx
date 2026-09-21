import { X } from 'lucide-react'
import { useEffect } from 'react'
import RichText from './RichText'

export default function StudentViewModal({ lesson, onClose, formatters }) {
    const { formatLessonNumber, formatDate, t } = formatters

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [onClose])

    if (!lesson) return null

    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors z-10"
                aria-label={t('close')}
            >
                <X size={24} />
            </button>

            <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 space-y-8">
                <div className="w-full max-w-3xl">
                    <h1 className="text-5xl font-bold text-gray-900 text-left">
                        {formatLessonNumber(lesson.lesson_number)}
                    </h1>
                </div>

                <div className="w-full max-w-3xl">
                    <span className="text-2xl text-gray-600 text-left">
                        {formatDate(lesson.date)}
                    </span>
                </div>

                {lesson.summary && (
                    <div className="w-full max-w-3xl">
                        <h2 className="text-2xl font-bold text-gray-900 mb-3 text-left">{t('summary')}</h2>
                        <RichText html={lesson.summary} className="text-xl text-gray-800 leading-relaxed whitespace-pre-wrap text-left" />
                    </div>
                )}

                {lesson.attention_box && (
                    <div className="w-full max-w-3xl p-6 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                        <h2 className="text-xl font-bold text-yellow-900 mb-2 text-left">{t('attention')}</h2>
                        <RichText html={lesson.attention_box} className="text-lg text-yellow-800 whitespace-pre-wrap text-left" />
                    </div>
                )}
            </div>
        </div>
    )
}