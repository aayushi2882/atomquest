import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { registerUser } from "../utils/auth";
import { consumeRoleIntent } from "../utils/user";
import { useAppStore } from "../store/useAppStore";

const ROLES = ["Employee", "Manager", "Admin"];

/* ── Framer variants ─────────────────────────────────────────────── */
const containerVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

const fieldVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.38, ease: "easeOut", delay: i * 0.07 },
    }),
};

function SignupPage() {
    const navigate = useNavigate();
    const registerEmployee = useAppStore((s) => s.registerEmployee);

    const [form, setForm] = useState({
        name: "", email: "", password: "", confirmPassword: "", role: "",
    });
    const [error, setError]   = useState("");
    const [loading, setLoading] = useState(false);

    /* Pre-select role from landing page intent */
    useEffect(() => {
        const intent = consumeRoleIntent();
        if (intent) setForm((prev) => ({ ...prev, role: intent }));
    }, []);

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (error) setError("");
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        /* ── Client-side validation ── */
        if (!form.name.trim()) { setError("Full name is required."); return; }
        if (!form.email.trim()) { setError("Email address is required."); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            setError("Please enter a valid email address."); return;
        }
        if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match."); return;
        }
        if (!form.role) { setError("Please select your role."); return; }

        setLoading(true);

        /* Small artificial delay for UX */
        setTimeout(() => {
            const result = registerUser({
                name:     form.name.trim(),
                email:    form.email.trim(),
                password: form.password,
                role:     form.role,
            });

            if (!result.ok) {
                setError(result.error);
                setLoading(false);
                return;
            }

            /* Register in Zustand store so dashboards know about this user */
            registerEmployee({ email: result.user.email, name: result.user.name, role: result.user.role });

            setLoading(false);

            /* Redirect based on role */
            const path =
                form.role === "Manager" ? "/manager"
                : form.role === "Admin"   ? "/admin"
                : "/employee";
            navigate(path);
        }, 700);
    };

    const inputClass  = "glass-input w-full rounded-xl px-4 py-3 text-sm";
    const labelClass  = "block text-[10px] text-white/35 uppercase tracking-widest font-medium mb-1.5";

    const fields = [
        { key: "name",            label: "Full Name",       type: "text",     placeholder: "Jane Doe",          autoComplete: "name" },
        { key: "email",           label: "Email Address",   type: "email",    placeholder: "you@company.com",   autoComplete: "email" },
        { key: "password",        label: "Password",        type: "password", placeholder: "Min. 6 characters", autoComplete: "new-password" },
        { key: "confirmPassword", label: "Confirm Password",type: "password", placeholder: "Repeat your password", autoComplete: "new-password" },
    ];

    return (
        <div className="min-h-screen bg-[#131313] flex items-center justify-center px-4 relative overflow-hidden">

            {/* Radial accent */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(79,70,229,0.07) 0%, transparent 70%)" }}
            />
            <div
                className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
                style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)" }}
            />

            <motion.div
                className="w-full max-w-sm relative z-10"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Logo */}
                <div className="flex items-center gap-2.5 mb-10 justify-center">
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                    >
                        <div className="w-8 h-8 rounded-xl luminous-gradient flex items-center justify-center">
                            <span className="text-white text-sm font-black">A</span>
                        </div>
                        <span className="text-base font-semibold text-white/80 tracking-wide">AtomQuest</span>
                    </button>
                </div>

                {/* Card */}
                <div className="glass-card-elevated rounded-2xl p-7">
                    <div className="mb-7">
                        <h1 className="text-lg font-semibold text-white">Create account</h1>
                        <p className="text-xs text-white/30 mt-1">Join the AtomQuest performance portal</p>
                    </div>

                    {/* Error banner */}
                    {error && (
                        <motion.div
                            key={error}
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.22 }}
                            className="mb-4 rounded-xl px-4 py-3 bg-red-500/[0.06] border border-red-500/20 text-red-400 text-xs flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: 14 }}>error</span>
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                        {fields.map(({ key, label, type, placeholder, autoComplete }, i) => (
                            <motion.div key={key} variants={fieldVariants} custom={i} initial="hidden" animate="visible">
                                <label className={labelClass}>{label}</label>
                                <input
                                    id={`signup-${key}`}
                                    type={type}
                                    placeholder={placeholder}
                                    value={form[key]}
                                    onChange={(e) => handleChange(key, e.target.value)}
                                    className={inputClass}
                                    autoComplete={autoComplete}
                                />
                            </motion.div>
                        ))}

                        {/* Role selector */}
                        <motion.div variants={fieldVariants} custom={4} initial="hidden" animate="visible">
                            <label className={labelClass}>Role</label>
                            <select
                                id="signup-role"
                                value={form.role}
                                onChange={(e) => handleChange("role", e.target.value)}
                                className={`${inputClass} select`}
                            >
                                <option value="">Select your role</option>
                                {ROLES.map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </motion.div>

                        {/* Role badge hint */}
                        {form.role && (
                            <motion.div
                                key={form.role}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                                style={{
                                    background: form.role === "Admin"
                                        ? "rgba(124,58,237,0.08)"
                                        : form.role === "Manager"
                                            ? "rgba(99,102,241,0.08)"
                                            : "rgba(99,102,241,0.06)",
                                    border: `0.5px solid ${
                                        form.role === "Admin"
                                            ? "rgba(124,58,237,0.22)"
                                            : "rgba(99,102,241,0.20)"
                                    }`,
                                }}
                            >
                                <span
                                    className="material-symbols-outlined"
                                    style={{
                                        fontSize: 13,
                                        color: form.role === "Admin" ? "#c084fc" : "#818cf8",
                                    }}
                                >
                                    {form.role === "Admin"
                                        ? "admin_panel_settings"
                                        : form.role === "Manager"
                                            ? "supervisor_account"
                                            : "person"}
                                </span>
                                <span className="text-[11px] text-white/45">
                                    {form.role === "Admin"
                                        ? "Full org-wide access"
                                        : form.role === "Manager"
                                            ? "Review & approve team goals"
                                            : "Set and track personal goals"}
                                </span>
                            </motion.div>
                        )}

                        {/* Submit */}
                        <button
                            id="signup-btn"
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? (
                                <>
                                    <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    Creating account…
                                </>
                            ) : (
                                <>
                                    Create account
                                    <span className="material-symbols-outlined" style={{ fontSize: 15 }}>arrow_forward</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer link */}
                <p className="text-center text-[11px] text-white/25 mt-6">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="text-indigo-400/80 hover:text-indigo-300 transition-colors underline underline-offset-2"
                    >
                        Sign in
                    </Link>
                </p>

                <p className="text-center text-[11px] text-white/14 mt-3">
                    © 2026 AtomQuest · Enterprise Goal Portal
                </p>
            </motion.div>
        </div>
    );
}

export default SignupPage;
