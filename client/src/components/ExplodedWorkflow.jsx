import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

/* ─── Module ring positions (exploded state) ─────────────────────────
   6 modules evenly distributed on an ellipse.
   explodeX / explodeY  → phase-2 outer positions
   lockX    / lockY     → phase-3 re-assembled grid positions
   ──────────────────────────────────────────────────────────────────── */
const MODULES = [
    {
        id: "goals",
        label: "Goals",
        icon: "target",
        desc: "Set & track",
        color: "rgba(99,102,241,0.13)",
        border: "rgba(99,102,241,0.30)",
        explodeX: 340, explodeY: -195,   // top-right
        lockX: -220,   lockY: -110,      // final grid: top-left
        stagger: 0,
    },
    {
        id: "analytics",
        label: "Analytics",
        icon: "bar_chart",
        desc: "Real-time insights",
        color: "rgba(139,92,246,0.11)",
        border: "rgba(139,92,246,0.26)",
        explodeX: 385,  explodeY: 0,     // right
        lockX: 0,        lockY: -110,    // final grid: top-center
        stagger: 1,
    },
    {
        id: "approvals",
        label: "Approvals",
        icon: "task_alt",
        desc: "Manager review",
        color: "rgba(99,102,241,0.10)",
        border: "rgba(99,102,241,0.22)",
        explodeX: 340,  explodeY: 195,   // bottom-right
        lockX: 220,      lockY: -110,    // final grid: top-right
        stagger: 2,
    },
    {
        id: "kpis",
        label: "KPIs",
        icon: "trending_up",
        desc: "Performance metrics",
        color: "rgba(139,92,246,0.12)",
        border: "rgba(139,92,246,0.24)",
        explodeX: -340, explodeY: 195,   // bottom-left
        lockX: -220,    lockY: 110,      // final grid: bottom-left
        stagger: 3,
    },
    {
        id: "progress",
        label: "Progress",
        icon: "donut_large",
        desc: "Quarterly cycles",
        color: "rgba(99,102,241,0.10)",
        border: "rgba(99,102,241,0.20)",
        explodeX: -385, explodeY: 0,     // left
        lockX: 0,        lockY: 110,     // final grid: bottom-center
        stagger: 4,
    },
    {
        id: "reviews",
        label: "Reviews",
        icon: "rate_review",
        desc: "Performance reviews",
        color: "rgba(139,92,246,0.09)",
        border: "rgba(139,92,246,0.22)",
        explodeX: -340, explodeY: -195,  // top-left
        lockX: 220,      lockY: 110,     // final grid: bottom-right
        stagger: 5,
    },
];

/* ─── Helpers ────────────────────────────────────────────────────────── */

/**
 * Three-phase interpolation driven by a single 0→1 scroll progress.
 *
 * Phase 1  [0.00 → 0.30]  assembled: all modules near centre (start offset ×0.04)
 * Phase 2  [0.30 → 0.65]  exploded:  modules fly to their explode positions
 * Phase 3  [0.65 → 1.00]  locked:    modules fly to final grid positions
 *
 * NOTE: useTransform's multi-input signature does NOT accept an ease option.
 *       Spring physics on the output (useSpring) provides the cinematic easing.
 */
function useThreePhase(progress, assembled, exploded, locked) {
    return useTransform(
        progress,
        [0, 0.30, 0.65, 1.0],
        [assembled, assembled, exploded, locked],
    );
}

/* ─── SVG Connector ──────────────────────────────────────────────────── */
function SvgConnectors({ progress, stageW, stageH }) {
    // Connector opacity: invisible while assembled, visible during explode, fades on lock
    const opacity = useTransform(progress, [0.28, 0.42, 0.60, 0.72], [0, 1, 1, 0]);

    const cx = stageW / 2;
    const cy = stageH / 2;

    return (
        <motion.svg
            className="absolute inset-0 pointer-events-none"
            width={stageW}
            height={stageH}
            style={{ opacity }}
        >
            <defs>
                <radialGradient id="lineGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(99,102,241,0.55)" />
                    <stop offset="100%" stopColor="rgba(99,102,241,0)" />
                </radialGradient>
            </defs>
            {MODULES.map((m) => {
                const ex = cx + m.explodeX;
                const ey = cy + m.explodeY;
                return (
                    <line
                        key={m.id}
                        x1={cx} y1={cy}
                        x2={ex} y2={ey}
                        stroke="url(#lineGrad)"
                        strokeWidth="0.5"
                        strokeDasharray="4 6"
                    />
                );
            })}
        </motion.svg>
    );
}

/* ─── Single module card ─────────────────────────────────────────────── */
function ModuleCard({ module, progress }) {
    // ── X axis ──
    const x = useThreePhase(
        progress,
        module.explodeX * 0.04,   // assembled (near-center)
        module.explodeX,           // exploded
        module.lockX,              // locked grid
    );

    // ── Y axis ──
    const y = useThreePhase(
        progress,
        module.explodeY * 0.04,
        module.explodeY,
        module.lockY,
    );

    // ── Scale: slightly smaller while assembled, full size otherwise ──
    const scale = useTransform(progress,
        [0, 0.25, 0.38, 0.62, 0.78, 1.0],
        [0.72, 0.72, 1.0, 1.0, 1.0, 1.0]
    );

    // ── Opacity: fade in as they leave centre ──
    const opacity = useTransform(progress,
        [0, 0.22, 0.38, 1.0],
        [0, 0, 1, 1]
    );

    // Apply spring damping for a cinematic feel
    const sx = useSpring(x, { stiffness: 60, damping: 20, mass: 0.8 });
    const sy = useSpring(y, { stiffness: 60, damping: 20, mass: 0.8 });

    return (
        <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ x: sx, y: sy, scale, opacity }}
        >
            <div
                className="rounded-2xl px-5 py-4 flex flex-col gap-2 select-none cursor-default"
                style={{
                    background: module.color,
                    border: `0.5px solid ${module.border}`,
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    minWidth: 132,
                    boxShadow: `0 4px 28px rgba(0,0,0,0.4), 0 0 0 0.5px ${module.border}`,
                }}
            >
                <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                        background: "rgba(99,102,241,0.18)",
                        border: "0.5px solid rgba(99,102,241,0.32)",
                    }}
                >
                    <span
                        className="material-symbols-outlined text-indigo-300"
                        style={{ fontSize: 15, fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}
                    >
                        {module.icon}
                    </span>
                </div>
                <p className="text-xs font-semibold text-white/88 tracking-wide leading-none">{module.label}</p>
                <p className="text-[10px] text-white/30 leading-snug">{module.desc}</p>
            </div>
        </motion.div>
    );
}

/* ─── Main Section ───────────────────────────────────────────────────── */
export default function ExplodedWorkflow() {
    /* The sticky container is taller than the viewport — this creates
       the "pinned" scrolling window where the animation plays out.      */
    const containerRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    // Smooth the raw scroll progress for cinematic feel
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 55,
        damping: 22,
        restDelta: 0.001,
    });

    // Stage dimensions (the sticky inner canvas)
    const STAGE_W = 980;
    const STAGE_H = 680;

    /* ── Ambient glow moves slightly as progress changes ── */
    const glowOpacity = useTransform(smoothProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0.3]);
    const glowScale   = useTransform(smoothProgress, [0.2, 0.65], [0.8, 1.3]);

    /* ── Bottom text fades in only at the locked phase ── */
    const textOpacity = useTransform(smoothProgress, [0.78, 0.95], [0, 1]);
    const textY       = useTransform(smoothProgress, [0.78, 0.95], [24, 0]);

    /* ── Phase label ── */
    const phaseLabel = useTransform(
        smoothProgress,
        [0, 0.25, 0.30, 0.62, 0.65, 1.0],
        ["Assembled", "Assembled", "Exploded", "Exploded", "Unified", "Unified"],
    );

    /* ── Core card scale pulses gently during explode phase ── */
    const coreScale = useTransform(smoothProgress,
        [0, 0.20, 0.35, 0.65, 0.80, 1.0],
        [0.88, 0.88, 1.0, 1.0, 1.04, 1.0]
    );
    const coreOpacity = useTransform(smoothProgress, [0, 0.18], [0, 1]);
    const eyebrowOpacity = useTransform(smoothProgress, [0, 0.12], [0, 1]);

    return (
        /*
          Outer wrapper is 350vh tall — this gives scroll room for the
          3-phase animation while the inner stage stays sticky.
        */
        <div
            ref={containerRef}
            className="relative w-full bg-[#131313]"
            style={{ height: "340vh" }}
        >
            {/* ── Sticky stage ─────────────────────────────────────── */}
            <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">

                {/* Ambient glow */}
                <motion.div
                    aria-hidden
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{
                        width: 560,
                        height: 560,
                        opacity: glowOpacity,
                        scale: glowScale,
                        background: "radial-gradient(ellipse at center, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.06) 48%, transparent 72%)",
                        filter: "blur(40px)",
                    }}
                />

                {/* Section eyebrow */}
                <motion.p
                    className="relative z-10 text-[11px] uppercase tracking-[0.24em] text-white/22 font-medium mb-6"
                    style={{ opacity: eyebrowOpacity }}
                >
                    Platform Architecture
                </motion.p>

                {/* ── Orbit canvas ────────────────────────────────── */}
                <div
                    className="relative flex-shrink-0"
                    style={{
                        width: STAGE_W,
                        maxWidth: "100vw",
                        height: STAGE_H,
                        overflow: "visible",
                    }}
                >
                    {/* SVG connector lines (visible only during explode) */}
                    <SvgConnectors
                        progress={smoothProgress}
                        stageW={STAGE_W}
                        stageH={STAGE_H}
                    />

                    {/* Module cards */}
                    {MODULES.map((mod) => (
                        <ModuleCard
                            key={mod.id}
                            module={mod}
                            progress={smoothProgress}
                        />
                    ))}

                    {/* ── AtomQuest Core — pinned at exact centre ── */}
                    <motion.div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
                        style={{ scale: coreScale, opacity: coreOpacity }}
                    >
                        {/* Diffuse glow halo */}
                        <div
                            aria-hidden
                            className="absolute pointer-events-none"
                            style={{
                                inset: -40,
                                borderRadius: 48,
                                background: "radial-gradient(ellipse at center, rgba(99,102,241,0.18) 0%, transparent 68%)",
                                filter: "blur(20px)",
                            }}
                        />

                        {/* Glass core card */}
                        <div
                            className="relative flex flex-col items-center justify-center gap-3 rounded-3xl"
                            style={{
                                width: 172,
                                height: 172,
                                background: "rgba(255,255,255,0.055)",
                                border: "0.5px solid rgba(255,255,255,0.14)",
                                backdropFilter: "blur(32px)",
                                WebkitBackdropFilter: "blur(32px)",
                                boxShadow: "0 0 0 1px rgba(99,102,241,0.18), 0 16px 56px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.09)",
                            }}
                        >
                            <div
                                className="w-11 h-11 rounded-2xl flex items-center justify-center"
                                style={{
                                    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                                    boxShadow: "0 4px 24px rgba(79,70,229,0.52)",
                                }}
                            >
                                <span className="text-white text-base font-black leading-none select-none">A</span>
                            </div>
                            <div className="text-center select-none">
                                <p className="text-sm font-bold text-white tracking-wide leading-none">AtomQuest</p>
                                <p className="text-[10px] text-white/30 mt-1 uppercase tracking-widest">Core</p>
                            </div>

                            {/* Pulse rings */}
                            <motion.div aria-hidden className="absolute pointer-events-none rounded-3xl"
                                style={{ inset: -10, border: "0.5px solid rgba(99,102,241,0.22)" }}
                                animate={{ opacity: [0.7, 0.15, 0.7] }}
                                transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
                            />
                            <motion.div aria-hidden className="absolute pointer-events-none"
                                style={{ inset: -22, borderRadius: 36, border: "0.5px solid rgba(99,102,241,0.10)" }}
                                animate={{ opacity: [0.5, 0.08, 0.5] }}
                                transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                            />
                        </div>
                    </motion.div>
                </div>

                {/* ── Bottom text — fades in at locked phase ─────────── */}
                <motion.div
                    className="relative z-10 text-center px-4 mt-8"
                    style={{ opacity: textOpacity, y: textY }}
                >
                    <h2 className="text-2xl md:text-[1.85rem] font-bold text-white/90 tracking-tight mb-3">
                        Unified Performance Ecosystem
                    </h2>
                    <p className="text-sm text-white/32 max-w-sm mx-auto leading-relaxed">
                        Align goals, approvals, analytics, and quarterly progress
                        into one seamless enterprise workflow.
                    </p>

                    {/* Horizontal divider */}
                    <div
                        className="mx-auto mt-6"
                        style={{
                            width: 320,
                            height: "0.5px",
                            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
                        }}
                    />
                </motion.div>

            </div>{/* end sticky */}
        </div>
    );
}
