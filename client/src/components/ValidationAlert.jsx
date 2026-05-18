function ValidationAlert({ messages = [], type = "error" }) {
    if (!messages.length) return null;

    const styles = {
        error: {
            wrapper: "bg-red-500/[0.06] border-red-500/20 text-red-400",
            icon: "error",
            dot: "bg-red-400",
        },
        warning: {
            wrapper: "bg-amber-500/[0.06] border-amber-500/20 text-amber-400",
            icon: "warning",
            dot: "bg-amber-400",
        },
        info: {
            wrapper: "bg-indigo-500/[0.06] border-indigo-500/20 text-indigo-400",
            icon: "info",
            dot: "bg-indigo-400",
        },
    };

    const s = styles[type] || styles.error;

    return (
        <div className={`rounded-xl px-4 py-3 border ${s.wrapper} fade-in`}>
            <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined mt-0.5 flex-shrink-0" style={{ fontSize: 15 }}>{s.icon}</span>
                <ul className="flex flex-col gap-1">
                    {messages.map((msg, i) => (
                        <li key={i} className="text-xs leading-relaxed">{msg}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default ValidationAlert;
