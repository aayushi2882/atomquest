import { useState, useEffect } from "react";
import { DEPARTMENTS } from "../../store/useAppStore";

const ROLES = ["Employee", "Manager", "Admin"];

const EMPTY = { name: "", email: "", role: "Employee", department: "", managerId: "" };

/**
 * EmployeeModal
 * mode: "add" | "edit" | "disable" | "enable"
 */
function EmployeeModal({ mode = "add", employee = null, managers = [], onConfirm, onClose }) {
    const [form, setForm]     = useState(EMPTY);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (employee && (mode === "edit")) {
            setForm({ name: employee.name, email: employee.email, role: employee.role, department: employee.department, managerId: employee.managerId || "" });
        } else {
            setForm(EMPTY);
        }
        setErrors({});
    }, [employee, mode]);

    const set = (field, val) => {
        setForm((p) => ({ ...p, [field]: val }));
        setErrors((p) => ({ ...p, [field]: "" }));
    };

    const validate = () => {
        const e = {};
        if (!form.name.trim())  e.name  = "Name is required";
        if (!form.email.trim()) e.email = "Email is required";
        if (!form.role)         e.role  = "Role is required";
        if (!form.department)   e.department = "Department is required";
        return e;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (mode === "disable" || mode === "enable") { onConfirm(employee?.id); return; }
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        onConfirm(form);
    };

    const TITLES = { add: "Add Employee", edit: "Edit Employee", disable: "Disable Account", enable: "Re-enable Account" };
    const inputCls = (field) => `glass-input w-full rounded-xl px-3.5 py-2.5 text-sm ${errors[field] ? "border-red-500/40" : ""}`;
    const labelCls = "block text-[10px] text-white/35 uppercase tracking-widest font-medium mb-1.5";

    const isConfirm = mode === "disable" || mode === "enable";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}>
            <div className="glass-card-elevated rounded-2xl p-6 w-full max-w-md fade-up" style={{ border: "0.5px solid rgba(255,255,255,0.14)" }}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-sm font-semibold text-white">{TITLES[mode]}</h3>
                        <p className="text-xs text-white/30 mt-0.5">
                            {isConfirm ? `This will ${mode} the user account.` : "Fill in the details below."}
                        </p>
                    </div>
                    <button onClick={onClose} className="w-7 h-7 rounded-lg glass-card flex items-center justify-center text-white/30 hover:text-white/60 transition">
                        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {isConfirm ? (
                        <div className={`rounded-xl px-4 py-4 border ${mode === "disable" ? "bg-red-500/[0.06] border-red-500/20" : "bg-emerald-500/[0.06] border-emerald-500/20"}`}>
                            <p className="text-sm font-medium text-white">{employee?.name}</p>
                            <p className="text-xs text-white/40 mt-1">
                                {mode === "disable"
                                    ? "This employee will no longer be able to access AtomQuest."
                                    : "This employee will regain access to AtomQuest."}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Name */}
                            <div>
                                <label className={labelCls}>Full Name</label>
                                <input type="text" placeholder="e.g. Priya Sharma" value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls("name")} />
                                {errors.name && <p className="text-[10px] text-red-400 mt-1">{errors.name}</p>}
                            </div>

                            {/* Email */}
                            <div>
                                <label className={labelCls}>Work Email</label>
                                <input type="email" placeholder="priya@company.com" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls("email")} disabled={mode === "edit"} />
                                {errors.email && <p className="text-[10px] text-red-400 mt-1">{errors.email}</p>}
                            </div>

                            {/* Role + Department */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelCls}>Role</label>
                                    <select value={form.role} onChange={(e) => set("role", e.target.value)} className={`${inputCls("role")} select`}>
                                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Department</label>
                                    <select value={form.department} onChange={(e) => set("department", e.target.value)} className={`${inputCls("department")} select`}>
                                        <option value="">Select dept</option>
                                        {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    {errors.department && <p className="text-[10px] text-red-400 mt-1">{errors.department}</p>}
                                </div>
                            </div>

                            {/* Manager */}
                            {form.role === "Employee" && (
                                <div>
                                    <label className={labelCls}>Assigned Manager</label>
                                    <select value={form.managerId} onChange={(e) => set("managerId", e.target.value)} className={`${inputCls("managerId")} select`}>
                                        <option value="">No manager assigned</option>
                                        {managers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </select>
                                </div>
                            )}
                        </>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn-ghost flex-1 py-2.5 rounded-xl text-sm">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${mode === "disable" ? "bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/15" : "btn-primary"}`}
                        >
                            {mode === "add" ? "Add Employee" : mode === "edit" ? "Save Changes" : mode === "disable" ? "Disable Account" : "Re-enable"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EmployeeModal;
