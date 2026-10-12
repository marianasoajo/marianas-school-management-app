
export default function Card({ children, className = '', ...props }) {
    return (
        <div
            className={`bg-app-surface border border-app-border rounded-2xl shadow-sm overflow-hidden ${className}`}
            {...props}
        >
            {children}
        </div>
    )
}