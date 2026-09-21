import { useTranslation } from 'react-i18next'

// Number to words (simple, for 1-1000)
const numberToWords = (n) => {
  const ones = [
    'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
    'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
    'seventeen', 'eighteen', 'nineteen'
  ]
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']

  if (n === 1000) return 'one thousand'
  if (n < 20) return ones[n]

  if (n < 100) {
    const t = Math.floor(n / 10)
    const r = n % 10
    return tens[t] + (r ? '-' + ones[r] : '')
  }

  const h = Math.floor(n / 100)
  const r = n % 100
  return ones[h] + ' hundred' + (r ? ' ' + numberToWords(r) : '')
}

// Ordinal number to words (simple, for 1-99)
const ordinalNumberToWords = (n) => {
  const ones = ['zeroth', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth',]
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']
  const tensOrdinal = ['', '', 'twentieth', 'thirtieth', 'fortieth', 'fiftieth', 'sixtieth', 'seventieth', 'eightieth', 'ninetieth']

  if (n < 20) return ones[n]
  const t = Math.floor(n / 10)
  const r = n % 10
  return r === 0 ? tensOrdinal[t] : `${tens[t]}-${ones[r]}`
}

const getOrdinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}

/**
 * Formats a lesson number for display
 * @param {string|number} lessonNumber - The lesson number to format
 * @param {function} t - Translation function from useTranslation()
 * @param {string} lang - Current language code (e.g., 'pt', 'en')
 * @returns {string} Formatted lesson number
 */
export const formatLessonNumber = (lessonNumber, t, lang = 'pt') => {
  if (!lessonNumber) return ''
  const str = String(lessonNumber).trim()
  const doubleMatch = str.match(/^(\d+)\s*(?:e|&|-|,|and)\s*(\d+)$/i)

  if (doubleMatch) {
    const firstNum = parseInt(doubleMatch[1], 10)
    const secondNum = parseInt(doubleMatch[2], 10)

    if (lang === 'pt') {
      return t('lesson_double', { first: doubleMatch[1], second: doubleMatch[2] })
    }

    const firstWord = numberToWords(firstNum)
    const secondWord = numberToWords(secondNum)
    return t('lesson_double', {
      first: `${doubleMatch[1]} (${firstWord})`,
      second: `${doubleMatch[2]} (${secondWord})`
    })
  }

  // Single lesson handling
  const match = str.match(/\d+/)
  const num = match ? parseInt(match[0], 10) : null

  if (lang === 'pt' || !num) {
    return `${t('lesson_single')} ${str}`
  }

  const word = numberToWords(num)
  return `${t('lesson_single')} ${str} (${word})`
}

/**
 * Formats a date string according to the current language
 * @param {string} dateString - ISO date string (YYYY-MM-DD)
 * @param {string} lang - Current language code (e.g., 'pt', 'en')
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, lang = 'pt') => {
  if (!dateString) return ''
  const date = new Date(dateString)

  if (lang === 'pt') {
    // Portuguese: dd/mm/yyyy
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } else {
    // English: day of week, dd[ordinal] month year
    // e.g., "Monday, 23rd of November 2026"
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' })
    const day = date.getDate()
    const month = date.toLocaleDateString('en-US', { month: 'long' })
    const year = date.getFullYear()

    return `${dayOfWeek}, ${day}${getOrdinal(day)} (${ordinalNumberToWords(day)}) of ${month} ${year}`
  }
}

/**
 * Custom hook to get formatters bound to current i18n
 */
export const useFormatters = () => {
  const { t, i18n } = useTranslation()
  const lang = i18n?.language || 'pt'

  return {
    formatLessonNumber: (lessonNumber) => formatLessonNumber(lessonNumber, t, lang),
    formatDate: (dateString) => formatDate(dateString, lang),
    t,
    lang
  }
}