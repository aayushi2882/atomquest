import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { loginUser } from "../utils/auth";
import { useAppStore } from "../store/useAppStore";

/* ── Framer variants ─────────────────────────────────────────────── */
const containerVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

const fieldVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.38, ease: "easeOut", delay: i * 0.08 },
    }),
};

function LoginPage() {
    const navigate = useNavigate();
    const registerEmployee = useAppStore((s) => s.registerEmployee);

    const [form, setForm]     = useState({ email: "", password: "" });
    const [error, setError]   = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (error) setError("");
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.email.trim()) { setError("Email address is required."); return; }
        if (!form.password)     { setError("Password is required."); return; }

        setLoading(true);

        setTimeout(() => {
            const result = loginUser({ email: form.email.trim(), password: form.password });

            if (!result.ok) {
                setError(result.error);
                setLoading(false);
                return;
            }

            /* Ensure the Zustand store knows about this user (idempotent) */
            registerEmployee({
                email: result.user.email,
                name:  result.user.name,
                role:  result.user.role,
            });

            setLoading(false);

            const path =
                result.user.role === "Manager" ? "/manager"
                : result.user.role === "Admin"   ? "/admin"
                : "/employee";
            navigate(path);
        }, 700);
    };

    const inputClass = "glass-input w-full rounded-xl px-4 py-3 text-sm";
    const labelClass = "block text-[10px] text-white/35 uppercase tracking-widest font-medium mb-1.5";

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
                {/* Logo / back */}
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
                        <h1 className="text-lg font-semibold text-white">Sign in</h1>
                        <p className="text-xs text-white/30 mt-1">Access your performance portal</p>
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
                        {/* Email */}
                        <motion.div variants={fieldVariants} custom={0} initial="hidden" animate="visible">
                            <label className={labelClass}>Email Address</label>
                            <input
                                id="login-email"
                                type="email"
                                placeholder="you@company.com"
                                value={form.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                                className={inputClass}
                                autoComplete="email"
                            />
                        </motion.div>

                        {/* Password */}
                        <motion.div variants={fieldVariants} custom={1} initial="hidden" animate="visible">
                            <label className={labelClass}>Password</label>
                            <input
                                id="login-password"
                                type="password"
                                placeholder="••••••••••"
                                value={form.password}
                                onChange={(e) => handleChange("password", e.target.value)}
                                className={inputClass}
                                autoComplete="current-password"
                            />
                        </motion.div>

                        {/* Submit */}
                        <motion.div variants={fieldVariants} custom={2} initial="hidden" animate="visible">
                            <button
                                id="login-btn"
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 mt-2"
                            >
                                {loading ? (
                                    <>
                                        <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Signing in…
                                    </>
                                ) : (
                                    <>
                                        Continue
                                        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>arrow_forward</span>
                                    </>
                                )}
                            </button>
                        </motion.div>
                    </form>
                </div>

                {/* Footer link */}
                <p className="text-center text-[11px] text-white/25 mt-6">
                    Don&apos;t have an account?{" "}
                    <Link
                        to="/signup"
                        className="text-indigo-400/80 hover:text-indigo-300 transition-colors underline underline-offset-2"
                    >
                        Create one
                    </Link>
                </p>

                <p className="text-center text-[11px] text-white/14 mt-3">
                    © 2026 AtomQuest · Enterprise Goal Portal
                </p>
            </motion.div>
        </div>
    );
}

export default LoginPage;
