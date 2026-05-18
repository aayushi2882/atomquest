import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getUser, displayNameFromEmail } from "../utils/user";

function ComingSoon() {
    const navigate = useNavigate();
    const user = getUser();
    const role = user?.role || "Manager";
    const name = displayNameFromEmail(user?.email);

    return (
        <div className="min-h-screen bg-[#131313] flex items-center justify-center px-4 relative overflow-hidden">
            {/* Ambient glow */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse 55% 45% at 50% 0%, rgba(79,70,229,0.06) 0%, transparent 68%)",
                }}
            />

            <motion.div
                className="w-full max-w-md text-center"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
                {/* Logo */}
                <div className="flex items-center gap-2.5 justify-center mb-12">
                    <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
                    >
                        <span className="text-white text-sm font-black">A</span>
                    </div>
                    <span className="text-base font-semibold text-white/75 tracking-wide">AtomQuest</span>
                </div>

                {/* Icon */}
                <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8"
                    style={{
                        background: "rgba(99,102,241,0.10)",
                        border: "0.5px solid rgba(99,102,241,0.22)",
                    }}
                >
                    <span className="material-symbols-outlined text-indigo-300" style={{ fontSize: 28 }}>
                        {role === "Manager" ? "supervisor_account" : "admin_panel_settings"}
                    </span>
                </div>

                {/* Text */}
                <div
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-5"
                    style={{
                        background: "rgba(99,102,241,0.09)",
                        border: "0.5px solid rgba(99,102,241,0.20)",
                    }}
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 pulse-dot" />
                    <span className="text-[10px] text-indigo-300/70 uppercase tracking-widest font-medium">
                        {role} Portal
                    </span>
                </div>

                <h1 className="text-2xl font-bold text-white mb-3 tracking-tight">
                    Coming Soon
                </h1>
                <p className="text-sm text-white/32 leading-relaxed max-w-sm mx-auto">
                    Hi{name !== "User" ? `, ${name}` : ""}. The <strong className="text-white/50">{role}</strong> dashboard
                    is currently under development and will be available in the next release.
                </p>

                {/* Buttons */}
                <div className="flex items-center justify-center gap-3 mt-10">
                    <button
                        onClick={() => navigate("/")}
                        className="btn-ghost px-5 py-2.5 rounded-xl text-sm flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>home</span>
                        Back to home
                    </button>
                    <button
                        onClick={() => navigate("/login")}
                        className="btn-ghost px-5 py-2.5 rounded-xl text-sm flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>logout</span>
                        Sign out
                    </button>
                </div>

                {/* Decorative dots */}
                <div className="flex items-center justify-center gap-2 mt-12">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-1 h-1 rounded-full bg-indigo-500/40"
                            animate={{ opacity: [0.2, 1, 0.2] }}
                            transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    );
}

export default ComingSoon;
