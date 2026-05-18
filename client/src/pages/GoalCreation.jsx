import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import GoalForm from "../components/GoalForm";
import GoalCard from "../components/GoalCard";
import ValidationAlert from "../components/ValidationAlert";
import GoalCreationLoader from "../components/GoalCreationLoader";
import { useAppStore } from "../store/useAppStore";
import { getUser, displayNameFromEmail, initialsFromName } from "../utils/user";

const now = new Date();
const quarter = `Q${Math.ceil((now.getMonth() + 1) / 3)} ${now.getFullYear()}`;

function GoalCreationPage() {
    const user         = getUser();
    const email        = user?.email || "unknown@atomquest.com";
    const displayName  = displayNameFromEmail(email);

    /* ── Zustand selectors & actions ── */
    const empState     = useAppStore((s) => s.employees[email] || null);
    const goals        = empState?.goals || [];
    const isSubmitted  = empState?.isSubmitted || false;

    const addGoal      = useAppStore((s) => s.addGoal);
    const updateGoal   = useAppStore((s) => s.updateGoal);
    const deleteGoal      = useAppStore((s) => s.deleteGoal);
    const submitGoals     = useAppStore((s) => s.submitGoals);
    const resetEmployee   = useAppStore((s) => s.resetEmployee);
    const registerEmployee = useAppStore((s) => s.registerEmployee);

    /* ── Local UI state ── */
    const [showForm, setShowForm]     = useState(false);
    const [editGoal, setEditGoal]     = useState(null);
    const [submitError, setSubmitError] = useState([]);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const [pendingGoal, setPendingGoal] = useState(null);

    const totalWeightage   = goals.reduce((sum, g) => sum + (parseInt(g.weightage) || 0), 0);
    const canAddMore       = goals.length < 8 && !isSubmitted;
    const weightageRemaining = 100 - totalWeightage;
    const isReadyToSubmit  = goals.length > 0 && totalWeightage === 100;

    /* ── Save / update goal ── */
    const handleSaveGoal = (goal) => {
        if (editGoal) {
            updateGoal(email, goal);
            setEditGoal(null);
            setShowForm(false);
        } else {
            // Auto-register in case they bypassed the login registration
            registerEmployee({ email, name: displayName, role: user?.role || "Employee" });
            // New goal → cinematic loader for 2.5s
            setPendingGoal(goal);
            setShowForm(false);
            setEditGoal(null);
            setShowLoader(true);
            setTimeout(() => {
                addGoal(email, goal);
                setPendingGoal(null);
                setShowLoader(false);
            }, 2500);
        }
    };

    /* ── Delete ── */
    const handleDeleteGoal = (id) => deleteGoal(email, id);

    /* ── Edit ── */
    const handleEditGoal = (goal) => {
        setEditGoal(goal);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    /* ── Submit all goals ── */
    const handleSubmit = () => {
        const errs = [];
        if (goals.length === 0) errs.push("You must add at least one goal before submitting.");
        if (totalWeightage !== 100) errs.push(`Total weightage must equal 100%. Currently: ${totalWeightage}%.`);
        if (errs.length) { setSubmitError(errs); return; }

        // Ensure employee is registered (idempotent — no-op if already exists)
        registerEmployee({ email, name: displayName, role: user?.role || "Employee" });

        submitGoals(email);
        setSubmitError([]);
        setSubmitSuccess(true);
    };

    /* ── Reset (demo) ── */
    const handleReset = () => {
        resetEmployee(email);
        setSubmitSuccess(false);
        setSubmitError([]);
        setShowForm(false);
        setEditGoal(null);
    };

    return (
        <DashboardLayout title="My Goals">
            <GoalCreationLoader visible={showLoader} />
            <div className="max-w-5xl mx-auto">

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 fade-up">
                    <div>
                        <h2 className="text-xl font-bold text-white">Goal Management</h2>
                        <p className="text-xs text-white/35 mt-1">
                            {isSubmitted
                                ? "Your goals have been submitted and are pending approval."
                                : `${goals.length} of 8 goals · ${totalWeightage}% of 100% allocated`}
                        </p>
                    </div>

                    {!isSubmitted && (
                        <div className="flex items-center gap-2">
                            {canAddMore && (
                                <button
                                    onClick={() => { setEditGoal(null); setShowForm((v) => !v); }}
                                    className={`btn-ghost text-sm px-4 py-2 rounded-xl flex items-center gap-2 ${showForm ? "bg-white/[0.06]" : ""}`}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: 15 }}>
                                        {showForm ? "close" : "add"}
                                    </span>
                                    {showForm ? "Collapse" : "Add Goal"}
                                </button>
                            )}
                            <button
                                onClick={handleSubmit}
                                disabled={!isReadyToSubmit}
                                className="btn-primary text-sm px-5 py-2 rounded-xl flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>send</span>
                                Submit Goals
                            </button>
                        </div>
                    )}

                    {isSubmitted && (
                        <button
                            onClick={handleReset}
                            className="btn-ghost text-xs px-3 py-2 rounded-xl flex items-center gap-1.5"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>restart_alt</span>
                            Reset (Demo)
                        </button>
                    )}
                </div>

                {/* Submission success banner */}
                {submitSuccess && isSubmitted && (
                    <div className="mb-5 rounded-2xl px-5 py-4 bg-emerald-500/[0.07] border border-emerald-500/20 flex items-center gap-3 fade-up">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-emerald-400" style={{ fontSize: 16 }}>check_circle</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-emerald-400">Goals submitted successfully</p>
                            <p className="text-xs text-emerald-400/60 mt-0.5">
                                Your {goals.length} goal{goals.length !== 1 ? "s" : ""} are now pending manager approval. Editing is locked.
                            </p>
                        </div>
                    </div>
                )}

                {/* Manager feedback banner */}
                {isSubmitted && goals.some((g) => g.status === "Approved") && (
                    <div className="mb-5 rounded-2xl px-5 py-4 bg-emerald-500/[0.07] border border-emerald-500/20 flex items-center gap-3 fade-up">
                        <span className="material-symbols-outlined text-emerald-400" style={{ fontSize: 20 }}>verified</span>
                        <div>
                            <p className="text-sm font-medium text-emerald-400">Goals Approved by Manager</p>
                            <p className="text-xs text-emerald-400/60 mt-0.5">Your goals have been reviewed and approved.</p>
                        </div>
                    </div>
                )}

                {isSubmitted && goals.some((g) => g.status === "Rejected") && (
                    <div className="mb-5 rounded-2xl px-5 py-4 bg-red-500/[0.07] border border-red-500/20 flex items-center gap-3 fade-up">
                        <span className="material-symbols-outlined text-red-400" style={{ fontSize: 20 }}>cancel</span>
                        <div>
                            <p className="text-sm font-medium text-red-400">Goals Rejected</p>
                            <p className="text-xs text-red-400/60 mt-0.5">Your manager has rejected your goals. Please contact them for guidance.</p>
                        </div>
                    </div>
                )}

                {!isSubmitted && goals.some((g) => g.status === "Needs Revision") && (
                    <div className="mb-5 rounded-2xl px-5 py-4 bg-amber-500/[0.07] border border-amber-500/20 flex items-center gap-3 fade-up">
                        <span className="material-symbols-outlined text-amber-400" style={{ fontSize: 20 }}>edit_note</span>
                        <div>
                            <p className="text-sm font-medium text-amber-400">Revision Requested</p>
                            <p className="text-xs text-amber-400/60 mt-0.5">Your manager has requested changes. Edit your goals and resubmit.</p>
                        </div>
                    </div>
                )}

                {/* Submit error */}
                {submitError.length > 0 && (
                    <div className="mb-5">
                        <ValidationAlert messages={submitError} type="error" />
                    </div>
                )}

                {/* Weightage progress bar */}
                {goals.length > 0 && (
                    <div className="glass-card rounded-2xl px-5 py-4 mb-5 fade-up">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-white/35 uppercase tracking-widest font-medium">Total Weightage</span>
                            <div className="flex items-center gap-3">
                                <span className={`text-xs font-semibold ${totalWeightage === 100 ? "text-emerald-400" : totalWeightage > 100 ? "text-red-400" : "text-white/50"}`}>
                                    {totalWeightage}%
                                </span>
                                {totalWeightage !== 100 && !isSubmitted && (
                                    <span className="text-[10px] text-amber-400/70 bg-amber-400/[0.07] border border-amber-400/15 px-2 py-0.5 rounded-full">
                                        {weightageRemaining > 0 ? `${weightageRemaining}% remaining` : `${Math.abs(weightageRemaining)}% over`}
                                    </span>
                                )}
                                {totalWeightage === 100 && (
                                    <span className="text-[10px] text-emerald-400/80 bg-emerald-400/[0.07] border border-emerald-400/15 px-2 py-0.5 rounded-full">
                                        Ready to submit
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${totalWeightage > 100 ? "bg-red-500" : totalWeightage === 100 ? "bg-emerald-500" : "luminous-gradient"}`}
                                style={{ width: `${Math.min(100, totalWeightage)}%` }}
                            />
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                            {goals.map((g) => (
                                <div key={g.id} className="flex items-center gap-1.5 text-[10px] text-white/30">
                                    <div className="w-1.5 h-1.5 rounded-full luminous-gradient flex-shrink-0" />
                                    <span className="truncate max-w-[100px]">{g.title}</span>
                                    <span className="text-white/20">·</span>
                                    <span>{g.weightage}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Goal Form */}
                {showForm && !isSubmitted && (
                    <div className="mb-5">
                        <GoalForm
                            goals={goals}
                            onSave={handleSaveGoal}
                            onCancel={() => { setShowForm(false); setEditGoal(null); }}
                            editGoal={editGoal}
                        />
                    </div>
                )}

                {/* Goals Grid */}
                {goals.length > 0 ? (
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {goals.map((goal) => (
                            <GoalCard
                                key={goal.id}
                                goal={goal}
                                onEdit={handleEditGoal}
                                onDelete={handleDeleteGoal}
                                isSubmitted={isSubmitted}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="glass-card rounded-2xl p-12 flex flex-col items-center text-center fade-up">
                        <div className="w-14 h-14 rounded-2xl glass-card flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-white/15" style={{ fontSize: 28 }}>target</span>
                        </div>
                        <h3 className="text-sm font-semibold text-white/60 mb-1">No goals yet</h3>
                        <p className="text-xs text-white/25 max-w-xs leading-relaxed">
                            Start by adding your first goal. You can create up to 8 goals with a combined weightage of 100%.
                        </p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="btn-primary mt-6 px-5 py-2.5 rounded-xl text-sm flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>add</span>
                            Add First Goal
                        </button>
                    </div>
                )}

                {goals.length >= 8 && !isSubmitted && (
                    <div className="mt-4">
                        <ValidationAlert messages={["Maximum of 8 goals reached. Delete an existing goal to add a new one."]} type="warning" />
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

export default GoalCreationPage;
