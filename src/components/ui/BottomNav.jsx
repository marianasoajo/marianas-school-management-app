
export default function BottomNav({ items = [], activeTab, onSelectTab }) {
    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-app-surface border-t border-app-border px-2 py-1 flex items-center justify-around shadow-lg">
            {items.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                return (
                    <button
                        key={item.id}
                        onClick={() => onSelectTab(item.id)}
                        className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg min-h-touch text-xs font-medium transition-colors ${isActive ? 'text-brand-primary' : 'text-content-muted'
                            }`}
                    >
                        <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                        <span className="mt-1 text-[10px]">{item.label}</span>
                    </button>
                )
            })}
        </nav>
    )
}