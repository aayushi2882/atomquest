function fmtDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const STATUS_CONFIG = {
    Active:   { pill: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400", dot: "bg-emerald-400", label: "Active"    },
    Locked:   { pill: "bg-amber-500/10  border-amber-500/20  text-amber-400",    dot: "bg-amber-400",   label: "Locked"    },
    Archived: { pill: "bg-zinc-500/15   border-zinc-500/20   text-zinc-400",     dot: "bg-zinc-500",    label: "Archived"  },
    Upcoming: { pill: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",   dot: "bg-indigo-400",  label: "Upcoming"  },
};

/**
 * CycleCard
 * @param {{ cycle, onStart, onLock, onOpen, onArchive }} props
 */
function CycleCard({ cycle, onStart, onLock, onOpen, onArchive, isCurrent }) {
    const cfg = STATUS_CONFIG[cycle.status] || STATUS_CONFIG.Upcoming;

    return (
        <div className={`glass-card rounded-2xl p-5 flex flex-col gap-4 goal-card ${isCurrent ? "border-indigo-500/25" : ""}`}
            style={isCurrent ? { boxShadow: "0 0 28px rgba(99,102,241,0.1)" } : {}}>

            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-base font-bold text-white">{cycle.label}</p>
                    {isCurrent && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-indigo-400/80 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 pulse-dot" /> Current cycle
                        </span>
                    )}
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium ${cfg.pill}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${cycle.status === "Active" ? "pulse-dot" : ""}`} />
                    {cfg.label}
                </span>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-3 gap-2 text-[10px]">
                {[
                    { label: "Started",  value: fmtDate(cycle.startedAt) },
                    { label: "Locked",   value: fmtDate(cycle.lockedAt) },
                    { label: "Archived", value: fmtDate(cycle.archivedAt) },
                ].map(({ label, value }) => (
                    <div key={label} className="rounded-lg bg-white/[0.03] border border-white/[0.06] px-2.5 py-2">
                        <p className="text-white/25 uppercase tracking-widest mb-1">{label}</p>
                        <p className="text-white/55 font-medium">{value}</p>
                    </div>
                ))}
            </div>

            {/* Actions */}
            {cycle.status !== "Archived" && (
                <div className="flex gap-2 pt-1 border-t border-white/[0.06]">
                    {cycle.status === "Upcoming" && (
                        <button onClick={() => onStart(cycle.id)}
                            className="btn-primary flex-1 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5">
                            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>play_circle</span>
                            Start Cycle
                        </button>
                    )}
                    {cycle.status === "Active" && (
                        <>
                            <button onClick={() => onLock(cycle.id)}
                                className="flex-1 py-2 rounded-xl text-xs font-medium text-amber-400 flex items-center justify-center gap-1.5 transition-all"
                                style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.20)" }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>lock</span>
                                Lock
                            </button>
                            <button onClick={() => onArchive(cycle.id)}
                                className="btn-ghost py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5">
                                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>archive</span>
                                Archive
                            </button>
                        </>
                    )}
                    {cycle.status === "Locked" && (
                        <>
                            <button onClick={() => onOpen(cycle.id)}
                                className="flex-1 py-2 rounded-xl text-xs font-medium text-emerald-400 flex items-center justify-center gap-1.5 transition-all"
                                style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.20)" }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>lock_open</span>
                                Open
                            </button>
                            <button onClick={() => onArchive(cycle.id)}
                                className="btn-ghost py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5">
                                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>archive</span>
                                Archive
                            </button>
                        </>
                    )}
                </div>
            )}
            {cycle.status === "Archived" && (
                <div className="flex items-center gap-2 text-xs text-white/20 pt-1 border-t border-white/[0.06]">
                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>check_circle</span>
                    Cycle complete — archived
                </div>
            )}
        </div>
    );
}

export default CycleCard;
