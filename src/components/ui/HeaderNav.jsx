
export default function HeaderNav({ items = [], activeTab, onSelectTab }) {
    return (
        <nav className="hidden md:flex items-center space-x-1">
            {items.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                return (
                    <button
                        key={item.id}
                        onClick={() => onSelectTab(item.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                            ? 'bg-brand-primary-light text-brand-primary font-semibold'
                            : 'text-content-muted hover:text-content-main hover:bg-app-hover'
                            }`}
                    >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                    </button>
                )
            })}
        </nav>
    )
}