import { X } from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

// Helper for English number words
const numToWord = (num) => {
    const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
    return words[num] || num
}

// Helper for English ordinal words
const getOrdinalEn = (day) => {
    const suffixes = { 1: '1st (the first)', 2: '2nd (the second)', 3: '3rd (the third)', 21: '21st (the twenty-first)', 22: '22nd (the twenty-second)', 23: '23rd (the twenty-third)', 31: '31st (the thirty-first)' }
    if (suffixes[day]) return suffixes[day]
    const ord = day % 10 === 4 || day % 10 === 5 || day % 10 === 6 || day % 10 === 7 || day % 10 === 8 || day % 10 === 9 || day % 10 === 0 ? 'th' : 'th'
    return `${day}${ord}`
}

export default function StudentViewModal({ lesson, onClose, formatters }) {
    const { i18n, t } = useTranslation()
    const lang = i18n.language || 'pt'
    const isPt = lang.startsWith('pt')

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

    // Default lesson number formatter
    const defaultFormatLessonNumber = (num, endNum) => {
        if (isPt) {
            return endNum ? `Lições n.º ${num} e ${endNum}` : `Lição n.º ${num}`
        }
        return endNum
            ? `Lessons no. ${num} (${numToWord(num)}) and ${endNum} (${numToWord(endNum)})`
            : `Lesson no. ${num} (${numToWord(num)})`
    }

    // Default date formatter
    const defaultFormatDate = (dateStr) => {
        if (!dateStr) return ''
        const dateObj = new Date(dateStr)
        if (isNaN(dateObj.getTime())) return dateStr

        if (isPt) {
            const d = String(dateObj.getDate()).padStart(2, '0')
            const m = String(dateObj.getMonth() + 1).padStart(2, '0')
            return `${d}/${m}/${dateObj.getFullYear()}`
        }

        const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' })
        const month = dateObj.toLocaleDateString('en-US', { month: 'long' })
        const dayOrdinal = getOrdinalEn(dateObj.getDate())
        return `${weekday}, ${dayOrdinal} ${month} ${dateObj.getFullYear()}`
    }

    const formatLessonNumber = formatters?.formatLessonNumber || defaultFormatLessonNumber
    const formatDate = formatters?.formatDate || defaultFormatDate
    const translate = formatters?.t || t

    return (
        <div className="student-view-container">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 p-3 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-xl transition-colors z-10"
                aria-label={translate('close') || 'Close'}
            >
                <X size={32} />
            </button>

            {/* Top & Main Content Area (Left and Top aligned) */}
            <div className="flex-1 flex flex-col justify-between w-full max-w-6xl mx-auto pt-4 pb-8 space-y-8">
                {/* Lesson Header & Date */}
                <div className="space-y-4 text-left">
                    <h1 className="student-view-heading">
                        {formatLessonNumber(lesson.lesson_number, lesson.lesson_number_end)}
                    </h1>
                    <div className="student-view-date">
                        {formatDate(lesson.date)}
                    </div>
                </div>

                {/* Lesson Summary */}
                {lesson.summary && (
                    <div className="flex-1 space-y-3 text-left">
                        <h2 className="student-view-section-title">
                            {isPt ? 'Sumário:' : 'Summary:'}
                        </h2>
                        <div
                            className="student-view-summary"
                            dangerouslySetInnerHTML={{ __html: lesson.summary }}
                        />
                    </div>
                )}

                {/* Attention Box (Centered at Bottom) */}
                {lesson.attention_box && (
                    <div className="student-view-attention">
                        <h2 className="text-xl sm:text-2xl font-bold text-amber-900 dark:text-amber-200 mb-2">
                            {isPt ? 'Atenção:' : 'Attention:'}
                        </h2>
                        <div
                            className="text-lg sm:text-xl text-amber-800 dark:text-amber-300 prose dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: lesson.attention_box }}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}