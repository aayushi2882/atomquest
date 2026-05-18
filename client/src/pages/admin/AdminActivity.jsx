import { useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { useAppStore } from "../../store/useAppStore";

const ACTIVITY_CFG = {
    goal_added:    { icon: "add_circle",   bg: "bg-purple-500/15",  color: "text-purple-400",  label: "Goal",      filter: "Goals" },
    submitted:     { icon: "send",          bg: "bg-indigo-500/15",  color: "text-indigo-400",  label: "Submit",    filter: "Submissions" },
    approved:      { icon: "check_circle",  bg: "bg-emerald-500/15", color: "text-emerald-400", label: "Approved",  filter: "Approvals" },
    rejected:      { icon: "cancel",        bg: "bg-red-500/15",     color: "text-red-400",     label: "Rejected",  filter: "Approvals" },
    revision:      { icon: "edit_note",     bg: "bg-amber-500/15",   color: "text-amber-400",   label: "Revision",  filter: "Approvals" },
    cycle_start:   { icon: "play_circle",   bg: "bg-indigo-500/15",  color: "text-indigo-400",  label: "Cycle",     filter: "System" },
    cycle_lock:    { icon: "lock",          bg: "bg-amber-500/15",   color: "text-amber-400",   label: "Cycle",     filter: "System" },
    cycle_open:    { icon: "lock_open",     bg: "bg-emerald-500/15", color: "text-emerald-400", label: "Cycle",     filter: "System" },
    cycle_archive: { icon: "archive",       bg: "bg-zinc-500/15",    color: "text-zinc-400",    label: "Cycle",     filter: "System" },
    emp_added:     { icon: "person_add",    bg: "bg-indigo-500/15",  color: "text-indigo-400",  label: "People",    filter: "System" },
    emp_disabled:  { icon: "person_off",    bg: "bg-red-500/15",     color: "text-red-400",     label: "People",    filter: "System" },
};

const FILTERS = ["All", "Submissions", "Approvals", "Goals", "System"];

function relativeTime(iso) {
    if (!iso) return "—";
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000), h = Math.floor(diff / 3600000), d = Math.floor(diff / 86400000);
    if (m < 1)  return "Just now";
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    if (d === 1) return "Yesterday";
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function initialsFromName(name = "") {
    const w = name.trim().split(" ").filter(Boolean);
    if (w.length >= 2) return (w[0][0] + w[1][0]).toUpperCase();
    if (w[0]?.length >= 2) return w[0].slice(0, 2).toUpperCase();
    return "U";
}

const ACCENT_POOL = ["bg-indigo-500/20 border-indigo-400/25 text-indigo-300", "bg-purple-500/20 border-purple-400/25 text-purple-300", "bg-violet-500/20 border-violet-400/25 text-violet-300", "bg-blue-500/20 border-blue-400/25 text-blue-300", "bg-cyan-500/20 border-cyan-400/25 text-cyan-300"];

function AdminActivity() {
    const activityLog = useAppStore((s) => s.activityLog);
    const [filter, setFilter] = useState("All");

    const filtered = filter === "All"
        ? activityLog
        : activityLog.filter((e) => (ACTIVITY_CFG[e.type]?.filter || "System") === filter);

    const now = new Date();
    const quarter = `Q${Math.ceil((now.getMonth() + 1) / 3)} ${now.getFullYear()}`;

    return (
        <AdminLayout title="Activity Feed">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-6 fade-up">
                    <p className="text-xs text-white/30 uppercase tracking-widest font-medium mb-1">{quarter} · Audit Trail</p>
                    <h2 className="text-2xl font-bold text-white">System Activity</h2>
                    <p className="text-sm text-white/35 mt-1">Live feed of all goal, approval, and system events.</p>
                </div>

                {/* Filter pills */}
                <div className="flex gap-2 mb-6 flex-wrap fade-up">
                    {FILTERS.map((f) => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${filter === f ? "bg-indigo-500/20 border border-indigo-500/30 text-indigo-400" : "btn-ghost"}`}>
                            {f}
                            <span className="ml-1.5 text-[10px] text-white/30">
                                {f === "All" ? activityLog.length : activityLog.filter((e) => (ACTIVITY_CFG[e.type]?.filter || "System") === f).length}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Timeline */}
                {filtered.length === 0 ? (
                    <div className="glass-card rounded-2xl p-12 flex flex-col items-center text-center fade-up">
                        <span className="material-symbols-outlined text-white/15 mb-3" style={{ fontSize: 36 }}>history</span>
                        <p className="text-sm font-medium text-white/40">No activity yet</p>
                        <p className="text-xs text-white/20 mt-1">Actions will appear here as employees and managers interact with the system.</p>
                    </div>
                ) : (
                    <div className="relative fade-up">
                        {/* Vertical timeline line */}
                        <div className="absolute left-[19px] top-4 bottom-4 w-px bg-white/[0.06]" />

                        <div className="flex flex-col gap-0">
                            {filtered.map((entry, idx) => {
                                const cfg = ACTIVITY_CFG[entry.type] || ACTIVITY_CFG.submitted;
                                const isLast = idx === filtered.length - 1;
                                return (
                                    <div key={entry.id} className={`flex gap-4 ${!isLast ? "pb-4" : ""}`}>
                                        {/* Dot */}
                                        <div className="flex flex-col items-center flex-shrink-0">
                                            <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center z-10 relative flex-shrink-0`}
                                                style={{ border: "0.5px solid rgba(255,255,255,0.08)" }}>
                                                <span className={`material-symbols-outlined ${cfg.color}`} style={{ fontSize: 15 }}>{cfg.icon}</span>
                                            </div>
                                        </div>

                                        {/* Card */}
                                        <div className="flex-1 glass-card rounded-xl px-4 py-3 mb-0 hover:bg-white/[0.03] transition-colors">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className={`text-[9px] font-medium uppercase tracking-widest px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>
                                                            {cfg.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-white/75">
                                                        <span className="font-semibold text-white">{entry.user}</span>
                                                        {" — "}
                                                        {entry.detail}
                                                    </p>
                                                </div>
                                                <span className="text-[10px] text-white/25 flex-shrink-0 mt-0.5">{relativeTime(entry.time)}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

export default AdminActivity;
