import { useState, useMemo } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import EmployeeModal from "../../components/admin/EmployeeModal";
import { useToast } from "../../components/Toast";
import { useAppStore } from "../../store/useAppStore";
import { initialsFromName } from "../../utils/user";

const ACCENT_POOL = ["bg-indigo-500/20 border-indigo-400/25 text-indigo-300","bg-purple-500/20 border-purple-400/25 text-purple-300","bg-violet-500/20 border-violet-400/25 text-violet-300","bg-blue-500/20 border-blue-400/25 text-blue-300","bg-cyan-500/20 border-cyan-400/25 text-cyan-300"];
const ROLE_COLORS = { Employee:"bg-indigo-500/10 border-indigo-500/20 text-indigo-400", Manager:"bg-violet-500/10 border-violet-500/20 text-violet-400", Admin:"bg-purple-500/10 border-purple-500/20 text-purple-400" };

function AdminEmployees() {
    const employeesMap        = useAppStore((s) => s.employees);
    const adminEmployees      = useAppStore((s) => s.adminEmployees);
    const addAdminEmployee    = useAppStore((s) => s.addAdminEmployee);
    const updateAdminEmployee = useAppStore((s) => s.updateAdminEmployee);
    const disableAdminEmployee = useAppStore((s) => s.disableAdminEmployee);
    const enableAdminEmployee  = useAppStore((s) => s.enableAdminEmployee);
    const { addToast, ToastPortal } = useToast();

    const [search, setSearch]   = useState("");
    const [roleFilter, setRole] = useState("All");
    const [statusFilter, setSt] = useState("All");
    const [modal, setModal]     = useState(null);

    /* ── Unified employee list ─────────────────────────────────────────
       Source 1: Real logged-in employees from employees{} map
       Source 2: Admin-added employees who haven't logged in yet
       Deduplicated by email — login data wins if same email.
    ───────────────────────────────────────────────────────────────────── */
    const loginEntries  = Object.entries(employeesMap).map(([email, e]) => ({
        id: `login-${email}`, name: e.name, email, role: e.role || "Employee",
        department: "—", managerId: null, status: "Active",
        createdAt: e.submittedAt || null, source: "login",
    }));
    const loginEmails   = new Set(loginEntries.map((e) => e.email));
    const adminOnlyList = adminEmployees.filter((e) => !loginEmails.has(e.email)).map((e) => ({ ...e, source: "admin" }));
    const unified       = [...loginEntries, ...adminOnlyList];

    /* Managers list for modal (from both sources) */
    const managers = unified.filter((e) => e.role === "Manager");

    /* Goal status helper (only meaningful for login employees) */
    const getGoalStatus = (email) => {
        const emp = employeesMap[email];
        if (!emp || emp.goals.length === 0) return { label: "Not Started", color: "text-zinc-500" };
        if (emp.isSubmitted && emp.goals.every((g) => g.status === "Approved"))  return { label: "Approved",    color: "text-emerald-400" };
        if (emp.goals.some((g) => g.status === "Rejected"))                      return { label: "Rejected",    color: "text-red-400" };
        if (emp.goals.some((g) => g.status === "Needs Revision"))                return { label: "Revision",    color: "text-amber-400" };
        if (emp.isSubmitted)                                                      return { label: "Pending",     color: "text-amber-400" };
        return { label: "Draft", color: "text-zinc-400" };
    };

    const getManagerName = (managerId) => {
        if (!managerId) return "—";
        return adminEmployees.find((e) => e.id === managerId)?.name || "—";
    };

    const filtered = useMemo(() => unified.filter((e) => {
        const q    = search.toLowerCase();
        const mName = !search || e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q);
        const mRole = roleFilter === "All" || e.role === roleFilter;
        const mSt   = statusFilter === "All" || e.status === statusFilter;
        return mName && mRole && mSt;
    }), [unified, search, roleFilter, statusFilter]);

    const handleConfirm = (data) => {
        if (modal.mode === "add") {
            addAdminEmployee(data);
            addToast({ message: `${data.name} added successfully`, type: "success" });
        } else if (modal.mode === "edit") {
            if (modal.employee.source === "admin") updateAdminEmployee(modal.employee.id, data);
            addToast({ message: "Employee updated", type: "success" });
        } else if (modal.mode === "disable") {
            if (modal.employee.source === "admin") disableAdminEmployee(modal.employee.id);
            addToast({ message: `${modal.employee.name} disabled`, type: "warning" });
        } else if (modal.mode === "enable") {
            if (modal.employee.source === "admin") enableAdminEmployee(modal.employee.id);
            addToast({ message: `${modal.employee.name} re-enabled`, type: "success" });
        }
        setModal(null);
    };

    const now = new Date();
    const quarter = `Q${Math.ceil((now.getMonth() + 1) / 3)} ${now.getFullYear()}`;
    const activeCount   = unified.filter((e) => e.status === "Active").length;
    const disabledCount = unified.filter((e) => e.status === "Disabled").length;

    return (
        <AdminLayout title="Employee Management">
            <ToastPortal />
            {modal && <EmployeeModal mode={modal.mode} employee={modal.employee} managers={managers} onConfirm={handleConfirm} onClose={() => setModal(null)} />}

            <div className="max-w-6xl mx-auto">
                <div className="mb-6 fade-up flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <p className="text-xs text-white/30 uppercase tracking-widest font-medium mb-1">{quarter} · People</p>
                        <h2 className="text-2xl font-bold text-white">Employee Management</h2>
                        <p className="text-sm text-white/35 mt-1">{activeCount} active · {disabledCount} disabled</p>
                    </div>
                    <button onClick={() => setModal({ mode: "add" })} className="btn-primary px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 flex-shrink-0">
                        <span className="material-symbols-outlined" style={{ fontSize:15 }}>person_add</span>
                        Add Employee
                    </button>
                </div>

                {/* Filters */}
                <div className="glass-card rounded-2xl p-4 mb-5 fade-up flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/25" style={{ fontSize:15 }}>search</span>
                        <input type="text" placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} className="glass-input w-full rounded-xl pl-9 pr-4 py-2.5 text-sm" />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {["All","Employee","Manager"].map((r) => (
                            <button key={r} onClick={() => setRole(r)} className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${roleFilter === r ? "bg-indigo-500/20 border border-indigo-500/30 text-indigo-400" : "btn-ghost"}`}>{r}</button>
                        ))}
                        <div className="w-px bg-white/[0.08]" />
                        {["All","Active","Disabled"].map((s) => (
                            <button key={s} onClick={() => setSt(s)} className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${statusFilter === s ? "bg-indigo-500/20 border border-indigo-500/30 text-indigo-400" : "btn-ghost"}`}>{s}</button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="glass-card rounded-2xl overflow-hidden fade-up">
                    <div className="admin-table-scroll">
                    <div className="grid gap-3 px-5 py-3 border-b border-white/[0.06] text-[10px] uppercase tracking-widest text-white/25 font-medium" style={{ gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr auto", minWidth:"600px" }}>
                        <span>Employee</span><span>Role</span><span className="hidden md:block">Department</span><span className="hidden md:block">Source</span><span>Goal Status</span><span>Actions</span>
                    </div>

                    {unified.length === 0 ? (
                        <div className="flex flex-col items-center py-16 text-center">
                            <span className="material-symbols-outlined text-white/10 mb-3" style={{ fontSize:36 }}>group</span>
                            <p className="text-sm font-medium text-white/35">No employees yet</p>
                            <p className="text-xs text-white/20 mt-1.5 max-w-[220px]">Employees appear here when they log in, or when you add them manually above.</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center py-12 text-center">
                            <span className="material-symbols-outlined text-white/15 mb-3" style={{ fontSize:32 }}>search_off</span>
                            <p className="text-sm text-white/35">No employees match your filters.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/[0.04]">
                            {filtered.map((emp, idx) => {
                                const gs = getGoalStatus(emp.email);
                                const isDisabled = emp.status === "Disabled";
                                const isLoginEmp = emp.source === "login";
                                return (
                                    <div key={emp.id} className={`grid gap-3 px-5 py-3.5 items-center hover:bg-white/[0.02] transition-colors ${isDisabled ? "opacity-50" : ""}`} style={{ gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr auto", minWidth:"600px" }}>
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`w-8 h-8 rounded-full border flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${ACCENT_POOL[idx % ACCENT_POOL.length]}`}>
                                                {initialsFromName(emp.name)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-medium text-white truncate">{emp.name}</p>
                                                <p className="text-[10px] text-white/30 truncate">{emp.email}</p>
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-medium w-fit ${ROLE_COLORS[emp.role] || ROLE_COLORS.Employee}`}>{emp.role}</span>
                                        <span className="text-xs text-white/50 hidden md:block truncate">{emp.department}</span>
                                        <div className="hidden md:flex items-center gap-1.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${isLoginEmp ? "bg-emerald-400" : "bg-indigo-400"}`} />
                                            <span className="text-[10px] text-white/35">{isLoginEmp ? "Logged in" : "Admin-added"}</span>
                                        </div>
                                        <span className={`text-xs font-medium ${gs.color}`}>{gs.label}</span>
                                        <div className="flex items-center gap-1">
                                            {!isLoginEmp && (
                                                <>
                                                    <button onClick={() => setModal({ mode:"edit", employee:emp })} title="Edit" className="w-7 h-7 rounded-lg glass-card flex items-center justify-center text-white/30 hover:text-white/70 transition">
                                                        <span className="material-symbols-outlined" style={{ fontSize:13 }}>edit</span>
                                                    </button>
                                                    <button onClick={() => setModal({ mode: isDisabled ? "enable" : "disable", employee:emp })} title={isDisabled ? "Re-enable" : "Disable"} className={`w-7 h-7 rounded-lg glass-card flex items-center justify-center transition ${isDisabled ? "text-emerald-400/50 hover:text-emerald-400" : "text-white/30 hover:text-red-400"}`}>
                                                        <span className="material-symbols-outlined" style={{ fontSize:13 }}>{isDisabled ? "person_check" : "person_off"}</span>
                                                    </button>
                                                </>
                                            )}
                                            {isLoginEmp && (
                                                <span title="Login-managed account" className="text-[10px] text-white/20 px-2">Live</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    </div>{/* admin-table-scroll */}
                </div>
                <p className="text-[10px] text-white/20 text-center mt-4">{filtered.length} of {unified.length} records · <span className="text-emerald-400/50">●</span> Logged in · <span className="text-indigo-400/50">●</span> Admin-added</p>
            </div>
        </AdminLayout>
    );
}

export default AdminEmployees;
