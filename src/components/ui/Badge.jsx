const VARIANTS = {
    neutral: 'bg-app-hover text-content-muted border border-app-border',
    primary: 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    danger: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
}

export default function Badge({ children, variant = 'primary', className = '' }) {
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${VARIANTS[variant] || VARIANTS.primary
                } ${className}`}
        >
            {children}
        </span>
    )
}