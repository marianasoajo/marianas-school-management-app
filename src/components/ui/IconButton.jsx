
const VARIANTS = {
    ghost: 'text-content-muted hover:text-content-main hover:bg-app-hover',
    primary: 'bg-brand-primary text-white hover:bg-brand-primary-hover',
    secondary: 'bg-app-hover text-content-main hover:bg-app-border border border-app-border',
    danger: 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30',
    emerald: 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
}

const SIZES = {
    sm: 'p-1.5 min-w-[36px] min-h-[36px]',
    md: 'p-2 min-w-touch min-h-touch',
    lg: 'p-3 min-w-[48px] min-h-[48px]'
}

export default function IconButton({
    children,
    variant = 'ghost',
    size = 'md',
    className = '',
    disabled = false,
    type = 'button',
    ...props
}) {
    return (
        <button
            type={type}
            disabled={disabled}
            className={`
        inline-flex items-center justify-center rounded-lg transition-all duration-150
        focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-1
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANTS[variant] || VARIANTS.ghost}
        ${SIZES[size] || SIZES.md}
        ${className}
      `}
            {...props}
        >
            {children}
        </button>
    )
}