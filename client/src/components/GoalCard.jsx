const STATUS_CONFIG = {
    Draft: {
        badge: "badge-draft",
        dot: "bg-zinc-400",
        label: "Draft",
        pulse: false,
    },
    "Pending Submission": {
        badge: "badge-pending",
        dot: "bg-amber-400",
        label: "Pending Submission",
        pulse: false,
    },
    "Pending Approval": {
        badge: "badge-pending",
        dot: "bg-amber-400",
        label: "Pending Approval",
        pulse: true,
    },
    Approved: {
        badge: "badge-approved",
        dot: "bg-emerald-400",
        label: "Approved",
        pulse: false,
    },
    Rejected: {
        badge: "badge-draft",
        dot: "bg-red-400",
        label: "Rejected",
        pulse: false,
    },
    "Needs Revision": {
        badge: "badge-pending",
        dot: "bg-amber-400",
        label: "Needs Revision",
        pulse: true,
    },
};

function GoalCard({ goal, onEdit, onDelete, isSubmitted }) {
    const statusCfg = STATUS_CONFIG[goal.status] || STATUS_CONFIG["Draft"];

    const weightagePercent = Math.min(100, parseInt(goal.weightage) || 0);

    return (
        <div className="glass-card goal-card rounded-2xl p-5 flex flex-col gap-4 fade-up">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white leading-snug truncate">{goal.title}</h3>
                    <p className="text-xs text-white/35 mt-1 line-clamp-2 leading-relaxed">{goal.description}</p>
                </div>
                <span className={`badge ${statusCfg.badge} flex-shrink-0 mt-0.5`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} ${statusCfg.pulse ? "pulse-dot" : ""}`} />
                    {statusCfg.label}
                </span>
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-3 py-2">
                    <p className="text-[10px] text-white/25 uppercase tracking-widest mb-1">Thrust Area</p>
                    <p className="text-xs text-white/70 font-medium truncate">{goal.thrustArea}</p>
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-3 py-2">
                    <p className="text-[10px] text-white/25 uppercase tracking-widest mb-1">Unit</p>
                    <p className="text-xs text-white/70 font-medium">{goal.unit}</p>
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-3 py-2">
                    <p className="text-[10px] text-white/25 uppercase tracking-widest mb-1">Target</p>
                    <p className="text-xs text-white/70 font-medium">{goal.target}</p>
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-3 py-2">
                    <p className="text-[10px] text-white/25 uppercase tracking-widest mb-1">Weightage</p>
                    <p className="text-xs text-white/70 font-medium">{goal.weightage}%</p>
                </div>
            </div>

            {/* Weightage progress */}
            <div>
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-white/25 uppercase tracking-widest">Allocation</span>
                    <span className="text-[10px] text-white/40">{weightagePercent}%</span>
                </div>
                <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                        className="h-full luminous-gradient rounded-full progress-glow transition-all duration-500"
                        style={{ width: `${weightagePercent}%` }}
                    />
                </div>
            </div>

            {/* Actions */}
            {!isSubmitted && (
                <div className="flex gap-2 pt-1 border-t border-white/[0.06]">
                    <button
                        onClick={() => onEdit(goal)}
                        className="btn-ghost flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>edit</span>
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(goal.id)}
                        className="btn-danger flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>delete</span>
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
}

export default GoalCard;
