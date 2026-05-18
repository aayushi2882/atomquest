import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminStatCard from "../../components/admin/AdminStatCard";
import { useAppStore } from "../../store/useAppStore";
import { initialsFromName } from "../../utils/user";

const now = new Date();
const quarter = `Q${Math.ceil((now.getMonth() + 1) / 3)} ${now.getFullYear()}`;
const ACCENT_POOL = ["bg-indigo-500/20 border-indigo-400/25 text-indigo-300","bg-purple-500/20 border-purple-400/25 text-purple-300","bg-violet-500/20 border-violet-400/25 text-violet-300","bg-blue-500/20 border-blue-400/25 text-blue-300","bg-cyan-500/20 border-cyan-400/25 text-cyan-300"];
const ACTIVITY_CFG = { goal_added:{icon:"add_circle",bg:"bg-purple-500/15",color:"text-purple-400"}, submitted:{icon:"send",bg:"bg-indigo-500/15",color:"text-indigo-400"}, approved:{icon:"check_circle",bg:"bg-emerald-500/15",color:"text-emerald-400"}, rejected:{icon:"cancel",bg:"bg-red-500/15",color:"text-red-400"}, revision:{icon:"edit_note",bg:"bg-amber-500/15",color:"text-amber-400"}, cycle_start:{icon:"play_circle",bg:"bg-indigo-500/15",color:"text-indigo-400"}, cycle_lock:{icon:"lock",bg:"bg-amber-500/15",color:"text-amber-400"}, cycle_open:{icon:"lock_open",bg:"bg-emerald-500/15",color:"text-emerald-400"}, cycle_archive:{icon:"archive",bg:"bg-zinc-500/15",color:"text-zinc-400"}, emp_added:{icon:"person_add",bg:"bg-indigo-500/15",color:"text-indigo-400"}, emp_disabled:{icon:"person_off",bg:"bg-red-500/15",color:"text-red-400"} };

function relativeTime(iso) {
    if (!iso) return "—";
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff/60000), h = Math.floor(diff/3600000), d = Math.floor(diff/86400000);
    if (m < 1) return "Just now"; if (m < 60) return `${m}m ago`; if (h < 24) return `${h}h ago`;
    return d === 1 ? "Yesterday" : `${d}d ago`;
}

function goalStatus(emp) {
    if (!emp.goals.length) return { label: "Not Started", color: "text-zinc-500" };
    if (emp.isSubmitted && emp.goals.every(g => g.status === "Approved")) return { label: "Approved", color: "text-emerald-400" };
    if (emp.goals.some(g => g.status === "Rejected")) return { label: "Rejected", color: "text-red-400" };
    if (emp.goals.some(g => g.status === "Needs Revision")) return { label: "Revision", color: "text-amber-400" };
    if (emp.isSubmitted) return { label: "Pending", color: "text-amber-400" };
    return { label: "Draft", color: "text-zinc-400" };
}

function AdminOverview() {
    const navigate     = useNavigate();
    const employeesMap = useAppStore((s) => s.employees);
    const activityLog  = useAppStore((s) => s.activityLog);
    const cycles       = useAppStore((s) => s.cycles);

    const allUsers    = Object.entries(employeesMap).map(([email, e]) => ({ email, ...e }));
    const empList     = allUsers.filter((u) => !u.role || u.role === "Employee");
    const managerList = allUsers.filter((u) => u.role === "Manager");
    const activeCycle = cycles.find((c) => c.status === "Active" && c.isCurrentCycle) || cycles.find((c) => c.status === "Active");

    const totalSubmitted = empList.filter((e) => e.isSubmitted).length;
    const totalApproved  = empList.filter((e) => e.isSubmitted && e.goals.length > 0 && e.goals.every((g) => g.status === "Approved")).length;
    const totalPending   = empList.filter((e) => e.isSubmitted && !e.goals.every((g) => g.status === "Approved")).length;

    return (
        <AdminLayout title="Admin Overview">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 fade-up">
                    <p className="text-xs text-white/30 uppercase tracking-widest font-medium mb-1">{quarter} · Organization Controls</p>
                    <h2 className="text-2xl font-bold text-white">Admin Overview</h2>
                    <p className="text-sm text-white/35 mt-1">Organization-wide visibility across all goal cycles and employees.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <AdminStatCard label="Employees"    value={String(empList.length)}      sub="Logged in"          icon="group"              accent />
                    <AdminStatCard label="Managers"     value={String(managerList.length)}   sub="Active reviewers"   icon="supervisor_account"        />
                    <AdminStatCard label="Active Cycle" value={activeCycle?.label || "None"} sub="Current quarter"    icon="cycle"                     />
                    <AdminStatCard label="Approved"     value={String(totalApproved)}        sub="Goals signed off"   icon="check_circle" trend="up"   />
                    <AdminStatCard label="Pending"      value={String(totalPending)}         sub="Awaiting review"    icon="pending"                   />
                </div>

                {activeCycle ? (
                    <div className="mb-6 rounded-2xl px-5 py-4 fade-up flex items-center justify-between gap-4" style={{ background:"rgba(99,102,241,0.06)", border:"0.5px solid rgba(99,102,241,0.25)" }}>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-indigo-400" style={{ fontSize:16 }}>cycle</span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">{activeCycle.label} — Active</p>
                                <p className="text-xs text-white/35 mt-0.5">{totalSubmitted} submission{totalSubmitted !== 1 ? "s" : ""} received · {totalApproved} approved</p>
                            </div>
                        </div>
                        <button onClick={() => navigate("/admin/cycles")} className="btn-ghost text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 flex-shrink-0">
                            Manage <span className="material-symbols-outlined" style={{ fontSize:13 }}>arrow_forward</span>
                        </button>
                    </div>
                ) : (
                    <div className="mb-6 rounded-2xl px-5 py-3 fade-up flex items-center gap-3" style={{ background:"rgba(255,255,255,0.02)", border:"0.5px solid rgba(255,255,255,0.07)" }}>
                        <span className="material-symbols-outlined text-white/20" style={{ fontSize:16 }}>info</span>
                        <p className="text-xs text-white/35">No active cycle. <button onClick={() => navigate("/admin/cycles")} className="text-indigo-400/70 hover:text-indigo-400 underline underline-offset-2 transition">Start one →</button></p>
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                    {/* Employee Snapshot */}
                    <div className="glass-card rounded-2xl p-5 fade-up">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-white">Employee Snapshot</h3>
                            <button onClick={() => navigate("/admin/employees")} className="text-[11px] text-indigo-400/70 hover:text-indigo-400 transition flex items-center gap-1">
                                View all <span className="material-symbols-outlined" style={{ fontSize:12 }}>arrow_forward</span>
                            </button>
                        </div>
                        {empList.length === 0 ? (
                            <div className="flex flex-col items-center py-8 text-center">
                                <span className="material-symbols-outlined text-white/10 mb-3" style={{ fontSize:32 }}>group</span>
                                <p className="text-sm font-medium text-white/35">No employee activity yet</p>
                                <p className="text-xs text-white/20 mt-1.5 max-w-[200px]">Employees appear here after they log in and work on goals.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {empList.slice(0, 6).map((emp, idx) => {
                                    const gs = goalStatus(emp);
                                    return (
                                        <div key={emp.email} className="flex items-center gap-3 py-2.5 border-b border-white/[0.04] last:border-0">
                                            <div className={`w-7 h-7 rounded-full border flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${ACCENT_POOL[idx % ACCENT_POOL.length]}`}>
                                                {initialsFromName(emp.name)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-white truncate">{emp.name}</p>
                                                <p className="text-[10px] text-white/30">{emp.goals.length} goal{emp.goals.length !== 1 ? "s" : ""} · {emp.role}</p>
                                            </div>
                                            <span className={`text-[10px] font-medium flex-shrink-0 ${gs.color}`}>{gs.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Recent Activity */}
                    <div className="glass-card rounded-2xl p-5 fade-up">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
                            <button onClick={() => navigate("/admin/activity")} className="text-[11px] text-indigo-400/70 hover:text-indigo-400 transition flex items-center gap-1">
                                View all <span className="material-symbols-outlined" style={{ fontSize:12 }}>arrow_forward</span>
                            </button>
                        </div>
                        {activityLog.length === 0 ? (
                            <div className="flex flex-col items-center py-8 text-center">
                                <span className="material-symbols-outlined text-white/10 mb-3" style={{ fontSize:32 }}>history</span>
                                <p className="text-sm font-medium text-white/35">No activity recorded yet</p>
                                <p className="text-xs text-white/20 mt-1.5 max-w-[200px]">Goal submissions, approvals, and cycle events will appear here.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {activityLog.slice(0, 6).map((entry) => {
                                    const cfg = ACTIVITY_CFG[entry.type] || ACTIVITY_CFG.submitted;
                                    return (
                                        <div key={entry.id} className="flex items-center gap-3">
                                            <div className={`w-7 h-7 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                                                <span className={`material-symbols-outlined ${cfg.color}`} style={{ fontSize:13 }}>{cfg.icon}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-white/70 truncate"><span className="font-medium text-white">{entry.user}</span> — {entry.detail}</p>
                                                <p className="text-[10px] text-white/25 mt-0.5">{relativeTime(entry.time)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    {[
                        { icon:"manage_accounts", title:"Employee Management", desc:"Add, edit, and manage team members.", path:"/admin/employees", color:"text-indigo-400", bg:"bg-indigo-500/10 border-indigo-500/20" },
                        { icon:"cycle",           title:"Goal Cycles",         desc:"Control quarterly goal cycles.",    path:"/admin/cycles",    color:"text-violet-400", bg:"bg-violet-500/10 border-violet-500/20" },
                        { icon:"analytics",       title:"Analytics",           desc:"Review performance charts.",        path:"/admin/analytics", color:"text-purple-400", bg:"bg-purple-500/10 border-purple-500/20" },
                    ].map((item) => (
                        <button key={item.path} onClick={() => navigate(item.path)} className="glass-card rounded-2xl p-5 text-left flex flex-col gap-3 goal-card w-full">
                            <div className={`w-9 h-9 rounded-xl border ${item.bg} flex items-center justify-center flex-shrink-0`}>
                                <span className={`material-symbols-outlined ${item.color}`} style={{ fontSize:16 }}>{item.icon}</span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">{item.title}</p>
                                <p className="text-xs text-white/35 mt-0.5">{item.desc}</p>
                            </div>
                            <span className="flex items-center gap-1 text-[11px] text-white/25 mt-auto">Open <span className="material-symbols-outlined" style={{ fontSize:12 }}>arrow_forward</span></span>
                        </button>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}

export default AdminOverview;
