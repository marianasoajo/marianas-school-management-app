import { Star } from 'lucide-react'

export function StarRating({
    value,
    onChange,
    disabled = false,
    activeColorClass = 'text-amber-400'
}) {
    return (
        <div className="flex justify-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange?.(star)}
                    className={`p-1 transition-transform hover:scale-110 ${disabled ? 'opacity-40 cursor-not-allowed hover:scale-100' : ''
                        }`}
                >
                    <Star
                        size={22}
                        className={star <= value ? activeColorClass : 'text-gray-300 dark:text-gray-600'}
                        fill={star <= value ? 'currentColor' : 'none'}
                    />
                </button>
            ))}
        </div>
    )
}

export default StarRating