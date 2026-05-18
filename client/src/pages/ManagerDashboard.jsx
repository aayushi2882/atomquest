import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import StatsCard from "../components/StatsCard";
import { useToast } from "../components/Toast";
import { getUser, displayNameFromEmail, initialsFromName } from "../utils/user";
import { useAppStore } from "../store/useAppStore";

const now = new Date();
const quarter = `Q${Math.ceil((now.getMonth() + 1) / 3)} ${now.getFullYear()}`;

function fmtDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
    });
}

const ACCENT_POOL = [
    "bg-indigo-500/20 border-indigo-400/25 text-indigo-300",
    "bg-purple-500/20 border-purple-400/25 text-purple-300",
    "bg-violet-500/20 border-violet-400/25 text-violet-300",
    "bg-blue-500/20 border-blue-400/25 text-blue-300",
    "bg-cyan-500/20 border-cyan-400/25 text-cyan-300",
];

const OVERALL_STATUS_MAP = {
    "Pending Approval": { dot: "bg-amber-400 pulse-dot", badge: "badge badge-pending",  label: "Pending" },
    Approved:          { dot: "bg-emerald-400",          badge: "badge badge-approved", label: "Approved" },
    Rejected:          { dot: "bg-red-400",              badge: "badge badge-draft",    label: "Rejected" },
    "Needs Revision":  { dot: "bg-amber-400",            badge: "badge badge-pending",  label: "Revision" },
    Draft:             { dot: "bg-zinc-500",             badge: "badge badge-draft",    label: "Draft" },
};

/** Compute the overall status for an employee's submitted goals. */
function getOverallStatus(emp) {
    if (!emp.isSubmitted && emp.goals.some((g) => g.status === "Needs Revision")) return "Needs Revision";
    if (!emp.isSubmitted) return "Draft";
    const statuses = [...new Set(emp.goals.map((g) => g.status))];
    if (statuses.includes("Approved"))       return "Approved";
    if (statuses.includes("Rejected"))       return "Rejected";
    if (statuses.includes("Needs Revision")) return "Needs Revision";
    return "Pending Approval";
}

/* ── Component ──────────────────────────────────────────────────────── */
function ManagerDashboard() {
    const user        = getUser();
    const displayName = user?.name || displayNameFromEmail(user?.email);
    const firstName   = displayName.split(" ")[0];

    /* Zustand */
    const approveEmployee = useAppStore((s) => s.approveEmployee);
    const rejectEmployee  = useAppStore((s) => s.rejectEmployee);
    const requestChanges  = useAppStore((s) => s.requestChanges);
    const employeesMap    = useAppStore((s) => s.employees);

    /* Only show employees — exclude managers/admins from approval queue */
    const allEmployees     = Object.entries(employeesMap)
        .map(([email, emp]) => ({ email, ...emp }))
        .filter((e) => !e.role || e.role === "Employee");
    const pendingEmployees = allEmployees.filter((e) => e.isSubmitted);

    /* Toast */
    const { addToast, ToastPortal } = useToast();

    /* Local feedback state for optimistic UI (keeps buttons from re-showing) */
    const [actionFeedback, setActionFeedback] = useState({}); // email → "approved"|"rejected"|"revision"

    const doAction = (email, action, empName) => {
        if (action === "approve") {
            approveEmployee(email);
            addToast({ message: `${empName}'s goals approved ✓`, type: "success" });
        }
        if (action === "reject") {
            rejectEmployee(email);
            addToast({ message: `${empName}'s goals rejected`, type: "error" });
        }
        if (action === "revision") {
            requestChanges(email);
            addToast({ message: `Revision requested for ${empName}`, type: "warning" });
        }
        setActionFeedback((prev) => ({ ...prev, [email]: action }));
    };

    /* Stats */
    const teamSize      = allEmployees.length;
    const pendingCount  = pendingEmployees.length;
    const approvedCount = allEmployees.filter((e) =>
        e.isSubmitted && e.goals.length > 0 && e.goals.every((g) => g.status === "Approved")
    ).length;

    return (
        <DashboardLayout title="Manager Dashboard">
            <ToastPortal />
            <div className="max-w-5xl mx-auto">

                {/* ── Header ── */}
                <div className="mb-8 fade-up">
                    <p className="text-xs text-white/30 uppercase tracking-widest font-medium mb-1">
                        {quarter} · Performance Cycle
                    </p>
                    <h2 className="text-2xl font-bold text-white">Manager Dashboard</h2>
                    <p className="text-sm text-white/35 mt-1">
                        Review &amp; approve your team's quarterly goals.
                    </p>
                </div>

                {/* ── Stats Row ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatsCard label="Team Size"         value={String(teamSize)}      sub="Active members"    icon="group"         accent />
                    <StatsCard label="Pending Approvals" value={String(pendingCount)}  sub="Awaiting review"   icon="pending"              />
                    <StatsCard label="Approved"          value={String(approvedCount)} sub="Goals signed off"  icon="check_circle"         />
                    <StatsCard label="Cycle"             value={quarter}               sub="Active"            icon="calendar_month"       />
                </div>

                {/* ── Pending Approvals ── */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-white">Pending Approvals</h3>
                        {pendingCount > 0 ? (
                            <span className="badge badge-pending">{pendingCount} awaiting</span>
                        ) : (
                            <span className="badge badge-approved">All clear</span>
                        )}
                    </div>

                    {pendingCount === 0 ? (
                        <div className="glass-card rounded-2xl p-10 flex flex-col items-center text-center">
                            <span className="material-symbols-outlined text-white/15 mb-3" style={{ fontSize: 36 }}>inbox</span>
                            <p className="text-sm font-medium text-white/40">No pending submissions</p>
                            <p className="text-xs text-white/20 mt-1">
                                Employees who submit goals will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {pendingEmployees.map((emp, idx) => {
                                const initials    = initialsFromName(emp.name);
                                const goalCount   = emp.goals.length;
                                const totalWeight = emp.goals.reduce((s, g) => s + (parseInt(g.weightage) || 0), 0);
                                const accentClass = ACCENT_POOL[idx % ACCENT_POOL.length];
                                const overallStatus = getOverallStatus(emp);

                                return (
                                    <div
                                        key={emp.email}
                                        className="glass-card rounded-2xl p-5 flex items-center justify-between gap-4 goal-card"
                                    >
                                        {/* Avatar + info */}
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className={`w-10 h-10 rounded-full border flex items-center justify-center text-xs font-bold flex-shrink-0 ${accentClass}`}>
                                                {initials}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-white truncate">{emp.name}</p>
                                                <p className="text-[11px] text-white/35">{emp.role}</p>
                                            </div>
                                        </div>

                                        {/* Meta */}
                                        <div className="hidden md:flex items-center gap-8 text-xs text-white/35">
                                            <div>
                                                <span className="block text-white/60 font-medium">{goalCount} goals</span>
                                                <span>{totalWeight}% weightage</span>
                                            </div>
                                            <div>
                                                <span className="block text-white/60 font-medium">Submitted</span>
                                                <span>{fmtDate(emp.submittedAt)}</span>
                                            </div>
                                        </div>

                                        {/* Status + Actions */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {overallStatus === "Approved" ? (
                                                <span className="badge badge-approved">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Approved
                                                </span>
                                            ) : overallStatus === "Rejected" ? (
                                                <span className="badge badge-draft">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Rejected
                                                </span>
                                            ) : overallStatus === "Needs Revision" ? (
                                                <span className="badge badge-pending">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Revision
                                                </span>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => doAction(emp.email, "approve", emp.name)}
                                                        className="px-4 py-2 rounded-xl text-xs font-medium text-emerald-400 transition-all duration-200"
                                                        style={{ background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.25)" }}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => doAction(emp.email, "revision", emp.name)}
                                                        className="px-4 py-2 rounded-xl text-xs font-medium text-amber-400 transition-all duration-200"
                                                        style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.20)" }}
                                                    >
                                                        Revise
                                                    </button>
                                                    <button
                                                        onClick={() => doAction(emp.email, "reject", emp.name)}
                                                        className="px-4 py-2 rounded-xl text-xs font-medium text-white/50 transition-all duration-200"
                                                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ── Team Overview ── */}
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-white mb-4">Team Overview</h3>

                    {allEmployees.length === 0 ? (
                        <div className="glass-card rounded-2xl p-8 flex flex-col items-center text-center">
                            <span className="material-symbols-outlined text-white/15 mb-3" style={{ fontSize: 32 }}>group</span>
                            <p className="text-sm font-medium text-white/40">No team members yet</p>
                            <p className="text-xs text-white/20 mt-1">Employees will appear here after they log in.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-3">
                            {allEmployees.map((emp, idx) => {
                                const initials      = initialsFromName(emp.name);
                                const accentClass   = ACCENT_POOL[idx % ACCENT_POOL.length];
                                const overallStatus = getOverallStatus(emp);
                                const sc            = OVERALL_STATUS_MAP[overallStatus] || OVERALL_STATUS_MAP.Draft;

                                return (
                                    <div
                                        key={emp.email}
                                        className="glass-card rounded-2xl p-4 flex items-center gap-3 goal-card"
                                    >
                                        <div className={`w-9 h-9 rounded-full border flex-shrink-0 flex items-center justify-center text-xs font-bold ${accentClass}`}>
                                            {initials}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-white truncate">{emp.name}</p>
                                            <p className="text-[10px] text-white/35">{emp.role}</p>
                                        </div>
                                        <div className={`flex items-center gap-1 ${sc.badge}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                                            {sc.label}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ── Coming Soon Sections ── */}
                <div className="grid md:grid-cols-2 gap-4">
                    {[
                        { icon: "bar_chart", title: "Performance Analytics", desc: "Track team-wide goal completion rates and trend lines." },
                        { icon: "forum",     title: "Goal Comments & Feedback", desc: "Inline annotations and feedback threads on individual goals." },
                    ].map((item) => (
                        <div key={item.title} className="glass-card rounded-2xl p-6 flex flex-col gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-indigo-400" style={{ fontSize: 16 }}>{item.icon}</span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white mb-0.5">{item.title}</p>
                                <p className="text-xs text-white/35 leading-relaxed">{item.desc}</p>
                            </div>
                            <div className="mt-auto inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-white/25 border border-white/[0.07] rounded-full px-3 py-1 w-fit">
                                <span className="w-1 h-1 rounded-full bg-amber-400 animate-pulse" />
                                Coming Soon
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </DashboardLayout>
    );
}

export default ManagerDashboard;
