import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import StatsCard from "../components/StatsCard";
import { getUser, displayNameFromEmail } from "../utils/user";
import { useAppStore } from "../store/useAppStore";

const now = new Date();
const quarter = `Q${Math.ceil((now.getMonth() + 1) / 3)} ${now.getFullYear()}`;

/* ── Helpers ─────────────────────────────────────────────────────────── */
function relativeTime(iso) {
    if (!iso) return "—";
    const diff = Date.now() - new Date(iso).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins < 1)   return "Just now";
    if (mins < 60)  return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    return `${days}d ago`;
}

const ACTIVITY_CONFIG = {
    goal_added: { icon: "add_circle",  iconBg: "bg-purple-500/15",  iconColor: "text-purple-400" },
    submitted:  { icon: "send",        iconBg: "bg-indigo-500/15",  iconColor: "text-indigo-400" },
    approved:   { icon: "check_circle",iconBg: "bg-emerald-500/15", iconColor: "text-emerald-400" },
    rejected:   { icon: "cancel",      iconBg: "bg-red-500/15",     iconColor: "text-red-400" },
    revision:   { icon: "edit_note",   iconBg: "bg-amber-500/15",   iconColor: "text-amber-400" },
};

/* ── Progress Bar ────────────────────────────────────────────────────── */
function ProgressBar({ value, max = 100, color = "luminous-gradient" }) {
    const pct = max === 0 ? 0 : Math.min(100, (value / max) * 100);
    return (
        <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div
                className={`h-full rounded-full ${color} progress-glow`}
                style={{ width: `${pct}%`, transition: "width 0.6s ease" }}
            />
        </div>
    );
}

/* ── Component ───────────────────────────────────────────────────────── */
function AdminDashboard() {
    const navigate    = useNavigate();
    const user        = getUser();
    const displayName = user?.name || displayNameFromEmail(user?.email);

    /* ── Live data from Zustand ── */
    const employeesMap  = useAppStore((s) => s.employees);
    const activityLog   = useAppStore((s) => s.activityLog);

    const allUsers      = Object.entries(employeesMap).map(([email, emp]) => ({ email, ...emp }));
    const employees     = allUsers.filter((u) => !u.role || u.role === "Employee");
    const managers      = allUsers.filter((u) => u.role === "Manager");

    const totalEmployees  = employees.length;
    const totalManagers   = managers.length;
    const totalSubmitted  = employees.filter((e) => e.isSubmitted).length;
    const totalApproved   = employees.filter(
        (e) => e.isSubmitted && e.goals.length > 0 && e.goals.every((g) => g.status === "Approved")
    ).length;
    const totalGoals      = employees.reduce((sum, e) => sum + e.goals.length, 0);
    const submissionRate  = totalEmployees === 0 ? 0 : Math.round((totalSubmitted / totalEmployees) * 100);
    const approvalRate    = totalSubmitted  === 0 ? 0 : Math.round((totalApproved  / totalSubmitted) * 100);

    /* Last 8 activity entries */
    const recentActivity = activityLog.slice(0, 8);

    return (
        <DashboardLayout title="Admin Dashboard">
            <div className="max-w-5xl mx-auto">

                {/* ── Header ──────────────────────────────────────── */}
                <div className="mb-8 fade-up">
                    <p className="text-xs text-white/30 uppercase tracking-widest font-medium mb-1">
                        {quarter} · Organization Controls
                    </p>
                    <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
                    <p className="text-sm text-white/35 mt-1">
                        Organization-wide overview of all active goal cycles.
                    </p>
                </div>

                {/* ── Stats Row ───────────────────────────────────── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatsCard label="Total Employees" value={String(totalEmployees)} sub="Registered users"       icon="group"             accent />
                    <StatsCard label="Goals Submitted" value={String(totalSubmitted)} sub={`${submissionRate}% rate`} icon="send"           />
                    <StatsCard label="Approved"        value={String(totalApproved)}  sub={`${approvalRate}% of submitted`} icon="check_circle" />
                    <StatsCard label="Managers"        value={String(totalManagers)}  sub="Active reviewers"       icon="supervisor_account" />
                </div>

                {/* ── Submission Status + Recent Activity ─────────── */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">

                    {/* Submission Status */}
                    <div className="glass-card rounded-2xl p-6 fade-up">
                        <h3 className="text-sm font-semibold text-white mb-4">Submission Status</h3>

                        {totalEmployees === 0 ? (
                            <div className="flex flex-col items-center py-6 text-center">
                                <span className="material-symbols-outlined text-white/15 mb-2" style={{ fontSize: 28 }}>group</span>
                                <p className="text-xs text-white/30">No employees registered yet.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {[
                                    {
                                        label: "Submitted",
                                        value: totalSubmitted,
                                        total: totalEmployees,
                                        color: "bg-indigo-500",
                                    },
                                    {
                                        label: "Approved",
                                        value: totalApproved,
                                        total: totalEmployees,
                                        color: "bg-emerald-500",
                                    },
                                    {
                                        label: "Not Started",
                                        value: employees.filter((e) => !e.isSubmitted && e.goals.length === 0).length,
                                        total: totalEmployees,
                                        color: "bg-zinc-600",
                                    },
                                ].map((item) => (
                                    <div key={item.label}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-xs text-white/50">{item.label}</span>
                                            <span className="text-xs text-white/60 font-mono">
                                                {item.value}/{item.total}
                                            </span>
                                        </div>
                                        <ProgressBar value={item.value} max={item.total} color={item.color} />
                                    </div>
                                ))}

                                {/* Total goals stat */}
                                <div className="mt-2 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                                    <span className="text-xs text-white/35">Total goals created</span>
                                    <span className="text-xs font-semibold text-white/60">{totalGoals}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Recent Activity */}
                    <div className="glass-card rounded-2xl p-6 fade-up">
                        <h3 className="text-sm font-semibold text-white mb-4">Recent Activity</h3>

                        {recentActivity.length === 0 ? (
                            <div className="flex flex-col items-center py-6 text-center">
                                <span className="material-symbols-outlined text-white/15 mb-2" style={{ fontSize: 28 }}>history</span>
                                <p className="text-xs text-white/30">No activity yet.</p>
                                <p className="text-[10px] text-white/20 mt-1">Actions will appear as employees submit goals.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {recentActivity.map((entry) => {
                                    const cfg = ACTIVITY_CONFIG[entry.type] || ACTIVITY_CONFIG.submitted;
                                    return (
                                        <div key={entry.id} className="flex items-center gap-3">
                                            <div className={`w-7 h-7 rounded-lg ${cfg.iconBg} flex items-center justify-center flex-shrink-0`}>
                                                <span className={`material-symbols-outlined ${cfg.iconColor}`} style={{ fontSize: 13 }}>
                                                    {cfg.icon}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-white/70 truncate">
                                                    <span className="font-medium text-white">{entry.user}</span>
                                                    {" — "}
                                                    {entry.detail}
                                                </p>
                                                <p className="text-[10px] text-white/25 mt-0.5">{relativeTime(entry.time)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Employee Roster ──────────────────────────────── */}
                {employees.length > 0 && (
                    <div className="glass-card rounded-2xl p-6 mb-6 fade-up">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-white">Employee Roster</h3>
                            <span className="text-[10px] uppercase tracking-widest text-white/25">{quarter} Cycle</span>
                        </div>
                        <div className="flex flex-col gap-4">
                            {employees.map((emp) => {
                                const submitted = emp.isSubmitted;
                                const approved  = submitted && emp.goals.length > 0 && emp.goals.every((g) => g.status === "Approved");
                                const rejected  = emp.goals.some((g) => g.status === "Rejected");
                                const revision  = emp.goals.some((g) => g.status === "Needs Revision");
                                const pct = submitted ? (approved ? 100 : 60) : (emp.goals.length > 0 ? 30 : 0);
                                const color = approved ? "bg-emerald-500" : rejected ? "bg-red-500" : submitted ? "bg-indigo-500" : "bg-zinc-600";

                                return (
                                    <div key={emp.email}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-semibold text-white">{emp.name}</p>
                                                <span className="text-[10px] text-white/30">{emp.goals.length} goals</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-[10px] text-white/35">
                                                <span>
                                                    <strong className={approved ? "text-emerald-400/80" : "text-white/60"}>
                                                        {emp.goals.filter((g) => g.status === "Approved").length}
                                                    </strong> approved
                                                </span>
                                                <span className={`font-mono ${approved ? "text-emerald-400" : "text-white/50"}`}>
                                                    {approved ? "✓ Done" : submitted ? "Pending" : revision ? "Revision" : "Draft"}
                                                </span>
                                            </div>
                                        </div>
                                        <ProgressBar value={pct} color={color} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── Admin Controls — Coming Soon ─────────────────── */}
                <div>
                    <h3 className="text-sm font-semibold text-white mb-4">Admin Controls</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        {[
                            { icon: "settings",         title: "Org Settings",       desc: "Configure performance cycles, review periods, and org-wide policies." },
                            { icon: "manage_accounts",  title: "User Management",     desc: "Add, remove, and reassign roles across the organization." },
                            { icon: "analytics",        title: "Advanced Analytics",  desc: "Export reports, track trends, and drill down into team performance." },
                        ].map((ctrl) => (
                            <div key={ctrl.title} className="glass-card rounded-2xl p-5 flex flex-col gap-3">
                                <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-violet-400" style={{ fontSize: 16 }}>{ctrl.icon}</span>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white mb-0.5">{ctrl.title}</p>
                                    <p className="text-xs text-white/35 leading-relaxed">{ctrl.desc}</p>
                                </div>
                                <div className="mt-auto inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-white/25 border border-white/[0.07] rounded-full px-3 py-1 w-fit">
                                    <span className="w-1 h-1 rounded-full bg-amber-400 animate-pulse" />
                                    Coming Soon
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}

export default AdminDashboard;
