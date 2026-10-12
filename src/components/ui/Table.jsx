
export default function Table({ headers = [], children, className = '' }) {
    return (
        <div className={`w-full overflow-x-auto border border-app-border rounded-2xl bg-app-surface shadow-sm ${className}`}>
            <table className="w-full text-left text-sm">
                <thead className="bg-app-hover/60 border-b border-app-border text-xs uppercase text-content-muted font-semibold">
                    <tr>
                        {headers.map((h, i) => (
                            <th key={i} className="p-3.5">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-app-border">
                    {children}
                </tbody>
            </table>
        </div>
    )
}