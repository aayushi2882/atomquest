import { useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import CycleCard from "../../components/admin/CycleCard";
import { useToast } from "../../components/Toast";
import { useAppStore } from "../../store/useAppStore";

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];
const YEARS    = [2025, 2026, 2027];

function AdminCycles() {
    const cycles       = useAppStore((s) => s.getCycles());
    const startCycle   = useAppStore((s) => s.startCycle);
    const lockCycle    = useAppStore((s) => s.lockCycle);
    const openCycle    = useAppStore((s) => s.openCycle);
    const archiveCycle = useAppStore((s) => s.archiveCycle);
    const addCycle     = useAppStore((s) => s.addCycle);
    const activeCycle  = useAppStore((s) => s.getActiveCycle());

    const { addToast, ToastPortal } = useToast();
    const [showNewModal, setShowNewModal] = useState(false);
    const [newQ, setNewQ] = useState("Q3");
    const [newY, setNewY] = useState(2026);

    const wrap = (fn, msg, type = "success") => (id) => {
        fn(id);
        addToast({ message: msg, type });
    };

    const handleStart   = wrap(startCycle,   "Cycle started successfully", "success");
    const handleLock    = wrap(lockCycle,     "Submissions locked", "warning");
    const handleOpen    = wrap(openCycle,     "Submissions re-opened", "success");
    const handleArchive = wrap(archiveCycle,  "Cycle archived", "info");

    const handleAddCycle = () => {
        const label = `${newQ} ${newY}`;
        const qNum  = parseInt(newQ.replace("Q", ""));
        if (cycles.some((c) => c.quarter === qNum && c.year === newY)) {
            addToast({ message: `${label} already exists`, type: "error" }); return;
        }
        addCycle({ label, quarter: qNum, year: newY, status: "Upcoming", isCurrentCycle: false, startedAt: null, lockedAt: null, archivedAt: null });
        addToast({ message: `${label} cycle created`, type: "success" });
        setShowNewModal(false);
    };

    const now = new Date();
    const quarter = `Q${Math.ceil((now.getMonth() + 1) / 3)} ${now.getFullYear()}`;

    const activeCount   = cycles.filter((c) => c.status === "Active").length;
    const lockedCount   = cycles.filter((c) => c.status === "Locked").length;
    const archivedCount = cycles.filter((c) => c.status === "Archived").length;
    const upcomingCount = cycles.filter((c) => c.status === "Upcoming").length;

    return (
        <AdminLayout title="Goal Cycles">
            <ToastPortal />

            {/* New Cycle Modal */}
            {showNewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}>
                    <div className="glass-card-elevated rounded-2xl p-6 w-full max-w-sm fade-up">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-semibold text-white">Start New Cycle</h3>
                            <button onClick={() => setShowNewModal(false)} className="w-7 h-7 rounded-lg glass-card flex items-center justify-center text-white/30 hover:text-white/60 transition">
                                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>close</span>
                            </button>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-[10px] text-white/35 uppercase tracking-widest font-medium mb-1.5">Quarter</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {QUARTERS.map((q) => (
                                        <button key={q} onClick={() => setNewQ(q)}
                                            className={`py-2.5 rounded-xl text-xs font-medium transition-all ${newQ === q ? "bg-indigo-500/25 border border-indigo-500/40 text-indigo-300" : "btn-ghost"}`}>
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] text-white/35 uppercase tracking-widest font-medium mb-1.5">Year</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {YEARS.map((y) => (
                                        <button key={y} onClick={() => setNewY(y)}
                                            className={`py-2.5 rounded-xl text-xs font-medium transition-all ${newY === y ? "bg-indigo-500/25 border border-indigo-500/40 text-indigo-300" : "btn-ghost"}`}>
                                            {y}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="rounded-xl px-4 py-3 bg-white/[0.03] border border-white/[0.08] text-center">
                                <p className="text-lg font-bold text-white">{newQ} {newY}</p>
                                <p className="text-xs text-white/30 mt-0.5">New performance cycle</p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowNewModal(false)} className="btn-ghost flex-1 py-2.5 rounded-xl text-sm">Cancel</button>
                                <button onClick={handleAddCycle} className="btn-primary flex-1 py-2.5 rounded-xl text-sm font-medium">Create</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6 fade-up flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <p className="text-xs text-white/30 uppercase tracking-widest font-medium mb-1">{quarter} · Cycle Management</p>
                        <h2 className="text-2xl font-bold text-white">Goal Cycle Control</h2>
                        <p className="text-sm text-white/35 mt-1">Start, lock, open, and archive quarterly goal cycles.</p>
                    </div>
                    <button onClick={() => setShowNewModal(true)} className="btn-primary px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 flex-shrink-0">
                        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>add_circle</span>
                        New Cycle
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Active",   value: activeCount,   color: "text-emerald-400", dot: "bg-emerald-400 pulse-dot" },
                        { label: "Locked",   value: lockedCount,   color: "text-amber-400",   dot: "bg-amber-400" },
                        { label: "Upcoming", value: upcomingCount, color: "text-indigo-400",  dot: "bg-indigo-400" },
                        { label: "Archived", value: archivedCount, color: "text-zinc-400",    dot: "bg-zinc-500" },
                    ].map(({ label, value, color, dot }) => (
                        <div key={label} className="glass-card rounded-2xl p-4 flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
                            <div>
                                <p className={`text-xl font-bold ${color}`}>{value}</p>
                                <p className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5">{label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Active cycle highlight */}
                {activeCycle && (
                    <div className="mb-6 fade-up rounded-2xl px-5 py-4 flex items-center gap-4"
                        style={{ background: "rgba(99,102,241,0.06)", border: "0.5px solid rgba(99,102,241,0.25)" }}>
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-indigo-400" style={{ fontSize: 16 }}>cycle</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-white">{activeCycle.label} is the current active cycle</p>
                            <p className="text-xs text-white/35 mt-0.5">Employees can submit goals. Managers are reviewing.</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                            <button onClick={() => handleLock(activeCycle.id)}
                                className="px-3 py-1.5 rounded-xl text-xs font-medium text-amber-400 transition-all"
                                style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.20)" }}>
                                Lock Submissions
                            </button>
                        </div>
                    </div>
                )}

                {/* Cycle grid */}
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {cycles.map((cycle) => (
                        <CycleCard
                            key={cycle.id}
                            cycle={cycle}
                            isCurrent={cycle.isCurrentCycle}
                            onStart={handleStart}
                            onLock={handleLock}
                            onOpen={handleOpen}
                            onArchive={handleArchive}
                        />
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}

export default AdminCycles;
