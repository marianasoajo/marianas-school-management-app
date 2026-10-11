
const VARIANTS = {
    primary: 'bg-brand-primary text-white hover:bg-brand-primary-hover active:scale-[0.98]',
    secondary: 'bg-app-hover text-content-main hover:bg-app-border border border-app-border',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]',
    ghost: 'bg-transparent text-content-muted hover:text-content-main hover:bg-app-hover'
}

export default function Button({
    children,
    variant = 'primary',
    className = '',
    isLoading = false,
    disabled = false,
    fullWidth = false,
    type = 'button',
    ...props
}) {
    return (
        <button
            type={type}
            disabled={disabled || isLoading}
            className={`
        inline-flex items-center justify-center font-medium rounded-lg text-sm
        px-4 py-2.5 min-h-touch transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${fullWidth ? 'w-full' : ''}
        ${VARIANTS[variant] || VARIANTS.primary}
        ${className}
      `}
            {...props}
        >
            {isLoading ? (
                <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Loading...</span>
                </span>
            ) : children}
        </button>
    )
}