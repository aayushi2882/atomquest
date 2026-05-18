function StatsCard({ label, value, sub, icon, accent = false }) {
    return (
        <div className={`glass-card rounded-2xl p-5 flex flex-col gap-3 ${accent ? "border-indigo-500/20" : ""}`}>
            <div className="flex items-center justify-between">
                <span className="text-xs text-white/35 uppercase tracking-widest font-medium">{label}</span>
                {icon && (
                    <div className="w-7 h-7 rounded-lg glass-card flex items-center justify-center">
                        <span className="material-symbols-outlined text-white/30" style={{ fontSize: 15 }}>{icon}</span>
                    </div>
                )}
            </div>
            <div>
                <p className={`text-2xl font-bold ${accent ? "text-gradient" : "text-white"}`}>{value}</p>
                {sub && <p className="text-xs text-white/30 mt-1">{sub}</p>}
            </div>
        </div>
    );
}

export default StatsCard;
