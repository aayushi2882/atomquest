/**
 * AdminStatCard — enhanced stat card with glow, trend indicator, and hover accent.
 * Props: label, value, sub, icon, accent, trend ("up"|"down"|"neutral")
 */
function AdminStatCard({ label, value, sub, icon, accent = false, trend }) {
    const trendIcon  = trend === "up" ? "trending_up" : trend === "down" ? "trending_down" : null;
    const trendColor = trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400" : "text-white/30";

    return (
        <div
            className={`
                glass-card rounded-2xl p-5 flex flex-col gap-3 goal-card
                ${accent ? "border-indigo-500/20" : ""}
            `}
            style={accent ? { boxShadow: "0 0 24px rgba(99,102,241,0.08)" } : {}}
        >
            <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/35 uppercase tracking-widest font-medium">{label}</span>
                {icon && (
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${accent ? "bg-indigo-500/15 border border-indigo-500/20" : "glass-card"}`}>
                        <span className={`material-symbols-outlined ${accent ? "text-indigo-400" : "text-white/30"}`} style={{ fontSize: 15 }}>
                            {icon}
                        </span>
                    </div>
                )}
            </div>

            <div>
                <p className={`text-3xl font-bold tracking-tight ${accent ? "text-gradient" : "text-white"}`}>
                    {value}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                    {trendIcon && (
                        <span className={`material-symbols-outlined ${trendColor}`} style={{ fontSize: 13 }}>{trendIcon}</span>
                    )}
                    {sub && <p className="text-xs text-white/30">{sub}</p>}
                </div>
            </div>
        </div>
    );
}

export default AdminStatCard;
