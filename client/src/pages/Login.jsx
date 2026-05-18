import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { saveUser, consumeRoleIntent, roleRedirectPath, displayNameFromEmail } from "../utils/user";
import { useAppStore } from "../store/useAppStore";

const ROLES = ["Employee", "Manager", "Admin"];

function LoginPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "", role: "" });
    const [error, setError] = useState("");
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

    const registerEmployee = useAppStore((s) => s.registerEmployee);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.email || !form.password || !form.role) {
            setError("Please fill in all fields to continue.");
            return;
        }
        setLoading(true);
        setTimeout(() => {
            const name = displayNameFromEmail(form.email);
            saveUser({ email: form.email, role: form.role, name });
            // Register / update in global store (always, for all roles — manager & admin
            // records help admin dashboard count team members)
            registerEmployee({ email: form.email, name, role: form.role });
            setLoading(false);
            navigate(roleRedirectPath(form.role));
        }, 800);
    };

    const inputClass = "glass-input w-full rounded-xl px-4 py-3 text-sm";
    const labelClass = "block text-[10px] text-white/35 uppercase tracking-widest font-medium mb-1.5";

    return (
        <div className="min-h-screen bg-[#131313] flex items-center justify-center px-4 relative overflow-hidden">
            {/* Subtle background accent */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(79,70,229,0.07) 0%, transparent 70%)",
                }}
            />
            <div
                className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
                style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)" }}
            />

            <div className="w-full max-w-sm relative z-10 fade-up">
                {/* Logo + back link */}
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

                    {error && (
                        <div className="mb-4 rounded-xl px-4 py-3 bg-red-500/[0.06] border border-red-500/20 text-red-400 text-xs flex items-center gap-2 fade-in">
                            <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: 14 }}>error</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className={labelClass}>Email Address</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="you@company.com"
                                value={form.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                                className={inputClass}
                                autoComplete="email"
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Password</label>
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••••"
                                value={form.password}
                                onChange={(e) => handleChange("password", e.target.value)}
                                className={inputClass}
                                autoComplete="current-password"
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Role</label>
                            <select
                                id="role"
                                value={form.role}
                                onChange={(e) => handleChange("role", e.target.value)}
                                className={`${inputClass} select`}
                            >
                                <option value="">Select your role</option>
                                {ROLES.map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            id="login-btn"
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? (
                                <>
                                    <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                                    Signing in…
                                </>
                            ) : (
                                <>
                                    Continue
                                    <span className="material-symbols-outlined" style={{ fontSize: 15 }}>arrow_forward</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-[11px] text-white/20 mt-6">
                    © 2026 AtomQuest · Enterprise Goal Portal
                </p>
            </div>
        </div>
    );
}

export default LoginPage;
