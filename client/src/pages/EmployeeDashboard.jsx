import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import StatsCard from "../components/StatsCard";
import { getUser, displayNameFromEmail } from "../utils/user";
import { useAppStore } from "../store/useAppStore";

const now     = new Date();
const quarter = `Q${Math.ceil((now.getMonth() + 1) / 3)} ${now.getFullYear()}`;

function getGreeting() {
    const h = now.getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
}

function EmployeeDashboard() {
    const navigate = useNavigate();

    const user        = getUser();
    const email       = user?.email || "";
    const displayName = displayNameFromEmail(email);
    const firstName   = displayName.split(" ")[0];

    /* ── Zustand ── */
    const empState    = useAppStore((s) => s.employees[email] || null);
    const goals       = empState?.goals || [];
    const isSubmitted = empState?.isSubmitted || false;

    const totalW      = goals.reduce((s, g) => s + (parseInt(g.weightage) || 0), 0);
    const goalCount   = goals.length;

    /* Determine overall manager decision */
    const allApproved       = isSubmitted && goalCount > 0 && goals.every((g) => g.status === "Approved");
    const anyRejected       = goals.some((g) => g.status === "Rejected");
    const needsRevision     = goals.some((g) => g.status === "Needs Revision");

    const status = allApproved
        ? "Approved"
        : anyRejected
            ? "Rejected"
            : needsRevision
                ? "Needs Revision"
                : isSubmitted
                    ? "Pending Approval"
                    : goalCount === 0
                        ? "Not Started"
                        : "Draft";

    const statusSub = {
        Approved:          "All goals approved",
        Rejected:          "Contact your manager",
        "Needs Revision":  "Revisions requested",
        "Pending Approval": "Awaiting manager review",
        "Not Started":     "No goals added yet",
        Draft:             "In progress",
    }[status];

    const weightageDisplay = `${totalW}%`;
    const weightageSub     = totalW === 100 ? "Fully allocated" : `${100 - totalW}% remaining`;

    return (
        <DashboardLayout title="Dashboard">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="mb-8 fade-up">
                    <p className="text-xs text-white/30 uppercase tracking-widest font-medium mb-1">
                        {quarter} · Performance Cycle
                    </p>
                    <h2 className="text-2xl font-bold text-white">
                        {getGreeting()}, {firstName}.
                    </h2>
                    <p className="text-sm text-white/35 mt-1">
                        {allApproved
                            ? "Your goals have been approved by your manager. Great work!"
                            : anyRejected
                                ? "Your goals were rejected. Please reach out to your manager."
                                : needsRevision
                                    ? "Your manager has requested revisions. Please update your goals."
                                    : isSubmitted
                                        ? "Your goals are submitted and awaiting manager approval."
                                        : goalCount === 0
                                            ? "You haven't set any goals yet. Start by adding your first goal."
                                            : `You have ${goalCount} goal${goalCount !== 1 ? "s" : ""} in progress. Keep it up.`}
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatsCard label="Goals Set"      value={String(goalCount)}      sub="of 8 max"     icon="target"        accent />
                    <StatsCard label="Weightage Used" value={weightageDisplay}        sub={weightageSub} icon="pie_chart"          />
                    <StatsCard label="Status"         value={status}                  sub={statusSub}    icon="pending"            />
                    <StatsCard label="Cycle"          value={quarter}                 sub="Active"       icon="calendar_month"     />
                </div>

                {/* Manager feedback banners */}
                {allApproved && (
                    <div className="mb-6 rounded-2xl px-5 py-4 bg-emerald-500/[0.06] border border-emerald-500/20 flex items-center gap-3 fade-up">
                        <span className="material-symbols-outlined text-emerald-400" style={{ fontSize: 22 }}>verified</span>
                        <div>
                            <p className="text-sm font-medium text-emerald-400">All Goals Approved</p>
                            <p className="text-xs text-emerald-400/60 mt-0.5">Your manager has reviewed and approved all {goalCount} goals.</p>
                        </div>
                    </div>
                )}

                {anyRejected && (
                    <div className="mb-6 rounded-2xl px-5 py-4 bg-red-500/[0.06] border border-red-500/20 flex items-center gap-3 fade-up">
                        <span className="material-symbols-outlined text-red-400" style={{ fontSize: 22 }}>cancel</span>
                        <div>
                            <p className="text-sm font-medium text-red-400">Goals Rejected</p>
                            <p className="text-xs text-red-400/60 mt-0.5">Your manager rejected your goals. Please contact them for next steps.</p>
                        </div>
                    </div>
                )}

                {needsRevision && (
                    <div className="mb-6 rounded-2xl px-5 py-4 bg-amber-500/[0.06] border border-amber-500/20 flex items-center gap-3 fade-up">
                        <span className="material-symbols-outlined text-amber-400" style={{ fontSize: 22 }}>edit_note</span>
                        <div>
                            <p className="text-sm font-medium text-amber-400">Revision Requested</p>
                            <p className="text-xs text-amber-400/60 mt-0.5">Your manager asked for changes. Go to My Goals to edit and resubmit.</p>
                        </div>
                    </div>
                )}

                {isSubmitted && !allApproved && !anyRejected && !needsRevision && (
                    <div className="mb-6 rounded-2xl px-5 py-4 bg-emerald-500/[0.06] border border-emerald-500/20 flex items-center gap-3 fade-up">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-emerald-400" style={{ fontSize: 16 }}>check_circle</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-emerald-400">Goals submitted</p>
                            <p className="text-xs text-emerald-400/60 mt-0.5">
                                {goalCount} goal{goalCount !== 1 ? "s" : ""} are pending manager approval. Editing is locked until reviewed.
                            </p>
                        </div>
                    </div>
                )}

                {/* CTA */}
                <div className="glass-card rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 fade-up">
                    <div>
                        <h3 className="text-base font-semibold text-white">
                            {isSubmitted ? "Review Your Submitted Goals" : "Manage Your Goals"}
                        </h3>
                        <p className="text-sm text-white/35 mt-1 max-w-md">
                            {isSubmitted
                                ? `You submitted ${goalCount} goal${goalCount !== 1 ? "s" : ""} with ${totalW}% total weightage. They are now under review.`
                                : `Create, edit, and submit your ${quarter} goals. You can set up to 8 goals with a total weightage of 100%.`}
                        </p>
                        <div className="flex items-center gap-4 mt-5">
                            {[
                                { dot: "bg-zinc-500",   label: "Draft" },
                                { dot: "bg-amber-400 pulse-dot", label: "Pending Approval" },
                                { dot: "bg-emerald-400", label: "Approved" },
                                { dot: "bg-red-400",    label: "Rejected" },
                            ].map(({ dot, label }) => (
                                <div key={label} className="flex items-center gap-2 text-xs text-white/30">
                                    <div className={`w-2 h-2 rounded-full ${dot}`} />
                                    {label}
                                </div>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={() => navigate("/employee/goals")}
                        className="btn-primary flex-shrink-0 px-6 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>
                            {isSubmitted ? "visibility" : "add_circle"}
                        </span>
                        {isSubmitted ? "View My Goals" : "Go to My Goals"}
                    </button>
                </div>

                {/* Process steps */}
                <div className="mt-6 grid md:grid-cols-3 gap-4">
                    {[
                        { step: "01", title: "Define Goals",         desc: "Add up to 8 goals with clear targets and weightage.",        icon: "edit_note",   done: goalCount > 0 },
                        { step: "02", title: "Review & Refine",      desc: "Ensure total weightage equals 100% before submitting.",      icon: "fact_check",  done: totalW === 100 },
                        { step: "03", title: "Submit for Approval",  desc: "Lock your goals and send them to your manager.",             icon: "send",        done: isSubmitted },
                    ].map((item) => (
                        <div
                            key={item.step}
                            className={`glass-card rounded-2xl p-5 fade-up transition-colors duration-300 ${item.done ? "border-indigo-500/20" : ""}`}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${item.done ? "bg-emerald-500/20 border border-emerald-500/30" : "luminous-gradient"}`}>
                                    <span className={`material-symbols-outlined ${item.done ? "text-emerald-400" : "text-white"}`} style={{ fontSize: 14 }}>
                                        {item.done ? "check" : item.icon}
                                    </span>
                                </div>
                                <span className="text-[10px] text-white/20 font-mono">{item.step}</span>
                            </div>
                            <h4 className="text-sm font-semibold text-white mb-1">{item.title}</h4>
                            <p className="text-xs text-white/30 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}

export default EmployeeDashboard;