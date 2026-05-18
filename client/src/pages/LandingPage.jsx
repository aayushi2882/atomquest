import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import HeroScene from "../components/HeroScene";
import ExplodedWorkflow from "../components/ExplodedWorkflow";
import { saveRoleIntent } from "../utils/user";

/* ─── Top Navbar ─────────────────────────────────────────────────────── */
function LandingNav({ onLogin }) {
    return (
        <header
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 h-14"
            style={{
                background: "rgba(19,19,19,0.72)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderBottom: "0.5px solid rgba(255,255,255,0.06)",
            }}
        >
            {/* Logo */}
            <div className="flex items-center gap-2.5">
                <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}
                >
                    <span className="text-white text-xs font-black">A</span>
                </div>
                <span className="text-sm font-semibold text-white/80 tracking-wide">AtomQuest</span>
            </div>

            {/* Nav actions */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onLogin}
                    className="text-xs text-white/50 hover:text-white/80 transition-colors px-3 py-1.5 rounded-lg"
                >
                    Sign in
                </button>
                <button
                    onClick={onLogin}
                    className="btn-primary text-xs px-4 py-2 rounded-lg font-medium"
                >
                    Get started
                </button>
            </div>
        </header>
    );
}

/* ─── Landing Page ───────────────────────────────────────────────────── */
function LandingPage() {
    const navigate   = useNavigate();
    const heroRef    = useRef(null);

    const { scrollY } = useScroll();
    /* Fade hero content out as the user scrolls away — subtle parallax */
    const heroOpacity = useTransform(scrollY, [0, 420], [1, 0]);
    const heroY       = useTransform(scrollY, [0, 420], [0, -40]);

    const goLogin = (role) => {
        if (role) saveRoleIntent(role);
        navigate("/login");
    };

    return (
        <div className="bg-[#131313] text-white">

            {/* ── Fixed Navbar ──────────────────────────────────────── */}
            <LandingNav onLogin={goLogin} />

            {/* ── Hero — full viewport, content vertically centred ───── */}
            <div
                ref={heroRef}
                className="relative min-h-screen overflow-hidden flex items-center justify-center"
                style={{ paddingTop: 56 /* navbar height */ }}
            >
                {/* Three.js particle background */}
                <HeroScene />

                {/* Hero content with subtle scroll-out parallax */}
                <motion.div
                    className="relative z-10 w-full max-w-3xl text-center px-4 sm:px-6"
                    style={{ opacity: heroOpacity, y: heroY }}
                >
                    {/* Eyebrow label */}
                    <motion.div
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8"
                        style={{
                            background: "rgba(99,102,241,0.10)",
                            border: "0.5px solid rgba(99,102,241,0.24)",
                        }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                    >
                        <span
                            className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                            style={{ boxShadow: "0 0 6px rgba(99,102,241,0.8)" }}
                        />
                        <span className="text-[11px] text-indigo-300/80 tracking-widest uppercase font-medium">
                            Enterprise Goal Platform
                        </span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        className="hero-headline text-3xl sm:text-4xl md:text-[3.25rem] font-black leading-[1.10] tracking-tight mb-5"
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.18 }}
                    >
                        Set goals.{" "}
                        <span className="text-white/55">Track progress.</span>
                        <span
                            className="block mt-1"
                            style={{
                                background: "linear-gradient(95deg,#818cf8 0%,#c084fc 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}
                        >
                            Win together.
                        </span>
                    </motion.h1>

                    {/* Subheading */}
                    <motion.p
                        className="hero-sub text-white/38 text-sm sm:text-base md:text-lg leading-relaxed mb-8 sm:mb-10 max-w-xl mx-auto"
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: "easeOut", delay: 0.28 }}
                    >
                        Precision-engineered goal tracking for high-performance teams.
                        Connect, align, and track every objective in one unified ecosystem.
                    </motion.p>

                    {/* CTA buttons */}
                    <motion.div
                        className="flex flex-wrap items-center justify-center gap-3 mb-10 sm:mb-14"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.65, ease: "easeOut", delay: 0.36 }}
                    >
                        <button
                            onClick={goLogin}
                            className="btn-primary px-7 py-3 rounded-xl text-sm font-semibold flex items-center gap-2"
                        >
                            Get started
                            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>arrow_forward</span>
                        </button>
                        <button
                            className="btn-ghost px-7 py-3 rounded-xl text-sm font-semibold"
                            onClick={() => {
                                document.getElementById("workflow-section")?.scrollIntoView({ behavior: "smooth" });
                            }}
                        >
                            See how it works
                        </button>
                    </motion.div>

                    {/* Role entry cards */}
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: "easeOut", delay: 0.44 }}
                    >
                        {/* Employee */}
                        <div
                            className="role-card rounded-2xl p-6 flex flex-col gap-3 text-left relative z-20"
                            style={{
                                background: "rgba(255,255,255,0.08)",
                                border: "1px solid rgba(255,255,255,0.12)",
                                backdropFilter: "blur(24px)",
                                WebkitBackdropFilter: "blur(24px)",
                                boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
                            }}
                        >
                            <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: "rgba(99,102,241,0.22)", border: "1px solid rgba(99,102,241,0.35)" }}
                            >
                                <span className="material-symbols-outlined text-indigo-300" style={{ fontSize: 16 }}>person</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white mb-0.5 tracking-tight">Employee</p>
                                <p className="text-[11px] text-white/55">Set goals, track progress</p>
                            </div>
                            <button
                                onClick={() => goLogin("Employee")}
                                className="mt-auto w-full py-2.5 rounded-xl text-xs font-medium text-white/80 hover:text-white transition-all duration-200"
                                style={{
                                    background: "rgba(99,102,241,0.14)",
                                    border: "1px solid rgba(99,102,241,0.30)",
                                }}
                            >
                                Enter portal
                            </button>
                        </div>

                        {/* Manager */}
                        <div
                            className="role-card role-card-accent rounded-2xl p-6 flex flex-col gap-3 text-left relative z-20"
                            style={{
                                background: "rgba(99,102,241,0.10)",
                                border: "1px solid rgba(99,102,241,0.22)",
                                backdropFilter: "blur(24px)",
                                WebkitBackdropFilter: "blur(24px)",
                                boxShadow: "0 8px 32px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,0.08)",
                            }}
                        >
                            <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: "rgba(99,102,241,0.28)", border: "1px solid rgba(99,102,241,0.40)" }}
                            >
                                <span className="material-symbols-outlined text-indigo-300" style={{ fontSize: 16 }}>supervisor_account</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white mb-0.5 tracking-tight">Manager</p>
                                <p className="text-[11px] text-white/55">Review &amp; approve goals</p>
                            </div>
                            <button
                                onClick={() => goLogin("Manager")}
                                className="mt-auto w-full py-2.5 rounded-xl text-xs font-medium text-indigo-300 hover:text-white transition-all duration-200"
                                style={{
                                    background: "rgba(99,102,241,0.18)",
                                    border: "1px solid rgba(99,102,241,0.35)",
                                }}
                            >
                                Enter portal
                            </button>
                        </div>

                        {/* Admin */}
                        <div
                            className="role-card rounded-2xl p-6 flex flex-col gap-3 text-left relative z-20"
                            style={{
                                background: "rgba(124,58,237,0.08)",
                                border: "1px solid rgba(124,58,237,0.18)",
                                backdropFilter: "blur(24px)",
                                WebkitBackdropFilter: "blur(24px)",
                                boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
                            }}
                        >
                            <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: "rgba(124,58,237,0.22)", border: "1px solid rgba(124,58,237,0.35)" }}
                            >
                                <span className="material-symbols-outlined text-violet-300" style={{ fontSize: 16 }}>admin_panel_settings</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white mb-0.5 tracking-tight">Admin</p>
                                <p className="text-[11px] text-white/55">Org-wide configuration</p>
                            </div>
                            <button
                                onClick={() => goLogin("Admin")}
                                className="mt-auto w-full py-2.5 rounded-xl text-xs font-medium text-violet-300 hover:text-white transition-all duration-200"
                                style={{
                                    background: "rgba(124,58,237,0.18)",
                                    border: "1px solid rgba(124,58,237,0.32)",
                                }}
                            >
                                Enter portal
                            </button>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Scroll cue */}
                <motion.div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.8 }}
                >
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/20">Scroll to explore</span>
                    <motion.div
                        className="w-px h-7 bg-gradient-to-b from-white/20 to-transparent"
                        animate={{ scaleY: [1, 0.4, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    />
                </motion.div>
            </div>

            {/* ── Exploded Workflow section ──────────────────────────── */}
            <div id="workflow-section">
                <ExplodedWorkflow />
            </div>

            {/* ── Footer ───────────────────────────────────────────── */}
            <footer
                className="py-10 text-center"
                style={{ borderTop: "0.5px solid rgba(255,255,255,0.06)" }}
            >
                <div className="flex items-center justify-center gap-2 mb-3">
                    <div
                        className="w-5 h-5 rounded-md flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}
                    >
                        <span className="text-white text-[9px] font-black">A</span>
                    </div>
                    <span className="text-xs text-white/30 font-medium tracking-wide">AtomQuest</span>
                </div>
                <p className="text-[11px] text-white/18 tracking-wide">
                    © 2026 AtomQuest · Enterprise Goal &amp; Performance Portal
                </p>
            </footer>
        </div>
    );
}

export default LandingPage;