import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area, Legend,
} from "recharts";
import AdminLayout from "../../components/admin/AdminLayout";
import { useAppStore } from "../../store/useAppStore";

/* ── Dark theme helpers ─────────────────────────────────────────────── */
const AXIS_STYLE  = { fill: "rgba(255,255,255,0.3)", fontSize: 11 };
const GRID_STROKE = "rgba(255,255,255,0.05)";
const PALETTE     = ["#4f46e5", "#7c3aed", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#8b5cf6", "#a78bfa"];

function DarkTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="glass-card-elevated rounded-xl px-4 py-3" style={{ border: "0.5px solid rgba(255,255,255,0.14)" }}>
            {label && <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">{label}</p>}
            {payload.map((entry, i) => (
                <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: entry.color || entry.fill }} />
                    <span className="text-xs text-white/60">{entry.name}:</span>
                    <span className="text-xs font-semibold text-white">{entry.value}</span>
                </div>
            ))}
        </div>
    );
}

function SectionHeader({ title, sub }) {
    return (
        <div className="mb-4">
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            {sub && <p className="text-xs text-white/30 mt-0.5">{sub}</p>}
        </div>
    );
}

function EmptyChart({ message = "No data yet" }) {
    return (
        <div className="flex flex-col items-center justify-center h-full py-10">
            <span className="material-symbols-outlined text-white/10 mb-2" style={{ fontSize: 32 }}>bar_chart</span>
            <p className="text-xs text-white/25">{message}</p>
        </div>
    );
}

function AdminAnalytics() {
    const employeesMap   = useAppStore((s) => s.employees);
    const adminEmployees = useAppStore((s) => s.adminEmployees);

    const loginEmployees = Object.entries(employeesMap).map(([email, e]) => ({ email, ...e }));
    const allGoals       = loginEmployees.flatMap((e) => e.goals);

    /* ── Chart 1: Goal status distribution ─── */
    const statusCounts = allGoals.reduce((acc, g) => {
        acc[g.status] = (acc[g.status] || 0) + 1;
        return acc;
    }, {});
    const statusData = [
        { name: "Draft",    count: statusCounts["Draft"] || 0,            fill: "#71717a" },
        { name: "Pending",  count: statusCounts["Pending Approval"] || 0, fill: "#f59e0b" },
        { name: "Approved", count: statusCounts["Approved"] || 0,         fill: "#22c55e" },
        { name: "Rejected", count: statusCounts["Rejected"] || 0,         fill: "#ef4444" },
        { name: "Revision", count: statusCounts["Needs Revision"] || 0,   fill: "#8b5cf6" },
    ];

    /* ── Chart 2: Thrust area distribution ─── */
    const thrustCounts = allGoals.reduce((acc, g) => {
        if (g.thrustArea) acc[g.thrustArea] = (acc[g.thrustArea] || 0) + 1;
        return acc;
    }, {});
    const thrustData = Object.entries(thrustCounts).map(([name, value], i) => ({ name, value, fill: PALETTE[i % PALETTE.length] }));

    /* ── Chart 3: Quarterly trend — real data only ─── */
    const submitted = loginEmployees.filter((e) => e.isSubmitted).length;
    const approved  = loginEmployees.filter((e) => e.isSubmitted && e.goals.length > 0 && e.goals.every((g) => g.status === "Approved")).length;
    const trendData = [
        { quarter: `Q2 ${new Date().getFullYear()}`, employees: loginEmployees.length, submitted, approved },
        { quarter: `Q3 ${new Date().getFullYear()}`, employees: 0, submitted: 0, approved: 0 },
        { quarter: `Q4 ${new Date().getFullYear()}`, employees: 0, submitted: 0, approved: 0 },
    ];

    /* ── Chart 4: Department breakdown — admin-added employees only ─── */
    const deptMap = adminEmployees.reduce((acc, e) => {
        if (!e.department || e.department === "—") return acc;
        if (!acc[e.department]) acc[e.department] = { total: 0, active: 0 };
        acc[e.department].total++;
        if (e.status === "Active") acc[e.department].active++;
        return acc;
    }, {});
    const deptData = Object.entries(deptMap).map(([dept, d]) => ({
        dept,
        active: d.active,
        total:  d.total,
        pct:    Math.round((d.active / d.total) * 100),
    })).sort((a, b) => b.active - a.active);
    const hasDeptData = deptData.length > 0;

    const now = new Date();
    const quarter = `Q${Math.ceil((now.getMonth() + 1) / 3)} ${now.getFullYear()}`;

    const hasGoals = allGoals.length > 0;

    return (
        <AdminLayout title="Analytics">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8 fade-up">
                    <p className="text-xs text-white/30 uppercase tracking-widest font-medium mb-1">{quarter} · Analytics</p>
                    <h2 className="text-2xl font-bold text-white">Organization Analytics</h2>
                    <p className="text-sm text-white/35 mt-1">Performance insights across all goal cycles and teams.</p>
                </div>

                {/* Summary stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 fade-up">
                    {[
                        { label: "Total Goals",    value: allGoals.length,                                                                      color: "text-white" },
                        { label: "Approval Rate",  value: allGoals.length ? `${Math.round((statusCounts["Approved"] || 0) / allGoals.length * 100)}%` : "—", color: "text-emerald-400" },
                        { label: "Pending Rate",   value: allGoals.length ? `${Math.round(((statusCounts["Pending Approval"] || 0) / allGoals.length) * 100)}%` : "—", color: "text-amber-400" },
                        { label: "Submission Rate",value: loginEmployees.length ? `${Math.round(submitted / Math.max(loginEmployees.length, 1) * 100)}%` : "—", color: "text-indigo-400" },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="glass-card rounded-2xl p-4">
                            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">{label}</p>
                            <p className={`text-2xl font-bold ${color}`}>{value}</p>
                        </div>
                    ))}
                </div>

                {/* Row 1: Status bar + Thrust pie */}
                <div className="grid md:grid-cols-5 gap-4 mb-4">
                    {/* Status Bar */}
                    <div className="glass-card rounded-2xl p-5 md:col-span-3 fade-up">
                        <SectionHeader title="Goal Status Distribution" sub="Count of goals per status across all employees" />
                        <div style={{ height: 200 }}>
                            {hasGoals ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={statusData} barSize={36}>
                                        <CartesianGrid vertical={false} stroke={GRID_STROKE} />
                                        <XAxis dataKey="name" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                                        <YAxis allowDecimals={false} tick={AXIS_STYLE} axisLine={false} tickLine={false} width={24} />
                                        <Tooltip content={<DarkTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                                        <Bar dataKey="count" name="Goals" radius={[4, 4, 0, 0]}>
                                            {statusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : <EmptyChart message="Submit goals to see distribution" />}
                        </div>
                    </div>

                    {/* Thrust Pie */}
                    <div className="glass-card rounded-2xl p-5 md:col-span-2 fade-up">
                        <SectionHeader title="Thrust Area Split" sub="Goal distribution by focus area" />
                        <div style={{ height: 200 }}>
                            {thrustData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={thrustData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={40} paddingAngle={3}>
                                            {thrustData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                                        </Pie>
                                        <Tooltip content={<DarkTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : <EmptyChart message="No thrust area data yet" />}
                        </div>
                        {thrustData.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {thrustData.slice(0, 4).map((d, i) => (
                                    <div key={d.name} className="flex items-center gap-1.5 text-[10px] text-white/40">
                                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.fill }} />
                                        <span className="truncate max-w-[80px]">{d.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Row 2: Quarterly trend */}
                <div className="glass-card rounded-2xl p-5 mb-4 fade-up">
                    <SectionHeader title="Quarterly Trend" sub="Real employee participation across active cycles" />
                    <div style={{ height: 200 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="gradEmployees" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#4f46e5" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradSubmitted" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradApproved" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid stroke={GRID_STROKE} />
                                <XAxis dataKey="quarter" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                                <YAxis allowDecimals={false} tick={AXIS_STYLE} axisLine={false} tickLine={false} width={24} />
                                <Tooltip content={<DarkTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }} />
                                <Area type="monotone" dataKey="employees" name="Employees" stroke="#4f46e5" strokeWidth={2} fill="url(#gradEmployees)" />
                                <Area type="monotone" dataKey="submitted" name="Submitted" stroke="#7c3aed" strokeWidth={2} fill="url(#gradSubmitted)" />
                                <Area type="monotone" dataKey="approved"  name="Approved"  stroke="#22c55e" strokeWidth={2} fill="url(#gradApproved)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Row 3: Department breakdown */}
                <div className="glass-card rounded-2xl p-5 fade-up">
                    <SectionHeader title="Department Headcount" sub="Add employees via the Employees tab to see department breakdown" />
                    {hasDeptData ? (
                        <div className="flex flex-col gap-3 mt-2">
                            {deptData.map((d, i) => (
                                <div key={d.dept}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs font-medium text-white">{d.dept}</p>
                                            <span className="text-[10px] text-white/30">{d.total} total</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] text-white/35">
                                            <span><strong className="text-white/60">{d.active}</strong> active</span>
                                            <span className="font-mono text-white/50">{d.pct}%</span>
                                        </div>
                                    </div>
                                    <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-500"
                                            style={{ width: `${d.pct}%`, background: PALETTE[i % PALETTE.length] }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center py-8 text-center">
                            <span className="material-symbols-outlined text-white/10 mb-2" style={{ fontSize:28 }}>corporate_fare</span>
                            <p className="text-xs text-white/25">No department data yet</p>
                            <p className="text-[10px] text-white/15 mt-1">Add employees with departments via Employee Management to populate this chart.</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

export default AdminAnalytics;
