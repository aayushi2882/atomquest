import { useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { useToast } from "../../components/Toast";
import { useAppStore } from "../../store/useAppStore";

function Toggle({ checked, onChange, label, sub }) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-white/[0.05] last:border-0">
            <div>
                <p className="text-xs font-medium text-white">{label}</p>
                {sub && <p className="text-[10px] text-white/30 mt-0.5">{sub}</p>}
            </div>
            <button
                onClick={onChange}
                className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 flex-shrink-0 ${checked ? "bg-indigo-600" : "bg-white/10"}`}
                style={{ height: 22, minWidth: 40 }}
            >
                <div className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-all duration-200 ${checked ? "left-[22px]" : "left-0.5"}`}
                    style={{ width: 18, height: 18 }} />
            </button>
        </div>
    );
}

function AdminSettings() {
    const resetDemoData = useAppStore((s) => s.resetDemoData);
    const { addToast, ToastPortal } = useToast();

    const [orgName, setOrgName]   = useState("AtomQuest Corp");
    const [fiscalQ, setFiscalQ]   = useState("Q1");
    const [notifs, setNotifs]     = useState({ submissions: true, approvals: true, cycles: true, reports: false });
    const [showReset, setShowReset] = useState(false);

    const toggleNotif = (key) => setNotifs((p) => ({ ...p, [key]: !p[key] }));

    const handleSaveOrg = () => addToast({ message: "Organization settings saved", type: "success" });

    const handleReset = () => {
        resetDemoData();
        setShowReset(false);
        addToast({ message: "Demo data reset to defaults", type: "info" });
    };

    const now = new Date();
    const quarter = `Q${Math.ceil((now.getMonth() + 1) / 3)} ${now.getFullYear()}`;

    const inputCls = "glass-input w-full rounded-xl px-3.5 py-2.5 text-sm";
    const labelCls = "block text-[10px] text-white/35 uppercase tracking-widest font-medium mb-1.5";

    return (
        <AdminLayout title="Settings">
            <ToastPortal />

            {/* Reset confirm modal */}
            {showReset && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}>
                    <div className="glass-card-elevated rounded-2xl p-6 w-full max-w-sm fade-up">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-red-400" style={{ fontSize: 18 }}>warning</span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">Reset Demo Data?</p>
                                <p className="text-xs text-white/35 mt-0.5">This will clear all goals, activity, and employee data.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowReset(false)} className="btn-ghost flex-1 py-2.5 rounded-xl text-sm">Cancel</button>
                            <button onClick={handleReset} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-red-400 transition-all"
                                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.20)" }}>
                                Reset Everything
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8 fade-up">
                    <p className="text-xs text-white/30 uppercase tracking-widest font-medium mb-1">{quarter} · Configuration</p>
                    <h2 className="text-2xl font-bold text-white">Admin Settings</h2>
                    <p className="text-sm text-white/35 mt-1">Organization configuration and system preferences.</p>
                </div>

                {/* Org Settings */}
                <div className="glass-card rounded-2xl p-6 mb-4 fade-up">
                    <h3 className="text-sm font-semibold text-white mb-5">Organization Settings</h3>
                    <div className="flex flex-col gap-4">
                        <div>
                            <label className={labelCls}>Organization Name</label>
                            <input type="text" value={orgName} onChange={(e) => setOrgName(e.target.value)} className={inputCls} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>Fiscal Year Start</label>
                                <select value={fiscalQ} onChange={(e) => setFiscalQ(e.target.value)} className={`${inputCls} select`}>
                                    {["Q1", "Q2", "Q3", "Q4"].map((q) => <option key={q} value={q}>{q}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Cycle Duration</label>
                                <select className={`${inputCls} select`} defaultValue="quarterly">
                                    <option value="quarterly">Quarterly</option>
                                    <option value="annual">Annual</option>
                                </select>
                            </div>
                        </div>
                        <button onClick={handleSaveOrg} className="btn-primary px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 w-fit">
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>save</span>
                            Save Settings
                        </button>
                    </div>
                </div>

                {/* Notification Prefs */}
                <div className="glass-card rounded-2xl p-6 mb-4 fade-up">
                    <h3 className="text-sm font-semibold text-white mb-4">Notification Preferences</h3>
                    <p className="text-xs text-white/30 mb-4">Control which events trigger admin notifications.</p>
                    <Toggle checked={notifs.submissions} onChange={() => toggleNotif("submissions")} label="Goal Submissions" sub="Notify when employees submit goals" />
                    <Toggle checked={notifs.approvals}   onChange={() => toggleNotif("approvals")}   label="Approvals & Rejections" sub="Notify when managers take action" />
                    <Toggle checked={notifs.cycles}      onChange={() => toggleNotif("cycles")}      label="Cycle Events" sub="Notify on cycle start, lock, and archive" />
                    <Toggle checked={notifs.reports}     onChange={() => toggleNotif("reports")}     label="Weekly Reports" sub="Receive weekly performance digest" />
                </div>

                {/* Admin Controls */}
                <div className="glass-card rounded-2xl p-6 mb-4 fade-up">
                    <h3 className="text-sm font-semibold text-white mb-4">Admin Controls</h3>
                    <div className="grid md:grid-cols-3 gap-3">
                        {[
                            { icon: "download", title: "Export Data",      desc: "Download all goal data as CSV.",    action: () => addToast({ message: "Export feature coming soon", type: "info" }) },
                            { icon: "backup",   title: "Backup State",     desc: "Save current app state to file.",  action: () => addToast({ message: "Backup feature coming soon", type: "info" }) },
                            { icon: "refresh",  title: "Reset Demo Data",  desc: "Clear all data and restore seeds.", action: () => setShowReset(true), danger: true },
                        ].map((ctrl) => (
                            <button key={ctrl.title} onClick={ctrl.action}
                                className={`glass-card rounded-xl p-4 text-left flex flex-col gap-2 goal-card w-full ${ctrl.danger ? "hover:border-red-500/20" : ""}`}>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${ctrl.danger ? "bg-red-500/10 border border-red-500/20" : "bg-indigo-500/10 border border-indigo-500/20"}`}>
                                    <span className={`material-symbols-outlined ${ctrl.danger ? "text-red-400" : "text-indigo-400"}`} style={{ fontSize: 15 }}>{ctrl.icon}</span>
                                </div>
                                <div>
                                    <p className={`text-xs font-semibold ${ctrl.danger ? "text-red-400/80" : "text-white"}`}>{ctrl.title}</p>
                                    <p className="text-[10px] text-white/30 mt-0.5 leading-relaxed">{ctrl.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Advanced — Coming soon */}
                <div className="glass-card rounded-2xl p-6 fade-up">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-white">Advanced Configuration</h3>
                        <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-white/25 border border-white/[0.07] rounded-full px-3 py-1">
                            <span className="w-1 h-1 rounded-full bg-amber-400 animate-pulse" /> Coming Soon
                        </span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                        {["SSO Integration", "Audit Logs Export", "Role Permissions Matrix", "Custom Thrust Areas"].map((item) => (
                            <div key={item} className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                                <span className="material-symbols-outlined text-white/15" style={{ fontSize: 14 }}>lock</span>
                                <span className="text-xs text-white/25">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

export default AdminSettings;
