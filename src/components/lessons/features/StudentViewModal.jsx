// src/features/lessons/components/StudentViewModal.jsx
import { X } from 'lucide-react'
import { useEffect } from 'react'
import RichText from './RichText'

export default function StudentViewModal({ lesson, onClose, formatters }) {
    const { formatLessonNumber, formatDate, t } = formatters

    // ESC Key listener to close projector view quickly
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [onClose])

    if (!lesson) return null

    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col p-8 overflow-y-auto animate-fade-in" role="dialog" aria-modal="true">
            <button
                onClick={onClose}
                className="absolute top-6 right-6 p-3 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
                aria-label={t('close')}
            >
                <X size={28} />
            </button>

            <div className="max-w-4xl mx-auto w-full space-y-8 my-auto">
                <header className="border-b border-gray-100 pb-6">
                    <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-2">
                        {formatLessonNumber(lesson.lesson_number)}
                    </h1>
                    <p className="text-2xl text-gray-500 font-medium">
                        {formatDate(lesson.date)}
                    </p>
                </header>

                {lesson.summary && (
                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold text-gray-400 uppercase tracking-wider">{t('summary')}</h2>
                        <RichText html={lesson.summary} className="text-2xl text-gray-800 leading-relaxed" />
                    </section>
                )}

                {lesson.attention_box && (
                    <section className="p-6 bg-amber-50 border-l-4 border-amber-400 rounded-r-xl">
                        <h2 className="text-lg font-bold text-amber-900 mb-2">{t('attention')}</h2>
                        <RichText html={lesson.attention_box} className="text-xl text-amber-800" />
                    </section>
                )}
            </div>
        </div>
    )
}