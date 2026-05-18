import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_LABELS = [
    "Initializing metrics",
    "Validating weightage",
    "Syncing objective layers",
    "Updating dashboard state",
    "Committing goal record",
];

const SPEED_LINES = [
    { y: "26%", w: 260, delay: 0,    dur: 0.9  },
    { y: "33%", w: 180, delay: 0.12, dur: 0.75 },
    { y: "40%", w: 320, delay: 0.04, dur: 1.05 },
    { y: "47%", w: 200, delay: 0.28, dur: 0.85 },
    { y: "54%", w: 280, delay: 0.18, dur: 0.95 },
    { y: "61%", w: 150, delay: 0.08, dur: 0.7  },
    { y: "68%", w: 220, delay: 0.32, dur: 1.0  },
    { y: "20%", w: 130, delay: 0.38, dur: 0.65 },
    { y: "74%", w: 190, delay: 0.22, dur: 0.88 },
    { y: "15%", w: 100, delay: 0.45, dur: 0.72 },
    { y: "80%", w: 240, delay: 0.15, dur: 0.92 },
];

const V_STREAMS = [
    { x: "18%", h: 90,  delay: 0,    dur: 1.3 },
    { x: "32%", h: 60,  delay: 0.2,  dur: 1.0 },
    { x: "68%", h: 100, delay: 0.1,  dur: 1.4 },
    { x: "82%", h: 70,  delay: 0.35, dur: 1.1 },
    { x: "50%", h: 50,  delay: 0.5,  dur: 0.9 },
];

const HEX_NODES = Array.from({ length: 6 }, (_, i) => {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
    return { x: Math.cos(angle) * 62, y: Math.sin(angle) * 62, i };
});

function GoalCreationLoader({ visible }) {
    const [statusIdx, setStatusIdx] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!visible) return;
        setStatusIdx(0);
        setProgress(0);

        const labelTimer = setInterval(() => {
            setStatusIdx((p) => (p + 1) % STATUS_LABELS.length);
        }, 460);

        const start = performance.now();
        const DURATION = 2350;
        let raf;
        const tick = (now) => {
            const elapsed = Math.min(now - start, DURATION);
            setProgress(Math.floor((elapsed / DURATION) * 100));
            if (elapsed < DURATION) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);

        return () => {
            clearInterval(labelTimer);
            cancelAnimationFrame(raf);
        };
    }, [visible]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    key="goal-loader"
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden select-none"
                    style={{ background: "#0a0a0c" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                >
                    {/* Atmospheric glow */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: `
                                radial-gradient(ellipse 60% 50% at 50% 50%, rgba(88,80,236,0.13) 0%, transparent 65%),
                                radial-gradient(ellipse 35% 30% at 50% 50%, rgba(124,58,237,0.11) 0%, transparent 55%)
                            `,
                        }}
                    />

                    {/* Grid */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            opacity: 0.022,
                            backgroundImage: `
                                linear-gradient(rgba(99,102,241,1) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)
                            `,
                            backgroundSize: "52px 52px",
                        }}
                    />

                    {/* Horizontal speed lines */}
                    {SPEED_LINES.map((line, i) => (
                        <motion.div
                            key={`h-${i}`}
                            className="absolute pointer-events-none"
                            style={{
                                top: line.y,
                                left: 0,
                                height: i % 3 === 0 ? 2 : 1,
                                width: line.w,
                                background: `linear-gradient(90deg, transparent, ${
                                    i % 2 === 0 ? "rgba(99,102,241,0.6)" : "rgba(139,92,246,0.5)"
                                }, transparent)`,
                                borderRadius: 2,
                            }}
                            animate={{ x: [-line.w, "105vw"] }}
                            transition={{
                                duration: line.dur,
                                delay: line.delay,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                        />
                    ))}

                    {/* Vertical data streams */}
                    {V_STREAMS.map((vl, i) => (
                        <motion.div
                            key={`v-${i}`}
                            className="absolute pointer-events-none"
                            style={{
                                left: vl.x,
                                top: 0,
                                width: 1,
                                height: vl.h,
                                background: `linear-gradient(180deg, transparent, rgba(124,58,237,0.45), transparent)`,
                            }}
                            animate={{ y: [-vl.h, "105vh"] }}
                            transition={{
                                duration: vl.dur,
                                delay: vl.delay,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                        />
                    ))}

                    {/* ── Central Speeder Module ── */}
                    <motion.div
                        className="relative flex items-center justify-center mb-10"
                        style={{ width: 210, height: 210 }}
                        animate={{ y: [0, -4, 1.5, -3, 0] }}
                        transition={{
                            duration: 0.55,
                            repeat: Infinity,
                            ease: "easeInOut",
                            repeatType: "mirror",
                        }}
                    >
                        {/* Outer orbit ring */}
                        <motion.div
                            className="absolute rounded-full pointer-events-none"
                            style={{
                                width: 188,
                                height: 188,
                                border: "1px solid rgba(99,102,241,0.14)",
                            }}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        />

                        {/* Mid dashed ring */}
                        <motion.div
                            className="absolute rounded-full pointer-events-none"
                            style={{
                                width: 144,
                                height: 144,
                                border: "1px dashed rgba(124,58,237,0.22)",
                            }}
                            animate={{ rotate: -360 }}
                            transition={{ duration: 13, repeat: Infinity, ease: "linear" }}
                        />

                        {/* Inner ring */}
                        <motion.div
                            className="absolute rounded-full pointer-events-none"
                            style={{
                                width: 100,
                                height: 100,
                                border: "1px solid rgba(139,92,246,0.12)",
                            }}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        />

                        {/* Hex orbit nodes */}
                        {HEX_NODES.map(({ x, y, i }) => (
                            <motion.div
                                key={i}
                                className="absolute pointer-events-none"
                                style={{
                                    width: i % 2 === 0 ? 7 : 5,
                                    height: i % 2 === 0 ? 7 : 5,
                                    borderRadius: 2,
                                    background: i % 2 === 0
                                        ? "rgba(99,102,241,0.9)"
                                        : "rgba(139,92,246,0.9)",
                                    boxShadow: `0 0 10px ${i % 2 === 0 ? "rgba(99,102,241,0.8)" : "rgba(139,92,246,0.8)"}`,
                                    x,
                                    y,
                                }}
                                animate={{
                                    opacity: [0.35, 1, 0.35],
                                    scale: [0.7, 1.5, 0.7],
                                }}
                                transition={{
                                    duration: 1.8,
                                    delay: i * 0.28,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            />
                        ))}

                        {/* Speeder core — diamond body */}
                        <motion.div
                            className="absolute"
                            style={{
                                width: 76,
                                height: 76,
                                background: "rgba(12,12,18,0.95)",
                                border: "1px solid rgba(99,102,241,0.38)",
                                borderRadius: 18,
                                rotate: 45,
                            }}
                            animate={{
                                boxShadow: [
                                    "0 0 0 1px rgba(99,102,241,0.10), 0 0 28px rgba(99,102,241,0.18), inset 0 0 22px rgba(99,102,241,0.06)",
                                    "0 0 0 1px rgba(139,92,246,0.25), 0 0 50px rgba(139,92,246,0.35), inset 0 0 32px rgba(124,58,237,0.12)",
                                    "0 0 0 1px rgba(99,102,241,0.10), 0 0 28px rgba(99,102,241,0.18), inset 0 0 22px rgba(99,102,241,0.06)",
                                ],
                            }}
                            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                        >
                            {/* Crosshair */}
                            <div className="absolute inset-0 flex items-center justify-center" style={{ transform: "rotate(-45deg)" }}>
                                <div className="w-px h-9 bg-indigo-500/25 absolute" />
                                <div className="h-px w-9 bg-indigo-500/25 absolute" />
                                <div className="w-1 h-1 rounded-full bg-violet-400/50 absolute" />
                            </div>
                        </motion.div>

                        {/* Core pulse dot */}
                        <motion.div
                            className="absolute"
                            style={{
                                width: 12,
                                height: 12,
                                borderRadius: "50%",
                                background: "radial-gradient(circle, rgba(196,181,253,1) 0%, rgba(99,102,241,0.5) 100%)",
                                boxShadow: "0 0 22px rgba(196,181,253,0.9), 0 0 50px rgba(99,102,241,0.5)",
                            }}
                            animate={{ scale: [1, 2.0, 1], opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                        />

                        {/* Left wing trail */}
                        <motion.div
                            className="absolute"
                            style={{
                                left: 6,
                                width: 32,
                                height: 2,
                                background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.75))",
                                borderRadius: 2,
                            }}
                            animate={{ scaleX: [0.3, 1, 0.3], opacity: [0.2, 1, 0.2] }}
                            transition={{ duration: 0.85, repeat: Infinity, ease: "easeInOut" }}
                        />

                        {/* Right wing trail */}
                        <motion.div
                            className="absolute"
                            style={{
                                right: 6,
                                width: 32,
                                height: 2,
                                background: "linear-gradient(90deg, rgba(99,102,241,0.75), transparent)",
                                borderRadius: 2,
                            }}
                            animate={{ scaleX: [0.3, 1, 0.3], opacity: [0.2, 1, 0.2] }}
                            transition={{ duration: 0.85, repeat: Infinity, ease: "easeInOut", delay: 0.42 }}
                        />

                        {/* Top exhaust */}
                        <motion.div
                            className="absolute"
                            style={{
                                top: 10,
                                width: 2,
                                height: 20,
                                background: "linear-gradient(180deg, transparent, rgba(139,92,246,0.6))",
                                borderRadius: 2,
                            }}
                            animate={{ scaleY: [0.2, 1, 0.2], opacity: [0.1, 0.8, 0.1] }}
                            transition={{ duration: 0.7, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
                        />

                        {/* Bottom exhaust */}
                        <motion.div
                            className="absolute"
                            style={{
                                bottom: 10,
                                width: 2,
                                height: 20,
                                background: "linear-gradient(180deg, rgba(139,92,246,0.6), transparent)",
                                borderRadius: 2,
                            }}
                            animate={{ scaleY: [0.2, 1, 0.2], opacity: [0.1, 0.8, 0.1] }}
                            transition={{ duration: 0.7, repeat: Infinity, ease: "easeInOut", delay: 0.57 }}
                        />
                    </motion.div>

                    {/* Text block */}
                    <motion.div
                        className="flex flex-col items-center gap-2 text-center px-6"
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.18, duration: 0.5 }}
                    >
                        <h2
                            className="text-xl font-black tracking-[0.2em] uppercase"
                            style={{
                                background: "linear-gradient(95deg, #818cf8 0%, #c084fc 55%, #818cf8 100%)",
                                backgroundSize: "200% auto",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                                animation: "shimmerText 2.5s linear infinite",
                            }}
                        >
                            Creating Goal
                        </h2>

                        <p className="text-[11px] text-white/30 tracking-[0.22em] uppercase font-medium">
                            Synchronizing performance protocols
                        </p>

                        {/* Cycling status */}
                        <div className="h-5 overflow-hidden mt-0.5">
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={statusIdx}
                                    className="text-[11px] text-indigo-400/65 font-mono tracking-wider"
                                    initial={{ y: 12, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -12, opacity: 0 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                >
                                    {STATUS_LABELS[statusIdx]}
                                </motion.p>
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Progress section */}
                    <motion.div
                        className="mt-8 w-60 flex flex-col gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.32 }}
                    >
                        <div
                            className="relative h-[3px] w-full rounded-full overflow-hidden"
                            style={{ background: "rgba(255,255,255,0.05)" }}
                        >
                            <motion.div
                                className="absolute left-0 top-0 h-full rounded-full"
                                style={{
                                    background: "linear-gradient(90deg, #4338ca, #7c3aed, #a78bfa, #7c3aed)",
                                    backgroundSize: "200% auto",
                                    boxShadow: "0 0 12px rgba(99,102,241,0.8), 0 0 24px rgba(124,58,237,0.5)",
                                    animation: "shimmerBar 1.5s linear infinite",
                                }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.1, ease: "linear" }}
                            />
                            {/* Shimmer sweep */}
                            <motion.div
                                className="absolute top-0 h-full w-20 rounded-full pointer-events-none"
                                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)" }}
                                animate={{ x: [-80, 260] }}
                                transition={{ duration: 1.0, repeat: Infinity, ease: "linear", delay: 0.25 }}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-[9px] uppercase tracking-[0.22em] text-white/18 font-mono">
                                Protocol sync
                            </span>
                            <motion.span
                                className="text-[9px] font-mono text-indigo-400/55"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 0.8, repeat: Infinity }}
                            >
                                {String(progress).padStart(3, "0")}%
                            </motion.span>
                        </div>
                    </motion.div>

                    {/* Corner HUD marks */}
                    {[
                        { top: 20, left: 20 },
                        { top: 20, right: 20 },
                        { bottom: 20, left: 20 },
                        { bottom: 20, right: 20 },
                    ].map((pos, i) => (
                        <motion.div
                            key={i}
                            className="absolute pointer-events-none"
                            style={{
                                ...pos,
                                width: 20,
                                height: 20,
                                borderTop:    i < 2  ? "1.5px solid rgba(99,102,241,0.4)" : "none",
                                borderBottom: i >= 2 ? "1.5px solid rgba(99,102,241,0.4)" : "none",
                                borderLeft:   i % 2 === 0 ? "1.5px solid rgba(99,102,241,0.4)" : "none",
                                borderRight:  i % 2 === 1 ? "1.5px solid rgba(99,102,241,0.4)" : "none",
                            }}
                            animate={{ opacity: [0.25, 0.85, 0.25] }}
                            transition={{ duration: 1.8, delay: i * 0.25, repeat: Infinity, ease: "easeInOut" }}
                        />
                    ))}

                    {/* Side edge scan lines */}
                    {["left-0", "right-0"].map((side, i) => (
                        <motion.div
                            key={side}
                            className={`absolute top-0 ${side} w-px h-full pointer-events-none`}
                            style={{
                                background: `linear-gradient(180deg, transparent 0%, rgba(99,102,241,0.28) 40%, rgba(124,58,237,0.28) 60%, transparent 100%)`,
                            }}
                            animate={{ opacity: [0, 0.7, 0] }}
                            transition={{ duration: 2.0, delay: i * 0.6, repeat: Infinity, ease: "easeInOut" }}
                        />
                    ))}

                    {/* Inline keyframes */}
                    <style>{`
                        @keyframes shimmerText {
                            0%   { background-position: 0% center; }
                            100% { background-position: 200% center; }
                        }
                        @keyframes shimmerBar {
                            0%   { background-position: 0% center; }
                            100% { background-position: 200% center; }
                        }
                    `}</style>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default GoalCreationLoader;
